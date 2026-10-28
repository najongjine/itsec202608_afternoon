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

길이를 맞출 필요 없이 한글, 영어, 숫자, 특수문자를 섞은 비밀 문자열을 설정하면 됩니다.
빈 문자열이나 공백만 있는 문자열은 거부합니다. 공백을 포함한 나머지 문자는 그대로 사용하므로 복호화할 때도 정확히 같은 문자열이 필요합니다.
내부에서 무작위 salt와 scrypt로 32바이트 AES 키를 유도합니다.
짧고 쉽게 추측할 수 있는 문자열보다 길고 예측하기 어려운 비밀 문장을 사용하세요.
원하면 PowerShell에서 무작위 문자열을 생성할 수도 있습니다.

```powershell
bun -e 'import { generateEncryptionKey } from "./src/utils/crypto"; console.log(generateEncryptionKey())'
```

비밀 문자열을 `.env.development` 또는 `.env.production`에 설정하세요.
현재 앱은 `src/db/env.ts`에서 환경 파일을 읽습니다. 모듈만 별도 실행할 때는 환경 변수를 직접 설정하거나 `encrypt(text, key)`, `decrypt(value, key)`로 키를 전달하세요.

```dotenv
ENCRYPTION_KEY="나만 아는 길고 복잡한 비밀문장!"
```

키는 환경별로 따로 생성해 비밀로 보관하고 Git에 커밋하지 마세요.
키를 잃어버리거나 교체하면 기존 암호문을 복호화할 수 없으므로 안전하게 백업하세요.
암호문 전체(`v2:salt:IV:인증태그:암호문`)를 저장해야 복호화할 수 있습니다.
기존 `v1` 암호문도 지원하지만 암호화 당시 사용한 64자리 16진수 키가 필요합니다.
현재 동기 API는 scrypt를 실행하는 동안 호출 스레드를 사용합니다. 대량 처리 시 비동기 API나 worker로 분리하세요.

회원가입은 Argon2id 해시를 저장하도록 적용되어 있습니다.
기존 DB에 평문으로 저장된 비밀번호는 자동 변환되지 않습니다. 기존 계정은 비밀번호 재설정 등으로 전환해야 합니다.
