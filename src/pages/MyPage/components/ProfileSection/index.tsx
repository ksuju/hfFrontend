import { useState, useRef } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import ProfileImage from './ProfileImage';
import { UserInfo, EditFormData } from '../../types';
import kakaoIcon from '../../../../assets/images/kakaotalk_simple_icon.png';
import googleIcon from '../../../../assets/images/google_simple_icon.png';
import naverIcon from '../../../../assets/images/naver_simple_icon.png';
import githubIcon from '../../../../assets/images/github_simple_icon.png';

interface ProfileSectionProps {
    userInfo: UserInfo;
    editForm: EditFormData;
    setEditForm: (form: EditFormData) => void;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onUpdate: () => void;
    isEditing?: boolean;
}

const ProfileSection = ({ userInfo, editForm, setEditForm, onImageUpload, onUpdate }: ProfileSectionProps) => {
    const [isNicknameEditing, setIsNicknameEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleResetImage = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getSocialIcon = (loginType: string) => {
        if (loginType === 'SELF') return null;
        const icons = {
            KAKAO: kakaoIcon,
            GOOGLE: googleIcon,
            NAVER: naverIcon,
            GITHUB: githubIcon
        };
        return icons[loginType as keyof typeof icons];
    };

    return (
        <div className="flex items-center gap-8">
            <div className="flex flex-col items-center">
                <ProfileImage
                    profilePath={userInfo.profilePath}
                    onImageUpload={onImageUpload}
                    onResetImage={handleResetImage}
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
                            <span className="text-lg font-bold text-primary">{userInfo.nickname}</span>
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
                        <span className="text-gray-600">{userInfo.email}</span>
                        {getSocialIcon(userInfo.loginType) && (
                            <img
                                src={getSocialIcon(userInfo.loginType) || undefined}
                                alt={userInfo.loginType}
                                className="w-5 h-5"
                            />
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-700">가입일</span>
                    <span className="text-gray-600">
                        {new Date(userInfo.createDate).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProfileSection;