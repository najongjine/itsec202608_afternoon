import { Elysia } from "elysia";
import { db } from "../db";
import { tBoard, tUser } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, encrypt, decrypt } from "../utils/crypto";
import { getBearerToken, signToken, verifyToken } from "../utils/jwt";

// export = 자바에서 public 말하는 겁니다
export const boardRouter = new Elysia({ prefix: "/board" });

boardRouter.get("/test", async () => {
  let response: { success: boolean; data: any; msg: string } = {
    success: true,
    data: null,
    msg: "",
  };
  try {
    const users = await db.select().from(tUser).orderBy(tUser.id).limit(10);
    response.data = users.map(({ password, ...user }) => user);
    const shortLivedToken = await signToken({ userId: 1,msg:"ㅎㅇ" }, 60 * 15); // 15분
    const auth = await verifyToken(shortLivedToken);
    let a=auth?.id;
    response.data=shortLivedToken;
    return response;
  } catch (e: any) {
    console.log(e);
    response.success = false;
    response.msg = `!!!error. ${e?.message}`;
    return response;
  }
});
boardRouter.post("/upsert", async ({request, set}) => {
  let response: { success: boolean; data: any; msg: string } = {
    success: true,
    data: null,
    msg: "",
  };
  try {
    // Authorization: Bearer <토큰> 헤더에서 토큰을 꺼냅니다.
    const accessToken = getBearerToken(request.headers.get("authorization"));
    if (!accessToken) {
      response.success = false;
      response.msg = "인증 토큰이 필요합니다.";
      return response;
    }

    // 서명과 만료 시간을 검증한 뒤, 로그인 시 넣었던 userId를 꺼냅니다.
    const auth = await verifyToken(accessToken);
    const userId = Number(auth?.userId||0);
    if (!userId) {
      response.success = false;
      response.msg = "유효하지 않거나 만료된 인증 토큰입니다.";
      return response;
    }

    // request 라는 커다란 데이터 안에서 formdata 라는것만 꺼내
    const formdata=await request.formData();
    /* formdata라는 큰 상자에서 username,password 라는거 꺼내. 
    그런데 사용자가 이런거 안보냈으면 그냥 "" 으로 처리해 */
    let title=formdata?.get("title")?.toString()?.trim()||"";
    let content=formdata?.get("content")?.toString()?.trim()||"";
   
   /*
    let data:any=await db.insert(tUser).values({username:username,password:passwordHash,phoneno:phonenoEncrypted})
    .returning();
    data=data[0]||{};
    */
   let data:any=await db.insert(tBoard).values({userId:userId,title:title,content:content}).returning();
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
