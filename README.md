# 📋 Secure Customer Management System (CMS)

> **React**와 **Express**, **PostgreSQL**을 활용한 보안 로그인 기반의 고객 데이터 관리 시스템입니다.  
> push를 통해 코드 수정이 github에 반영되면 **Vercel**과 **Railway**를 통해 빌드부터 배포까지 자동으로 이루어지는 **CI/CD 파이프라인**을 구축하였습니다.

---

## 🔗 Project Links & Info
* **Live Demo:** [https://my-project-1-iun1kt7q9-jun-ho-byuns-projects.vercel.app]
* **Demo Video:** [https://youtu.be/_S1TI1rxjmg]
* **Test Account:** * **ID:** `admin`
  * **PW:** `admin123` (보안을 위해 해싱 처리됨)

---

## 📑 Table of Contents
1. [Tech Stack](#-tech-stack)
2. [CI/CD Pipeline](#-cicd-pipeline-automated-deployment)
3. [System Architecture](#-system-architecture)
4. [Key Features & Demo](#-key-features--demo)
5. [Troubleshooting](#-troubleshooting-critical-issue-solving)

---

## 🛠 Tech Stack

| Category | Tech |
| :--- | :--- |
| **Frontend** | ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![MUI](https://img.shields.io/badge/Material--UI-0081CB?style=flat&logo=material-ui&logoColor=white) |
| **Backend** | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white) |
| **Database** | ![Neon](https://img.shields.io/badge/Neon-00E599?style=flat&logo=neon&logoColor=black) |
| **Security** | ![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=json-web-tokens&logoColor=white) ![BCrypt](https://img.shields.io/badge/BCrypt-4EA94B?style=flat) |
| **Deployment** | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white) ![Railway](https://img.shields.io/badge/Railway-131415?style=flat&logo=railway&logoColor=white) |

---

## 🚀 CI/CD Pipeline (Automated Deployment)
본 프로젝트는 현대적인 웹 개발 워크플로우를 준수하여 **지속적 통합 및 배포(CI/CD)**를 구현했습니다.



* **GitHub Integration:** 모든 소스 코드는 GitHub 저장소에서 관리됩니다.
* **Automated Frontend Build:** `main` 브랜치에 코드가 `push`되면 Vercel이 즉시 변경 사항을 감지하여 최적화된 빌드와 배포를 수행합니다.
* **Automated Backend Deployment:** Railway 서버가 저장소와 연동되어 서버 코드가 업데이트될 때마다 자동으로 재배포를 실행하며, 환경 변수(`.env`)를 안전하게 관리합니다.

---

## 🏗 System Architecture
애플리케이션은 다음과 같은 구조로 데이터를 주고받습니다.



1. **Client (Vercel):** 사용자 UI를 제공하며, 브라우저에서 서버로 API 요청을 보냅니다.
2. **Server (Railway):** 클라이언트의 요청을 받아 비즈니스 로직을 처리하고 JWT 토큰을 검증합니다.
3. **Database (Neon/PostgreSQL):** 관계형 데이터베이스에 사용자 정보와 고객 데이터를 안전하게 보관합니다.

---

## ✨ Key Features

### 1. JWT 기반 보안 로그인
* **BCrypt** 라이브러리를 사용해 비밀번호를 단방향 해싱하여 보안성을 높였습니다.
* **JWT (JSON Web Token)**를 활용하여 인증된 사용자만 고객 데이터에 접근할 수 있도록 미들웨어를 구현했습니다.

### 2. 고객 데이터 CRUD 관리
* 관리자 전용 페이지에서 고객 정보를 등록, 수정, 삭제할 수 있습니다.
* **Material-UI**의 Table과 Dialog를 활용하여 직관적인 UX를 제공합니다.

### 3. 실시간 통합 검색
* SQL의 `LIKE` 구문과 정규식을 활용하여 이름, 직업 등 다양한 키워드로 실시간 검색이 가능합니다.

---

## ⚡ Troubleshooting (Critical Issue Solving)

### ✅ CORS 정책 위반 및 Preflight 차단 해결
* **문제:** 프론트엔드와 백엔드의 도메인이 달라 브라우저 보안 정책에 의해 API 요청이 거절되는 현상이 발생했습니다.
* **해결:** Express 서버에 `cors` 미들웨어를 설치하고, 배포 환경의 도메인을 명시하거나 와일드카드를 허용하여 Preflight 요청을 정상적으로 처리했습니다.



### ✅ 배포 환경에서의 API 경로 불일치 (404 Error)
* **문제:** 로컬에서는 `/api` 상대 경로가 작동했으나, 배포 후 서버가 JSON 대신 404 HTML 페이지를 응답하며 `SyntaxError`가 발생했습니다.
* **해결:** 배포된 API 서버의 **절대 경로**를 상수로 정의하여 클라이언트에서 직접 호출하도록 수정하여 통신 문제를 해결했습니다.

---

## 💻 How to Run Locally

1. 저장소를 클론합니다:
   ```bash
   git clone [저장소 주소]

2. 환경 변수를 설정합니다 (.env):
   NETLIFY_DATABASE_URL=your_postgres_url
   JWT_SECRET=your_secret_key
   
3. 패키지를 설치하고 실행합니다:

 # Server&&Client (Root)
 yarn start
