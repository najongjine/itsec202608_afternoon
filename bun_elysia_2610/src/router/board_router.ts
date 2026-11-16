import { Elysia } from "elysia";
import { db } from "../db";
import { tBoard, tUser } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, encrypt, decrypt } from "../utils/crypto";
import { getBearerToken, signToken, verifyToken } from "../utils/jwt";

// export = 자바에서 public 말하는 겁니다
export const boardRouter = new Elysia({ prefix: "/board" });

boardRouter.get("/get_board_list", async () => {
  let response: { success: boolean; data: any; msg: string } = {
    success: true,
    data: null,
    msg: "",
  };
  try {
    let data = await db.select().from(tBoard).orderBy(tBoard.id).limit(1000);
    response.data = data;
    return response;
  } catch (e: any) {
    console.log(e);
    response.success = false;
    response.msg = `!!!error. ${e?.message}`;
    return response;
  }
});
boardRouter.get("/get_a_board", async ({query}) => {
  let response: { success: boolean; data: any; msg: string } = {
    success: true,
    data: null,
    msg: "",
  };
  try {
    let board_id=Number(query?.board_id?.trim()||0);
    let data:any = await db.select().from(tBoard).where(eq(tBoard.id, board_id)).limit(1);
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
