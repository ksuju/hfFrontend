// src/pages/MyPage/index.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileSection from './components/ProfileSection';
import SocialAccounts from './components/SocialAccounts';
import UserInfoForm from './components/UserInfoForm';
import PasswordVerification from './components/PasswordVerification';
import ActionButtons from './components/ActionButtons';
import { EditFormData } from './types';

const MyPage = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isPasswordVerified, setIsPasswordVerified] = useState(false);
    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')!).data : null;

    const [editForm, setEditForm] = useState<EditFormData>({
        phoneNumber: userInfo?.phoneNumber || '',
        location: userInfo?.location || '',
        gender: userInfo?.gender || '',
        birthday: userInfo?.birthday || '',
        mkAlarm: userInfo?.mkAlarm || false,
        nickname: userInfo?.nickname || ''
    });

    // 회원정보 수정
    const handleUpdate = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/me/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(editForm)
            });

            if (response.ok) {
                const updatedUserInfo = await response.json();
                localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
                setIsEditing(false);
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '회원정보 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('수정 에러:', error);
            alert('서버 연결에 실패했습니다.');
        }
    };

    // 회원 탈퇴
    const handleDelete = async () => {
        const confirmed = window.confirm('정말로 탈퇴하시겠습니까?');
        if (!confirmed) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/me/deactivate`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                }
            );

            if (response.ok) {
                const data = await response.json();
                alert(data.msg || '회원 탈퇴가 완료되었습니다.');
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userInfo');
                navigate('/');
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '회원 탈퇴에 실패했습니다.');
            }
        } catch (error) {
            console.error('탈퇴 에러:', error);
            alert('서버 연결에 실패했습니다.');
        }
    };

    // 이미지 업로드
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profileImage', file);

        try {
            const response = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/me/profile-image`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (response.ok) {
                const updatedUserInfo = await response.json();
                localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '이미지 업로드에 실패했습니다.');
            }
        } catch (error) {
            console.error('이미지 업로드 에러:', error);
            alert('서버 연결에 실패했습니다.');
        }
    };

    if (!userInfo) {
        return <div>로그인이 필요합니다.</div>;
    }

    return (
        <div className="p-4">
            {isPasswordVerified ? (
                <>
                    <ActionButtons
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                    />
                    <ProfileSection
                        userInfo={userInfo}
                        isEditing={isEditing}
                        editForm={editForm}
                        setEditForm={setEditForm}
                        onImageUpload={handleImageUpload}
                    />
                    <SocialAccounts userInfo={userInfo} />
                    <UserInfoForm
                        isEditing={isEditing}
                        editForm={editForm}
                        setEditForm={setEditForm}
                    />
                </>
            ) : (
                <PasswordVerification
                    userInfo={userInfo}
                    setIsPasswordVerified={setIsPasswordVerified}
                />
            )}
        </div>
    );
};

export default MyPage;