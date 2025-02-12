import { useState } from 'react';

interface NoticeFormProps {
    onSubmit: (title: string, content: string) => Promise<void>;
    onCancel: () => void;
}

const NoticeForm = ({ onSubmit, onCancel }: NoticeFormProps) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }
        await onSubmit(title, content);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4">공지사항 작성</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            제목
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                            placeholder="제목을 입력하세요"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            내용
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full p-2 border rounded-lg h-64"
                            placeholder="내용을 입력하세요"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                        >
                            등록
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NoticeForm; 