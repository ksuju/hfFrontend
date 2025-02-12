import React from 'react';

interface ConfirmLeavePopupProps {
    cancelLeaveRoom: () => void;
    confirmLeaveRoom: (chatRoomId: string) => void;
    isConfirmLeaveOpen: string;
}

const ConfirmLeavePopup: React.FC<ConfirmLeavePopupProps> = ({
    cancelLeaveRoom,
    confirmLeaveRoom,
    isConfirmLeaveOpen,
}) => {
    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-20">
            <div className="bg-white p-6 rounded-lg shadow-md w-80">
                <h3 className="text-lg font-semibold mb-8">정말 모임을 떠나시겠어요?</h3>
                <div className="flex justify-end space-x-10">
                    <button
                        className=" text-primary rounded-lg"
                        onClick={cancelLeaveRoom}>
                        취소
                    </button>
                    <button
                        className="text-primary rounded-lg"
                        onClick={() => confirmLeaveRoom(isConfirmLeaveOpen)}>
                        나가기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmLeavePopup;