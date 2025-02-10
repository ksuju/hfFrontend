import { useState, useEffect } from 'react';
import MemberManagement from './components/MemberManagement';
import NoticeManagement from './components/NoticeManagement';
import ChatRoomManagement from './components/ChatRoomManagement';
import ReportManagement from './components/ReportManagement';

interface DashboardStats {
    totalMembers: number;
    totalNotices: number;
    totalChatRooms: number;
    totalReports: number;
}

const Admin = () => {
    const [activeTab, setActiveTab] = useState<'members' | 'chats' | 'notices' | 'reports'>('members');
    const [stats, setStats] = useState<DashboardStats>({
        totalMembers: 0,
        totalNotices: 0,
        totalChatRooms: 0,
        totalReports: 0
    });

    const fetchDashboardStats = async () => {
        try {
            // 공지사항 수 조회
            const noticesResponse = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/boards`,
                { credentials: 'include' }
            );
            
            if (noticesResponse.ok) {
                const noticesData = await noticesResponse.json();
                setStats(prevStats => ({
                    ...prevStats,
                    totalNotices: noticesData.data.page.totalElements
                }));
            }

            // 회원 수 조회
            const membersResponse = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members`,
                { credentials: 'include' }
            );
            
            if (membersResponse.ok) {
                const membersData = await membersResponse.json();
                setStats(prevStats => ({
                    ...prevStats,
                    totalMembers: membersData.length
                }));
            }

            // 채팅방 수 조회
            const chatRoomsResponse = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/chat-rooms`,
                { credentials: 'include' }
            );

            if (chatRoomsResponse.ok) {
                const chatRoomsData = await chatRoomsResponse.json();
                setStats(prevStats => ({
                    ...prevStats,
                    totalChatRooms: chatRoomsData.totalElements
                }));
            }

            // 신고 수 조회 추가
            const reportsResponse = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/reports`,
                { credentials: 'include' }
            );

            if (reportsResponse.ok) {
                const reportsData = await reportsResponse.json();
                setStats(prevStats => ({
                    ...prevStats,
                    totalReports: reportsData.data.totalElements || 0
                }));
            }

        } catch (error) {
            console.error('통계 데이터 조회 실패:', error);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    // 채팅방 탭 클릭 시에도 통계 업데이트
    const handleTabChange = (tabId: 'members' | 'chats' | 'notices' | 'reports') => {
        setActiveTab(tabId);
        fetchDashboardStats(); // 비동기 함수 호출
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 페이지 헤더 */}
                <div className="mb-8 bg-white rounded-xl shadow-sm p-6 border border-blue-100">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        관리자 대시보드
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">시스템 전반적인 관리와 모니터링을 할 수 있습니다.</p>
                </div>

                {/* 통계 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* 전체 회원 */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">전체 회원</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.totalMembers}</p>
                            </div>
                        </div>
                    </div>

                    {/* 채팅방 */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">채팅방</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.totalChatRooms}</p>
                            </div>
                        </div>
                    </div>

                    {/* 공지사항 */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">공지사항</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.totalNotices}</p>
                            </div>
                        </div>
                    </div>

                    {/* 신고 */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">신고</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.totalReports}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 탭 메뉴 */}
                <div className="bg-white rounded-xl shadow-sm mb-8 border border-blue-100">
                    <div className="border-b border-gray-200">
                        <nav className="flex">
                            {[
                                { id: 'members', label: '회원 관리' },
                                { id: 'chats', label: '채팅방 관리' },
                                { id: 'notices', label: '공지사항 관리' },
                                { id: 'reports', label: '신고 관리' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id as any)}
                                    className={`px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                                        activeTab === tab.id
                                            ? 'border-b-2 border-blue-600 text-blue-600'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* 컨텐츠 영역 */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
                    {activeTab === 'members' && <MemberManagement />}
                    {activeTab === 'notices' && <NoticeManagement />}
                    {activeTab === 'chats' && <ChatRoomManagement />}
                    {activeTab === 'reports' && <ReportManagement />}
                </div>
            </div>
        </div>
    );
};

export default Admin; 