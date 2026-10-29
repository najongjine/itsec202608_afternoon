import { createHash, randomBytes } from "node:crypto";
import { errors, jwtVerify, SignJWT, type JWTPayload } from "jose";

export type TokenPayload = JWTPayload;

export interface VerifiedTokenPayload extends TokenPayload {
  iat: number;
  exp: number;
}

const issuer = "bun-elysia";
const audience = "bun-elysia-api";

// 최초 설정할 때 생성한 값을 JWT_SECRET에 보관합니다. 요청마다 생성하지 마세요.
export function generateJwtSecret(): string {
  return randomBytes(32).toString("base64url");
}

function readSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret?.trim()) {
    throw new Error("JWT_SECRET에 비어 있지 않은 비밀 문자열을 설정하세요.");
  }
  // 길이·문자 종류 제한 없이 입력받아 HS256용 32바이트 키로 변환합니다.
  // 공백도 키의 일부이므로 trim한 값이 아닌 원문을 사용합니다.
  return createHash("sha256").update(secret, "utf8").digest();
}

// 원하는 JSON 데이터를 넣습니다. 로그인용 토큰은 계정 검증 후 발급하세요.
export async function signToken(
  payload: TokenPayload,
  expiresInSeconds = 60 * 60,
): Promise<string> {
  const secret = readSecret();
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isSafeInteger(expiresInSeconds) || expiresInSeconds <= 0 ||
      !Number.isSafeInteger(now + expiresInSeconds)) {
    throw new Error("토큰 유효 시간은 양의 정수(초)여야 합니다.");
  }
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt(now)
    .setExpirationTime(now + expiresInSeconds)
    .sign(secret);
}

// 만료·변조·잘못된 토큰은 null. 서버의 키 설정 오류는 예외로 알립니다.
export async function verifyToken(token: string): Promise<VerifiedTokenPayload | null> {
  const secret = readSecret();
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
      typ: "JWT",
      issuer,
      audience,
      requiredClaims: ["iat", "exp"],
    });
    if (typeof payload.iat !== "number" || typeof payload.exp !== "number") {
      return null;
    }
    return { ...payload, iat: payload.iat, exp: payload.exp };
  } catch (error) {
    if (error instanceof errors.JOSEError) return null;
    throw error;
  }
}

// request.headers.get("authorization") 값을 전달합니다.
export function getBearerToken(authorization: string | null | undefined): string | null {
  return /^Bearer[ \t]+([^\s]+)$/i.exec(authorization?.trim() ?? "")?.[1] ?? null;
}
