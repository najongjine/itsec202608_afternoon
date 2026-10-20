import { Elysia } from "elysia";
import { closeDb, db } from "./db";

/*
MyClass myclass= new Myclass();
new Elysia 라는 객체를 만들고,
.get 이라는 기능을 탑재 시키고, listen 이라는 기능도 탑재 시켰다
listen(3000) = 이 서버의 id 번호는 3000번입니다
 */
const app = new Elysia().decorate("db", db).onStop(async () => {
  await closeDb();
});

app.get("/", () => "Hello Elysia");
app.get("/test", async ({ query }) => {
  let response: { success: boolean; data: any; msg: string } = {
    success: true,
    data: null,
    msg: "",
  };
  let myname = query.myname;
  let name = query.name;
  console.log(`name: ${name}`);
  let myobj1 = { myname: myname, name: name };
  response.data = myobj1;
  return response;
});
app.get("/test2", async ({ query }) => {
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

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
