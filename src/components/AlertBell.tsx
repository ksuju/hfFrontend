import { useState, useContext, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { AlertContext } from '../providers/AlertProvider';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../types/Alert';

export const AlertBell = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) => {
    const navigate = useNavigate();
    const [visibleCount, setVisibleCount] = useState(5);
    const [showAllAlerts, setShowAllAlerts] = useState(false);
    const { alerts, unreadCount, hasMore, loadMore, readAlerts, setAlerts, processedAlerts, setProcessedAlerts } = useContext(AlertContext);

    const handleAlertClick = async (alert: Alert) => {
        try {
            const navigationData = JSON.parse(alert.navigationData);

            // 클릭한 알림이 읽지 않은 상태라면 읽음 처리
            if (!alert.isRead) {
                await readAlerts([alert.id]);
            }

            switch (alert.navigationType) {
                case 'GROUP':
                    if (navigationData.chatRoomId) {
                        navigate(`/chat/${navigationData.chatRoomId}`);
                    }
                    break;
                case 'BOARD':
                    if (navigationData.boardId) {
                        navigate(`/notice/${navigationData.boardId}`);
                    }
                    break;
                case 'FESTIVAL':
                    // 축제 관련 네비게이션을 위한 자리
                    console.log('Festival navigation:', navigationData);
                    break;
                case 'COMMENT':
                    // 댓글 관련 네비게이션을 위한 자리
                    console.log('Comment navigation:', navigationData);
                    break;
                case 'NONE':
                    // 네비게이션이 필요없는 알림을 위한 자리
                    console.log('No navigation needed');
                    break;
                default:
                    console.log('Unknown navigation type:', alert.navigationType);
            }

            setIsOpen(false);
        } catch (error) {
            console.error('Navigation data parsing error:', error);
        }
    };

    const handleClose = async () => {
        // alerts에서 직접 읽지 않은 알림 ID들을 필터링
        const unreadAlertIds = alerts
            .filter(alert => !alert.isRead)
            .map(alert => alert.id);

        if (unreadAlertIds.length > 0) {
            await readAlerts(unreadAlertIds);
        }
        setIsOpen(false);
    };

    const handleLoadMore = async () => {
        if (visibleCount >= alerts.length && hasMore) {
            await loadMore();
        }
        setVisibleCount(prev => prev + 5);
    };

    const handleAcceptRequest = async (requestId: number, alertId: number) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/friends/friend-requests/${requestId}/accept`,
                {
                    method: 'POST',
                    credentials: 'include'
                }
            );
            if (response.ok) {
                setProcessedAlerts(prev => ({ ...prev, [alertId]: '수락 완료' }));
                // 3초 후 알림 제거
                setTimeout(() => {
                    setAlerts(prev => prev.filter(a => a.id !== alertId));
                }, 3000);
            }
        } catch (error) {
            console.error('친구 신청 수락 실패:', error);
        }
    };

    const handleRejectRequest = async (requestId: number, alertId: number) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/friends/friend-requests/${requestId}/reject`,
                {
                    method: 'POST',
                    credentials: 'include'
                }
            );
            if (response.ok) {
                setProcessedAlerts(prev => ({ ...prev, [alertId]: '거절 완료' }));
                // 3초 후 알림 제거
                setTimeout(() => {
                    setAlerts(prev => prev.filter(a => a.id !== alertId));
                }, 3000);
            }
        } catch (error) {
            console.error('친구 신청 거절 실패:', error);
        }
    };

    const highlightText = (alert: Alert) => {
        const lines = alert.content.split('\n');
        const navigationData = JSON.parse(alert.navigationData);

        return (
            <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                    <Bell className={`w-4 h-4 ${alert.isRead ? 'text-gray-400' : 'text-red-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                    {lines.map((line, lineIndex) => (
                        <div key={`line-${lineIndex}`} className="mb-1">
                            {lineIndex === 0 ? (
                                <span className={`text-xs text-gray-500 block truncate tracking-wide ${alert.isRead ? 'font-normal' : 'font-bold'}`}>
                                    {line}
                                </span>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <span className={`text-sm tracking-wide ${alert.isRead ? 'font-normal' : 'font-bold'}`}>
                                        {line}
                                    </span>
                                    {alert.navigationType === 'SELECT' && navigationData.requestId && !processedAlerts[alert.id] ? (
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAcceptRequest(navigationData.requestId, alert.id);
                                                }}
                                                className="px-2 py-1 bg-primary text-white text-xs rounded hover:bg-primary-dark"
                                            >
                                                수락
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRejectRequest(navigationData.requestId, alert.id);
                                                }}
                                                className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                                            >
                                                거절
                                            </button>
                                        </div>
                                    ) : processedAlerts[alert.id] ? (
                                        <span className="text-sm text-primary">{processedAlerts[alert.id]}</span>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const getDomainBackgroundColor = (domain: string) => {
        switch (domain) {
            case 'GROUP':
                return 'bg-amber-50';  // 연한 노란색
            case 'MEMBER':
                return 'bg-blue-50';   // 연한 파란색
            case 'BOARD':
                return 'bg-green-50';  // 연한 초록색
            case 'FESTIVAL':
                return 'bg-purple-50'; // 연한 보라색
            case 'COMMENT':
                return 'bg-pink-50';   // 연한 분홍색
            default:
                return 'bg-amber-50';
        }
    };

    // alerts를 의존성 배열에 추가
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isOpen && !target.closest('.alert-container')) {
                handleClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, alerts]);  // alerts 추가

    // 보여줄 알림 필터링
    const filteredAlerts = showAllAlerts
        ? alerts
        : alerts.filter(alert => !alert.isRead);

    return (
        <div className="relative">
            <button
                onClick={() => {
                    if (isOpen) {
                        handleClose();
                    } else {
                        setIsOpen(true);
                    }
                }}
                className="relative p-2 rounded-full hover:bg-gray-100 alert-container"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg overflow-hidden z-50 alert-container">
                    <div className="p-2 border-b flex justify-end">
                        <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showAllAlerts}
                                onChange={(e) => setShowAllAlerts(e.target.checked)}
                                className="mr-2"
                            />
                            전체 알림 보기
                        </label>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {filteredAlerts.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                알림이 없습니다
                            </div>
                        ) : (
                            <>
                                {filteredAlerts.slice(0, visibleCount).map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`${getDomainBackgroundColor(alert.domain)} p-5 cursor-pointer hover:brightness-95 border-b transition-all ${alert.isRead ? 'opacity-60' : ''
                                            }`}
                                        onClick={() => handleAlertClick(alert)}
                                    >
                                        <div className={`tracking-wide ${alert.isRead ? 'font-normal' : 'font-medium'}`}>
                                            {highlightText(alert)}
                                        </div>
                                        <div className="text-xs text-gray-400 ml-6 mt-2">
                                            {new Date(alert.createDate).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                                {(hasMore || visibleCount < alerts.length) && (
                                    <button
                                        onClick={handleLoadMore}
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