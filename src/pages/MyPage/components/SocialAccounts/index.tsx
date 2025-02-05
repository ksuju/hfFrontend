import SocialAccountCard from './SocialAccountCard';
import { UserInfo } from '../../types';
import kakaoSimpleIcon from '../../../../assets/images/kakaotalk_simple_icon.png';
import googleSimpleIcon from '../../../../assets/images/google_simple_icon.png';
import naverSimpleIcon from '../../../../assets/images/naver_simple_icon.png';
import githubSimpleIcon from '../../../../assets/images/github_simple_icon.png';

interface SocialAccountsProps {
    userInfo: UserInfo;
    onUpdate: () => void;
}

const SocialAccounts = ({ userInfo, onUpdate }: SocialAccountsProps) => {
    const socialAccounts = [
        {
            provider: 'KAKAO' as const,
            icon: kakaoSimpleIcon,
            name: '카카오',
            account: userInfo.socialAccounts.KAKAO
        },
        {
            provider: 'NAVER' as const,
            icon: naverSimpleIcon,
            name: '네이버',
            account: userInfo.socialAccounts.NAVER
        },
        {
            provider: 'GOOGLE' as const,
            icon: googleSimpleIcon,
            name: '구글',
            account: userInfo.socialAccounts.GOOGLE
        },
        {
            provider: 'GITHUB' as const,
            icon: githubSimpleIcon,
            name: '깃허브',
            account: userInfo.socialAccounts.GITHUB
        }
    ];

    const handleSocialLink = () => {
        window.sessionStorage.setItem('needsUpdate', 'true');
        onUpdate();
    };

    return (
        <div className="mt-6 space-y-4">
            <p className="text-base font-bold text-primary mb-2">소셜 계정 연동</p>
            <div className="flex flex-col gap-4">
                {socialAccounts.map(({ provider, icon, name, account }) => (
                    <SocialAccountCard
                        key={provider}
                        provider={provider}
                        icon={icon}
                        name={name}
                        account={account}
                        onSocialLink={handleSocialLink}
                    />
                ))}
            </div>
        </div>
    );
};

export default SocialAccounts;