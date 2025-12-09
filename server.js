require('dotenv').config(); 

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql'); 
const app = express();
const port = process.env.PORT || 5000;

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_for_safety';

// 2. process.env 객체를 사용하여 환경 변수 참조
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

// 3. MySQL 연결 실행
connection.connect((err) => {
    if (err) {
        // 연결 실패 시 오류 출력
        console.error('MySQL 연결 실패: ' + err.stack);
        return;
    }
    console.log('MySQL 연결 성공 (ID ' + connection.threadId + ')');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// ==========================================================
// 1. 인증 미들웨어: 토큰 검증 및 사용자 권한 확인
// ==========================================================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Bearer [토큰] 형식에서 토큰 부분만 추출
    const token = authHeader && authHeader.split(' ')[1]; 

    if (token == null) {
        // 토큰이 없으면 401 Unauthorized 반환
        return res.status(401).send({ message: '인증 토큰이 필요합니다.' }); 
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            // 토큰 검증 실패 (만료 또는 위변조) 시 403 Forbidden 반환
            return res.status(403).send({ message: '유효하지 않거나 만료된 토큰입니다.' }); 
        }
        
        // 토큰이 유효하면 사용자 정보를 req 객체에 저장
        req.user = user; 
        next(); // 다음 라우터로 요청 전달
    });
};

// ==========================================================
// 2. 로그인 API 구현 (POST /api/login)
// ==========================================================
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // 1. DB에서 사용자 정보 조회
    connection.query('SELECT * FROM user WHERE username = ?', [username], (err, users) => {
        if (err || users.length === 0) {
            return res.status(401).send({ message: '사용자 이름이 잘못되었거나 존재하지 않습니다.' });
        }
        
        const user = users[0];

        // 2. 비밀번호 비교 (bcrypt 사용)
        bcrypt.compare(password, user.password, (err, result) => {
            if (err || !result) {
                return res.status(401).send({ message: '비밀번호가 잘못되었습니다.' });
            }
            
            // 3. 인증 성공 -> JWT 토큰 생성 (Payload에 권한 정보 포함)
            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role }, 
                SECRET_KEY, 
                { expiresIn: '1h' } // 토큰 유효 기간 1시간 설정
            );
            
            // 4. 토큰과 사용자 정보를 클라이언트에 응답
            res.json({ token, username: user.username, role: user.role });
        });
    });
});


// ==========================================================
// 4. 고객 정보 추가 (Create - POST)
// ==========================================================
app.post('/api/customers', authenticateToken, (req, res) => {
    // 관리자 권한 확인 (미들웨어에서 req.user에 user 정보가 저장됨)
    if (req.user.role !== 'admin') {
        return res.status(403).send({ message: '등록 권한이 없습니다. (Admin 필요)' });
    }
    
    // 클라이언트에서 전달된 데이터 추출
    const { id, name, job } = req.body;
    
    // 고객 정보 삽입 쿼리
    const sql = 'INSERT INTO customer (id, name, job) VALUES (?, ?, ?)';
    const params = [id, name, job];

    connection.query(sql, params, (err, result) => {
        if (err) {
            console.log("DB 데이터 추가 오류:", err);
            // 🚨 ID 중복 등 오류 발생 시 400 Bad Request 반환
            return res.status(400).send({ message: '데이터 추가에 실패했습니다. (ID 중복 또는 DB 오류)' });
        }
        // 성공 시 201 Created 반환
        res.status(201).send({ message: '고객 정보가 성공적으로 등록되었습니다.', id: result.insertId });
    });
});

// ==========================================================
// 5. 고객 정보 수정 (Update - PUT)
// ==========================================================
// URL 파라미터로 ID를 받습니다. 예: /api/customers/1
app.put('/api/customers/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ message: '수정 권한이 없습니다. (Admin 필요)' });
    }
    
    const customerId = req.params.id;
    const { name, job } = req.body;

    const sql = 'UPDATE customer SET name = ?, job = ? WHERE id = ?';
    const params = [name, job, customerId];

    connection.query(sql, params, (err, result) => {
        if (err) {
            console.log("DB 데이터 수정 오류:", err);
            return res.status(500).send({ message: '데이터 수정에 실패했습니다.' });
        }
        
        if (result.affectedRows === 0) {
            // 해당 ID의 고객이 존재하지 않을 경우
            return res.status(404).send({ message: '수정할 고객을 찾을 수 없습니다.' });
        }

        res.send({ message: `${customerId} 고객 정보가 성공적으로 수정되었습니다.` });
    });
});

// ==========================================================
// 6. 고객 정보 삭제 (Delete - DELETE)
// ==========================================================
// URL 파라미터로 ID를 받습니다. 예: /api/customers/1
app.delete('/api/customers/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ message: '삭제 권한이 없습니다. (Admin 필요)' });
    }

    const customerId = req.params.id;
    const sql = 'DELETE FROM customer WHERE id = ?';

    connection.query(sql, customerId, (err, result) => {
        if (err) {
            console.log("DB 데이터 삭제 오류:", err);
            return res.status(500).send({ message: '데이터 삭제에 실패했습니다.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).send({ message: '삭제할 고객을 찾을 수 없습니다.' });
        }
        
        res.send({ message: `${customerId} 고객 정보가 성공적으로 삭제되었습니다.` });
    });
});

// ==========================================================
// 7. 통합 검색 기능으로 수정 (ID, 이름, 직무)
// ==========================================================
app.get('/api/customers', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ message: '고객 정보 열람 권한이 없습니다. (Admin 필요)' });
    }

    const searchQuery = req.query.search; 
    let sql = "SELECT * FROM customer";
    let params = [];
    
    // 🚨 ID, 이름, 직무 세 필드를 OR 조건으로 통합 검색하도록 수정했습니다.
    if (searchQuery) {
        // ID, Name, Job 중 하나라도 검색어에 포함되면 결과를 반환합니다.
        sql += " WHERE id LIKE ? OR name LIKE ? OR job LIKE ?";
        params = [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`];
    }
    
    // 결과는 ID를 기준으로 정렬
    sql += " ORDER BY id ASC"; 

    connection.query(sql, params, (err, rows, fields) => {
        if (err) {
            console.log("DB 쿼리 오류:", err);
            res.status(500).send("데이터베이스 오류 발생");
        } else {
            // ... (캐시 설정 코드 유지) ...
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
            res.send(rows); // 필터링된 결과 전송
        }
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));