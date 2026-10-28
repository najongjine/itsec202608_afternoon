import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

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

function readKey(keyHex: string | undefined): Buffer {
  if (!keyHex || !/^[a-fA-F0-9]{64}$/.test(keyHex)) {
    throw new Error("ENCRYPTION_KEY는 64자리 16진수(32바이트)여야 합니다.");
  }
  return Buffer.from(keyHex, "hex");
}

// 양방향: 매번 새로운 IV를 사용하고 인증 태그로 변조를 검출합니다.
export function encrypt(text: string, keyHex = process.env.ENCRYPTION_KEY): string {
  const key = readKey(keyHex);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return ["v1", iv.toString("hex"), cipher.getAuthTag().toString("hex"), encrypted.toString("hex")].join(":");
}

export function decrypt(value: string, keyHex = process.env.ENCRYPTION_KEY): string {
  const key = readKey(keyHex);
  const parts = value.split(":");
  const [version, ivHex, tagHex, encryptedHex] = parts;
  if (parts.length !== 4 || version !== "v1" ||
      !/^[a-f0-9]{24}$/.test(ivHex ?? "") ||
      !/^[a-f0-9]{32}$/.test(tagHex ?? "") ||
      !/^(?:[a-f0-9]{2})*$/.test(encryptedHex ?? "")) {
    throw new Error("암호문 형식이 올바르지 않습니다.");
  }
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}
