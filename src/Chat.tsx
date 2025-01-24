import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import axios from 'axios';

// 메시지 인터페이스 간소화
interface ChatMessage {
    nickname?: string;
    chatMessageContent: string;
}

const WEBSOCKET_URL = 'ws://localhost:8090/ws/chat';
// const API_BASE_URL = import.meta.env.VITE_CORE_API_BASE_URL;

const Chat: React.FC<{ chatRoomId: number; memberId: number }> = ({ chatRoomId, memberId }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const stompClientRef = useRef<Client | null>(null);

    // 이전 메시지 조회
    const fetchPreviousMessages = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8090/api/v1/groups/${chatRoomId}/messages`
            );
            
            setMessages(response.data);
        } catch (error) {
            console.error('메시지 조회 실패:', error);
        }
    };

    useEffect(() => {
        const client = new Client({
            brokerURL: WEBSOCKET_URL,
            reconnectDelay: 5000, // 자동 재연결 (5초 간격)
            debug: (str) => {
                console.log('STOMP: ', str);
            },
            onConnect: () => {
                console.log('STOMP 연결 성공');
                // 이전 메시지 조회
                fetchPreviousMessages();

                // 메시지 구독
                client.subscribe(`/topic/chat/${chatRoomId}`, (message) => {
                    if (message.body) {
                        const receivedMessage: ChatMessage = JSON.parse(message.body);
                        setMessages((prev) => [...prev, receivedMessage]);
                    }
                });
            },
            onDisconnect: () => {
                console.log('STOMP 연결 종료');
            },
        });

        client.activate(); // 클라이언트 활성화
        stompClientRef.current = client;

        return () => {
            client.deactivate(); // 클라이언트 비활성화
        };
    }, [chatRoomId]);

    const sendMessage = async () => {
        if (!messageInput.trim() || !stompClientRef.current) return;

        const messageToSend = {
            memberId,
            content: messageInput,
        };

        try {
            // STOMP를 통해 메시지 전송
            stompClientRef.current.publish({
                destination: `/app/chat/${chatRoomId}`,
                body: JSON.stringify(messageToSend),
            });

            // 메시지 기록 저장 (REST API 호출)
            await axios.post(
                `http://localhost:8090/api/v1/groups/${chatRoomId}/messages`,
                messageToSend
            );

            setMessageInput('');
        } catch (error) {
            console.error('메시지 전송 실패:', error);
        }
    };

    return (
        <div className="chat-container">
            <div className="messages-list">
                {messages.map((msg, index) => (
                    <div key={index} className="message">
                        {msg.nickname} : {msg.chatMessageContent || "내용 없음"}
                    </div>
                ))}
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