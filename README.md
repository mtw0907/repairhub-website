# RepairHub

전국 음향기기·악기 수리업체 검색/비교/예약/견적/AI 상담 플랫폼. Next.js 16 (App Router) +
Prisma + NextAuth 기반 풀스택 애플리케이션이며, 4단계 권한(USER/PARTNER/ADMIN/SUPER_ADMIN)을
프론트엔드·서버·데이터 접근 전 영역에서 검증합니다.

## 로컬 개발 환경 설정

```bash
npm install
cp .env.example .env   # 값 채우기 (아래 "환경변수" 참고)
npx prisma migrate dev
npx prisma db seed
npm run dev
```

`http://localhost:3000` 에서 확인. 시드 계정(비밀번호 전부 `Passw0rd!`):

| 이메일 | 역할 |
| --- | --- |
| user@repairhub.test | USER |
| partner@repairhub.test | PARTNER |
| admin@repairhub.test | ADMIN |
| superadmin@repairhub.test | SUPER_ADMIN |

## 환경변수

`.env.example` 참고. 최소 필요 값:

- `DATABASE_URL` — Postgres 연결문자열. 로컬 개발도 운영과 동일하게 Postgres를 사용합니다
  (Vercel 프로젝트 → Storage → Postgres 추가하면 발급됨). SQLite는 더 이상 사용하지 않습니다.
- `BLOB_READ_WRITE_TOKEN` — 업체 사진·사업자등록증 업로드용 Vercel Blob 토큰
  (Vercel 프로젝트 → Storage → Blob 추가하면 발급됨)
- `AUTH_SECRET` — NextAuth 세션 서명 키. **운영 배포 전 반드시 새로 생성**: `openssl rand -base64 32`

OpenAI API Key, 토스페이먼츠 Client/Secret Key, SMTP 설정, Kakao Maps 키 등은 코드/환경변수가
아니라 **최고관리자 로그인 → 시스템 설정** 화면에서 등록합니다 (DB에 저장되며 즉시 반영, 재배포 불필요).

## 데이터베이스 · 파일 스토리지

Postgres(Vercel Postgres 등)와 Vercel Blob을 사용합니다. `schema.prisma`의 Role/Status 등
`String` 필드(주석에 허용값 명시)는 SQLite 시절 설계의 흔적으로, 원하면 Postgres `enum`
타입으로 전환 가능하지만 필수는 아닙니다. 스키마 변경 후에는:

```bash
npx prisma migrate dev   # 로컬
npx prisma migrate deploy  # 운영 배포 파이프라인
```

## 배포 체크리스트 (Vercel 기준)

1. **`AUTH_SECRET`을 새로 생성**하여 운영 환경변수에 설정 (로컬 `.env`의 개발용 값 재사용 금지)
2. Vercel 프로젝트에 Postgres·Blob 스토리지를 추가하고 `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`을
   환경변수로 설정
3. 배포 후 **최고관리자 계정으로 로그인 → 회원 관리에서 시드 계정 비밀번호 변경 또는 삭제**
   (개발용 시드 계정/비밀번호를 운영에 그대로 두지 않기)
4. **최고관리자 → 시스템 설정**에서 OpenAI API Key, 토스페이먼츠 Client/Secret Key, Kakao Maps
   키 등록
4-1. 파트너 Pro 구독은 토스페이먼츠 **빌링(정기결제)** 서비스로 신청해야 함 (일반결제 아님).
   `CRON_SECRET` 환경변수를 랜덤 문자열로 생성해 Vercel에 등록 — 매일 만료 구독을 자동
   재청구하는 `vercel.json`의 크론(`/api/cron/subscriptions/renew`) 인증에 사용됨
5. NextAuth v5는 배포 플랫폼에 따라 `AUTH_TRUST_HOST=true` 환경변수가 필요할 수 있음
   (호스트 헤더 신뢰 관련 오류 발생 시 추가)
6. `NEXT_PUBLIC_SITE_URL`을 실제 배포 도메인으로 설정 (sitemap.xml/robots.txt에 사용됨)
7. Kakao Maps JavaScript 키를 쓴다면, Kakao Developers 콘솔의 플랫폼(Web) 설정에 실제
   배포 도메인을 등록해야 지도가 표시됩니다 (localhost는 등록이 안 되므로 배포 후 진행)
8. 로그인/회원가입 API에는 애플리케이션 레벨 로그인 시도 제한이 없습니다. 배포 플랫폼의
   요청 속도 제한(예: Vercel Firewall, Cloudflare Rate Limiting)을 반드시 적용하세요.
9. `npm audit`에 표시되는 high severity 항목(postcss, sharp)은 Next.js 내부 옵션 의존성이며,
   본 프로젝트는 `next/image`를 사용하지 않고 사용자 입력 CSS를 처리하지 않으므로 실제 공격
   경로가 없습니다. `npm audit fix --force`는 Next.js를 7개 메이저 버전 하위 호환 깨지는 버전으로
   낮추므로 실행하지 마세요 — Next.js의 정식 패치 릴리스를 기다리는 것을 권장합니다.

## 배포 전 검증

```bash
npx tsc --noEmit
npm run build
```

두 명령 모두 통과해야 합니다.

## 아키텍처 개요

- **인증/RBAC**: `src/lib/auth.ts`(NextAuth 설정), `src/proxy.ts`(경로별 역할 검증,
  Next.js 16부터 `middleware.ts`가 `proxy.ts`로 이름이 바뀜), `src/lib/rbac.ts`(API 레벨
  `requireRole`/`requireOwnCompany` 헬퍼)
- **AI 기능**: `src/lib/ai.ts` — OpenAI 키 미설정 시 그레이스풀 폴백, 모든 호출을
  `AiUsageLog`에 기록
- **결제**: `src/lib/payment.ts` — 토스페이먼츠 빌링(정기결제) 연동. 최초 가입 시 카드를
  등록해 billingKey를 발급받고(`Company.billingKey`), 이후 매달 `/api/cron/subscriptions/renew`
  (Vercel Cron, `vercel.json`)가 자동으로 재청구. 카드 정보는 서버를 거치지 않으며, 서버가
  클라이언트 결제 금액을 재검증
- **시스템 설정**: `src/lib/systemSettings.ts` — API Key/SMTP/점검모드 등을 DB에 저장,
  민감한 값은 조회 API로 절대 반환하지 않음
