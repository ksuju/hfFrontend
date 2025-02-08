import { createContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { Alert } from '../types/Alert';
import { ToastAlert } from '../components/ToastAlert';

interface AlertContextType {
    alerts: Alert[];
    unreadCount: number;
    hasMore: boolean;
    loadMore: () => Promise<void>;
}

export const AlertContext = createContext<AlertContextType>({
    alerts: [],
    unreadCount: 0,
    hasMore: false,
    loadMore: async () => { }
});

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [toast, setToast] = useState<Alert | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const clientRef = useRef<Client | null>(null);

    const userInfo = localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo')!).data
        : null;

    const loadMore = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/alerts?page=${page + 1}&size=10`,
                { credentials: 'include' }
            );

            const data = await response.json();
            if (data.resultCode === "200") {
                const newAlerts = data.data.content;
                if (newAlerts.length < 10) {
                    setHasMore(false);
                }
                setAlerts(prev => [...prev, ...newAlerts]);
                setPage(prev => prev + 1);
            }
        } catch (error) {
            console.error('Failed to load more alerts:', error);
        }
    };

    useEffect(() => {
        if (!userInfo) return undefined;
        if (clientRef.current) {
            clientRef.current.deactivate();
        }

        const fetchInitialAlerts = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/alerts?page=0&size=10`,
                    { credentials: 'include' }
                );

                const data = await response.json();
                if (data.resultCode === "200") {
                    setAlerts(data.data.content);
                    setHasMore(data.data.content.length === 10);
                    setPage(0);
                }
            } catch (error) {
                console.error('Failed to fetch alerts:', error);
            }
        };

        fetchInitialAlerts();

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
            onDisconnect: () => console.log('Disconnected'),
            onStompError: (frame) => {
                console.error('브로커 오류:', frame.headers['message']);
                console.error('추가 정보:', frame.body);
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
        <AlertContext.Provider value={{
            alerts,
            unreadCount: alerts.filter(alert => !alert.isRead).length,
            hasMore,
            loadMore
        }}>
            {children}
            {toast && <ToastAlert alert={toast} onClose={() => setToast(null)} />}
        </AlertContext.Provider>
    );
};