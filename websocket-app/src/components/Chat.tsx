import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import axios from 'axios';

interface ChatMessage {
    messageId?: number;
    nickname?: string;
    chatMessageContent: string;
    messageTimestamp: string;
}

interface PageInfo {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
}

interface ChatResponse {    // RsData 형식에 맞춰서 수정
    data: {
        content: ChatMessage[];
        page: PageInfo;
    }
}

interface MemberStatusResponse {
    resultCode: string;
    msg: string;
    data: MemberStatus[];
}

interface MemberStatus {
    nickname: string;
    userLoginStatus: string;
}

const WEBSOCKET_URL = `${import.meta.env.VITE_CORE_WEBSOCKET_BASE_URL}/ws/chat`;
const request_URL = import.meta.env.VITE_CORE_API_BASE_URL;

const Chat: React.FC<{ memberId: number }> = ({ memberId }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const stompClientRef = useRef<Client | null>(null);
    const messagesListRef = useRef<HTMLDivElement>(null);
    const [currentUserNickname, setCurrentUserNickname] = useState<string>('');
    const [memberStatusList, setMemberStatusList] = useState<MemberStatus[]>([]);
    const { chatRoomId } = useParams();
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [searchPage, setSearchPage] = useState(0);
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [currentSearchKeyword, setCurrentSearchKeyword] = useState('');
    const [currentSearchNickname, setCurrentSearchNickname] = useState('');
    const scrollToBottom = () => {
        if (messagesListRef.current) {
            messagesListRef.current.scrollTop = messagesListRef.current.scrollHeight;
        }
    };

    // 채팅방 입장 시 메시지 불러오기
    const fetchPreviousMessages = async (page: number) => {
        try {
            const response = await axios.get<ChatResponse>(
                request_URL + `/api/v1/chatRooms/${chatRoomId}/messages?page=${page}`,
                { withCredentials: true }  // 인증 정보 포함
            );

            if (page === 0) {
                setMessages(response.data.data.content);
                // 첫 로드시 가장 최신 메시지의 읽음 상태 업데이트
                if (response.data.data.content.length > 0) {
                    const latestMessage = response.data.data.content[0]; // 가장 최신 메시지
                    if (latestMessage.messageId) {  // id 필드 추가 필요
                        updateMessageReadStatus(latestMessage.messageId);
                    }
                }
                setTimeout(() => scrollToBottom(), 100);
            } else {
                setMessages(prev => [...prev, ...response.data.data.content]);
            }

            setHasMore(page < response.data.data.page.totalPages - 1);
        } catch (error) {
            console.error('메시지 조회 실패:', error);
        }
    };

    const loadMoreMessages = () => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchPreviousMessages(nextPage);
    };

    // 메시지 읽음 상태 업데이트 함수
    const updateMessageReadStatus = async (latestMessageId: number) => {
        try {
            const messageReadStatus = {
                messageId: latestMessageId
            };

            await axios.put(
                request_URL + `/api/v1/chatRooms/${chatRoomId}/messages/readStatus`,
                messageReadStatus,
                { withCredentials: true }  // 인증 정보 포함
            );
        } catch (error) {
            console.error('메시지 읽음 상태 업데이트 실패:', error);
        }
    };

    // 채팅방 멤버의 로그인 상태 가져오기
    const updateMemberLoginStatus = async () => {
        try {
            const response = await axios.get<MemberStatusResponse>(
                import.meta.env.VITE_CORE_API_BASE_URL + `/api/v1/chatRooms/${chatRoomId}/members`,
                { withCredentials: true }
            );
            setMemberStatusList(response.data.data); // data 필드에서 멤버 상태 배열 추출
            console.log(memberStatusList);
        } catch (error) {
            console.error('유저 로그인 상태 조회 실패:', error);
        }
    }

    // 채팅방 멤버의 로그인 상태 로그아웃으로 변경하기
    const updateLogout = async () => {
        try {
            await axios.patch(
                request_URL + `/api/v1/chatRooms/${chatRoomId}/members/logout`,
                {},
                { withCredentials: true }
            );
        } catch (error) {
            console.error('유저 로그아웃 상태 업데이트 실패:', error);
        };
    }

    // 채팅방 멤버의 로그인 상태 로그인으로 변경하기
    const updateLogin = async () => {
        try {
            await axios.patch(
                request_URL + `/api/v1/chatRooms/${chatRoomId}/members/login`,
                {},
                { withCredentials: true }
            );
        } catch (error) {
            console.error('유저 로그인 상태 업데이트 실패:', error);
        };
    }

    // 키워드 하이라이트 함수
    const highlightKeyword = (text: string, keyword: string) => {
        if (!keyword.trim()) return text;
        const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === keyword.toLowerCase() ?
                <span key={i} style={{ backgroundColor: '#ffeb3b', padding: '0 2px' }}>{part}</span>
                : part
        );
    };

    // 채팅 내용 검색
    const messageSearch = async (keyword: string, nickname: string, page: number = 0) => {
        try {
            const response = await axios.get<ChatResponse>(
                `${request_URL}/api/v1/chatRooms/${chatRoomId}/messages/search`,
                {
                    params: {
                        keyword,
                        nickname,
                        page
                    },
                    withCredentials: true
                }
            );

            if (response.data && response.data.data) {
                if (page === 0) {
                    setMessages(response.data.data.content);
                } else {
                    setMessages(prev => [...prev, ...response.data.data.content]);
                }
                setSearchKeyword(keyword);
                setHasMore(page < response.data.data.page.totalPages - 1);
                setIsSearchMode(true);
                setCurrentSearchKeyword(keyword);
                setCurrentSearchNickname(nickname);
                setSearchPage(page + 1);
            }
        } catch (error) {
            console.error('채팅 내용 검색 실패:', error);
        }
    };

    const loadMoreSearchResults = () => {
        if (isSearchMode) {
            messageSearch(currentSearchKeyword, currentSearchNickname, searchPage);
        }
    };

    useEffect(() => {
        const client = new Client({
            brokerURL: WEBSOCKET_URL,
            reconnectDelay: 5000,
            // // connectHeaders에 멤버ID와 채팅방ID 추가
            // connectHeaders: {
            //     memberId: memberId.toString(),
            //     chatRoomId: chatRoomId.toString()
            // },
            debug: (str) => {
                console.log('STOMP: ', str);
                console.log("web_url", import.meta.env)
            },
            onConnect: () => {
                console.log('STOMP 연결 성공');
                updateLogin();
                // updateMemberLoginStatus();
                fetchPreviousMessages(0);

                // 멤버 상태 변경 구독 추가
                client.subscribe(`/topic/members/${chatRoomId}`, () => {
                    setTimeout(() => {
                        updateMemberLoginStatus(); // 멤버 상태 변경 시 업데이트
                    }, 500); // 0.5초 딜레이 (연속된 요청으로 인한 에러 방지)
                });

                // 채팅 메시지 구독
                client.subscribe(`/topic/chat/${chatRoomId}`, (message) => {
                    if (message.body) {
                        const receivedMessage = JSON.parse(message.body);
                        const chatMessage: ChatMessage = {
                            nickname: receivedMessage.nickname,
                            chatMessageContent: receivedMessage.chatMessageContent,
                            messageTimestamp: receivedMessage.createDate
                        };
                        setMessages(prev => [chatMessage, ...prev]);
                        
                        // 새 메시지가 도착하면 읽음 상태 업데이트
                        if (receivedMessage.id) {
                            updateMessageReadStatus(receivedMessage.id);
                        }
                    }
                });
            },
            onDisconnect: () => {
                updateLogout();
                console.log('STOMP 연결 종료');
            },
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [chatRoomId, memberId]);

    const sendMessage = async () => {
        if (!messageInput.trim() || !stompClientRef.current) return;

        const messageToSend = {
            content: messageInput,
        };

        try {
            stompClientRef.current.publish({
                destination: `/app/chat/${chatRoomId}`,
                body: JSON.stringify(messageToSend),
            });

            await axios.post(
                request_URL + `/api/v1/chatRooms/${chatRoomId}/messages`,
                messageToSend,
                { withCredentials: true }  // 인증 정보 포함
            );

            setMessageInput('');
            scrollToBottom();
        } catch (error) {
            console.error('메시지 전송 실패:', error);
        }
    };


    const formatMessageTime = (timestamp: string) => {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
            console.error('Invalid timestamp:', timestamp);
            return '';
        }

        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? '오후' : '오전';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

        return `${ampm} ${formattedHours}:${formattedMinutes}`;
    };


    // 컴포넌트 마운트 시 데이터 가져오기
    useEffect(() => {
        // updateMemberLoginStatus();
    }, [chatRoomId]);  // chatRoomId가 바뀔 때마다 데이터 업데이트

    // 페이지 이동/브라우저 종료 시
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userInfo = localStorage.getItem('userInfo');
                if (userInfo) {
                    const { data } = JSON.parse(userInfo);
                    setCurrentUserNickname(data.nickname);
                }
            } catch (error) {
                console.error('사용자 정보 로드 실패:', error);
            }
        };
        fetchUserInfo();
    }, []);

    // 채팅 검색 컴포넌트
    const ChatSearch = ({ onSearch }: { onSearch: (keyword: string, nickname: string) => void }) => {
        const [keyword, setKeyword] = useState("");
        const [nickname, setNickname] = useState("");

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSearch(keyword, nickname);
        };

        const handleReset = () => {
            // 검색 관련 상태 초기화
            setKeyword("");
            setNickname("");
            setIsSearchMode(false);
            setSearchPage(0);
            setCurrentSearchKeyword('');
            setCurrentSearchNickname('');
            setSearchKeyword(''); // 하이라이트 제거를 위한 검색 키워드 초기화

            // 전체 메시지 다시 로드
            fetchPreviousMessages(0);
        };

        return (
            <div className="p-4 border-b border-gray-200">
                <form onSubmit={handleSubmit} className="space-y-2">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="검색할 내용을 입력하세요"
                            className="flex-1 h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                        />
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="닉네임 (선택사항)"
                            className="w-32 h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                        />
                        <button
                            type="submit"
                            className="h-10 px-4 bg-primary text-white rounded-lg hover:bg-opacity-90"
                        >
                            검색
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="h-10 px-4 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                        >
                            초기화
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    return (
        <div className="messages-container">
            <ChatSearch onSearch={(keyword, nickname) => messageSearch(keyword, nickname, 0)} />
            <div
                className="messages-list"
                ref={messagesListRef}
                style={{
                    height: "400px",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    padding: "20px"
                }}
            >
                {isSearchMode && hasMore && (
                    <button onClick={loadMoreSearchResults} className="w-full p-2 text-primary hover:bg-gray-50">
                        이전 검색 결과 더보기
                    </button>
                )}
                {!isSearchMode && hasMore && (
                    <button onClick={loadMoreMessages}>이전 메시지 더보기</button>
                )}
                <div style={{ flexGrow: 1 }}>
                    {messages.slice().reverse().map((msg, index, array) => {
                        const isMyMessage = msg.nickname === currentUserNickname;
                        const prevMessage = array[index - 1];
                        const showNickname = !isMyMessage && 
                            (!prevMessage || prevMessage.nickname !== msg.nickname);
                        
                        return (
                            <div key={index} 
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isMyMessage ? 'flex-end' : 'flex-start',
                                    margin: '8px 0'
                                }}
                            >
                                {showNickname && (
                                    <span style={{
                                        fontSize: '0.8rem',
                                        color: '#666',
                                        marginBottom: '4px',
                                        marginLeft: '8px'
                                    }}>
                                        {msg.nickname}
                                    </span>
                                )}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: isMyMessage ? 'row-reverse' : 'row',
                                    alignItems: 'flex-end',
                                    gap: '8px'
                                }}>
                                    <div style={{
                                        background: isMyMessage ? '#F26A2E' : '#e9ecef', // 내 메시지 말풍선 색
                                        color: isMyMessage ? 'white' : 'black',
                                        padding: '8px 12px',
                                        borderRadius: isMyMessage ? '15px 15px 0 15px' : '15px 15px 15px 0',
                                        maxWidth: '70%',
                                        wordBreak: 'break-word'
                                    }}>
                                        {highlightKeyword(msg.chatMessageContent, searchKeyword)}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: '#6c757d'
                                    }}>
                                        {formatMessageTime(msg.messageTimestamp)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="message-input" style={{
                display: 'flex',
                gap: '8px',
                padding: '10px',
                borderTop: '1px solid #ddd'
            }}>
                <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="메시지를 입력하세요..."
                    maxLength={250}
                    style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                    }}
                />
                <button 
                    onClick={sendMessage}
                    style={{
                        padding: '8px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <img 
                        src="src/assets/images/send.png"
                        alt="전송"
                        style={{
                            width: '24px',
                            height: '24px',
                            filter: messageInput.trim() 
                                ? 'invert(47%) sepia(82%) saturate(2604%) hue-rotate(337deg) brightness(97%) contrast(92%)' 
                                : 'opacity(0.5)'
                        }}
                    />
                </button>
            </div>
        </div>
    );
};

export default Chat;