import { useState, useEffect } from 'react';
import UserProfile from '../../../../components/UserProfile';

interface Friend {
    id: number;
    nickname: string;
    profilePath: string | null;
    status: string;
    requestId?: number;
    friendId?: number;
}

export default function FriendList() {
    const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
    const [sentRequests, setSentRequests] = useState<Friend[]>([]);
    const [acceptedFriends, setAcceptedFriends] = useState<Friend[]>([]);

    // 친구 신청 목록 조회
    const fetchPendingRequests = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/friends/friend-requests`,
                { credentials: 'include' }
            );
            const data = await response.json();
            if (data.resultCode === "200") {
                setPendingRequests(data.data);
            }
        } catch (error) {
            console.error('친구 신청 목록 조회 실패:', error);
        }
    };

    // 보낸 친구 신청 목록 조회
    const fetchSentRequests = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/friends/self-friend-requests`,
                { credentials: 'include' }
            );
            const data = await response.json();
            if (data.resultCode === "200") {
                setSentRequests(data.data);
            }
        } catch (error) {
            console.error('보낸 친구 신청 목록 조회 실패:', error);
        }
    };

    // 수락된 친구 목록 조회
    const fetchAcceptedFriends = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/friends`,
                { credentials: 'include' }
            );
            const data = await response.json();
            if (data.resultCode === "200") {
                setAcceptedFriends(data.data);
            }
        } catch (error) {
            console.error('친구 목록 조회 실패:', error);
        }
    };

    // 친구 신청 수락
    const handleAccept = async (requestId: number) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/friends/friend-requests/${requestId}/accept`,
                {
                    method: 'POST',
                    credentials: 'include'
                }
            );
            if (response.ok) {
                fetchPendingRequests();
                fetchAcceptedFriends();
            }
        } catch (error) {
            console.error('친구 신청 수락 실패:', error);
        }
    };

    // 친구 신청 거절
    const handleReject = async (requestId: number) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/friends/friend-requests/${requestId}/reject`,
                {
                    method: 'POST',
                    credentials: 'include'
                }
            );
            if (response.ok) {
                fetchPendingRequests();
            }
        } catch (error) {
            console.error('친구 신청 거절 실패:', error);
        }
    };

    // 친구 삭제
    const handleDelete = async (friendId: number) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/friends/${friendId}`,
                {
                    method: 'DELETE',
                    credentials: 'include'
                }
            );
            if (response.ok) {
                fetchAcceptedFriends();
            }
        } catch (error) {
            console.error('친구 삭제 실패:', error);
        }
    };

    // 친구 신청 취소
    const handleCancel = async (requestId: number) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/friends/friend-requests/${requestId}`,
                {
                    method: 'DELETE',
                    credentials: 'include'
                }
            );
            if (response.ok) {
                fetchSentRequests();
            }
        } catch (error) {
            console.error('친구 신청 취소 실패:', error);
        }
    };

    useEffect(() => {
        fetchPendingRequests();
        fetchSentRequests();
        fetchAcceptedFriends();
    }, []);

    // 빈 상태 컴포넌트 추가
    const EmptyState = ({ message }: { message: string }) => (
        <div className="flex flex-col items-center justify-center py-8 px-4 bg-primary/5 rounded-lg">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </div>
            <p className="text-gray-500 text-center">{message}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* 받은 친구 신청 목록 */}
            {pendingRequests.length > 0 && (
                <div>
                    <h3 className="text-base font-bold text-primary mb-4">받은 친구 신청</h3>
                    <div className="space-y-3">
                        {pendingRequests.map(request => (
                            <div key={request.id}
                                className="flex items-center justify-between p-4 bg-primary/5 rounded-lg"
                            >
                                <UserProfile userId={request.id} />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAccept(request.requestId!)}
                                        className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/90 text-sm"
                                    >
                                        수락
                                    </button>
                                    <button
                                        onClick={() => handleReject(request.requestId!)}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                                    >
                                        거절
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 보낸 친구 신청 목록 */}
            {sentRequests.length > 0 && (
                <div>
                    <h3 className="text-base font-bold text-primary mb-4">보낸 친구 신청</h3>
                    <div className="space-y-3">
                        {sentRequests.map(request => (
                            <div key={request.id}
                                className="flex items-center justify-between p-4 bg-primary/5 rounded-lg"
                            >
                                <UserProfile userId={request.id} />
                                <button
                                    onClick={() => handleCancel(request.requestId!)}
                                    className="px-3 py-1 text-red-500 hover:text-red-700 text-sm"
                                >
                                    취소
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 친구 목록 */}
            <div>
                <h3 className="text-base font-bold text-primary mb-4">친구</h3>
                {acceptedFriends.length === 0 ? (
                    <EmptyState message="새로운 친구를 만들어보세요" />
                ) : (
                    <div className="space-y-3">
                        {acceptedFriends.map(friend => (
                            <div key={friend.id}
                                className="flex items-center justify-between p-4 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
                            >
                                <UserProfile userId={friend.id} />
                                <button
                                    onClick={() => handleDelete(friend.friendId!)}
                                    className="px-3 py-1 text-red-500 hover:text-red-700 text-sm"
                                >
                                    삭제
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}