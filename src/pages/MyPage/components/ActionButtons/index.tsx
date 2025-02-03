interface ActionButtonsProps {
    isEditing: boolean;
    setIsEditing: (editing: boolean) => void;
    onUpdate: () => void;
    onDelete: () => void;
}

const ActionButtons = ({ isEditing, setIsEditing, onUpdate, onDelete }: ActionButtonsProps) => {
    return (
        <div className="flex justify-between items-start mb-6 mr-4">
            <h2 className="text-2xl font-bold">마이페이지</h2>
            <div className="space-x-2">
                {!isEditing ? (
                    <>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            수정
                        </button>
                        <button
                            onClick={onDelete}
                            className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                            탈퇴
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={onUpdate}
                            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            저장
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                            취소
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ActionButtons;