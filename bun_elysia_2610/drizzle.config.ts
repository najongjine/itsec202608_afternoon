import { defineConfig } from "drizzle-kit";
import { databaseUrl } from "./src/db/env";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: databaseUrl },
});
