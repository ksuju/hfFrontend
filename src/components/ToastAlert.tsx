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

    const highlightText = (text: string) => {
        return text.split(/('.*?')/).map((part, index) =>
            part.startsWith("'") && part.endsWith("'") ? (
                <span key={index} className="text-primary font-extrabold">
                    {part}
                </span>
            ) : (
                part
            )
        );
    };

    return (
        <div className="fixed bottom-24 right-8 z-50 animate-fade-in-down">
            <div className="bg-white rounded-lg shadow-xl p-4 max-w-sm border-l-4 border-primary transform transition-all hover:scale-105">
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    </div>
                    <div className="flex-1">
                        <div className="font-bold text-gray-800">
                            {highlightText(alert.content)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {new Date().toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};