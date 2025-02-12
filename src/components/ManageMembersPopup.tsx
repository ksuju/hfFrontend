import React from 'react';

interface ManageMembersPopupProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    sortedJoinMembers: string[][];
    selectedMeeting: any;
    handleConfirmDelegate: (chatRoomId: string, memberId: string) => void;
    handleConfirmKick: (chatRoomId: string, memberId: string) => void;
    handleApprove: (chatRoomId: string, memberId: string) => void;
    handleRefuse: (chatRoomId: string, memberId: string) => void;
    closeManagePopup: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const ManageMembersPopup: React.FC<ManageMembersPopupProps> = ({
    activeTab,
    setActiveTab,
    sortedJoinMembers,
    selectedMeeting,
    handleConfirmDelegate,
    handleConfirmKick,
    handleApprove,
    handleRefuse,
    closeManagePopup,
}) => {
    return (
        <div
            className="fixed inset-0 bg-gray-500 bg-opacity-10 flex justify-center items-center z-20"
            onClick={(e) => e.stopPropagation()} // 팝업 외부 클릭 방지
        >
            <div className="bg-white w-2/3 h-3/4 p-6 rounded-lg shadow-md flex flex-col">
                <h3 className="text-lg font-semibold mb-4">인원 관리</h3>
                {/* 메뉴바 */}
                <div className="flex border-b">
                    {[
                        { label: "참여자", count: sortedJoinMembers.length },
                        { label: "대기자", count: selectedMeeting?.waitingMemberIdNickNameList?.length ?? 0 },
                    ].map(({ label, count }) => (
                        <button
                            key={label}
                            className={`flex-1 p-2 text-center text-lg font-medium ${activeTab === label ? "border-b-2 border-primary text-primary" : "text-gray-500"
                                }`}
                            onClick={() => setActiveTab(label)}
                        >
                            {`${label} ${count}`}
                        </button>
                    ))}
                </div>

                {/* 내용 */}
                <div className="flex-grow overflow-y-auto p-4">
                    {activeTab === "참여자" ? (
                        <ul>
                            {sortedJoinMembers.map(([id, nickname], index) => (
                                <li key={id} className="p-2 border-b flex items-center w-full">
                                    <span>{nickname}</span>
                                    {index === 0 && <span className="text-yellow-500 ml-1">👑</span>}
                                    {index !== 0 && (
                                        <div className="ml-auto flex space-x-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleConfirmDelegate(selectedMeeting?.chatRoomId ?? '', id);
                                                }}
                                                className="text-primary"
                                            >
                                                위임
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleConfirmKick(selectedMeeting?.chatRoomId ?? '', id);
                                                }}
                                                className="text-gray-500"
                                            >
                                                강퇴
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <ul>
                            {(selectedMeeting?.waitingMemberIdNickNameList?.length ?? 0) > 0 ? (
                                selectedMeeting?.waitingMemberIdNickNameList.map(([id, nickname]) => (
                                    <li key={id} className="p-2 border-b flex items-center w-full">
                                        <span>{nickname}</span>
                                        <div className="ml-auto flex space-x-4">
                                            <button
                                                className="text-primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleApprove(selectedMeeting?.chatRoomId ?? '', id); // 승인 버튼 클릭 시 승인 처리
                                                }}
                                            >
                                                승인
                                            </button>
                                            <button
                                                className="text-gray-500"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRefuse(selectedMeeting?.chatRoomId ?? '', id); // 거절 버튼 클릭 시 거절 처리
                                                }}
                                            >
                                                거절
                                            </button>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <p className="text-center text-gray-500">대기자가 없습니다.</p>
                            )}
                        </ul>
                    )}
                </div>

                {/* 닫기 버튼 */}
                <div className="text-right mt-4">
                    <button className="px-4 py-2 text-primary rounded-lg" onClick={(e) => closeManagePopup(e)}>
                        닫기</button>
                </div>
            </div>
        </div>
    );
};

export default ManageMembersPopup;
