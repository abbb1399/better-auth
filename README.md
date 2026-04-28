# Better Auth Demo

[Better Auth](https://www.better-auth.com/)의 다양한 기능을 직접 구현하며 학습하기 위한 Next.js 프로젝트입니다.

## 주요 기능

### 인증 (Authentication)

- 이메일/비밀번호 회원가입 및 로그인 (이메일 인증 필수)
- 소셜 로그인: GitHub, Discord
- 비밀번호 재설정, 이메일 변경, 계정 삭제

### 보안

- **2FA (이중 인증)**: TOTP(OTP 앱) 및 백업 코드 지원
- **Passkey**: WebAuthn 기반 패스키 등록 및 로그인
- **Rate Limiting**: 데이터베이스 기반 요청 제한
- **비밀번호 강도 검사**: zxcvbn 라이브러리 사용

### 프로필 관리

- 프로필 정보 수정
- 세션 관리 (활성 세션 목록 조회 및 종료)
- 계정 연동 관리, 패스키 관리

### 조직 (Organization)

- 조직 생성 및 멤버 관리
- 역할 기반 접근 제어 (owner, admin, member)
- 이메일 초대 기능
- 조직별 Stripe 구독 관리

### 관리자 (Admin)

- 사용자 목록 조회 및 관리
- 사용자 가장(Impersonation) 기능
- 커스텀 역할 및 권한 시스템 (access control)

### 결제 (Stripe)

- 회원가입 시 Stripe 고객 자동 생성
- 조직 단위 구독 플랜 관리 (업그레이드 / 취소 / 복구)
- Webhook 연동

### 이메일 (Postmark)

- 환영 이메일, 이메일 인증, 비밀번호 재설정
- 계정 삭제 확인, 조직 초대 이메일

## 기술 스택

| 분류         | 기술                                |
| ------------ | ----------------------------------- |
| 프레임워크   | Next.js 16, React 19                |
| 인증         | Better Auth 1.5                     |
| 데이터베이스 | PostgreSQL 17, Drizzle ORM          |
| UI           | Tailwind CSS 4, shadcn/ui, Radix UI |
| 이메일       | Postmark                            |
| 결제         | Stripe                              |
| 보안         | Arcjet                              |
| 폼 검증      | React Hook Form, Zod                |

## 프로젝트 구조

```
src/
├── app/
│   ├── auth/login/          # 로그인 / 회원가입 페이지
│   ├── 2fa/                 # 2FA 설정 페이지
│   ├── profile/             # 프로필 관리 페이지
│   ├── organizations/       # 조직 관리 페이지
│   ├── admin/               # 관리자 페이지
│   └── api/auth/[...all]/   # Better Auth API 라우트
├── lib/
│   ├── auth/
│   │   ├── auth.ts          # 서버 사이드 auth 설정
│   │   ├── auth-client.ts   # 클라이언트 사이드 auth 설정
│   │   └── stripe.ts        # Stripe 플랜 설정
│   └── emails/              # 이메일 템플릿 및 발송 로직
├── drizzle/
│   ├── db.ts                # DB 연결
│   ├── schema.ts            # 스키마 통합 export
│   └── schemas/             # 테이블 스키마 정의
└── components/
    ├── auth/                # 인증 관련 컴포넌트
    └── ui/                  # shadcn/ui 공통 컴포넌트
```

## 시작하기

### 사전 요구사항

- Node.js 20+
- pnpm
- Docker (PostgreSQL 실행용)

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 변수를 설정하세요.

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=better_auth
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/better_auth

# Better Auth
BETTER_AUTH_SECRET=your_secret
BETTER_AUTH_URL=http://localhost:3000

# OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# Postmark
POSTMARK_API_KEY=your_postmark_api_key
POSTMARK_FROM_EMAIL=noreply@yourdomain.com

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Arcjet
ARCJET_KEY=your_arcjet_key
```

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# PostgreSQL 컨테이너 실행
docker compose up -d

# DB 마이그레이션
pnpm db:migrate

# 개발 서버 실행
pnpm dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

### DB 관련 명령어

```bash
pnpm db:generate   # 마이그레이션 파일 생성
pnpm db:migrate    # 마이그레이션 실행
pnpm db:push       # 스키마 직접 동기화 (개발용)
pnpm db:studio     # Drizzle Studio 실행
```

### Better Auth 스키마 재생성

```bash
pnpm auth:generate
```
