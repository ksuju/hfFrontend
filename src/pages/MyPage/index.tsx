// src/pages/MyPage/index.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileSection from './components/ProfileSection';
import SocialAccounts from './components/SocialAccounts';
import UserInfoForm from './components/UserInfoForm';
import PasswordVerification from './components/PasswordVerification';
import { EditFormData, UserInfo } from './types';
import FriendList from './components/FriendList';

interface MyPageProps {
    updateUserInfo: (userInfo: any) => void;
}

const MyPage = ({ updateUserInfo }: MyPageProps) => {
    const navigate = useNavigate();
    const [isPasswordVerified, setIsPasswordVerified] = useState(false);
    const [activeTab, setActiveTab] = useState('social');

    const defaultSocialAccount = {
        active: false,
        createDate: '',
        email: null
    };


    // userInfo 상태 관리 수정
    const [userInfo, setUserInfo] = useState(() => {
        const stored = localStorage.getItem('userInfo');
        if (!stored) return null;
        try {
            const parsed = JSON.parse(stored);
            // socialAccounts가 없거나 각 계정이 undefined인 경우 기본값 설정
            if (parsed.data) {
                parsed.data.socialAccounts = {
                    KAKAO: { ...defaultSocialAccount, ...parsed.data.socialAccounts?.KAKAO },
                    NAVER: { ...defaultSocialAccount, ...parsed.data.socialAccounts?.NAVER },
                    GOOGLE: { ...defaultSocialAccount, ...parsed.data.socialAccounts?.GOOGLE },
                    GITHUB: { ...defaultSocialAccount, ...parsed.data.socialAccounts?.GITHUB }
                };
                // profilePath가 null이면 기본값 설정
                parsed.data.profilePath = parsed.data.profilePath || 'default.png';
            }
            return parsed.data;
        } catch (e) {
            console.error('userInfo 파싱 에러:', e);
            return null;
        }
    });

    // editForm 의존성 수정
    const [editForm, setEditForm] = useState<EditFormData>({
        phoneNumber: null,
        location: null,
        gender: null,
        birthday: null,
        mkAlarm: false,
        nickname: ''
    });

    // useEffect 수정
    useEffect(() => {
        if (userInfo) {
            setEditForm({
                phoneNumber: userInfo.phoneNumber || null,
                location: userInfo.location || null,
                gender: userInfo.gender || null,
                birthday: userInfo.birthday || null,
                mkAlarm: userInfo.mkAlarm || false,
                nickname: userInfo.nickname || ''
            });
        }
    }, [userInfo]);

    const fetchUserInfo = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/auth/me`,
                {
                    credentials: 'include'
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.data) {
                    // socialAccounts가 없다면 기본값 설정
                    if (!data.data.socialAccounts) {
                        data.data.socialAccounts = {
                            KAKAO: { active: false, createDate: '' },
                            NAVER: { active: false, createDate: '' },
                            GOOGLE: { active: false, createDate: '' },
                            GITHUB: { active: false, createDate: '' }
                        };
                    }
                    localStorage.setItem('userInfo', JSON.stringify(data));
                    setUserInfo(data.data);
                }
            }
        } catch (error) {
            console.error('회원 정보 조회 실패:', error);
        }
    };

    useEffect(() => {
        if (window.sessionStorage.getItem('needsUpdate') === 'true') {
            fetchUserInfo();  // 회원 정보 다시 불러오기
            window.sessionStorage.removeItem('needsUpdate');
        }
    }, []);

    const handleUpdate = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/me/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(editForm)
            });

            const responseData = await response.json();
            console.log('Update response:', responseData);

            if (response.ok && responseData.data) {
                // 회원 정보 업데이트 후 전체 사용자 정보 다시 가져오기
                const userInfoResponse = await fetch(
                    `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/auth/me`,
                    {
                        credentials: 'include'
                    }
                );

                if (userInfoResponse.ok) {
                    const data = await userInfoResponse.json();
                    setUserInfo(data.data);
                    localStorage.setItem('userInfo', JSON.stringify(data));
                }

                alert('회원정보가 수정되었습니다.');
            } else {
                alert(responseData.msg || '회원정보 수정에 실패했습니다.');
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
                const newUserInfo = {
                    ...userInfo,
                    profilePath: updatedUserInfo.data.profilePath
                };
                updateUserInfo({ data: newUserInfo });  // App의 상태 업데이트
                setUserInfo(newUserInfo);
                alert('프로필 이미지가 변경되었습니다.');
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '이미지 업로드에 실패했습니다.');
            }
        } catch (error) {
            console.error('이미지 업로드 에러:', error);
            alert('서버 연결에 실패했습니다.');
        }
    };

    // 이미지 삭제
    const handleResetImage = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/me/profile-image`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                setUserInfo((prev: UserInfo | null) => prev ? { ...prev, profilePath: 'default.png' } : prev);
                alert('프로필 이미지가 삭제되었습니다.');
            }
        } catch (error) {
            console.error('이미지 삭제 에러:', error);
        }
    };

    if (!userInfo) {
        return <div>로그인이 필요합니다.</div>;
    }

    return (
        <div className="flex flex-col min-h-screen">
            {isPasswordVerified ? (
                <>
                    <div className="flex-none px-8 pt-8 pb-6">
                        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6">
                            <ProfileSection
                                userInfo={userInfo}
                                editForm={editForm}
                                setEditForm={setEditForm}
                                onImageUpload={handleImageUpload}
                                onUpdate={handleUpdate}
                                handleResetImage={handleResetImage}
                                handleDelete={handleDelete}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <nav className="border-t border-gray-200 bg-white shadow-sm sticky top-0 z-10">
                            <div className="max-w-4xl mx-auto">
                                <div className="grid grid-cols-3 text-center">
                                    <button
                                        className={`py-4 px-6 font-bold transition-all duration-200 ${activeTab === 'social'
                                            ? 'text-primary border-b-2 border-primary bg-blue-50'
                                            : 'text-gray-500 hover:text-primary hover:bg-blue-50'
                                            }`}
                                        onClick={() => setActiveTab('social')}
                                    >
                                        계정 연동
                                    </button>
                                    <button
                                        className={`py-4 px-6 font-bold transition-all duration-200 ${activeTab === 'info'
                                            ? 'text-primary border-b-2 border-primary bg-blue-50'
                                            : 'text-gray-500 hover:text-primary hover:bg-blue-50'
                                            }`}
                                        onClick={() => setActiveTab('info')}
                                    >
                                        회원 정보
                                    </button>
                                    <button
                                        className={`py-4 px-6 font-bold transition-all duration-200 ${activeTab === 'meetings'
                                            ? 'text-primary border-b-2 border-primary bg-blue-50'
                                            : 'text-gray-500 hover:text-primary hover:bg-blue-50'
                                            }`}
                                        onClick={() => setActiveTab('meetings')}
                                    >
                                        친구 목록
                                    </button>
                                </div>
                            </div>
                        </nav>

                        <div className="max-w-4xl mx-auto p-8">
                            {activeTab === 'social' && <SocialAccounts userInfo={userInfo} onUpdate={fetchUserInfo} />}
                            {activeTab === 'info' && (
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <UserInfoForm
                                        userInfo={userInfo}
                                        editForm={editForm}
                                        setEditForm={setEditForm}
                                        onUpdate={handleUpdate}
                                    />
                                </div>
                            )}
                            {activeTab === 'meetings' && <FriendList />}
                        </div>
                    </div>
                </>
            ) : (
                <PasswordVerification
                    userInfo={userInfo}
                    setIsPasswordVerified={setIsPasswordVerified}
                    setUserInfo={setUserInfo}
                />
            )}
        </div>
    );
};

export default MyPage;