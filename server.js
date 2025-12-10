require('dotenv').config(); 

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_for_safety';


const pool = new Pool({
    // 이 환경 변수에는 Netlify/Neon이 제공한 전체 DB URL이 들어갑니다.
    connectionString: process.env.NETLIFY_DATABASE_URL 
});

const allowedOrigins = [
    'http://localhost:3000',
    'https://my-project-1-bpzqrxctw-jun-ho-byuns-projects.vercel.app' 
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] // 허용할 HTTP 메서드 명시
}));

// 3. PostgreSQL 연결 테스트
pool.connect((err, client, release) => {
    if (err) {
        // 연결 실패 시 오류 출력 
        console.error('PostgreSQL 연결 실패: ' + err.stack);
        return;
    }
    release(); // 연결 객체를 Pool로 반환
    console.log('PostgreSQL 연결 성공');
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// ==========================================================
// 1. 인증 미들웨어: 토큰 검증 및 사용자 권한 확인
// ==========================================================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (token == null) {
        return res.status(401).send({ message: '인증 토큰이 필요합니다.' }); 
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).send({ message: '유효하지 않거나 만료된 토큰입니다.' }); 
        }
        
        req.user = user; 
        next();
    });
};


// ==========================================================
// 2. 로그인 API 구현 (POST /api/login)
// MySQL ? -> PostgreSQL $1, connection.query -> pool.query, result.rows 처리
// ==========================================================
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // 1. DB에서 사용자 정보 조회 (PostgreSQL은 테이블 이름에 쌍따옴표 사용 권장)
    // ? 대신 $1 사용
    pool.query('SELECT * FROM "user" WHERE username = $1', [username])
    .then(result => {
        const users = result.rows; // PostgreSQL 쿼리 결과는 result.rows에 담김

        if (users.length === 0) {
            return res.status(401).send({ message: '사용자 이름이 잘못되었거나 존재하지 않습니다.' });
        }
        
        const user = users[0];

        // 2. 비밀번호 비교 (bcrypt 사용)
        bcrypt.compare(password, user.password, (err, result) => {
            if (err || !result) {
                return res.status(401).send({ message: '비밀번호가 잘못되었습니다.' });
            }
            
            // 3. 인증 성공 -> JWT 토큰 생성
            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role }, 
                SECRET_KEY, 
                { expiresIn: '1h' }
            );
            
            // 4. 토큰과 사용자 정보를 클라이언트에 응답
            res.json({ token, username: user.username, role: user.role });
        });
    })
    .catch(err => {
        console.error("DB 쿼리 오류:", err);
        res.status(500).send({ message: '데이터베이스 오류 발생' });
    });
});


// ==========================================================
// 4. 고객 정보 추가 (Create - POST)
// MySQL ? -> PostgreSQL $1, $2, $3, result.insertId 대신 RETURNING id 사용
// ==========================================================
app.post('/customers', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ message: '등록 권한이 없습니다. (Admin 필요)' });
    }
    
    const { id, name, job } = req.body;
    
    // PostgreSQL 쿼리: ? 대신 $1, $2, $3 사용, 삽입된 ID를 얻기 위해 RETURNING id 추가
    const sql = 'INSERT INTO customer (id, name, job) VALUES ($1, $2, $3) RETURNING id';
    const params = [id, name, job];

    pool.query(sql, params)
    .then(result => {
        // PostgreSQL에서 삽입된 ID는 result.rows[0].id에 담김
        const insertedId = result.rows[0].id;
        res.status(201).send({ message: '고객 정보가 성공적으로 등록되었습니다.', id: insertedId });
    })
    .catch(err => {
        console.error("DB 데이터 추가 오류:", err);
        // ID 중복 등 오류 발생 시 400 Bad Request 반환
        res.status(400).send({ message: '데이터 추가에 실패했습니다. (ID 중복 또는 DB 오류)' });
    });
});

// ==========================================================
// 5. 고객 정보 수정 (Update - PUT)
// MySQL ? -> PostgreSQL $1, $2, $3, result.affectedRows -> result.rowCount 처리
// ==========================================================
app.put('/customers/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ message: '수정 권한이 없습니다. (Admin 필요)' });
    }
    
    const customerId = req.params.id;
    const { name, job } = req.body;

    const sql = 'UPDATE customer SET name = $1, job = $2 WHERE id = $3';
    const params = [name, job, customerId];

    pool.query(sql, params)
    .then(result => {
        // PostgreSQL에서 영향 받은 행 수는 result.rowCount에 담김
        if (result.rowCount === 0) { 
            // 해당 ID의 고객이 존재하지 않을 경우
            return res.status(404).send({ message: '수정할 고객을 찾을 수 없습니다.' });
        }

        res.send({ message: `${customerId} 고객 정보가 성공적으로 수정되었습니다.` });
    })
    .catch(err => {
        console.error("DB 데이터 수정 오류:", err);
        res.status(500).send({ message: '데이터 수정에 실패했습니다.' });
    });
});

// ==========================================================
// 6. 고객 정보 삭제 (Delete - DELETE)
// MySQL ? -> PostgreSQL $1, result.affectedRows -> result.rowCount 처리
// ==========================================================
app.delete('/customers/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ message: '삭제 권한이 없습니다. (Admin 필요)' });
    }

    const customerId = req.params.id;
    const sql = 'DELETE FROM customer WHERE id = $1';

    // params는 배열로 전달해야 함
    pool.query(sql, [customerId])
    .then(result => {
        if (result.rowCount === 0) {
            return res.status(404).send({ message: '삭제할 고객을 찾을 수 없습니다.' });
        }
        
        res.send({ message: `${customerId} 고객 정보가 성공적으로 삭제되었습니다.` });
    })
    .catch(err => {
        console.error("DB 데이터 삭제 오류:", err);
        res.status(500).send({ message: '데이터 삭제에 실패했습니다.' });
    });
});

// ==========================================================
// 7. 통합 검색 기능 (GET /api/customers)
// MySQL ? -> PostgreSQL $1, $2, $3, ID 필드 비교를 위해 id::text 사용
// ==========================================================
app.get('/customers', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ message: '고객 정보 열람 권한이 없습니다. (Admin 필요)' });
    }

    const searchQuery = req.query.search; 
    let sql = "SELECT * FROM customer";
    let params = [];
    
    if (searchQuery) {
        // PostgreSQL: ID(숫자형)를 LIKE 검색하려면 id::text로 형변환 필요.
        // ? 대신 $1, $2, $3 사용
        sql += " WHERE id::text LIKE $1 OR name LIKE $2 OR job LIKE $3";
        params = [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`];
    }
    
    sql += " ORDER BY id ASC"; 

    pool.query(sql, params)
    .then(result => {
        // PostgreSQL 쿼리 결과는 result.rows에 담김
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.send(result.rows); 
    })
    .catch(err => {
        console.error("DB 쿼리 오류:", err);
        res.status(500).send("데이터베이스 오류 발생");
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));