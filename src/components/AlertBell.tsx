import { useState, useContext } from 'react';
import { Bell } from 'lucide-react';
import { AlertContext } from '../providers/AlertProvider';
// import { Alert } from '../types/Alert';

export const AlertBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { alerts, unreadCount, hasMore, loadMore } = useContext(AlertContext);

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
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50">
                    <div className="max-h-96 overflow-y-auto">
                        {alerts.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                알림이 없습니다
                            </div>
                        ) : (
                            <>
                                {alerts.map((alert) => (
                                    <div key={alert.id} className="p-4 cursor-pointer hover:bg-gray-50 border-b">
                                        <div className="font-medium">
                                            {highlightText(alert.content)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(alert.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                                {hasMore && (
                                    <button
                                        onClick={loadMore}
                                        className="w-full p-2 text-sm text-primary hover:bg-gray-50"
                                    >
                                        더보기
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};