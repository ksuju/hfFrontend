export interface Alert {
    id: number;
    content: string;
    isRead: boolean;
    type: AlertType;
    navigationData: string;
    createdAt: string;
}

export enum AlertType {
    GROUP_APPLICATION = 'GROUP_APPLICATION',
    GROUP_APPROVED = 'GROUP_APPROVED',
    GROUP_APPLICATION_APPROVED = 'GROUP_APPLICATION_APPROVED',
    GROUP_APPLICATION_REJECTED = 'GROUP_APPLICATION_REJECTED',
    GROUP_KICKED = 'GROUP_KICKED',
    GROUP_DELETED = 'GROUP_DELETED',
    GROUP_NEW_POST = 'GROUP_NEW_POST',
    COMMENT_REPLY = 'COMMENT_REPLY',
    // ... (백엔드 AlertType과 일치하게 설정)
}