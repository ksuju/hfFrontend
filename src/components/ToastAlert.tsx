import { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Alert } from '../types/Alert';
import { useNavigate } from 'react-router-dom';

interface ToastAlertProps {
    alert: Alert;
    onClose: () => void;
}

export const ToastAlert = ({ alert, onClose }: ToastAlertProps) => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const handleClick = () => {
        try {
            const navigationData = JSON.parse(alert.navigationData);

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

            onClose();  // 토스트 알림 닫기
        } catch (error) {
            console.error('Navigation data parsing error:', error);
        }
    };

    const highlightText = (text: string) => {
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
            '새로운 전체 공지사항': 'text-yellow-500',
            '비밀번호': 'text-yellow-500'
        };

        return (
            <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                    <Bell className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                    {lines.map((line, lineIndex) => (
                        <div key={lineIndex} className="mb-1">
                            {lineIndex === 0 ? (
                                <span className="text-xs text-gray-500 block truncate tracking-wide font-bold">
                                    {line}
                                </span>
                            ) : (
                                <span className="text-sm font-bold tracking-wide">
                                    {line.split(/(참가 신청|승인|참여|위임|답글|변경|거절|강퇴|취소|삭제|신고|차단|새로운 전체 공지사항|비밀번호)/).map((part, index) => {
                                        if (!part) return null;

                                        const keyword = keywords[part as keyof typeof keywords];
                                        if (keyword) {
                                            return <span key={index} className={`${keyword} font-bold`}>{part}</span>;
                                        }

                                        return part;
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
                return 'bg-amber-50';  // 현재 사용 중인 연한 노란색
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

    return (
        <div className="fixed bottom-24 right-8 z-50 animate-fade-in-down">
            <div
                className={`${getDomainBackgroundColor(alert.domain)} rounded-xl shadow-md p-5 max-w-sm border-l-4 border-primary transform transition-all hover:scale-105 cursor-pointer`}
                onClick={handleClick}
            >
                <div className="flex-1">
                    <div className="font-medium tracking-wide">
                        {highlightText(alert.content)}
                    </div>
                    <div className="text-xs text-gray-400 ml-6 mt-2">
                        {new Date(alert.createDate).toLocaleString()}  {/* createdAt → createDate */}
                    </div>
                </div>
            </div>
        </div>
    );
};