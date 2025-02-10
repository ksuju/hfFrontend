import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const NoticeEdit = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchNotice = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/boards/${id}`,
                    { credentials: 'include' }
                );
                if (response.ok) {
                    const data = await response.json();
                    setTitle(data.data.title);
                    setContent(data.data.content);
                }
            } catch (error) {
                console.error('공지사항 조회 실패:', error);
                alert('공지사항을 불러오는데 실패했습니다.');
            }
        };

        fetchNotice();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/boards/${id}`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title, content })
                }
            );

            if (response.ok) {
                alert('공지사항이 수정되었습니다.');
                navigate('/admin?tab=notices');
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '공지사항 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('공지사항 수정 실패:', error);
            alert('공지사항 수정 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 페이지 헤더 */}
                <div className="mb-8 bg-white rounded-xl shadow-sm p-6 border border-blue-100">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        공지사항 수정
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">공지사항을 수정할 수 있습니다.</p>
                </div>

                {/* 수정 폼 */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">공지사항 수정</h2>
                        <button
                            onClick={() => navigate('/admin?tab=notices')}
                            className="inline-flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            목록으로 돌아가기
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                제목
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                placeholder="제목을 입력하세요"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                내용
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg h-96 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
                                placeholder="내용을 입력하세요"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/admin?tab=notices')}
                                className="px-6 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors inline-flex items-center"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                            >
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                수정
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NoticeEdit; 