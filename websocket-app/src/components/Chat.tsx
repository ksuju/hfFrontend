import React, { useState, useEffect, useRef } from 'react';
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

const WEBSOCKET_URL = 'ws://localhost:8090/ws/chat';

const Chat: React.FC<{ chatRoomId: number; memberId: number }> = ({ chatRoomId, memberId }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const stompClientRef = useRef<Client | null>(null);
    const messagesListRef = useRef<HTMLDivElement>(null);
    const [currentUserNickname, setCurrentUserNickname] = useState<string>('');

    const scrollToBottom = () => {
        if (messagesListRef.current) {
            messagesListRef.current.scrollTop = messagesListRef.current.scrollHeight;
        }
    };

    const fetchPreviousMessages = async (page: number) => {
        try {
            const response = await axios.get<ChatResponse>(
                import.meta.env.VITE_CORE_API_BASE_URL + `/api/v1/chatRooms/${chatRoomId}/messages?page=${page}`,
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
                memberId: memberId,
                messageId: latestMessageId
            };

            await axios.put(
                import.meta.env.VITE_CORE_API_BASE_URL + `/api/v1/chatRooms/${chatRoomId}/messages/readStatus`,
                messageReadStatus,
                { withCredentials: true }  // 인증 정보 포함
            );
        } catch (error) {
            console.error('메시지 읽음 상태 업데이트 실패:', error);
        }
    };

    useEffect(() => {
        const client = new Client({
            brokerURL: WEBSOCKET_URL,
            reconnectDelay: 5000,
            // connectHeaders에 인증 정보와 채팅방 ID 추가
            connectHeaders: {
                Authorization: `Bearer ${getAccessToken()}`, // 쿠키에서 토큰 가져오기
                roomId: chatRoomId.toString()
            },
            debug: (str) => {
                console.log('STOMP: ', str);
            },
            onConnect: () => {
                console.log('STOMP 연결 성공');
                fetchPreviousMessages(0);

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
                console.log('STOMP 연결 종료');
            },
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [chatRoomId]);

    // 쿠키에서 accessToken 가져오는 함수
    const getAccessToken = () => {
        const cookies = document.cookie.split(';');
        const accessToken = cookies
            .find(cookie => cookie.trim().startsWith('accessToken='))
            ?.split('=')[1];
        return accessToken || '';
    };

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

    const sendMessage = async () => {
        if (!messageInput.trim() || !stompClientRef.current) return;

        const messageToSend = {
            memberId,
            content: messageInput,
        };

        try {
            stompClientRef.current.publish({
                destination: `/app/chat/${chatRoomId}`,
                body: JSON.stringify(messageToSend),
            });

            await axios.post(
                import.meta.env.VITE_CORE_API_BASE_URL + `/api/v1/chatRooms/${chatRoomId}/messages`,
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

    return (
        <div className="messages-container">
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
                {hasMore && (
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
                                        {msg.chatMessageContent}
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
                        border: '1px solid #ddd',
                        outline: 'none' // 기본 포커스 테두리 제거
                    }}
                    onFocus={(e) => e.target.style.border = '1px solid #F26A2E'} // 포커스 시 테두리 색상
                    onBlur={(e) => e.target.style.border = '1px solid #ddd'} // 포커스 해제 시 원래 색상
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