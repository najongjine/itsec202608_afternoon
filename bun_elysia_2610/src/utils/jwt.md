# JWT 모듈 사용 매뉴얼

`src/utils/jwt.ts`는 `jose`를 사용하는 Bun용 모듈입니다.
Elysia 플러그인 등록 없이 router에서 함수를 import하면 됩니다.
로그인 API와 기존 라우터의 인증 처리는 수강생이 직접 구현합니다.

## 1. 비밀 키 설정

의존성은 `package.json`에 추가되어 있습니다. 다른 PC에서는 `bun install`을 실행하세요.
`JWT_SECRET`은 길이나 문자 종류를 맞출 필요 없이 원하는 비밀 문자열로 설정합니다.
한글, 영어, 숫자, 특수문자, 이모지와 공백을 섞어도 됩니다. 빈 값이나 공백만 있는 값은 거부합니다.
`.env.development`에 다음처럼 따옴표로 감싸서 넣으세요.

```dotenv
JWT_SECRET="내가 원하는 비밀문장! 한글도 가능 🔑"
```

운영용 값은 별도로 정해서 `.env.production` 또는 배포 환경 변수에 넣습니다.
무작위 키를 쓰고 싶으면 프로젝트 루트의 PowerShell에서 다음 명령으로 생성할 수도 있습니다.

```powershell
bun -e 'import { generateJwtSecret } from "./src/utils/jwt"; console.log(generateJwtSecret())'
```

출력된 값을 `JWT_SECRET`에 넣으면 됩니다. 키 생성 함수 사용은 선택 사항입니다.

서버를 재시작하면 적용됩니다. 현재 앱은 `src/db/env.ts`에서 환경 파일을 읽습니다.
JWT 모듈 자체는 환경 파일이나 DB를 로딩하지 않습니다.
단독 스크립트에서는 환경 변수를 직접 설정하거나 `dotenv`로 먼저 로딩하세요.
내부에서 입력 문자열을 SHA-256으로 해시하여 HS256용 32바이트 키로 변환합니다.
해시는 추측하기 쉬운 문자열을 안전하게 바꿔주지는 않으므로, 실제 운영에서는 길고 예측하기 어려운 값을 쓰세요.
공백도 원문 그대로 사용하므로 발급과 검증 때 정확히 같은 값이 필요합니다.
키가 없거나 빈 값 또는 공백만 있으면 발급·검증 시 예외가 발생합니다. 기본 키는 없습니다.
`ENCRYPTION_KEY`와 별개의 키를 사용하고, 요청이나 서버 시작 때마다 새로 생성하지 마세요.
키를 교체하면 이전 키로 발급한 토큰은 검증되지 않습니다.
이전 버전(문자열을 키로 직접 사용)에서 발급한 토큰도 이번 변경 후 다시 발급해야 합니다.
실제 키를 Git에 커밋하지 마세요. 현재 `.gitignore`의 env 제외 규칙은 주석 처리되어 있으므로 커밋 전에 확인하세요.

## 2. 제공 함수

| 함수 | 반환값 / 역할 |
| --- | --- |
| `generateJwtSecret()` | 최초 설정용 무작위 비밀 문자열 |
| `signToken(payload, expiresInSeconds?)` | `Promise<string>`, 기본 3,600초(1시간)짜리 토큰 발급 |
| `verifyToken(token)` | 성공하면 넣었던 데이터와 `iat`, `exp`, `iss`, `aud`를 담은 객체, 실패하면 `null`을 반환하는 Promise |
| `getBearerToken(authorization)` | 헤더에서 토큰 추출, 없거나 형식이 틀리면 `null` |

발급·검증 함수에는 `await`가 필요합니다. payload는 원하는 JSON 데이터를 담은 객체입니다.
`userId`는 필수가 아니며, `msg`, `username`, `roles` 등 원하는 필드와 중첩 객체·배열을 넣을 수 있습니다.
`iat`, `exp`, `iss`, `aud`는 모듈이 설정하므로 payload에 넣어도 모듈 설정으로 덮어씁니다.
`nbf`, `sub`, `jti` 같은 JWT 표준 필드를 사용할 때는 표준 타입과 의미를 따릅니다.
`iat`(발급 시간), `exp`(만료 시간)는 밀리초가 아닌 Unix 초 단위입니다.
HS256 알고리즘과 발급자(`bun-elysia`), 대상(`bun-elysia-api`)을 고정해서 검증합니다.
서명 오류·만료·토큰 형식 오류는 `null`로 처리합니다.
사용자 정의 필드의 타입은 `unknown`이며, 필요한 필드와 타입은 사용하는 핸들러에서 확인하세요.
키 설정 오류 등 서버 오류는 예외로 전달되므로 인증 실패와 구분하세요.

## 3. 발급 함수 사용

아래 코드는 함수 사용 예제입니다. 로그인 API 핸들러는 직접 작성하세요.

```ts
import { signToken } from "../utils/jwt";

// 예제 ID입니다. 실제로는 계정 조회와 비밀번호 검증을 통과한 DB 사용자 ID를 사용하세요.
const token = await signToken({ userId: 1 });
const shortLivedToken = await signToken({ userId: 1, msg: "ㅎㅇ" }, 60 * 15); // 15분
const customToken = await signToken({ msg: "ㅎㅇ", roles: ["student"] }); // userId도 선택
```

검증하면 추가로 넣은 데이터도 반환됩니다.

```ts
import { verifyToken } from "../utils/jwt";

const auth = await verifyToken(shortLivedToken);
console.log(auth?.msg); // "ㅎㅇ" (검증 성공 시)
```

수강생 구현 순서:

1. 로그인 요청에서 계정과 비밀번호를 받습니다.
2. DB에서 계정을 조회합니다.
3. `utils/crypto.ts`의 `verifyPassword`로 저장된 해시와 비교합니다.
4. 일치할 때만 **DB에서 조회한 ID**로 `signToken`을 호출합니다.
5. 발급한 토큰을 응답에 담습니다. 요청자가 보낸 `userId`를 그대로 신뢰하면 안 됩니다.

## 4. 요청에서 검증 함수 사용

클라이언트는 다음 헤더로 토큰을 전달합니다.

```http
Authorization: Bearer 발급받은_토큰
```

아래 코드를 인증이 필요한 Elysia 핸들러 **내부에** 적용하세요.

```ts
import { getBearerToken, verifyToken } from "../utils/jwt";

// 핸들러에서 ({ request, set })을 받았다고 가정합니다.
const token = getBearerToken(request.headers.get("authorization"));
const auth = token ? await verifyToken(token) : null;

if (!auth || typeof auth.userId !== "number" || !Number.isSafeInteger(auth.userId) || auth.userId <= 0) {
  set.status = 401;
  return { success: false, data: null, msg: "로그인이 필요합니다." };
}

// 이 아래에서 auth.userId로 사용자 조회, 작성자 확인 등을 구현합니다.
```

`getBearerToken`은 문자열만 추출합니다. 인증 여부는 반드시 `verifyToken` 결과로 판단하세요.
JWT 내용은 암호화되지 않으므로 비밀번호, 비밀번호 해시, 전화번호 등의 비밀 정보를 넣지 마세요.
모듈은 전달한 필드를 저장합니다. DB 사용자 객체 전체를 넘기지 말고 필요한 필드만 골라 넣으세요.
토큰이 유효해도 사용자 삭제·계정 정지·접근 권한은 필요한 곳에서 DB로 확인해야 합니다.
로그아웃 시 클라이언트가 토큰을 지워도 이미 발급한 토큰은 만료까지 유효합니다.
Refresh Token, 서버 측 강제 로그아웃, 자동 인증 미들웨어는 구현 범위에 포함하지 않았습니다.

## 5. 확인

```powershell
bun test src/utils/jwt.test.ts
bun run typecheck
```

공식 참고: [jose](https://github.com/panva/jose), [JWT 검증 API](https://github.com/panva/jose/blob/main/docs/jwt/verify/functions/jwtVerify.md)
