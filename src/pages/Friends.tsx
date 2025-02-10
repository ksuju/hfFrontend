import { useState, useEffect } from 'react';

interface Friend {
    id: number;
    nickname: string;
    profileImage: string | null;
    status: string;
    requestId?: number;
}

export default function Friends() {
    const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
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

    useEffect(() => {
        fetchPendingRequests();
        fetchAcceptedFriends();
    }, []);

    return (
        <div className="p-4">
            {/* 받은 친구 신청 목록 */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">받은 친구 신청</h2>
                <div className="space-y-4">
                    {pendingRequests.length === 0 ? (
                        <p className="text-gray-500">받은 친구 신청이 없습니다.</p>
                    ) : (
                        pendingRequests.map(request => (
                            <div key={request.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                        {request.profileImage ? (
                                            <img src={request.profileImage} alt={request.nickname} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl">{request.nickname[0]}</span>
                                        )}
                                    </div>
                                    <span className="ml-3 font-medium">{request.nickname}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAccept(request.requestId!)}
                                        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                                    >
                                        수락
                                    </button>
                                    <button
                                        onClick={() => handleReject(request.requestId!)}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                    >
                                        거절
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 수락된 친구 목록 */}
            <div>
                <h2 className="text-xl font-bold mb-4">친구 목록</h2>
                <div className="space-y-4">
                    {acceptedFriends.length === 0 ? (
                        <p className="text-gray-500">아직 친구가 없습니다.</p>
                    ) : (
                        acceptedFriends.map(friend => (
                            <div key={friend.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                        {friend.profileImage ? (
                                            <img src={friend.profileImage} alt={friend.nickname} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl">{friend.nickname[0]}</span>
                                        )}
                                    </div>
                                    <span className="ml-3 font-medium">{friend.nickname}</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(friend.id)}
                                    className="px-4 py-2 text-red-500 hover:text-red-700"
                                >
                                    삭제
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
} 