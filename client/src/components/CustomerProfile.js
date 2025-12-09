import React, { useMemo } from 'react';
import { 
    Card, 
    CardContent, 
    Typography, 
    ListItemAvatar, // ListItem 제거
    Avatar, 
    Box, 
    Button 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

// 이미지 URL 목록 (단일 URL로 변경하여 효율성 개선)
const randomImageUrlBase = 'https://picsum.photos/64/64?random='; 

// props에 id, onUpdate, onDelete 추가
function CustomerProfile({ id, name, job, onUpdate, onDelete }) {
    
    // ID를 기반으로 고유한 이미지 URL을 생성 (고정된 이미지 사용)
    const imageUrl = useMemo(() => {
        return `${randomImageUrlBase}${id}`; 
    }, [id]); // ID가 바뀔 때만 이미지가 변경되도록 의존성 배열에 [id] 추가

    // 삭제 버튼 클릭 핸들러
    const handleDelete = () => {
        if (onDelete) {
            onDelete(id); 
        }
    };
    
    // 수정 버튼 클릭 핸들러
    const handleEdit = () => {
        if (onUpdate) {
            const newName = prompt("새로운 이름을 입력하세요:", name);
            const newJob = prompt("새로운 담당 업무를 입력하세요:", job);

            if (newName && newJob) {
                onUpdate(id, newName, newJob);
            }
        }
    };

    return (
        <Card sx={{ minWidth: 275, marginBottom: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    
                    {/* 프로필 정보 영역 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        
                        {/* 1. 아바타 */}
                        <ListItemAvatar sx={{ mr: 2 }}>
                            <Avatar 
                                alt={`${name}의 프로필`} 
                                src={imageUrl} 
                                sx={{ width: 56, height: 56 }} 
                            />
                        </ListItemAvatar>
                        
                        {/* 2. 고객 정보 */}
                        <div className="profile-details">
                            <Typography variant="h6" component="div">
                                이름: {name} (ID: {id})
                            </Typography>
                            <Typography sx={{ mb: 0.5 }} color="text.secondary">
                                담당 업무: {job}
                            </Typography>
                        </div>
                    </Box>

                    {/* 3. 액션 버튼 영역 */}
                    <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
                        <Button 
                            variant="contained" 
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={handleEdit}
                            size="small"
                        >
                            수정
                        </Button>
                        
                        <Button 
                            variant="outlined" 
                            color="error" 
                            startIcon={<DeleteIcon />}
                            onClick={handleDelete}
                            size="small"
                        >
                            삭제
                        </Button>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}

export default CustomerProfile;