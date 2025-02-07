import { useEffect, useState } from 'react';
import SearchBar from '../components/SearchBar';
import Footer from '../components/Footer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface NoticeItem {
    id: number;
    title: string;
    content: string;
    createDate: string;
}

interface PageInfo {
    content: NoticeItem[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

interface ApiResponse {
    resultCode: string;
    data: PageInfo;
}

const Notice = () => {
    const [notices, setNotices] = useState<NoticeItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchNotices = async (pageNumber: number, keyword = "") => {
        setIsLoading(true);
        try {
            const pageSize = 10;
            const url = keyword
                ? `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/boards/search?keyword=${encodeURIComponent(keyword)}&page=${pageNumber}&size=${pageSize}`
                : `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/boards?page=${pageNumber}&size=${pageSize}`;

            const response = await axios.get<ApiResponse>(url, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.data.resultCode === "200") {
                const content = response.data.data.content;
                const remainingItems = pageSize - content.length;
                
                if (remainingItems > 0 && content.length > 0) {
                    const emptyItems = Array(remainingItems).fill({
                        id: -1,
                        title: '',
                        content: '',
                        createDate: ''
                    });
                    setNotices([...content, ...emptyItems]);
                } else {
                    setNotices(content);
                }
                
                setTotalPages(Math.max(1, response.data.data.page.totalPages));
                
                console.log('API 응답:', {
                    totalPages: response.data.data.page.totalPages,
                    number: response.data.data.page.number,
                    size: response.data.data.page.size,
                    totalElements: response.data.data.page.totalElements,
                    content: response.data.data.content
                });
            }
        } catch (err) {
            console.error('Error fetching notices:', err);
            setError('공지사항을 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices(currentPage, searchKeyword);
    }, [currentPage, searchKeyword]);

    const handleSearch = (keyword: string) => {
        setSearchKeyword(keyword);
        setCurrentPage(0);
    };

    const handlePageChange = (page: number) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
        }
    };

    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

    return (
        <>
            <div className="max-w-[1280px] mx-auto min-h-[calc(100vh-160px)]">
                <SearchBar placeholder="공지사항을 검색해보세요" onChange={handleSearch} />
                <main className="flex-1 mt-16 mb-16">
                    <div className="max-w-[600px] lg:max-w-screen-lg mx-auto lg:py-6">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">공지사항</h2>
                                <p className="text-sm text-gray-500">
                                    총 {notices.length}개의 공지사항
                                </p>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {notices.map((notice, index) => (
                                    <div 
                                        key={notice.id === -1 ? `empty-${index}` : notice.id} 
                                        className={`py-5 ${notice.id === -1 ? 'opacity-0' : 'cursor-pointer hover:bg-gray-50'} transition-colors`}
                                        onClick={() => notice.id !== -1 && navigate(`/notice/${notice.id}`)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-medium text-base flex-grow truncate pr-12">
                                                {notice.title}
                                            </h3>
                                            <p className="text-xs text-gray-400 whitespace-nowrap">
                                                {notice.id !== -1 && new Date(notice.createDate).toISOString().slice(0, 10).replace(/-/g, ".")}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8">
                                <div className="flex justify-center items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                                        disabled={currentPage === 0}
                                        className={`px-2 py-1 rounded text-sm ${
                                            currentPage === 0 
                                                ? 'text-gray-300 cursor-not-allowed' 
                                                : 'text-gray-500 hover:text-primary'
                                        }`}
                                    >
                                        &lt;
                                    </button>
                                    {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handlePageChange(i)}
                                            className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                                                currentPage === i
                                                    ? 'text-primary border border-primary' 
                                                    : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                                        disabled={currentPage === totalPages - 1}
                                        className={`px-2 py-1 rounded text-sm ${
                                            currentPage === totalPages - 1
                                                ? 'text-gray-300 cursor-not-allowed'
                                                : 'text-gray-500 hover:text-primary'
                                        }`}
                                    >
                                        &gt;
                                    </button>
                                </div>
                            </div>
                            {isLoading && <p className="text-center text-gray-500 mt-4">Loading...</p>}
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default Notice;
