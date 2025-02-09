import { useState, useContext, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { AlertContext } from '../providers/AlertProvider';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../types/Alert';

export const AlertBell = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) => {
    const navigate = useNavigate();
    const [visibleCount, setVisibleCount] = useState(5);
    const { alerts, unreadCount, hasMore, loadMore, readAlerts } = useContext(AlertContext);

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

    const highlightText = (text: string, isRead: boolean) => {
        const lines = text.split('\n');

        const keywords = {
            // 파란색 키워드
            '참가 신청': 'text-blue-500',
            '승인': 'text-blue-500',
            '참여': 'text-blue-500',
            '위임': 'text-blue-500',
            '답글': 'text-blue-500',
            '변경': 'text-blue-500',

            // 빨간색 키워드
            '거절': 'text-red-500',
            '강퇴': 'text-red-500',
            '취소': 'text-red-500',
            '삭제': 'text-red-500',
            '신고': 'text-red-500',
            '차단': 'text-red-500',

            // 노란색 키워드
            '새로운 전체 공지사항': 'text-orange-500',
            '비밀번호': 'text-orange-500'
        };

        return (
            <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                    <Bell className={`w-4 h-4 ${isRead ? 'text-gray-400' : 'text-red-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                    {lines.map((line, lineIndex) => (
                        <div key={`line-${lineIndex}`} className="mb-1">
                            {lineIndex === 0 ? (
                                <span className={`text-xs text-gray-500 block truncate tracking-wide ${isRead ? 'font-normal' : 'font-bold'}`}>
                                    {line}
                                </span>
                            ) : (
                                <span className={`text-sm tracking-wide ${isRead ? 'font-normal' : 'font-bold'}`}>
                                    {line.split(/(참가 신청|승인|참여|위임|답글|변경|거절|강퇴|취소|삭제|신고|차단|새로운 전체 공지사항|비밀번호)/).map((part, index) => {
                                        if (!part) return null;

                                        const keyword = keywords[part as keyof typeof keywords];
                                        if (keyword) {
                                            return <span key={`keyword-${lineIndex}-${index}`} className={`${keyword} ${isRead ? 'font-normal' : 'font-bold'}`}>{part}</span>;
                                        }

                                        return <span key={`text-${lineIndex}-${index}`}>{part}</span>;
                                    })}
                                </span>
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
                return 'bg-amber-50';
            case 'MEMBER':
                return 'bg-blue-50';
            case 'BOARD':
                return 'bg-red-50';
            case 'FESTIVAL':
                return 'bg-purple-50';
            case 'COMMENT':
                return 'bg-pink-50';
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
                    <div className="max-h-96 overflow-y-auto">
                        {alerts.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                알림이 없습니다
                            </div>
                        ) : (
                            <>
                                {alerts.slice(0, visibleCount).map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`${getDomainBackgroundColor(alert.domain)} p-5 cursor-pointer hover:brightness-95 border-b transition-all ${alert.isRead ? 'opacity-60' : ''
                                            }`}
                                        onClick={() => handleAlertClick(alert)}
                                    >
                                        <div className={`tracking-wide ${alert.isRead ? 'font-normal' : 'font-medium'}`}>
                                            {highlightText(alert.content, alert.isRead)}
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