import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import kakaoSimpleIcon from '../assets/images/kakaotalk_simple_icon.png';
import googleSimpleIcon from '../assets/images/google_simple_icon.png';
import naverSimpleIcon from '../assets/images/naver_simple_icon.png';
import githubSimpleIcon from '../assets/images/github_simple_icon.png';

// 성별 표시 변환 함수 추가
const displayGender = (serverGender: string | null) => {
    if (serverGender === 'M') return '남성';
    if (serverGender === 'W') return '여성';
    return '정보 없음';
};

const xMyPage = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')!).data : null;
    const [editForm, setEditForm] = useState({
        phoneNumber: userInfo?.phoneNumber || '',
        location: userInfo?.location || '',
        gender: userInfo?.gender || '',
        birthday: userInfo?.birthday || '',
        mkAlarm: userInfo?.mkAlarm || false,
        nickname: userInfo?.nickname || ''  // nickname 추가
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isPasswordVerified, setIsPasswordVerified] = useState(false);
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

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

    // 프로필 이미지 초기화 함수 추가
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

    // 일반 사용자 비밀번호 확인
    const handlePasswordVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/me/password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ password })
            });

            if (response.ok) {
                setIsPasswordVerified(true);
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '비밀번호가 일치하지 않습니다.');
            }
        } catch (error) {
            console.error('비밀번호 확인 에러:', error);
            alert('서버 연결에 실패했습니다.');
        }
    };

    // 소셜 전용 계정 비밀번호 생성
    const handleCreatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            setPasswordError('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/me/social/password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ password: newPassword })
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.msg || '비밀번호가 설정되었습니다.');
                setIsPasswordVerified(true);
                setPassword(newPassword); // 생성된 비밀번호를 verification 용 비밀번호로 설정
                setNewPassword('');
                setConfirmNewPassword('');
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '비밀번호 설정에 실패했습니다.');
            }
        } catch (error) {
            console.error('비밀번호 설정 에러:', error);
            alert('서버 연결에 실패했습니다.');
        }
    };

    if (!userInfo) {
        return <div>로그인이 필요합니다.</div>;
    }

    return (
        <div className="p-4">
            {/* 비밀번호 미확인 상태에서는 버튼 숨김 */}
            {((userInfo.onlySocialAccount && isPasswordVerified) ||
                (!userInfo.onlySocialAccount && isPasswordVerified)) && (
                    <div className="flex justify-between items-start mb-6 mr-4">
                        <h2 className="text-2xl font-bold">마이페이지</h2>
                        <div className="space-x-2">
                            {!isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                    >
                                        수정
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                    >
                                        탈퇴
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleUpdate}
                                        className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                    >
                                        저장
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                                    >
                                        취소
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

            <div className="bg-white rounded-lg shadow-md p-6">
                {!isPasswordVerified ? (
                    <div className="max-w-md mx-auto">
                        {userInfo.onlySocialAccount ? (
                            // 소셜 전용 계정 비밀번호 생성 폼
                            <form onSubmit={handleCreatePassword} className="space-y-4">
                                <h3 className="text-xl font-bold text-center mb-4">비밀번호 설정</h3>
                                <p className="text-gray-600 text-center mb-6">
                                    소셜 로그인 계정입니다. 정보 확인을 위해 비밀번호를 설정해주세요.
                                </p>
                                <div>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="새 비밀번호"
                                        className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="password"
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        placeholder="새 비밀번호 확인"
                                        className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                    />
                                </div>
                                {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                                <button
                                    type="submit"
                                    className="w-full h-12 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                                >
                                    비밀번호 설정
                                </button>
                            </form>
                        ) : (
                            // 일반 사용자 비밀번호 확인 폼
                            <form onSubmit={handlePasswordVerify} className="space-y-4">
                                <h3 className="text-xl font-bold text-center mb-4">비밀번호 확인</h3>
                                <p className="text-gray-600 text-center mb-6">
                                    회원 정보를 수정하기 위해 비밀번호를 입력해주세요.
                                </p>
                                <div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="비밀번호"
                                        className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full h-12 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                                >
                                    비밀번호 확인
                                </button>
                            </form>
                        )}
                    </div>
                ) : (
                    <>
                        {/* 프로필 섹션 */}
                        <div className="flex items-center mb-8 relative">
                            <div className="relative">
                                <img
                                    src={userInfo.profilePath?.startsWith('http')
                                        ? userInfo.profilePath
                                        : `https://kr.object.ncloudstorage.com/hf-bucket2025/member/${userInfo.profilePath}`}
                                    alt="프로필"
                                    className="w-80 h-80 rounded-full"
                                />
                                <button
                                    onClick={handleResetImage}
                                    className="absolute top-0 right-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                    title="프로필 이미지 삭제"
                                >
                                    ×
                                </button>
                            </div>
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
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                                >
                                    프로필 사진 변경
                                </button>
                                <div className="mt-6 space-y-4">
                                    <p className="text-base font-bold text-primary mb-2">소셜 계정 연동</p>

                                    <div className="grid grid-cols-2 gap-4"> {/* grid-cols-1 -> grid-cols-2 변경 */}
                                        {/* 카카오 */}
                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <img src={kakaoSimpleIcon} alt="카카오" className="w-8 h-8" /> {/* 크기 증가 */}
                                                <span className="font-medium">카카오</span>
                                            </div>
                                            <div className="flex items-center gap-6"> {/* gap-4에서 gap-6으로 증가 */}
                                                {userInfo.socialAccounts.KAKAO.active ? (
                                                    <>
                                                        <span className="text-sm text-gray-500 ml-4"> {/* ml-4 추가 */}
                                                            {new Date(userInfo.socialAccounts.KAKAO.createDate).toLocaleDateString()}
                                                        </span>
                                                        <span className="px-2 py-1 text-sm bg-primary text-white rounded">ON</span>
                                                    </>
                                                ) : (
                                                    <span className="px-2 py-1 text-sm bg-gray-200 text-gray-600 rounded">OFF</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* 네이버 */}
                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <img src={naverSimpleIcon} alt="네이버" className="w-8 h-8" /> {/* 크기 증가 */}
                                                <span className="font-medium">네이버</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {userInfo.socialAccounts.NAVER.active ? (
                                                    <>
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(userInfo.socialAccounts.NAVER.createDate).toLocaleDateString()}
                                                        </span>
                                                        <span className="px-2 py-1 text-sm bg-primary text-white rounded">ON</span>
                                                    </>
                                                ) : (
                                                    <span className="px-2 py-1 text-sm bg-gray-200 text-gray-600 rounded">OFF</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* 구글 */}
                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <img src={googleSimpleIcon} alt="구글" className="w-8 h-8" /> {/* 크기 증가 */}
                                                <span className="font-medium">구글</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {userInfo.socialAccounts.GOOGLE.active ? (
                                                    <>
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(userInfo.socialAccounts.GOOGLE.createDate).toLocaleDateString()}
                                                        </span>
                                                        <span className="px-2 py-1 text-sm bg-primary text-white rounded">ON</span>
                                                    </>
                                                ) : (
                                                    <span className="px-2 py-1 text-sm bg-gray-200 text-gray-600 rounded">OFF</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* 깃허브 */}
                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <img src={githubSimpleIcon} alt="깃허브" className="w-8 h-8" /> {/* 크기 증가 */}
                                                <span className="font-medium">깃허브</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {userInfo.socialAccounts.GITHUB.active ? (
                                                    <>
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(userInfo.socialAccounts.GITHUB.createDate).toLocaleDateString()}
                                                        </span>
                                                        <span className="px-2 py-1 text-sm bg-primary text-white rounded">ON</span>
                                                    </>
                                                ) : (
                                                    <span className="px-2 py-1 text-sm bg-gray-200 text-gray-600 rounded">OFF</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 수정 가능한 정보 섹션 */}
                        {isEditing ? (
                            <form className="space-y-6">
                                <div className="border-b pb-3">
                                    <label className="block text-base font-bold text-primary mb-1">전화번호</label>
                                    <input
                                        type="text"
                                        value={editForm.phoneNumber}
                                        onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                                        className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                                    />
                                </div>

                                <div className="border-b pb-3">
                                    <label className="block text-base font-bold text-primary mb-1">위치</label>
                                    <input
                                        type="text"
                                        value={editForm.location}
                                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                        className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                                    />
                                </div>

                                <div className="border-b pb-3">
                                    <label className="block text-base font-bold text-primary mb-1">성별</label>
                                    <select
                                        value={editForm.gender}
                                        onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                                        className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                                    >
                                        <option value="">선택안함</option>
                                        <option value="M">남성</option>
                                        <option value="W">여성</option>
                                    </select>
                                </div>

                                <div className="border-b pb-3">
                                    <label className="block text-base font-bold text-primary mb-1">생일</label>
                                    <input
                                        type="date"
                                        value={editForm.birthday}
                                        onChange={(e) => setEditForm({ ...editForm, birthday: e.target.value })}
                                        className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                                    />
                                </div>

                                <div className="border-b pb-3">
                                    <label className="flex items-center text-base font-bold text-primary mb-1">
                                        <input
                                            type="checkbox"
                                            checked={editForm.mkAlarm}
                                            onChange={(e) => setEditForm({ ...editForm, mkAlarm: e.target.checked })}
                                            className="mr-2"
                                        />
                                        마케팅 수신 동의
                                    </label>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="border-b pb-3">
                                    <p className="text-base font-bold text-primary mb-1">전화번호</p>
                                    <p className="text-base text-gray-900">{userInfo.phoneNumber || "정보 없음"}</p>
                                </div>

                                <div className="border-b pb-3">
                                    <p className="text-base font-bold text-primary mb-1">위치</p>
                                    <p className="text-base text-gray-900">{userInfo.location || "정보 없음"}</p>
                                </div>

                                <div className="border-b pb-3">
                                    <p className="text-base font-bold text-primary mb-1">성별</p>
                                    <p className="text-base text-gray-900">{displayGender(userInfo.gender)}</p>
                                </div>

                                <div className="border-b pb-3">
                                    <p className="text-base font-bold text-primary mb-1">생일</p>
                                    <p className="text-base text-gray-900">{userInfo.birthday || "정보 없음"}</p>
                                </div>

                                <div className="border-b pb-3">
                                    <p className="text-base font-bold text-primary mb-1">가입일</p>
                                    <p className="text-base text-gray-900">{new Date(userInfo.createDate).toLocaleDateString()}</p>
                                </div>

                                <div className="border-b pb-3">
                                    <p className="text-base font-bold text-primary mb-1">마케팅 수신 동의</p>
                                    <p className="text-base text-gray-900">{userInfo.mkAlarm ? "동의" : "미동의"}</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default xMyPage;