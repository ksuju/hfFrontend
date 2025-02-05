export interface UserInfo {
    id: number;
    email: string | null;
    nickname: string | null;
    profilePath: string | null | undefined;
    phoneNumber: string | null;
    location: string | null;
    gender: string | null;
    birthday: string | null;
    mkAlarm: boolean;
    createDate: string | null;
    loginType: string | null;
    onlySocialAccount: boolean;
    socialAccounts: {
        KAKAO: SocialAccount;
        NAVER: SocialAccount;
        GOOGLE: SocialAccount;
        GITHUB: SocialAccount;
    };
}

export interface EditFormData {
    phoneNumber: string | null;
    location: string | null;
    gender: string | null;
    birthday: string | null;
    mkAlarm: boolean;
    nickname: string;
}

export interface SocialAccount {
    active: boolean;
    createDate: string;
    email: string | null;
}