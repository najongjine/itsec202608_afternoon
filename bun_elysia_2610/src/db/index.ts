import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { databaseUrl } from "./env";
import * as schema from "../../drizzle/schema";

// 모듈을 가져오는 곳에서 같은 연결 풀을 재사용합니다.
const client = postgres(databaseUrl);

export const db = drizzle(client, { schema });

export async function closeDb() {
  await client.end();
}
