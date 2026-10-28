# 암호화 모듈 사용법

추가 패키지 없이 Bun에서 사용합니다. router에서는 `../utils/crypto`를 import합니다.

```ts
import { hashPassword, verifyPassword, encrypt, decrypt } from "../utils/crypto";

// 단방향: DB에 해시를 저장하고 로그인할 때 비교합니다. 복호화는 불가능합니다.
const hash = await hashPassword("비밀번호");
const matches = await verifyPassword("비밀번호", hash); // true

// 양방향: ENCRYPTION_KEY를 설정한 뒤 사용합니다.
const encrypted = encrypt("010-1234-5678");
const original = decrypt(encrypted);
```

## 양방향 암호화 키 설정

PowerShell에서 한 번 실행하여 키를 생성하세요.

```powershell
bun -e 'import { generateEncryptionKey } from "./src/utils/crypto"; console.log(generateEncryptionKey())'
```

출력된 값을 `.env.development` 또는 `.env.production`에 설정하세요.
현재 앱은 `src/db/env.ts`에서 환경 파일을 읽습니다. 모듈만 별도 실행할 때는 환경 변수를 직접 설정하거나 `encrypt(text, key)`, `decrypt(value, key)`로 키를 전달하세요.

```dotenv
ENCRYPTION_KEY=생성한_64자리_16진수
```

키는 환경별로 따로 생성해 비밀로 보관하고 Git에 커밋하지 마세요.
키를 잃어버리거나 교체하면 기존 암호문을 복호화할 수 없으므로 안전하게 백업하세요.
암호문 전체(`v1:IV:인증태그:암호문`)를 저장해야 복호화할 수 있습니다.

회원가입은 Argon2id 해시를 저장하도록 적용되어 있습니다.
기존 DB에 평문으로 저장된 비밀번호는 자동 변환되지 않습니다. 기존 계정은 비밀번호 재설정 등으로 전환해야 합니다.
