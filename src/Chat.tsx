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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 이전 메시지 조회
    const fetchPreviousMessages = async (page: number) => {
        try {
            const response = await axios.get<ChatResponse>(
                `http://localhost:8090/api/v1/chatRooms/${chatRoomId}/messages?page=${page}`
            );
            
            if (page === 0) {
                setMessages(response.data.content);
            } else {
                setMessages(prev => [...prev, ...response.data.content]);
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
                        const receivedMessage: ChatMessage = JSON.parse(message.body);
                        setMessages(prev => [receivedMessage, ...prev]);
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

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
        } catch (error) {
            console.error('메시지 전송 실패:', error);
        }
    };

    // 시간 포맷팅 함수
    const formatMessageTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? '오후' : '오전';
        const formattedHours = hours % 12 || 12;
        
        return `${ampm} ${formattedHours}:${minutes}`;
    };

    return (
        <div className="messages-container">
            <div className="messages-list" style={{ 
                height: "400px", // 고정된 높이 설정
                overflowY: "auto" // 스크롤 가능하도록 설정
            }}>
                {hasMore && (
                    <button 
                        onClick={loadMoreMessages} 
                        className="load-more-button"
                    >
                        이전 메시지 더보기
                    </button>
                )}
                {messages.slice().reverse().map((msg, index) => (
                    <div key={index} className="message" style={{ display: 'flex', gap: '8px' }}>
                        <span>{msg.nickname} : {msg.chatMessageContent || "내용 없음"}</span>
                        <span style={{ color: '#888', fontSize: '0.9em' }}>
                            {formatMessageTime(msg.messageTimestamp)}
                        </span>
                    </div>
                ))}
                <div ref={messagesEndRef} /> {/* 스크롤 타겟 요소 */}
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