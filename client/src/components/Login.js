import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

const RAILWAY_API_URL = "https://react-site-production-a693.up.railway.app"; 

function Login({ setToken }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`${RAILWAY_API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '로그인에 실패했습니다.');
            }

            localStorage.setItem('token', data.token);
            setToken(data.token);

        } catch (err) {
            console.error("로그인 중 오류 발생:", err);
            if (err.message.includes('Unexpected end of JSON input')) {
                setError('서버 응답 오류: 서버 상태를 확인해주세요.');
            } else {
                setError(err.message);
            }
        }
    };

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '60vh' 
            }}
        >
            <Paper 
                component="form" 
                onSubmit={handleSubmit}
                sx={{ 
                    padding: 4, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 3, 
                    width: 350 
                }}
            >
                <Typography variant="h5" component="h2" align="center">
                    관리 시스템 로그인
                </Typography>
                
                {error && (
                    <Typography color="error" align="center" variant="body2">
                        {error}
                    </Typography>
                )}

                <TextField
                    label="사용자 이름 (admin)"
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <TextField
                    label="비밀번호 (admin123 해시 값)"
                    variant="outlined"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <Button variant="contained" type="submit" size="large">
                    로그인
                </Button>
            </Paper>
        </Box>
    );
}

export default Login;