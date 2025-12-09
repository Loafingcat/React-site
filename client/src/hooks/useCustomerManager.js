import { useState, useEffect, useCallback } from 'react';

// Custom Hook: 고객 데이터를 관리하고 CRUD 로직을 처리
const useCustomerManager = (token, handleLogout) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleCloseSnackbar = useCallback(() => setSnackbar(prev => ({ ...prev, open: false })), []);

    // 💡 1. 데이터 로딩 함수 (useCallback으로 최적화)
    const fetchCustomers = useCallback(async (keyword) => {
        if (!token) return;

        setLoading(true);
        try {
            // 🚨 지연 시간 제거 (필요 없는 경우)
            // await new Promise(resolve => setTimeout(resolve, 500)); 
            
            // ✅ 통합 검색 URL 생성 로직 (이미 완벽)
            const url = `/api/customers${keyword ? `?search=${encodeURIComponent(keyword)}` : ''}`;

            const response = await fetch(url, { 
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.status === 401 || response.status === 403) {
                // 서버에서 토큰 오류가 오면 로그아웃
                handleLogout();
                setSnackbar({ open: true, message: "세션 만료. 재로그인하세요.", severity: 'error' });
                return;
            }

            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            const body = await response.json();
            setCustomers(body);
        } catch (err) {
            console.error("데이터 로딩 오류:", err);
            setCustomers([]);
            setSnackbar({ open: true, message: `데이터 로딩 실패: ${err.message}`, severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [token, handleLogout]);

    // 💡 2. useEffect: 토큰이나 검색어가 바뀔 때 fetchCustomers 실행
    useEffect(() => {
        fetchCustomers(searchKeyword);
    }, [fetchCustomers, searchKeyword]); // 🚨 searchKeyword가 의존성 배열에 있어 실시간 검색 가능


    // =======================================================
    // 3. CRUD Logic
    // =======================================================

    const handleAddCustomer = useCallback(async (newCustomer) => {
        try {
            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(newCustomer),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || '등록 중 서버 오류 발생');
            }

            setSnackbar({ open: true, message: '등록 성공!', severity: 'success' });
            fetchCustomers(searchKeyword); // 새로고침
        } catch (err) {
            setSnackbar({ open: true, message: `등록 실패: ${err.message}`, severity: 'error' });
        }
    }, [token, fetchCustomers, searchKeyword]); 
    
    
    const handleDeleteCustomer = useCallback(async (id) => {
        if (!window.confirm(`${id}번 고객 정보를 정말로 삭제하시겠습니까?`)) {
            return;
        }
        try {
            const response = await fetch(`/api/customers/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || '삭제 중 서버 오류 발생');
            }

            setSnackbar({ open: true, message: '삭제 성공!', severity: 'success' });
            fetchCustomers(searchKeyword); // 새로고침
        } catch (err) {
            setSnackbar({ open: true, message: `삭제 실패: ${err.message}`, severity: 'error' });
        }
    }, [token, fetchCustomers, searchKeyword]);
    
    
    // 🚨 수정 로직 추가/완성
    const handleUpdateCustomer = useCallback(async (id, name, job) => {
        try {
            const response = await fetch(`/api/customers/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ name, job }), // 이름과 직무만 보냅니다.
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '수정 중 서버 오류 발생');
            }
            
            setSnackbar({ open: true, message: `${id} 고객 정보 수정 성공!`, severity: 'success' });
            fetchCustomers(searchKeyword); // 새로고침
            return true; // 수정 성공 시 true 반환
        } catch (err) {
            setSnackbar({ open: true, message: `수정 실패: ${err.message}`, severity: 'error' });
            return false;
        }
    }, [token, fetchCustomers, searchKeyword]);


    return {
        customers,
        loading,
        searchKeyword,
        setSearchKeyword,
        snackbar,
        handleCloseSnackbar,
        handleAddCustomer,
        handleDeleteCustomer,
        handleUpdateCustomer,
    };
};

export default useCustomerManager;