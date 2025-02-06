interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = 0; i < totalPages; i++) {
            if (
                i === 0 || 
                i === totalPages - 1 || 
                (i >= currentPage - delta && i <= currentPage + delta)
            ) {
                range.push(i);
            }
        }

        let l;
        for (const i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    return (
        <div className="flex justify-center items-center gap-1 mt-6">
            <button
                onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className={`px-2 py-1 rounded text-sm ${
                    currentPage === 0 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:text-primary'
                }`}
            >
                이전
            </button>
            
            {getPageNumbers().map((pageNumber, index) => (
                pageNumber === '...' ? (
                    <span key={`dot-${index}`} className="text-gray-500">...</span>
                ) : (
                    <button
                        key={`page-${pageNumber}`}
                        onClick={() => onPageChange(Number(pageNumber))}
                        className={`w-8 h-8 flex items-center justify-center rounded ${
                            currentPage === pageNumber
                                ? 'text-primary border border-primary'
                                : 'text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                        {Number(pageNumber) + 1}
                    </button>
                )
            ))}

            <button
                onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className={`px-2 py-1 rounded text-sm ${
                    currentPage === totalPages - 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:text-primary'
                }`}
            >
                다음
            </button>
        </div>
    );
};

export default Pagination; 