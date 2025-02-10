import { useState, useEffect } from 'react';

interface Post {
    id: number;
    title: string;
    content: string;
    createDate: string;
    author: string;
}

const PostManagement = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPosts = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/admin/posts`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setPosts(data.data);
            }
        } catch (error) {
            console.error('게시글 목록 조회 실패:', error);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div>
            <div className="flex justify-between mb-4">
                <input
                    type="text"
                    placeholder="게시글 검색..."
                    className="px-4 py-2 border rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <table className="w-full">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="p-4 text-left">ID</th>
                        <th className="p-4 text-left">제목</th>
                        <th className="p-4 text-left">작성자</th>
                        <th className="p-4 text-left">작성일</th>
                        <th className="p-4 text-left">관리</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map(post => (
                        <tr key={post.id} className="border-b">
                            <td className="p-4">{post.id}</td>
                            <td className="p-4">{post.title}</td>
                            <td className="p-4">{post.author}</td>
                            <td className="p-4">{new Date(post.createDate).toLocaleDateString()}</td>
                            <td className="p-4">
                                <button className="text-blue-500 hover:text-blue-700 mr-2">수정</button>
                                <button className="text-red-500 hover:text-red-700">삭제</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PostManagement; 