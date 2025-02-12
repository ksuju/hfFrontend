interface ConfirmKickPopupProps {
    nickname: string | null;
    onCancel: () => void;
    onConfirm: () => void;
}

const ConfirmKickPopup: React.FC<ConfirmKickPopupProps> = ({ nickname, onCancel, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-20">
            <div className="bg-white p-6 rounded-lg shadow-md w-80">
                <h3 className="text-lg font-semibold mb-8">
                    <span className="text-primary">{nickname}</span>님을 강퇴하시겠어요?
                </h3>
                <div className="flex justify-end space-x-10">
                    <button className="text-primary rounded-lg" onClick={onCancel}>
                        취소
                    </button>
                    <button className="text-gray-500 rounded-lg" onClick={onConfirm}>
                        강퇴하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmKickPopup;
