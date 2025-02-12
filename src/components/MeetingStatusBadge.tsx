interface MeetingStatusBadgeProps {
    isUserJoined: boolean;
    isUserWaiting: boolean;
}

const MeetingStatusBadge = ({ isUserJoined, isUserWaiting }: MeetingStatusBadgeProps) => {
    if (!isUserJoined && !isUserWaiting) return null;

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            isUserJoined 
                ? 'bg-green-50 text-green-600' 
                : 'bg-orange-50 text-orange-600'
        }`}>
            {isUserJoined ? '참여중' : '대기중'}
        </span>
    );
};

export default MeetingStatusBadge; 