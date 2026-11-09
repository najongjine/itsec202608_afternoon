import { Elysia } from "elysia";
import { checkDbConnection, closeDb } from "./db";
import { userRouter } from "./router/user_router";
import cors from "@elysia/cors";

const app = new Elysia();

app.use(
  cors({
    origin:true,
    methods:"*",
    allowedHeaders:"*",
    credentials:true,
    preflight:true,
  })
);

app.get("/", () => "Hello Elysia");

app.get("/test2", async ({ query }) => {
  let response: { success: boolean; data: any; msg: string } = {
    success: true,
    data: null,
    msg: "",
  };
  let a:any={a:1,b:2};
  let a_b:any={a2:1,b2:2, a};
  let a_b_c:any={a3:1,b3:2, a_b,a};

 
  response.data = a_b_c?.a_b?.a?.a?.b?.a||"그런거 없어";
  return response;
});

app.use(userRouter);
app.onStop(async () => {
  await closeDb();
});

try {
  await checkDbConnection();
  console.log("[DB] 연결 성공");
} catch (error) {
  console.error("[DB] 연결 실패:", error);
  await closeDb();
}

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
