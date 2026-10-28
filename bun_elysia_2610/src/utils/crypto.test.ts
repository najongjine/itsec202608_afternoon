import { expect, test } from "bun:test";
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
  expect(() => encrypt("secret", "short-key")).toThrow();
});
