interface MeetingMemberCountProps {
    joinMemberNum: string;
    roomMemberLimit: string;
}

const MeetingMemberCount = ({ joinMemberNum, roomMemberLimit }: MeetingMemberCountProps) => {
    return (
        <div className="flex items-center gap-3">
            {/* 참여 인원 아이콘과 숫자 */}
            <div className="flex items-center gap-1 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-sm font-medium">{joinMemberNum}/{roomMemberLimit}</span>
            </div>
            
            {/* 참여 인원 프로그레스 바 */}
            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                    className="h-full rounded-full transition-all duration-300 bg-primary" 
                    style={{ 
                        width: `${(Number(joinMemberNum) / Number(roomMemberLimit)) * 100}%` 
                    }}
                />
            </div>
        </div>
    );
};

export default MeetingMemberCount; 