import React from 'react';
import dots from '../assets/images/three-dots.png';
import PopupMenu from './PopupMenu';

interface MeetingCardProps {
    meeting: any;
    isUserInWaitRoom: (chatRoomId: number | string) => boolean;
    isUserInJoinRoom: (chatRoomId: number | string) => boolean;
    currentUser: any;
    currentUserID: string;
    handleChatRoomClick: (chatRoomId: string, isUserJoined: boolean) => void;
    handleTogglePopup: (chatRoomId: string) => void;
    handleJoinClick: (chatRoomId: string, isUserWaiting: boolean | undefined) => void;
    handleManageMembers: (chatRoomId: string) => void;
    handleEditRoom: (chatRoomId: string) => void;
    handleLeaveRoom: (chatRoomId: string) => void;
    openPopupId: string | null;
    setOpenPopupId: (id: string | null) => void;
}

const MeetingCard: React.FC<MeetingCardProps> = ({
    meeting,
    isUserInWaitRoom,
    isUserInJoinRoom,
    currentUser,
    currentUserID,
    handleChatRoomClick,
    handleTogglePopup,
    handleJoinClick,
    handleManageMembers,
    handleEditRoom,
    handleLeaveRoom,
    openPopupId,
    setOpenPopupId,
}) => {
    const isUserWaiting = isUserInWaitRoom(meeting.chatRoomId);
    const isUserJoined = isUserInJoinRoom(meeting.chatRoomId);
    const isRoomOwner = meeting.memberId === currentUser?.id;

    return (
        <div
            className="bg-white rounded-lg shadow-md p-4 border border-gray-100 cursor-pointer"
            onClick={() => {
                if (!isUserJoined) {
                    console.log("채팅방에 참여해야 이동할 수 있습니다.");
                    return; // 클릭 가능하지만 동작 안 함
                }
                handleChatRoomClick(meeting.chatRoomId, isUserJoined);
            }}
        >
            {/* 제목 + 버튼 */}
            <div className="flex justify-between items-start">
                <h3 className="font-medium text-base flex-grow truncate max-w-[75%]">
                    {meeting.roomTitle}
                </h3>
                {/* 참여 상태 표시 */}
                <div className="flex items-center space-x-3 relative">
                    {isUserJoined && (
                        <img
                            src={dots}
                            alt="사이드바"
                            className="h-8 mt-[-6px] mr-[-6px] cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation(); // 채팅방 클릭 방지
                                handleTogglePopup(meeting.chatRoomId);
                            }}
                        />
                    )}
                    {!isUserJoined && (
                        <button
                            className={`text-sm font-medium px-3 rounded-md ${isUserWaiting ? "text-gray-500 border-gray-400" : "text-primary border-primary"
                                }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (currentUserID == "") {
                                    alert("로그인이 필요합니다.");
                                    return;
                                }
                                handleJoinClick(meeting.chatRoomId, isUserWaiting);
                            }}
                        >
                            {isUserWaiting ? "취소" : "참여하기"}
                        </button>
                    )}
                </div>
            </div>
            {/* 팝업 메뉴 */}
            {openPopupId === meeting.chatRoomId && (
                <PopupMenu
                    isRoomOwner={isRoomOwner}
                    handleManageMembers={() => handleManageMembers(meeting.chatRoomId)}
                    handleEditRoom={() => handleEditRoom(meeting.chatRoomId)}
                    handleLeaveRoom={() => handleLeaveRoom(meeting.chatRoomId)}
                    setOpenPopupId={setOpenPopupId}
                />
            )}

            {/* 내용 */}
            <p className="text-sm text-gray-500 mt-1 truncate max-w-full">{meeting.roomContent}</p>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
                {/* 생성 날짜 + 축제 이름 */}
                <div className="flex items-center">
                    <p>{new Date(meeting.createDate).toISOString().slice(0, 10).replace(/-/g, ".")}</p>
                    <p className="ml-2 text-xs text-gray-500">{meeting.festivalName}</p>
                </div>
                {/* 참여 인원 */}
                <div className="text-xs text-gray-500 whitespace-nowrap ml-auto">
                    {meeting.joinMemberNum}/{meeting.roomMemberLimit}명
                </div>
            </div>
        </div>
    );
};

export default MeetingCard;
