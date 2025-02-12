interface MeetingActionButtonProps {
    isUserJoined: boolean;
    isUserWaiting: boolean;
    currentUserID: string;
    chatRoomId: string;
    handleChatRoomClick: (chatRoomId: string, isUserJoined: boolean) => void;
    handleJoinClick: (chatRoomId: string, isUserWaiting: boolean) => void;
}

const MeetingActionButton = ({
    isUserJoined,
    isUserWaiting,
    currentUserID,
    chatRoomId,
    handleChatRoomClick,
    handleJoinClick
}: MeetingActionButtonProps) => {
    if (isUserJoined) {
        return (
            <button
                className="px-4 py-2 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-all"
                onClick={(e) => {
                    e.stopPropagation();
                    handleChatRoomClick(chatRoomId, isUserJoined);
                }}
            >
                입장하기
            </button>
        );
    }

    return (
        <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isUserWaiting 
                    ? "text-gray-500 border border-gray-300 hover:bg-gray-50" 
                    : "bg-primary text-white hover:bg-primary/90"
            }`}
            onClick={(e) => {
                e.stopPropagation();
                if (!currentUserID) {
                    alert("로그인이 필요합니다.");
                    return;
                }
                handleJoinClick(chatRoomId, isUserWaiting);
            }}
        >
            {isUserWaiting ? "대기 취소" : "참여 신청"}
        </button>
    );
};

export default MeetingActionButton; 