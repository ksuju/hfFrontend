import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import axios from 'axios';

interface ChatMessage {
    nickname?: string;
    chatMessageContent: string;
    messageTimestamp: string;  // 추가
}

interface PageInfo {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
}

interface ChatResponse {
    content: ChatMessage[];
    page: PageInfo;
}

const WEBSOCKET_URL = 'ws://localhost:8090/ws/chat';

const Chat: React.FC<{ chatRoomId: number; memberId: number }> = ({ chatRoomId, memberId }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const stompClientRef = useRef<Client | null>(null);
    const messagesListRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesListRef.current) {
            messagesListRef.current.scrollTop = messagesListRef.current.scrollHeight;
        }
    };

    // 이전 메시지 조회
    const fetchPreviousMessages = async (page: number) => {
        try {
            const response = await axios.get<ChatResponse>(
                `http://localhost:8090/api/v1/chatRooms/${chatRoomId}/messages?page=${page}`
            );
            
            if (page === 0) {
                setMessages(response.data.content);
                scrollToBottom(); // 초기 로드시에만 스크롤
            } else {
                setMessages(prev => [...prev, ...response.data.content]);
                // 이전 메시지 로드시에는 스크롤 하지 않음
            }
            
            setHasMore(page < response.data.page.totalPages - 1);
        } catch (error) {
            console.error('메시지 조회 실패:', error);
        }
    };

    const loadMoreMessages = () => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchPreviousMessages(nextPage);
    };

    useEffect(() => {
        const client = new Client({
            brokerURL: WEBSOCKET_URL,
            reconnectDelay: 5000,
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
                            messageTimestamp: receivedMessage.createDate // createDate를 messageTimestamp로 매핑
                        };
                        setMessages(prev => [chatMessage, ...prev]);
                        // 새 메시지 수신시에만 스크롤
                        if (receivedMessage.memberId === memberId) {
                            scrollToBottom();
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
                `http://localhost:8090/api/v1/chatRooms/${chatRoomId}/messages`,
                messageToSend
            );

            setMessageInput('');
            // 메시지 전송 후 스크롤
            scrollToBottom();
        } catch (error) {
            console.error('메시지 전송 실패:', error);
        }
    };

    // 시간 포맷팅 함수
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
                    flexDirection: "column"
                }}
            >
                {hasMore && (
                    <button 
                        onClick={loadMoreMessages} 
                        className="load-more-button"
                        style={{
                            margin: "10px auto",
                            padding: "5px 10px"
                        }}
                    >
                        이전 메시지 더보기
                    </button>
                )}
                <div style={{ flexGrow: 1 }}> {/* 여백을 위한 공간 */}
                    {messages.slice().reverse().map((msg, index) => (
                        <div key={index} className="message" style={{ 
                            display: 'flex', 
                            gap: '8px',
                            margin: '5px 0'
                        }}>
                            <span>{msg.nickname} : {msg.chatMessageContent || "내용 없음"}</span>
                            <span style={{ color: '#888', fontSize: '0.9em' }}>
                                {formatMessageTime(msg.messageTimestamp)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="message-input">
                <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="메시지를 입력하세요..."
                    maxLength={250}
                />
                <button onClick={sendMessage}>전송</button>
            </div>
        </div>
    );
};

export default Chat;