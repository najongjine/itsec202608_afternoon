import { Elysia } from "elysia";
import { closeDb } from "./db";
import { userRouter } from "./router/user_router";

const app = new Elysia();

app.get("/", () => "Hello Elysia");

userRouter.get("/test2", async ({ query }) => {
  let response: { success: boolean; data: any; msg: string } = {
    success: true,
    data: null,
    msg: "",
  };
  let username = query.username;
  let password = query.password;

  let myobj1 = { username: username, password: password };
  response.data = myobj1;
  return response;
});

app.use(userRouter);
app.onStop(async () => {
  await closeDb();
});

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
