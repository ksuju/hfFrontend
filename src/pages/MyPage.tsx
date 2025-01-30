import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const MyPage = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')!).data : null;
    const [editForm, setEditForm] = useState({
        phoneNumber: userInfo?.phoneNumber || '',
        location: userInfo?.location || '',
        gender: userInfo?.gender || '',
        birthday: userInfo?.birthday || '',
        mkAlarm: userInfo?.mkAlarm || false
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 회원정보 수정
    const handleUpdate = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/update`, {
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
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/${userInfo.id}/deactivate`,
                {
                    method: 'DELETE',
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
            const response = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/profile-image`, {
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
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/reset-profile-image`,
                {
                    method: 'PATCH',
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

    if (!userInfo) {
        return <div>로그인이 필요합니다.</div>;
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">마이페이지</h2>
                <div className="space-x-2">
                    {!isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 text-sm text-primary border border-primary rounded hover:bg-primary hover:text-white transition-colors"
                            >
                                수정
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm text-red-500 border border-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
                            >
                                탈퇴
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleUpdate}
                                className="px-4 py-2 text-sm text-primary border border-primary rounded hover:bg-primary hover:text-white transition-colors"
                            >
                                저장
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-sm text-gray-500 border border-gray-500 rounded hover:bg-gray-500 hover:text-white transition-colors"
                            >
                                취소
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
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
                        <h3 className="text-xl font-bold text-gray-900">{userInfo.nickname}</h3>
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
                                <option value="MALE">남성</option>
                                <option value="FEMALE">여성</option>
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
                            <p className="text-base text-gray-900">{userInfo.gender || "정보 없음"}</p>
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
            </div>
        </div>
    );
};

export default MyPage;