import { useState, useEffect } from 'react';

interface Report {
    id: number;
    reporterId: number;
    reporterNickname: string;
    reportedId: number;
    reportedNickname: string;
    content: string;
    status: 'ACTIVE' | 'REJECTED' | 'CONFIRMED';
    createDate: string;
}

const ReportManagement = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchReports = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/reports`,
                { 
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (response.ok) {
                const data = await response.json();
                console.log('신고 데이터:', data);  // 데이터 구조 확인
                setReports(data.data.content || []);  // data.data.content가 없을 경우 빈 배열 사용
            }
        } catch (error) {
            console.error('신고 목록 조회 실패:', error);
        }
    };

    const handleReject = async (reportId: number) => {
        if (!window.confirm('이 신고를 거절하시겠습니까?')) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/reports/${reportId}/reject`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                alert('신고가 거절되었습니다.');
                fetchReports();
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '신고 거절에 실패했습니다.');
            }
        } catch (error) {
            console.error('신고 거절 실패:', error);
            alert('신고 거절 중 오류가 발생했습니다.');
        }
    };

    const handleConfirm = async (reportId: number) => {
        if (!window.confirm('이 신고를 승인하시겠습니까?')) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/reports/${reportId}/confirm`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                alert('신고가 승인되었습니다.');
                fetchReports();
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '신고 승인에 실패했습니다.');
            }
        } catch (error) {
            console.error('신고 승인 실패:', error);
            alert('신고 승인 중 오류가 발생했습니다.');
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            case 'REJECTED':
                return 'bg-red-100 text-red-800 border border-red-200';
            case 'CONFIRMED':
                return 'bg-green-100 text-green-800 border border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    const getStatusDisplayName = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return '처리중';
            case 'REJECTED':
                return '거절됨';
            case 'CONFIRMED':
                return '승인됨';
            default:
                return status;
        }
    };

    return (
        <div>
            <div className="flex justify-between mb-4">
                <input
                    type="text"
                    placeholder="신고 검색..."
                    className="px-4 py-2 border rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <table className="w-full">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="p-4 text-left">ID</th>
                        <th className="p-4 text-left">신고자</th>
                        <th className="p-4 text-left">피신고자</th>
                        <th className="p-4 text-left">신고 내용</th>
                        <th className="p-4 text-left">상태</th>
                        <th className="p-4 text-left">신고일</th>
                        <th className="p-4 text-left">관리</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map(report => (
                        <tr key={report.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">{report.id}</td>
                            <td className="p-4">{report.reporterNickname}</td>
                            <td className="p-4">{report.reportedNickname}</td>
                            <td className="p-4 max-w-[300px] truncate" title={report.content}>
                                {report.content}
                            </td>
                            <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(report.status)}`}>
                                    {getStatusDisplayName(report.status)}
                                </span>
                            </td>
                            <td className="p-4">{new Date(report.createDate).toLocaleDateString()}</td>
                            <td className="p-4">
                                {report.status === 'ACTIVE' && (
                                    <div className="space-x-2">
                                        <button
                                            onClick={() => handleConfirm(report.id)}
                                            className="text-green-500 hover:text-green-700"
                                        >
                                            승인
                                        </button>
                                        <button
                                            onClick={() => handleReject(report.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            거절
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReportManagement; 