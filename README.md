# 📋 Customer Management System (CMS)

React와 Node.js, PostgreSQL을 사용하여 구축한 **풀스택 고객 관리 웹 애플리케이션**입니다.
JWT 인증을 통한 보안 로그인과 고객 데이터의 CRUD(생성, 조회, 수정, 삭제) 기능을 제공합니다.

🔗 **Demo Link:** [https://my-project-1-iun1kt7q9-jun-ho-byuns-projects.vercel.app]
🔑 **Test Account:** ID: `admin` / PW: `admin123` (예시)

## 🛠 Tech Stack

- **Frontend:** React, Material-UI, Axios
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Deployment:** Vercel (Front), Railway (Back), Neon(DB)
- **DevOps:** Git, GitHub

## ✨ Key Features

1. **JWT Authentication:** 안전한 로그인 및 세션 유지
2. **RESTful API:** 고객 데이터 관리를 위한 효율적인 API 설계
3. **Smart Search:** 키워드 기반 실시간 고객 검색
4. **Responsive UI:** Material-UI를 활용한 깔끔한 디자인

## 🚀 Troubleshooting Experience

### 1. CORS & Proxy Issue
- **상황:** 배포 후 프론트엔드와 백엔드 간 통신이 `401 Unauthorized` 및 CORS 정책으로 차단됨.
- **원인:** Vercel의 `rewrites` 설정이 백엔드 서버(Railway)로 제대로 전달되지 않았으며, 브라우저의 Preflight 요청이 서버에서 거부됨.
- **해결:**
    1. Express 서버에 `cors` 라이브러리 도입 및 와일드카드(`*`) 혹은 특정 도메인 허용 설정.
    2. 클라이언트 코드에서 상대 경로(`/api`) 대신 백엔드 절대 경로를 사용하여 직접 통신하도록 아키텍처 변경.

### 2. JSON Parsing Error (Unexpected token '<')
- **상황:** API 호출 시 `SyntaxError: Unexpected token '<'` 오류 발생.
- **원인:** 잘못된 API 경로로 요청을 보내 서버가 JSON 대신 404 HTML 페이지를 반환함.
- **해결:** `fetch` 요청 URL을 점검하고, 배포된 서버의 엔드포인트와 일치하도록 클라이언트의 `Base URL`을 수정하여 해결.

## 💻 How to Run Locally

1. Clone the repo
2. `npm install` (client & server)
3. Setup `.env` file (DB Key, JWT Secret)
4. `yarn start`
