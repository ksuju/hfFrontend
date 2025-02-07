import { useEffect } from 'react';
import { Alert } from '../types/Alert';

interface ToastAlertProps {
    alert: Alert;
    onClose: () => void;
}

export const ToastAlert = ({ alert, onClose }: ToastAlertProps) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
            <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
                <div className="font-medium">{alert.content}</div>
            </div>
        </div>
    );
};