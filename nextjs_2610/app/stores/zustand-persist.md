# 로그인 성공 응답으로 배우는 Zustand + persist

지금 로그인에 성공하면 `app/login/page.tsx`에서 아래 코드로 응답을 보여주고 있습니다.

```ts
alert(`로그인 성공 ${JSON.stringify(response?.data || {})}`);
```

올려주신 화면을 보면 `response.data` 안에 `user`와 `token`이 들어 있습니다.
필요한 부분만 간단히 적으면 다음 형태입니다. 아래 토큰은 설명용 가짜 값입니다.

```json
{
  "user": { "id": 10, "username": "test1" },
  "token": "example-token"
}
```

이 값을 **저장하기 → 다른 페이지에서 가져오기 → 새로고침해도 유지하기 → 비우기** 순서로 사용해 보겠습니다.
아래 코드는 직접 적용할 수 있는 예제입니다. 실제 로그인 페이지나 인증 기능을 자동으로 변경한 것은 아닙니다.

## 1. 로그인 정보를 담을 파일 만들기

프로젝트 최상위에 `stores` 폴더를 만들고, 그 안에 `auth-store.ts` 파일을 만드세요.
`app`, `lib`, `stores`가 나란히 있는 구조입니다.

```text
프로젝트/
├─ app/
├─ lib/
│  └─ create-persisted-store.ts  ← 이미 만들어 둔 공통 모듈
└─ stores/
   └─ auth-store.ts             ← 새로 만들 파일
```

`stores/auth-store.ts`에 아래 코드를 넣으세요.
예제에서는 사용자 정보 중 `id`, `username`만 보관합니다.

```ts
"use client";

import { createPersistedStore } from "@/lib/create-persisted-store";

// 저장할 사용자 정보의 형태입니다.
type User = {
  id: number;
  username: string;
};

// 저장할 값과, 그 값을 바꾸는 함수를 정합니다.
type AuthStore = {
  user: User | null;
  token: string | null;
  setLogin: (user: User, token: string) => void;
  clearLogin: () => void;
};

export const useAuthStore = createPersistedStore<AuthStore>(
  (set) => ({
    // 처음에는 저장된 로그인 정보가 없습니다.
    user: null,
    token: null,

    // 로그인 성공 응답을 받으면 호출할 함수입니다.
    setLogin: (user, token) => set({
      user: { id: user.id, username: user.username },
      token: token,
    }),

    // 보관한 로그인 정보를 비우는 함수입니다.
    clearLogin: () => set({ user: null, token: null }),
  }),
  {
    name: "itsec2610board-auth-storage",
    partialize: (state) => ({ user: state.user, token: state.token }),
  },
);
```

여기서 알아둘 것은 다음 다섯 가지입니다.

| 코드 | 하는 일 |
| --- | --- |
| `user`, `token` | 여러 페이지에서 함께 사용할 값입니다. `null`은 아직 값이 없다는 뜻입니다. |
| `set({ ... })` | 괄호 안에 적은 값으로 저장 상태를 바꿉니다. |
| `setLogin(user, token)` | 로그인 성공 시 사용자 정보와 토큰을 넣습니다. |
| `clearLogin()` | 사용자 정보와 토큰을 둘 다 `null`로 바꿉니다. |
| `name`, `partialize` | `auth-storage`라는 이름으로 브라우저에 저장하며, 저장할 항목은 `user`, `token`입니다. |

공통 모듈이 자동 저장을 처리하므로 `localStorage.setItem()`을 따로 작성할 필요가 없습니다.
`@/`는 이 프로젝트의 최상위 폴더를 가리킵니다.

## 2. 지금 로그인 코드에서 저장하기

`app/login/page.tsx`에서 세 군데를 추가하고, 로그인 버튼 한 곳을 바꾸면 됩니다.

### ① 파일 위쪽에 import 추가

기존 import 아래에 추가하세요. 파일 첫 줄의 `"use client";`는 그대로 둡니다.

```ts
import { useAuthStore } from "@/stores/auth-store";
import { useStoreHydration } from "@/lib/create-persisted-store";
```

### ② Login 함수 안에 두 줄 추가

기존 `username`, `password`를 선언하는 부분 바로 아래에 추가하세요.
`onLogin` 함수 안에 넣는 것이 아니라, `Login` 함수 안에 넣습니다.

```ts
const ready = useStoreHydration(useAuthStore);
const setLogin = useAuthStore((state) => state.setLogin);
```

첫 줄은 이전에 저장한 값을 브라우저에서 불러옵니다. 불러오기가 끝나면 `ready`가 `true`가 됩니다.
두 번째 줄은 1번에서 만든 `setLogin` 함수를 가져옵니다.
`(state) => state.setLogin`은 “저장소에서 setLogin을 꺼내겠다”는 뜻입니다.

### ③ 로그인 성공 alert 바로 위에 저장 코드 추가

기존의 실패 확인 부분은 그대로 두고, 성공한 경우에만 `setLogin`을 호출합니다.
현재 코드의 해당 부분이 다음처럼 되면 됩니다.

```ts
if (!response?.success) {
  alert(`로그인 실패. ${response?.msg || "알 수 없는 오류"}`);
  return;
}

// 서버가 보내준 user와 token을 저장합니다.
setLogin(response.data.user, response.data.token);

alert(`로그인 성공 ${JSON.stringify(response?.data || {})}`);
```

**저장하는 코드는 `setLogin(response.data.user, response.data.token)` 한 줄입니다.**
사진 속 응답에서 `user`는 첫 번째 인수로, `token`은 두 번째 인수로 들어갑니다.

### ④ 기존 로그인 버튼 바꾸기

저장된 정보를 불러오는 동안에는 로그인 버튼을 잠시 비활성화합니다.

```tsx
<button disabled={!ready} onClick={onLogin}>
  {ready ? "로그인" : "저장 정보 불러오는 중..."}
</button>
```

이제 로그인에 성공하면 상태가 바뀌고, 같은 내용이 브라우저의 localStorage에도 자동으로 저장됩니다.

## 3. 다른 페이지에서 사용자 이름과 토큰 가져오기

예를 들어 `app/profile/page.tsx`를 만들고 아래 코드를 넣으면 `/profile`에서 확인할 수 있습니다.
이 예제는 저장된 이름을 보여주고, 저장된 정보를 비우는 버튼을 제공합니다.

```tsx
"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useStoreHydration } from "@/lib/create-persisted-store";

export default function Profile() {
  const ready = useStoreHydration(useAuthStore);

  // 필요한 값이나 함수를 한 줄씩 꺼냅니다.
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const clearLogin = useAuthStore((state) => state.clearLogin);

  // 새로고침 직후, 이전 저장값을 불러올 때까지 기다립니다.
  if (!ready) return <p>저장 정보 불러오는 중...</p>;

  if (!user || !token) return <p>저장된 로그인 정보가 없습니다.</p>;

  return (
    <section>
      <p>{user.username}님 안녕하세요.</p>
      <p>회원 번호: {user.id}</p>
      <p>토큰이 저장되어 있습니다.</p>
      <button onClick={clearLogin}>저장된 로그인 정보 비우기</button>
    </section>
  );
}
```

사용자 이름은 `user.username`, 토큰 값은 `token` 변수로 사용할 수 있습니다.
`clearLogin()`을 호출하면 메모리와 localStorage 양쪽의 `user`, `token` 값이 `null`로 바뀝니다.
이 버튼은 브라우저에 보관한 정보를 비우며, 서버 로그아웃 API를 호출하지는 않습니다.

`ready`를 확인하는 이유는 새로고침 직후에는 저장값을 아직 읽지 않았기 때문입니다.
읽기가 끝날 때까지 기다리면 “저장된 정보가 없습니다”라는 문구가 잠깐 나타나는 것을 막을 수 있습니다.
이 화면은 브라우저에 저장된 정보만 표시합니다. 토큰이 유효한지는 서버에서 별도로 확인해야 합니다.

## 4. 직접 확인하기

1. 위 예제를 적용한 뒤 `/login`에서 로그인합니다.
2. `/profile`로 이동하면 `test1님 안녕하세요.`가 표시됩니다.
3. 새로고침해도 같은 이름이 표시되는지 확인합니다. 이것이 persist가 하는 일입니다.
4. `저장된 로그인 정보 비우기`를 누르면 `저장된 로그인 정보가 없습니다.`로 바뀝니다.
5. 다시 새로고침해도 비워진 상태가 유지되는지 확인합니다.

브라우저 개발자 도구에서 **Application → Local Storage → 현재 사이트 → auth-storage**를 열면 저장값도 볼 수 있습니다.

사용할 때 자주 찾게 될 코드는 아래 세 줄입니다. 모두 컴포넌트 함수 안에서 사용합니다.

```ts
const setLogin = useAuthStore((state) => state.setLogin); // 저장하는 함수 가져오기
const user = useAuthStore((state) => state.user);         // 사용자 정보 가져오기
const clearLogin = useAuthStore((state) => state.clearLogin); // 비우는 함수 가져오기
```

저장은 `setLogin(사용자정보, 토큰)`, 이름 확인은 `user?.username`, 비우기는 `clearLogin()`입니다.
