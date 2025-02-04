// src/pages/MyPage/components/UserInfoForm/index.tsx
import { useState } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import { UserInfo, EditFormData } from '../../types';

interface UserInfoFormProps {
    userInfo: UserInfo;
    editForm: EditFormData;
    setEditForm: (form: EditFormData) => void;
    onUpdate: () => void;
}

interface PasswordForm {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface VerificationState {
    isSending: boolean;
    isVerifying: boolean;
    isVerified: boolean;
    code: string;
    error: string;
}

const UserInfoForm = ({ userInfo, editForm, setEditForm, onUpdate }: UserInfoFormProps) => {
    const [editingField, setEditingField] = useState<keyof EditFormData | null>(null);
    const [isPasswordChanging, setIsPasswordChanging] = useState(false);
    const [passwordForm, setPasswordForm] = useState<PasswordForm>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [verification, setVerification] = useState<VerificationState>({
        isSending: false,
        isVerifying: false,
        isVerified: false,
        code: '',
        error: ''
    });

    const handlePasswordChange = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('새 비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/me/password`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        currentPassword: passwordForm.currentPassword,
                        newPassword: passwordForm.newPassword
                    })
                }
            );

            if (response.ok) {
                alert('비밀번호가 변경되었습니다.');
                setIsPasswordChanging(false);
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setPasswordError('');
            } else {
                const data = await response.json();
                setPasswordError(data.msg || '비밀번호 변경에 실패했습니다.');
            }
        } catch (error) {
            console.error('비밀번호 변경 에러:', error);
            setPasswordError('서버 연결에 실패했습니다.');
        }
    };

    // 전화번호 형식화 함수 추가
    const formatPhoneNumber = (value: string) => {
        const numbers = value.replace(/[^\d]/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    };

    // 숫자만 추출하는 함수 추가
    const getOnlyNumbers = (value: string) => value.replace(/[^\d]/g, '');

    // SMS 인증코드 요청 함수 수정
    const requestVerificationCode = async (phoneNumber: string) => {
        const numberOnly = getOnlyNumbers(phoneNumber);
        if (numberOnly.length !== 11) {
            setVerification(prev => ({ ...prev, error: '올바른 휴대폰 번호를 입력해주세요.' }));
            return;
        }

        setVerification(prev => ({ ...prev, isSending: true, error: '' }));
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/me/phone/verification-code`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ phoneNumber: numberOnly })
                }
            );

            if (response.ok) {
                setVerification(prev => ({
                    ...prev,
                    isVerifying: true,
                    isSending: false,
                    error: ''
                }));
                alert('인증번호가 전송되었습니다.');
            } else {
                const data = await response.json();
                setVerification(prev => ({
                    ...prev,
                    isSending: false,
                    error: data.msg || '인증번호 전송에 실패했습니다.'
                }));
            }
        } catch (error) {
            setVerification(prev => ({
                ...prev,
                isSending: false,
                error: '서버 연결에 실패했습니다.'
            }));
        }
    };

    // 인증코드 확인 함수 수정
    const verifyCode = async (phoneNumber: string, code: string) => {
        const numberOnly = getOnlyNumbers(phoneNumber);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/me/phone/verify`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ phoneNumber: numberOnly, code })
                }
            );

            if (response.ok) {
                setVerification(prev => ({
                    ...prev,
                    isVerifying: false,
                    isVerified: true,
                    error: ''
                }));
                alert('인증이 완료되었습니다.');
            } else {
                const data = await response.json();
                setVerification(prev => ({
                    ...prev,
                    error: data.msg || '인증번호가 일치하지 않습니다.'
                }));
            }
        } catch (error) {
            setVerification(prev => ({
                ...prev,
                error: '서버 연결에 실패했습니다.'
            }));
        }
    };

    const renderField = (field: keyof EditFormData, label: string, type: string = 'text') => {
        const isEditing = editingField === field;

        if (field === 'phoneNumber' && isEditing) {
            return (
                <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 min-h-[64px]">
                    <span className="font-bold text-gray-700 w-24">{label}</span>
                    <div className="flex flex-col gap-2 min-w-[300px]">
                        <div className="flex items-center gap-2 justify-end">
                            <input
                                type="tel"
                                value={editForm.phoneNumber}
                                onChange={(e) => {
                                    const formatted = formatPhoneNumber(e.target.value);
                                    if (formatted.length <= 13) {
                                        setEditForm({ ...editForm, phoneNumber: formatted });
                                    }
                                }}
                                className="w-48 h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                                placeholder="010-0000-0000"
                                maxLength={13}
                                disabled={verification.isVerified}
                            />
                            {!verification.isVerified && (
                                <button
                                    onClick={() => requestVerificationCode(editForm.phoneNumber)}
                                    disabled={verification.isSending || getOnlyNumbers(editForm.phoneNumber).length !== 11}
                                    className="h-9 px-3 bg-primary text-white rounded-lg hover:bg-opacity-90 text-sm font-medium disabled:bg-gray-300"
                                >
                                    {verification.isSending ? '전송 중...' : '인증번호 전송'}
                                </button>
                            )}
                        </div>
                        {verification.isVerifying && !verification.isVerified && (
                            <div className="flex items-center gap-2 justify-end">
                                <input
                                    type="text"
                                    value={verification.code}
                                    onChange={(e) => setVerification(prev => ({ ...prev, code: e.target.value }))}
                                    className="w-48 h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                                    placeholder="인증번호 입력"
                                />
                                <div className="flex items-center gap-2 w-[120px]">
                                    <button
                                        onClick={() => verifyCode(editForm.phoneNumber, verification.code)}
                                        className="h-9 px-3 bg-primary text-white rounded-lg hover:bg-opacity-90 text-sm font-medium"
                                    >
                                        확인
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingField(null);
                                            setVerification({
                                                isSending: false,
                                                isVerifying: false,
                                                isVerified: false,
                                                code: '',
                                                error: ''
                                            });
                                        }}
                                        className="h-9 px-3 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 text-sm font-medium"
                                    >
                                        취소
                                    </button>
                                </div>
                            </div>
                        )}
                        {verification.isVerified && (
                            <div className="flex items-center gap-2 justify-end">
                                <div className="flex items-center gap-2 w-[120px]">
                                    <button
                                        onClick={() => {
                                            const numberOnly = getOnlyNumbers(editForm.phoneNumber);
                                            setEditForm({
                                                ...editForm,
                                                phoneNumber: numberOnly
                                            });
                                            onUpdate();
                                            setEditingField(null);
                                            setVerification({
                                                isSending: false,
                                                isVerifying: false,
                                                isVerified: false,
                                                code: '',
                                                error: ''
                                            });
                                        }}
                                        className="h-9 px-3 bg-primary text-white rounded-lg hover:bg-opacity-90 text-sm font-medium"
                                    >
                                        저장
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingField(null);
                                            setVerification({
                                                isSending: false,
                                                isVerifying: false,
                                                isVerified: false,
                                                code: '',
                                                error: ''
                                            });
                                        }}
                                        className="h-9 px-3 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 text-sm font-medium"
                                    >
                                        취소
                                    </button>
                                </div>
                            </div>
                        )}
                        {verification.error && (
                            <p className="text-red-500 text-sm text-right">{verification.error}</p>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 min-h-[64px]">
                <span className="font-bold text-gray-700 w-24">{label}</span>
                <div className="flex items-center gap-2 min-w-[300px] justify-end">
                    {isEditing ? (
                        <>
                            <input
                                type={type}
                                value={typeof editForm[field] === 'boolean' ? '' : (editForm[field] || '')}
                                onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                                className="w-48 h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                            />
                            <div className="flex items-center gap-2 w-[120px]">
                                <button
                                    onClick={() => {
                                        onUpdate();
                                        setEditingField(null);
                                    }}
                                    className="h-9 px-3 bg-primary text-white rounded-lg hover:bg-opacity-90 text-sm font-medium"
                                >
                                    저장
                                </button>
                                <button
                                    onClick={() => setEditingField(null)}
                                    className="h-9 px-3 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 text-sm font-medium"
                                >
                                    취소
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 justify-end w-48 h-9">
                            <span className="text-gray-600 leading-9">{userInfo[field] || '미설정'}</span>
                            <button
                                onClick={() => setEditingField(field)}
                                className="h-9 px-1 text-gray-400 hover:text-primary"
                            >
                                <FiEdit2 size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50">
                <span className="font-bold text-gray-700">비밀번호</span>
                {isPasswordChanging ? (
                    <div className="flex flex-col gap-2 w-72">
                        <input
                            type="password"
                            placeholder="현재 비밀번호"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                        />
                        <input
                            type="password"
                            placeholder="새 비밀번호"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                        />
                        <input
                            type="password"
                            placeholder="새 비밀번호 확인"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                        />
                        {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                        <div className="flex gap-2 justify-end mt-2">
                            <button
                                onClick={handlePasswordChange}
                                className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-opacity-90 text-sm font-medium"
                            >
                                변경
                            </button>
                            <button
                                onClick={() => {
                                    setIsPasswordChanging(false);
                                    setPasswordError('');
                                }}
                                className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 text-sm font-medium"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsPasswordChanging(true)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                    >
                        비밀번호 변경
                    </button>
                )}
            </div>
            {renderField('phoneNumber', '전화번호')}
            {renderField('location', '위치')}
            {renderField('gender', '성별')}
            {renderField('birthday', '생년월일', 'date')}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50">
                <span className="font-bold text-gray-700">마케팅 수신 동의</span>
                <input
                    type="checkbox"
                    checked={editForm.mkAlarm}
                    onChange={(e) => {
                        setEditForm({ ...editForm, mkAlarm: e.target.checked });
                        onUpdate();
                    }}
                    className="w-5 h-5 text-primary rounded"
                />
            </div>
        </div>
    );
};

export default UserInfoForm;