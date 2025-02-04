import { useRef } from 'react';
import ProfileImage from './ProfileImage';
import { UserInfo, EditFormData } from '../../types';

interface ProfileSectionProps {
    userInfo: UserInfo;
    isEditing: boolean;
    editForm: EditFormData;
    setEditForm: (form: EditFormData) => void;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileSection = ({ userInfo, isEditing, editForm, setEditForm, onImageUpload }: ProfileSectionProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleResetImage = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/me/profile-image`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                }
            );

            if (response.ok) {
                const updatedUserInfo = await response.json();
                localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '프로필 이미지 초기화에 실패했습니다.');
            }
        } catch (error) {
            console.error('프로필 초기화 에러:', error);
            alert('서버 연결에 실패했습니다.');
        }
    };

    return (
        <div className="flex items-center mb-8 relative">
            <ProfileImage
                profilePath={userInfo.profilePath}
                onImageUpload={onImageUpload}
                onResetImage={handleResetImage}
                fileInputRef={fileInputRef}
            />
            <div className="ml-12">
                {isEditing ? (
                    <input
                        type="text"
                        value={editForm.nickname}
                        onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                        className="text-xl font-bold text-gray-900 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-primary"
                    />
                ) : (
                    <h3 className="text-xl font-bold text-gray-900">{userInfo.nickname}</h3>
                )}
                <p className="text-gray-500 mt-2">ID: {userInfo.id}</p>
                <p className="text-gray-500">이메일: {userInfo.email}</p>
                <p className="text-gray-500">로그인 유형: {userInfo.loginType}</p>
            </div>
        </div>
    );
};

export default ProfileSection;