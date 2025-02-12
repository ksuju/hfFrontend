interface MeetingContentProps {
    title: string;
    content: string;
    isExpanded: boolean;
}

const MeetingContent = ({ title, content, isExpanded }: MeetingContentProps) => {
    return (
        <div className={`mb-4 transition-all duration-300 ${
            isExpanded ? 'min-h-[200px] overflow-y-auto' : ''
        }`}>
            <h3 className={`text-lg font-semibold text-gray-800 ${
                isExpanded ? 'mb-4 break-words' : 'mb-0 truncate'
            } hover:text-primary transition-colors`}>
                {title}
            </h3>
            {isExpanded && (
                <p className="text-gray-600 text-sm break-words whitespace-pre-wrap">
                    {content}
                </p>
            )}
        </div>
    );
};

export default MeetingContent; 