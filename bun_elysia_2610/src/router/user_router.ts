import { Elysia } from "elysia";
import { db } from "../db";
import { tUser } from "../../drizzle/schema";

// export = 자바에서 public 말하는 겁니다
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
userRouter.post("/register", async ({request}) => {
  let response: { success: boolean; data: any; msg: string } = {
    success: true,
    data: null,
    msg: "",
  };
  try {
    // request 라는 커다란 데이터 안에서 formdata 라는것만 꺼내
    const formdata=await request.formData();
    /* formdata라는 큰 상자에서 username,password 라는거 꺼내. 
    그런데 사용자가 이런거 안보냈으면 그냥 "" 으로 처리해 */
    let username=formdata?.get("username")?.toString()||"";
    let password=formdata?.get("password")?.toString()||"";
    let data:any=await db.insert(tUser).values({username:username,password:password}).returning();
    data=data[0]||{};
    response.data = data;
    return response;
  } catch (e: any) {
    console.log(e);
    response.success = false;
    response.msg = `!!!error. ${e?.message}`;
    return response;
  }
});
