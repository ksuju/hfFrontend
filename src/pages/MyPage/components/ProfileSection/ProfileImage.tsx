interface ProfileImageProps {
    profilePath: string;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onResetImage: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
}

const ProfileImage = ({ profilePath, onImageUpload, onResetImage, fileInputRef }: ProfileImageProps) => {
    return (
        <div className="relative">
            <img
                src={profilePath?.startsWith('http')
                    ? profilePath
                    : `https://kr.object.ncloudstorage.com/hf-bucket2025/member/${profilePath}`}
                alt="프로필"
                className="w-80 h-80 rounded-full"
            />
            <button
                onClick={onResetImage}
                className="absolute top-0 right-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                title="프로필 이미지 삭제"
            >
                ×
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={onImageUpload}
                accept="image/*"
                className="hidden"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
                프로필 사진 변경
            </button>
        </div>
    );
};

export default ProfileImage;