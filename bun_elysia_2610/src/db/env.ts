import { config } from "dotenv";

export const nodeEnv = process.env.NODE_ENV ?? "development";

if (nodeEnv !== "development" && nodeEnv !== "production") {
  throw new Error("NODE_ENV는 development 또는 production으로 설정하세요.");
}

// 배포 환경에서 주입한 환경 변수가 파일보다 우선합니다.
config({ path: `.env.${nodeEnv}`, quiet: true });

const value = process.env.DATABASE_URL;

if (!value) {
  throw new Error(`DATABASE_URL이 필요합니다. .env.${nodeEnv}에 DB 접속 정보를 입력하세요.`);
}

export const databaseUrl = value;
