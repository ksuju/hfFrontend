// src/components/UserProfile/index.tsx
import { useState, useRef, useEffect } from 'react';
import { MoreVertical, UserPlus, Flag } from 'lucide-react';
import useOnClickOutside from '../../hooks/useOnClickOutside';

interface UserProfileProps {
    userId: number;
}

interface ProfileInfo {
    memberId: number;
    nickname: string;
    profilePath: string;
    isFriend: boolean;
}

const UserProfile = ({ userId }: UserProfileProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [reportContent, setReportContent] = useState('');
    const [showReportModal, setShowReportModal] = useState(false);
    const [profileInfo, setProfileInfo] = useState<ProfileInfo | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useOnClickOutside(menuRef, () => setIsOpen(false));
    useOnClickOutside(modalRef, () => setShowReportModal(false));

    useEffect(() => {
        const fetchProfileInfo = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/${userId}/profile-info`,
                    {
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' }
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setProfileInfo(data.data);
                }
            } catch (error) {
                console.error('프로필 정보 조회 실패:', error);
            }
        };

        fetchProfileInfo();
    }, [userId]);

    const handleFriendRequest = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/friends/friend-requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ receiverId: userId })
            });

            if (response.ok) {
                alert('친구 신청이 전송되었습니다.');
            } else {
                const error = await response.json();
                alert(error.msg || '친구 신청에 실패했습니다.');
            }
        } catch (error) {
            alert('서버 연결에 실패했습니다.');
        }
        setIsOpen(false);
    };

    const handleReport = () => {
        setIsOpen(false);
        setShowReportModal(true);
    };

    const submitReport = async () => {
        if (!reportContent.trim()) {
            alert('신고 내용을 입력해주세요.');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/reports`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    reportedId: userId,
                    content: reportContent
                })
            });

            if (response.ok) {
                alert('신고가 접수되었습니다.');
                setShowReportModal(false);
                setReportContent('');
            } else {
                const error = await response.json();
                alert(error.msg || '신고 접수에 실패했습니다.');
            }
        } catch (error) {
            alert('서버 연결에 실패했습니다.');
        }
    };

    const getProfileImageUrl = (path: string | null) => {
        if (!path) return 'https://kr.object.ncloudstorage.com/hf-bucket2025/member/default.png';
        if (path === 'default.png') return 'https://kr.object.ncloudstorage.com/hf-bucket2025/member/default.png';
        if (path.startsWith('http')) return path;
        return `https://kr.object.ncloudstorage.com/hf-bucket2025/member/${path}`;
    };

    return (
        <div className="relative inline-flex items-center gap-2">
            {profileInfo && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-2"
                >
                    <span className="font-medium">{profileInfo.nickname}</span>
                </button>
            )}

            {isOpen && profileInfo && (
                <div
                    ref={menuRef}
                    className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg py-1 z-50"
                >
                    <div className="p-4 border-b flex items-center gap-3">
                        <img
                            src={getProfileImageUrl(profileInfo.profilePath)}
                            alt={profileInfo.nickname}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <span className="font-medium">{profileInfo.nickname}</span>
                    </div>

                    {!profileInfo.isFriend && (
                        <button
                            onClick={handleFriendRequest}
                            className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>친구 신청</span>
                        </button>
                    )}

                    <button
                        onClick={handleReport}
                        className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-red-500"
                    >
                        <Flag className="w-4 h-4" />
                        <span>신고하기</span>
                    </button>
                </div>
            )}

            {showReportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div
                        ref={modalRef}
                        className="bg-white rounded-lg p-6 w-96 max-w-[90%]"
                    >
                        <h3 className="text-lg font-semibold mb-4">신고하기</h3>
                        <textarea
                            value={reportContent}
                            onChange={(e) => setReportContent(e.target.value)}
                            placeholder="신고 내용을 입력해주세요"
                            className="w-full h-32 p-2 border rounded-lg mb-4 resize-none"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                취소
                            </button>
                            <button
                                onClick={submitReport}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                신고하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;