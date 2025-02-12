import React from 'react';

interface EditPopupProps {
    editRoomData: { title: string; content: string; limit: number };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleSaveEdit: (chatRoomId: string) => void;
    setIsEditPopupOpen: (isOpen: boolean) => void;
    selectedMeeting: any;
}

const EditPopup: React.FC<EditPopupProps> = ({
    editRoomData,
    handleChange,
    handleSaveEdit,
    setIsEditPopupOpen,
    selectedMeeting,
}) => {
    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-10 flex justify-center items-center z-20"
            onClick={(e) => e.stopPropagation()}>
            <div className="bg-white w-2/3 h-4/7 p-6 rounded-lg shadow-md flex flex-col">
                <h3 className="text-lg font-semibold mb-4">채팅방 수정</h3>

                <label className="block mb-2">
                    제목
                    <input
                        type="text"
                        name="title"
                        value={editRoomData.title}
                        onChange={handleChange}
                        maxLength={100}
                        className="w-full border p-2 rounded mt-1"
                    />
                </label>

                <label className="block mb-2">
                    내용
                    <textarea
                        name="content"
                        value={editRoomData.content}
                        onChange={handleChange}
                        maxLength={500}
                        className="w-full border p-2 rounded mt-1 h-32"
                    />
                </label>

                <label className="block mb-4">
                    인원 제한
                    <select
                        name="limit"
                        value={editRoomData.limit}
                        onChange={handleChange}
                        className="w-full border p-2 rounded mt-1 mb-2"
                    >
                        {Array.from({ length: 10 }, (_, i) => (i + 1) * 10).map((num) => (
                            <option key={num} value={num}>{num}명</option>
                        ))}
                    </select>
                </label>

                <div className="flex justify-end space-x-4">
                    <button className="pl-4 py-2 text-primary" onClick={() => setIsEditPopupOpen(false)}>취소</button>
                    <button className="pl-4 py-2 text-primary" onClick={() => handleSaveEdit(selectedMeeting?.chatRoomId ?? '')}>
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPopup;