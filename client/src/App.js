import React, { useState, useCallback } from 'react';
import logo from './logo.svg';
import './App.css';
import CustomerProfile from './components/CustomerProfile';
import Login from './components/Login'; 
import CustomerAdd from './components/CustomerAdd'; // 등록 컴포넌트 임포트
import CustomerSearch from './components/CustomerSearch'; // 검색 컴포넌트 임포트
import useCustomerManager from './hooks/useCustomerManager'; 

import {
    Container, Box, Typography, CircularProgress, Button, AppBar, 
    Toolbar, Snackbar, Alert 
} from '@mui/material';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token')); 

    const handleLogout = useCallback(() => { 
        localStorage.removeItem('token');
        setToken(null);
    }, [setToken]);

    const {
        customers,
        loading,
        searchKeyword,
        setSearchKeyword,
        snackbar,
        handleCloseSnackbar,
        handleAddCustomer,
        handleDeleteCustomer,
        handleUpdateCustomer,
    } = useCustomerManager(token, handleLogout); 

    if (!token) {
        return <Login setToken={setToken} />;
    }

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        고객 관리 시스템
                    </Typography>
                    <Button color="inherit" onClick={handleLogout}>
                        로그아웃
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg">
                <Box sx={{ my: 4, textAlign: 'center' }}>
                    <img src={logo} className="App-logo" alt="project logo" />
                    <Typography variant="h4" component="h1" gutterBottom>
                        고객 데이터 관리
                    </Typography>
                </Box>
                
                <hr />
                
                <CustomerAdd 
                    onAdd={handleAddCustomer}
                />
                
                <CustomerSearch 
                    searchKeyword={searchKeyword}
                    setSearchKeyword={setSearchKeyword}
                />

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
                    {loading ? (
                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                            <CircularProgress />
                            <Typography sx={{ mt: 2 }} color="text.secondary">데이터 로딩 중...</Typography>
                        </Box>
                    ) : customers.length > 0 ? (
                        <Box sx={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {customers.map(item => (
                                <CustomerProfile
                                    key={item.id}
                                    id={item.id} 
                                    name={item.name} 
                                    job={item.job} 
                                    onUpdate={handleUpdateCustomer}
                                    onDelete={handleDeleteCustomer}
                                />
                            ))}
                        </Box>
                    ) : (
                        <Typography color="text.secondary">검색 결과가 없거나 표시할 데이터가 없습니다.</Typography>
                    )}
                </Box>
            </Container>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}

export default App;