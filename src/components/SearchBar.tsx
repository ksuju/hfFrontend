// SearchBar.tsx
import { useState } from 'react';

interface SearchBarProps {
    placeholder: string;
    onChange: (keyword: string) => void;
}

const SearchBar = ({ placeholder, onChange }: SearchBarProps) => {
    const [keyword, setKeyword] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newKeyword = e.target.value;
        setKeyword(newKeyword);
        onChange(newKeyword); // Trigger the onChange callback on every input change
    };

    return (
        <div className="fixed top-16 left-0 right-0 bg-white z-20 shadow-sm">
            <div className="max-w-[600px] lg:max-w-screen-lg mx-auto px-4 py-2">
                <form className="relative">
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
                </form>
            </div>
        </div>
    );
};

export default SearchBar