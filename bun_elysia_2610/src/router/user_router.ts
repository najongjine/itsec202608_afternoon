import { Elysia } from "elysia";
import { db } from "../db";
import { tUser } from "../../drizzle/schema";

export const userRouter = new Elysia({ prefix: "/user" });
// localhost:3000/user/test
userRouter.get("/test", async () => {
  let response: { success: boolean; data: any; msg: string } = {
    success: true,
    data: null,
    msg: "",
  };
  try {
    response.data = await db.select().from(tUser).orderBy(tUser.id).limit(10);
    return response;
  } catch (e: any) {
    console.log(e);
    response.success = false;
    response.msg = `!!!error. ${e?.message}`;
    return response;
  }
});
userRouter.get("/register", async ({query}) => {
  let response: { success: boolean; data: any; msg: string } = {
    success: true,
    data: null,
    msg: "",
  };
  try {
    let username=query?.username||"";
    let password=query?.password||"";
    return response;
  } catch (e: any) {
    console.log(e);
    response.success = false;
    response.msg = `!!!error. ${e?.message}`;
    return response;
  }
});
