import { afterEach, beforeEach, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { decodeJwt, SignJWT } from "jose";
import { generateJwtSecret, getBearerToken, signToken, verifyToken } from "./jwt";

const testSecret = "test-only-jwt-secret-".repeat(4);
let originalSecret: string | undefined;

beforeEach(() => {
  originalSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = testSecret;
});

afterEach(() => {
  if (originalSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalSecret;
});

// 서명이 맞더라도 검증에서 거부해야 하는 외부 토큰을 만듭니다.
function externalToken(
  claims: Record<string, unknown> = {},
  algorithm = "HS256",
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    userId: 1,
    iat: now,
    exp: now + 3600,
    iss: "bun-elysia",
    aud: "bun-elysia-api",
    ...claims,
  })
    .setProtectedHeader({ alg: algorithm, typ: "JWT" })
    .sign(createHash("sha256").update(testSecret, "utf8").digest());
}

test("발급한 토큰 검증 및 기본 1시간 만료", async () => {
  const token = await signToken({ userId: 7 });
  const auth = await verifyToken(token);
  expect(auth?.userId).toBe(7);
  expect(auth!.exp - auth!.iat).toBe(3600);
  expect(decodeJwt(token)).toMatchObject({ iss: "bun-elysia", aud: "bun-elysia-api" });
});

test("유효 시간 지정 및 불필요한 개인정보 제외", async () => {
  const input = { userId: 3, password: "do-not-include" };
  const token = await signToken(input, 900);
  const auth = await verifyToken(token);
  expect(auth!.exp - auth!.iat).toBe(900);
  expect(decodeJwt(token)).not.toHaveProperty("password");
});

test("변조, 다른 키, 잘못된 토큰 거부", async () => {
  const token = await signToken({ userId: 1 });
  const parts = token.split(".");
  parts[1] = Buffer.from(JSON.stringify({ ...decodeJwt(token), userId: 999 })).toString("base64url");
  expect(await verifyToken(parts.join("."))).toBeNull();
  for (const malformed of ["", "invalid", "a.b.c"]) {
    expect(await verifyToken(malformed)).toBeNull();
  }
  process.env.JWT_SECRET = generateJwtSecret();
  expect(await verifyToken(token)).toBeNull();
});

test("만료 및 미래 nbf 토큰 거부", async () => {
  const now = Math.floor(Date.now() / 1000);
  expect(await verifyToken(await externalToken({ exp: now - 1 }))).toBeNull();
  expect(await verifyToken(await externalToken({ nbf: now + 3600 }))).toBeNull();
});

test("만료 시간, 발급 시간, 사용자 ID 누락 또는 타입 오류 거부", async () => {
  for (const claims of [
    { exp: undefined }, { iat: undefined }, { userId: undefined },
    { exp: "tomorrow" }, { iat: "yesterday" },
    { userId: "1" }, { userId: 0 }, { userId: -1 }, { userId: 1.5 },
  ]) {
    expect(await verifyToken(await externalToken(claims))).toBeNull();
  }
});

test("다른 알고리즘, 발급자, 대상의 토큰 거부", async () => {
  expect(await verifyToken(await externalToken({}, "HS384"))).toBeNull();
  expect(await verifyToken(await externalToken({ iss: "another-app" }))).toBeNull();
  expect(await verifyToken(await externalToken({ aud: "another-api" }))).toBeNull();
});

test("잘못된 발급 입력 거부", async () => {
  for (const userId of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    await expect(signToken({ userId })).rejects.toThrow("userId");
  }
  for (const expiresIn of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER]) {
    await expect(signToken({ userId: 1 }, expiresIn)).rejects.toThrow("유효 시간");
  }
});

test("키 설정 오류는 인증 실패(null)로 숨기지 않음", async () => {
  for (const secret of [undefined, "", " ".repeat(32), "\t\n"]) {
    if (secret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = secret;
    await expect(signToken({ userId: 1 })).rejects.toThrow("JWT_SECRET");
    await expect(verifyToken("invalid")).rejects.toThrow("JWT_SECRET");
  }
});

test("길이·문자 종류 제한 없이 비밀 문자열 사용", async () => {
  for (const secret of ["a", "123", "내맘대로 비밀문장! 🔑", "특수문자!@#$%^&*()", "x".repeat(10000)]) {
    process.env.JWT_SECRET = secret;
    expect((await verifyToken(await signToken({ userId: 1 })))?.userId).toBe(1);
  }
});

test("키에 포함된 앞뒤 공백도 구분", async () => {
  process.env.JWT_SECRET = " 비밀문장 ";
  const token = await signToken({ userId: 1 });
  expect((await verifyToken(token))?.userId).toBe(1);
  process.env.JWT_SECRET = "비밀문장";
  expect(await verifyToken(token)).toBeNull();
});

test("생성한 키로 발급과 검증 가능", async () => {
  const secret = generateJwtSecret();
  expect(Buffer.from(secret, "base64url").length).toBe(32);
  expect(generateJwtSecret()).not.toBe(secret);
  process.env.JWT_SECRET = secret;
  expect((await verifyToken(await signToken({ userId: 1 })))?.userId).toBe(1);
});

test("Bearer 헤더 추출 및 잘못된 헤더 거부", () => {
  expect(getBearerToken("Bearer a.b.c")).toBe("a.b.c");
  expect(getBearerToken("  bearer\ta.b.c  ")).toBe("a.b.c");
  for (const header of [null, undefined, "", "Bearer", "Bearer ", "Basic abc", "Bearer a b", "Bearer a, Bearer b"]) {
    expect(getBearerToken(header)).toBeNull();
  }
});
