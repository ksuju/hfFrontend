import { useState, useEffect } from 'react';
import NoticeForm from './NoticeForm';
import Pagination from '../../../components/Pagination';
import { useNavigate } from 'react-router-dom';

interface Notice {
    id: number;
    title: string;
    content: string;
    createDate: string;
}

const NoticeManagement = () => {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isWriting, setIsWriting] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const navigate = useNavigate();

    const fetchNotices = async (page: number = 0) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/boards?page=${page}&size=10`,
                { credentials: 'include' }
            );
            if (response.ok) {
                const data = await response.json();
                setNotices(data.data.content);
                setTotalPages(data.data.totalPages);
            }
        } catch (error) {
            console.error('공지사항 목록 조회 실패:', error);
        }
    };

    const handleCreateNotice = async (title: string, content: string) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/boards/create`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title, content })
                }
            );

            if (response.ok) {
                alert('공지사항이 등록되었습니다.');
                setIsWriting(false);
                fetchNotices(currentPage); // 현재 페이지 유지
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '공지사항 등록에 실패했습니다.');
            }
        } catch (error) {
            console.error('공지사항 등록 실패:', error);
            alert('공지사항 등록 중 오류가 발생했습니다.');
        }
    };

    const handleDelete = async (noticeId: number) => {
        if (!window.confirm('정말 이 공지사항을 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/boards/${noticeId}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.ok) {
                alert('공지사항이 삭제되었습니다.');
                fetchNotices(currentPage); // 현재 페이지 새로고침
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '공지사항 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('공지사항 삭제 실패:', error);
            alert('공지사항 삭제 중 오류가 발생했습니다.');
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchNotices(page);
    };

    useEffect(() => {
        fetchNotices(currentPage);
    }, [currentPage]);

    return (
        <div>
            <div className="flex justify-between mb-4">
                <input
                    type="text"
                    placeholder="공지사항 검색..."
                    className="px-4 py-2 border rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                    onClick={() => navigate('/admin/notice/write')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    공지사항 작성
                </button>
            </div>

            {isWriting && (
                <NoticeForm 
                    onSubmit={handleCreateNotice}
                    onCancel={() => setIsWriting(false)}
                />
            )}

            <table className="w-full">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="p-4 text-left">ID</th>
                        <th className="p-4 text-left">제목</th>
                        <th className="p-4 text-left">작성일</th>
                        <th className="p-4 text-left">관리</th>
                    </tr>
                </thead>
                <tbody>
                    {notices.map(notice => (
                        <tr key={notice.id} className="border-b">
                            <td className="p-4">{notice.id}</td>
                            <td className="p-4">{notice.title}</td>
                            <td className="p-4">{new Date(notice.createDate).toLocaleDateString()}</td>
                            <td className="p-4">
                                <button 
                                    onClick={() => navigate(`/admin/notice/edit/${notice.id}`)}
                                    className="text-blue-500 hover:text-blue-700 mr-2"
                                >
                                    수정
                                </button>
                                <button 
                                    onClick={() => handleDelete(notice.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    삭제
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 페이지네이션 추가 */}
            <div className="mt-4">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default NoticeManagement; 