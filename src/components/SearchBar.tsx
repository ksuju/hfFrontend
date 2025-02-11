import { useState } from 'react';

interface SearchBarProps {
    placeholder: string;
    onChange: (keyword: string, searchType?: string) => void;
    showSearchType?: boolean;
}

type SearchType = '축제명+지역' | '축제명' | '지역';

const SearchBar = ({ placeholder, onChange, showSearchType = false }: SearchBarProps) => {
    const [keyword, setKeyword] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedSearchType, setSelectedSearchType] = useState<SearchType>('축제명+지역');

    const searchTypes: SearchType[] = ['축제명+지역', '축제명', '지역'];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newKeyword = e.target.value;
        setKeyword(newKeyword);
        onChange(newKeyword, showSearchType ? selectedSearchType : undefined);
    };

    const handleSearchTypeSelect = (type: SearchType) => {
        setSelectedSearchType(type);
        setIsDropdownOpen(false);
        onChange(keyword, type);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    return (
        <div className="fixed top-16 left-0 right-0 bg-white z-20 shadow-sm">
            <div className="max-w-[600px] lg:max-w-screen-lg mx-auto px-2 py-2">
                <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                    {/* 검색 조건 드롭다운 - Festival 페이지에서만 표시 */}
                    {showSearchType && (
                        <div className="relative w-36">
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-36 h-12 px-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-between"
                            >
                                <span className="text-sm">{selectedSearchType}</span>
                                <svg
                                    className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
                                    {searchTypes.map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => handleSearchTypeSelect(type)}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 검색창 */}
                    <div className={`relative ${showSearchType ? 'flex-1' : 'w-full'}`}>
                        <input
                            type="text"
                            value={keyword}
                            onChange={handleChange}
                            placeholder={placeholder}
                            className="w-full h-12 pl-12 pr-4 rounded-full border border-gray-200 focus:outline-none focus:border-primary"
                        />
                        <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2">
                            <svg
                                className="w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SearchBar;