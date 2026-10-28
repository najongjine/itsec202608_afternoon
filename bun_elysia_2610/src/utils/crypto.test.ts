import { expect, test } from "bun:test";
import { createCipheriv, randomBytes } from "node:crypto";
import { decrypt, encrypt, generateEncryptionKey, hashPassword, verifyPassword } from "./crypto";

test("비밀번호 해시: 같은 비밀번호도 다른 해시, 올바른 입력만 통과", async () => {
  const hash = await hashPassword("test-password");
  expect(hash).not.toBe(await hashPassword("test-password"));
  expect(await verifyPassword("test-password", hash)).toBe(true);
  expect(await verifyPassword("wrong-password", hash)).toBe(false);
});

test("양방향: 한글과 빈 문자열 복원, 매번 다른 암호문", () => {
  const key = generateEncryptionKey();
  for (const text of ["안녕하세요 🔐", ""]) {
    const encrypted = encrypt(text, key);
    expect(decrypt(encrypted, key)).toBe(text);
    expect(encrypt(text, key)).not.toBe(encrypted);
  }
});

test("잘못된 키, 변조된 데이터, 잘못된 형식 거부", () => {
  const key = generateEncryptionKey();
  const encrypted = encrypt("secret", key);
  expect(() => decrypt(encrypted, generateEncryptionKey())).toThrow();
  const parts = encrypted.split(":");
  parts[2] = (parts[2].startsWith("00") ? "ff" : "00") + parts[2].slice(2);
  expect(() => decrypt(parts.join(":"), key)).toThrow();
  expect(() => decrypt("invalid", key)).toThrow();
  expect(() => encrypt("secret", "")).toThrow();
  expect(() => encrypt("secret", "   ")).toThrow();
});

test("길이 제한 없이 한글, 특수문자, 짧은 문자열 키 사용", () => {
  for (const secret of ["a", "내맘대로! 비밀문장 🔑", "x".repeat(1000)]) {
    expect(decrypt(encrypt("데이터", secret), secret)).toBe("데이터");
  }
});

test("v2 salt 변조 거부", () => {
  const parts = encrypt("secret", "비밀문장").split(":");
  parts[1] = (parts[1].startsWith("00") ? "ff" : "00") + parts[1].slice(2);
  expect(() => decrypt(parts.join(":"), "비밀문장")).toThrow();
});

test("기존 v1 암호문 복호화 호환", () => {
  const key = generateEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", Buffer.from(key, "hex"), iv);
  const encrypted = Buffer.concat([cipher.update("기존 데이터", "utf8"), cipher.final()]);
  const legacy = ["v1", iv.toString("hex"), cipher.getAuthTag().toString("hex"), encrypted.toString("hex")].join(":");
  expect(decrypt(legacy, key)).toBe("기존 데이터");
});
