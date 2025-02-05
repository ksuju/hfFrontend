export interface UserInfo {
    id: number;
    email: string;
    nickname: string;
    profilePath: string;
    phoneNumber: string;
    location: string;
    gender: string;
    birthday: string;
    mkAlarm: boolean;
    createDate: string;
    loginType: string;
    onlySocialAccount: boolean;
    socialAccounts: {
        KAKAO: SocialAccount;
        NAVER: SocialAccount;
        GOOGLE: SocialAccount;
        GITHUB: SocialAccount;
    };
}

export interface EditFormData {
    phoneNumber: string;
    location: string;
    gender: string | null;
    birthday: string;
    mkAlarm: boolean;
    nickname: string;
}

export interface SocialAccount {
    active: boolean;
    createDate: string;
}