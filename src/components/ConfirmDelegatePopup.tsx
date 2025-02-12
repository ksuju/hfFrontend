import React from 'react';

interface ConfirmDelegatePopupProps {
    cancelDelegate: () => void;
    confirmDelegate: () => void;
    getNicknameById: (id: string | null) => string;
    selectedDelegateId: string | null;
}

const ConfirmDelegatePopup: React.FC<ConfirmDelegatePopupProps> = ({
    cancelDelegate,
    confirmDelegate,
    getNicknameById,
    selectedDelegateId,
}) => {
    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-20">
            <div className="bg-white p-6 rounded-lg shadow-md w-80">
                <h3 className="text-lg font-semibold mb-8">
                    <span className="text-primary">{getNicknameById(selectedDelegateId)}</span>님에게 방장권한을 위임하시겠어요?
                </h3>
                <div className="flex justify-end space-x-10">
                    <button className="text-primary rounded-lg" onClick={cancelDelegate}>
                        취소
                    </button>
                    <button className="text-gray-500 rounded-lg" onClick={confirmDelegate}>
                        위임하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDelegatePopup;
