import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

// 예제 테이블입니다. 서비스에 필요한 테이블을 이 파일에 정의하세요.
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
