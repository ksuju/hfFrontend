import React from 'react';

interface PopupMenuProps {
    isRoomOwner: boolean;
    handleManageMembers: () => void;
    handleEditRoom: () => void;
    handleLeaveRoom: () => void;
    setOpenPopupId: (id: string | null) => void;
}

const PopupMenu: React.FC<PopupMenuProps> = ({
    isRoomOwner,
    handleManageMembers,
    handleEditRoom,
    handleLeaveRoom,
    setOpenPopupId,
}) => {
    return (
        <div
            className="absolute right-12 bg-white shadow-md rounded-lg border border-gray-200 w-20 text-sm z-10"
            onClick={(e) => e.stopPropagation()} // 채팅방 클릭 방지
            onBlur={() => setOpenPopupId(null)}
            tabIndex={0} // 포커스 유지
        >
            {isRoomOwner && (
                <>
                    <button
                        className="w-full text-left px-3 py-2 hover:bg-gray-100"
                        onClick={handleManageMembers}
                    >
                        인원 관리
                    </button>
                    <button
                        className="w-full text-left px-3 py-2 hover:bg-gray-100"
                        onClick={handleEditRoom}
                    >
                        수정하기
                    </button>
                </>
            )}
            <button
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-primary"
                onClick={handleLeaveRoom}
            >
                나가기
            </button>
        </div>
    );
};

export default PopupMenu;
