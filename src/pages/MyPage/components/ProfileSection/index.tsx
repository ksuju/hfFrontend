import { useRef } from 'react';
import ProfileImage from './ProfileImage';
import { UserInfo, EditFormData } from '../../types';

interface ProfileSectionProps {
    userInfo: UserInfo;
    isEditing: boolean;
    editForm: EditFormData;
    setEditForm: (form: EditFormData) => void;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onUpdate: () => void;
    handleResetImage: () => void;
    handleDelete: () => void;
}

const ProfileSection = ({ userInfo, editForm, setEditForm, onImageUpload, onUpdate, handleResetImage, handleDelete }: ProfileSectionProps) => {
    const [isNicknameEditing, setIsNicknameEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '정보 없음';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return '정보 없음';
        }
    };

    return (
        <div className="relative">
            <button
                onClick={handleDelete}
                className="absolute top-0 right-0 text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
                회원탈퇴
            </button>
            <div className="flex items-center gap-8">
                <div className="flex flex-col items-center">
                    <ProfileImage
                        profilePath={userInfo.profilePath}
                        onImageUpload={onImageUpload}
                        onResetImage={async () => await handleResetImage()}
                        fileInputRef={fileInputRef}
                    />
                </div>
                <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-700">닉네임</span>
                        {isNicknameEditing ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={editForm.nickname}
                                    onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                                    className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                                />
                                <button
                                    onClick={() => {
                                        onUpdate();
                                        setIsNicknameEditing(false);
                                    }}
                                    className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-opacity-90 text-sm font-medium"
                                >
                                    저장
                                </button>
                                <button
                                    onClick={() => setIsNicknameEditing(false)}
                                    className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 text-sm font-medium"
                                >
                                    취소
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-primary">
                                    {userInfo.nickname || '닉네임 없음'}
                                </span>
                                <button
                                    onClick={() => setIsNicknameEditing(true)}
                                    className="p-1 text-gray-400 hover:text-primary"
                                >
                                    <FiEdit2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-700">계정</span>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600">
                                {userInfo.email || '이메일 없음'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-700">가입일</span>
                        <span className="text-gray-600">{formatDate(userInfo.createDate)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSection;