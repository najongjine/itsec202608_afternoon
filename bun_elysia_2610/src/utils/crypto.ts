import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

// 단방향: 복호화 대신 verifyPassword로 입력한 비밀번호를 검증합니다.
export async function hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, { algorithm: "argon2id" });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return Bun.password.verify(password, hash);
}

// 최초 설정할 때 한 번 생성하고 안전하게 보관하세요.
export function generateEncryptionKey(): string {
  return randomBytes(32).toString("hex");
}

function readSecret(secret: string | undefined): string {
  if (!secret || !secret.trim()) {
    throw new Error("ENCRYPTION_KEY에 비밀 문자열을 설정하세요.");
  }
  return secret;
}

// 양방향: 매번 새로운 IV를 사용하고 인증 태그로 변조를 검출합니다.
export function encrypt(text: string, secret = process.env.ENCRYPTION_KEY): string {
  // 길이와 문자 종류에 관계없이 비밀 문자열에서 32바이트 키를 유도합니다.
  const salt = randomBytes(16);
  const key = scryptSync(readSecret(secret), salt, 32);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return ["v2", salt.toString("hex"), iv.toString("hex"), cipher.getAuthTag().toString("hex"), encrypted.toString("hex")].join(":");
}

export function decrypt(value: string, secret = process.env.ENCRYPTION_KEY): string {
  const password = readSecret(secret);
  const parts = value.split(":");
  const version = parts[0];
  const isV2 = version === "v2";
  const [ivHex, tagHex, encryptedHex] = parts.slice(isV2 ? 2 : 1);
  if ((isV2 ? parts.length !== 5 : version !== "v1" || parts.length !== 4) ||
      (isV2 && !/^[a-f0-9]{32}$/.test(parts[1])) ||
      !/^[a-f0-9]{24}$/.test(ivHex ?? "") ||
      !/^[a-f0-9]{32}$/.test(tagHex ?? "") ||
      !/^(?:[a-f0-9]{2})*$/.test(encryptedHex ?? "")) {
    throw new Error("암호문 형식이 올바르지 않습니다.");
  }
  // v1은 기존 64자리 16진수 키로 만든 암호문을 위한 호환 처리입니다.
  if (!isV2 && !/^[a-fA-F0-9]{64}$/.test(password)) {
    throw new Error("v1 암호문에는 암호화 당시의 64자리 16진수 키가 필요합니다.");
  }
  const key = isV2
    ? scryptSync(password, Buffer.from(parts[1], "hex"), 32)
    : Buffer.from(password, "hex");
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}
