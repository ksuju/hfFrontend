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
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'social' | 'friends'

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
        // 컴포넌트가 마운트되면 무조건 유저 정보를 가져옵니다
        fetchUserInfo();
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


    useEffect(() => {
        const checkAndFetchUserInfo = async () => {
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            if (!isLoggedIn) {
                navigate('/login', {
                    state: { from: { pathname: '/mypage' } }
                });
                return;
            }

            // 로그인 되어있다면 유저 정보 가져오기
            await fetchUserInfo();
        };

        checkAndFetchUserInfo();
    }, [navigate]);


    if (!userInfo) {
        return <div>로딩 중...</div>; // 또는 스피너 컴포넌트
    }


    return (
        <div className="p-4">
            {isPasswordVerified ? (
                <div className="space-y-6">
                    {/* 탭 네비게이션 */}
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex-1 px-4 py-3 font-semibold transition-all duration-200 
                                ${activeTab === 'profile'
                                    ? 'text-primary border-b-2 border-primary bg-blue-50'
                                    : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                                } focus:outline-none`}
                        >
                            프로필 정보
                        </button>
                        <button
                            onClick={() => setActiveTab('social')}
                            className={`flex-1 px-4 py-3 font-semibold transition-all duration-200 
                                ${activeTab === 'social'
                                    ? 'text-primary border-b-2 border-primary bg-blue-50'
                                    : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                                } focus:outline-none`}
                        >
                            소셜 계정
                        </button>
                        <button
                            onClick={() => setActiveTab('friends')}
                            className={`flex-1 px-4 py-3 font-semibold transition-all duration-200 
                                ${activeTab === 'friends'
                                    ? 'text-primary border-b-2 border-primary bg-blue-50'
                                    : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                                } focus:outline-none`}
                        >
                            친구 관리
                        </button>
                    </div>

                    {/* 컨텐츠 영역 */}
                    {activeTab === 'profile' && (
                        <>
                            <ProfileSection
                                userInfo={userInfo}
                                editForm={editForm}
                                setEditForm={setEditForm}
                                onImageUpload={handleImageUpload}
                                onUpdate={handleUpdate}
                                handleResetImage={handleResetImage}
                            />
                            <UserInfoForm
                                userInfo={userInfo}
                                editForm={editForm}
                                setEditForm={setEditForm}
                                onUpdate={handleUpdate}
                                onDelete={handleDelete}  // handleDelete prop 추가
                            />
                        </>
                    )}

                    {activeTab === 'social' && (
                        <SocialAccounts userInfo={userInfo} onUpdate={fetchUserInfo} />
                    )}

                    {activeTab === 'friends' && (
                        <FriendList />
                    )}
                </div>
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