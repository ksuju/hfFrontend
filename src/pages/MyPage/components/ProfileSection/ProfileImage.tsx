import React, { useState } from 'react';
import { FiEdit2 } from 'react-icons/fi';

interface ProfileImageProps {
    profilePath: string | null | undefined;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onResetImage: () => Promise<void>;
    fileInputRef: React.RefObject<HTMLInputElement>;
}

const ProfileImage = ({ profilePath, onImageUpload, onResetImage, fileInputRef }: ProfileImageProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const isDefaultImage = profilePath === 'default.png';  // 기본 이미지 체크

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsLoading(true);
        try {
            await onImageUpload(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetImage = async () => {
        setIsLoading(true);
        try {
            await onResetImage();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative">
            <img
                src={profilePath?.startsWith('http')
                    ? profilePath
                    : `https://kr.object.ncloudstorage.com/hf-bucket2025/member/${profilePath}`}
                alt="프로필"
                className={`w-80 h-80 rounded-full ${isLoading ? 'opacity-50' : ''}`}
            />
            {!isDefaultImage && (  // 기본 이미지가 아닐 때만 삭제 버튼 표시
                <button
                    onClick={handleResetImage}
                    disabled={isLoading}
                    className={`absolute top-0 right-0 w-8 h-8 ${isLoading ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'
                        } text-white rounded-full flex items-center justify-center transition-colors`}
                    title="프로필 이미지 삭제"
                >
                    {isLoading ? '...' : '×'}
                </button>
            )}
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                title="프로필 사진 변경"
            >
                <FiEdit2 className="w-5 h-5 text-gray-600" />
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
                disabled={isLoading}
            />
        </div>
    );
};

export default ProfileImage;