import { useState, useEffect } from 'react';

interface ChatRoom {
    chatRoomId: string;
    roomTitle: string;
    roomContent: string;
    festivalName: string;
    roomMemberLimit: string;
    joinMemberNum: string;
    createDate: string;
    hostNickname: string;
    status?: string;
    phoneNumber?: string;
}

const ChatRoomManagement = () => {
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingRows, setEditingRows] = useState<{ [key: string]: boolean }>({});

    const fetchChatRooms = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/chat-rooms?page=0&size=100`,
                { 
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (response.ok) {
                const data = await response.json();
                console.log('채팅방 데이터:', data);
                setChatRooms(data.content || []);
            }
        } catch (error) {
            console.error('채팅방 목록 조회 실패:', error);
        }
    };

    const handleDelete = async (chatRoomId: string) => {
        if (!window.confirm('이 채팅방을 삭제하시겠습니까?')) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/chat-rooms/${chatRoomId}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                alert('채팅방이 삭제되었습니다.');
                fetchChatRooms();
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '채팅방 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('채팅방 삭제 실패:', error);
            alert('채팅방 삭제 중 오류가 발생했습니다.');
        }
    };

    useEffect(() => {
        fetchChatRooms();
    }, []);

    // 검색어로 채팅방 필터링
    const filteredChatRooms = searchTerm
        ? chatRooms.filter(room => {
            const title = room?.roomTitle?.toLowerCase() || '';
            const nickname = room?.hostNickname?.toLowerCase() || '';
            const searchTermLower = searchTerm.toLowerCase();
            return title.includes(searchTermLower) || nickname.includes(searchTermLower);
        })
        : chatRooms;

    return (
        <div>
            <div className="flex justify-between mb-4">
                <input
                    type="text"
                    placeholder="채팅방 검색..."
                    className="px-4 py-2 border rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <table className="w-full">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="p-4 text-left whitespace-nowrap">ID</th>
                        <th className="p-4 text-left whitespace-nowrap min-w-[150px]">제목</th>
                        <th className="p-4 text-left whitespace-nowrap min-w-[120px]">축제명</th>
                        <th className="p-4 text-left whitespace-nowrap">방장</th>
                        <th className="p-4 text-left whitespace-nowrap">인원</th>
                        <th className="p-4 text-left whitespace-nowrap">상태</th>
                        <th className="p-4 text-left whitespace-nowrap">생성일</th>
                        <th className="p-4 text-left whitespace-nowrap">관리</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredChatRooms.map((room, index) => (
                        <tr key={`${room.chatRoomId}-${index}`} className="border-b hover:bg-gray-50">
                            <td className="p-4 whitespace-nowrap">{room.chatRoomId}</td>
                            <td 
                                className="p-4 truncate max-w-[150px]" 
                                title={room.roomTitle}
                            >
                                {room.roomTitle}
                            </td>
                            <td 
                                className="p-4 truncate max-w-[120px]"
                                title={room.festivalName}
                            >
                                {room.festivalName}
                            </td>
                            <td className="p-4 whitespace-nowrap">{room.hostNickname}</td>
                            <td className="p-4 whitespace-nowrap">{room.joinMemberNum}/{room.roomMemberLimit}</td>
                            <td className="p-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                                    ${room.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                                      room.status === 'CLOSED' ? 'bg-red-100 text-red-800' : 
                                      'bg-gray-100 text-gray-800'}`}>
                                    {room.status === 'ACTIVE' ? '활성' : 
                                     room.status === 'CLOSED' ? '종료' : room.status}
                                </span>
                            </td>
                            <td className="p-4 whitespace-nowrap">{new Date(room.createDate).toLocaleDateString()}</td>
                            <td className="p-4 whitespace-nowrap">
                                <button
                                    onClick={() => handleDelete(room.chatRoomId)}
                                    className="px-3 py-1 rounded-md text-sm font-medium text-red-500 hover:text-red-700"
                                >
                                    삭제
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ChatRoomManagement; 