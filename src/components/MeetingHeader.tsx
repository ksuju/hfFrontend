interface MeetingHeaderProps {
    festivalName: string;
    createDate: string;
    isUserJoined: boolean;
}

const MeetingHeader = ({ festivalName, createDate, isUserJoined }: MeetingHeaderProps) => {
    return (
        <div className="flex items-center justify-between mb-4">
            <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${
                isUserJoined 
                    ? 'bg-green-50 text-green-600'  // 참여중일 때 초록색
                    : 'bg-primary/5 text-primary'   // 기본 상태
            }`}>
                {festivalName}
            </span>
            <span className="text-sm text-gray-400">
                {new Date(createDate).toLocaleDateString()}
            </span>
        </div>
    );
};

export default MeetingHeader; 