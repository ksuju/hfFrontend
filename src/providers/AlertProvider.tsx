import { createContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { Alert } from '../types/Alert';
import { ToastAlert } from '../components/ToastAlert';

interface AlertContextType {
    alerts: Alert[];
    unreadCount: number;
}

export const AlertContext = createContext<AlertContextType>({
    alerts: [],
    unreadCount: 0
});

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [toast, setToast] = useState<Alert | null>(null);
    const clientRef = useRef<Client | null>(null);

    const userInfo = localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo')!).data
        : null;

    useEffect(() => {
        if (!userInfo) return undefined;
        if (clientRef.current) {
            clientRef.current.deactivate();
        }

        const fetchAlerts = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/alerts?page=0&size=10`,
                    {
                        credentials: 'include'
                    }
                );

                const data = await response.json();

                if (data.resultCode === "200") {
                    console.log('Setting alerts:', data.data.content);
                    setAlerts(data.data.content);
                } else {
                    console.error('Failed to fetch alerts:', data.msg);
                }

            } catch (error) {
                console.error('Failed to fetch alerts:', error);
            }
        };

        fetchAlerts();

        const client = new Client({
            brokerURL: `${import.meta.env.VITE_CORE_WEBSOCKET_BASE_URL}/ws/chat`,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {

                console.log('Connected');
                client.subscribe(`/user/${userInfo.id}/queue/alerts`, message => {
                    console.log('Received alert:', message.body);
                    const newAlert = JSON.parse(message.body);
                    setAlerts(prev => [newAlert, ...prev]);
                });

                client.subscribe(`/user/${userInfo.id}/queue/toast-alerts`, message => {
                    console.log('Received toast:', message.body);
                    const newAlert = JSON.parse(message.body);
                    setToast(newAlert);
                });
            },
            onDisconnect: () => {
                console.log('Disconnected');
            },
            onStompError: (frame) => {
                console.error('브로커 오류: ' + frame.headers['message']);
                console.error('추가 정보: ' + frame.body);
            },
        });

        clientRef.current = client;

        client.activate();
        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
        };
    }, []);



    return (
        <AlertContext.Provider value= {{
        alerts,
            unreadCount: alerts.filter(alert => !alert.isRead).length
    }
}>
    { children }
{ toast && <ToastAlert alert={ toast } onClose = {() => setToast(null) } />}
</AlertContext.Provider>
    );
};