import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';

function CustomerAdd({ onAdd }) {
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [job, setJob] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!id || !name || !job) {
            alert('ID, 이름, 직무는 모두 입력해야 합니다.');
            return;
        }

        onAdd({ id, name, job }); 
        
        // 등록 후 입력 필드 초기화
        setId('');
        setName('');
        setJob('');
    };

    return (
        <Paper elevation={1} sx={{ p: 2, mb: 4, maxWidth: '800px', mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
                고객 정보 신규 등록
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                    label="ID (필수)"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    size="small"
                    sx={{ width: '150px' }}
                />
                <TextField
                    label="이름 (필수)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    size="small"
                    sx={{ width: '200px' }}
                />
                <TextField
                    label="직무 (필수)"
                    value={job}
                    onChange={(e) => setJob(e.target.value)}
                    size="small"
                    sx={{ flexGrow: 1 }}
                />
                <Button variant="contained" type="submit" sx={{ minWidth: '100px' }}>
                    등록
                </Button>
            </Box>
        </Paper>
    );
}

export default CustomerAdd;