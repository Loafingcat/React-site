import React from 'react';
import { Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

function CustomerSearch({ searchKeyword, setSearchKeyword }) {
    return (
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
            <TextField
                label="ID, 이름 또는 직무로 통합 검색"
                variant="outlined"
                size="small"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                sx={{ width: '400px' }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />
        </Box>
    );
}

export default CustomerSearch;