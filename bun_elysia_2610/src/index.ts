import { Elysia } from "elysia";

/*
MyClass myclass= new Myclass();
new Elysia 라는 객체를 만들고,
.get 이라는 기능을 탑재 시키고, listen 이라는 기능도 탑재 시켰다
listen(3000) = 이 서버의 id 번호는 3000번입니다
 */
const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
