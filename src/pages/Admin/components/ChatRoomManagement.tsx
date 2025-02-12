import { useState, useEffect } from 'react';

interface ChatRoom {
    memberId: string;
    chatRoomId: string;
    roomTitle: string;
    roomContent: string;
    festivalName: string;  // 축제 이름 필드 추가
    roomMemberLimit: string;
    joinMemberNum: string;
    createDate: string;
    joinMemberIdNickNameList: string[][];
    waitingMemberIdNickNameList: string[][];
}

const ChatRoomManagement = () => {
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [memberNicknames, setMemberNicknames] = useState<{ [key: string]: string }>({});

    // 멤버 ID로 닉네임 조회하는 함수
    const fetchMemberNickname = async (memberId: string) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/${memberId}`,
                {
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    }
                }
            );
            if (response.ok) {
                const data = await response.json();
                return data.nickname;
            }
        } catch (error) {
            console.error('멤버 정보 조회 실패:', error);
            return null;
        }
    };

    // 모든 방장의 닉네임을 조회하는 함수
    const fetchAllMemberNicknames = async (rooms: ChatRoom[]) => {
        const nicknames: { [key: string]: string } = {};
        for (const room of rooms) {
            if (!nicknames[room.memberId]) {
                const nickname = await fetchMemberNickname(room.memberId);
                if (nickname) {
                    nicknames[room.memberId] = nickname;
                }
            }
        }
        setMemberNicknames(nicknames);
    };

    const fetchChatRooms = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/chat-rooms`,
                { credentials: 'include' }
            );
            if (response.ok) {
                const data = await response.json();
                setChatRooms(data.content);
                // 채팅방 데이터를 가져온 후 방장들의 닉네임 조회
                await fetchAllMemberNicknames(data.content);
            }
        } catch (error) {
            console.error('채팅방 목록 조회 실패:', error);
        }
    };

    const handleDeleteChatRoom = async (chatRoomId: string) => {
        if (!window.confirm('정말로 이 채팅방을 삭제하시겠습니까?')) return;

        try {
            setIsLoading(true);
            
            // 채팅방 삭제 API 호출
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/delete-chat-room/${chatRoomId}`,
                {
                    method: 'GET',  // DELETE에서 GET으로 변경
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    }
                }
            );

            if (!response.ok) {
                throw new Error('채팅방 삭제 실패');
            }

            // 성공적으로 삭제되면 목록 새로고침
            await fetchChatRooms();
            alert('채팅방이 성공적으로 삭제되었습니다.');

        } catch (error) {
            console.error('채팅방 삭제 중 오류 발생:', error);
            alert('채팅방 삭제에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchChatRooms();
    }, []);

    // 검색어로 채팅방 필터링
    const filteredChatRooms = searchTerm
        ? chatRooms.filter(room => {
            const title = room?.roomTitle?.toLowerCase() || '';
            const searchTermLower = searchTerm.toLowerCase();
            return title.includes(searchTermLower);
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
                        <th className="p-4 text-left">ID</th>
                        <th className="p-4 text-left">방 제목</th>
                        <th className="p-4 text-left">축제 제목</th>
                        <th className="p-4 text-left">방장</th>
                        <th className="p-4 text-left">인원</th>
                        <th className="p-4 text-left">대기</th>
                        <th className="p-4 text-left">생성일</th>
                        <th className="p-4 text-left">관리</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredChatRooms.map((room) => (
                        <tr key={room.chatRoomId} className="border-b hover:bg-gray-50">
                            <td className="p-4">{room.chatRoomId}</td>
                            <td className="p-4 truncate max-w-[150px]" title={room.roomTitle}>
                                {room.roomTitle}
                            </td>
                            <td className="p-4 truncate max-w-[150px]" title={room.festivalName}>
                                {room.festivalName}
                            </td>
                            <td className="p-4">
                                {memberNicknames[room.memberId] || room.memberId}
                            </td>
                            <td className="p-4">{room.joinMemberNum}/{room.roomMemberLimit}</td>
                            <td className="p-4">{room.waitingMemberIdNickNameList.length}명</td>
                            <td className="p-4">{new Date(room.createDate).toLocaleDateString()}</td>
                            <td className="p-4">
                                <button
                                    onClick={() => handleDeleteChatRoom(room.chatRoomId)}
                                    disabled={isLoading}
                                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
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