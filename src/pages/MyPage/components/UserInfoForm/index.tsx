// src/pages/MyPage/components/UserInfoForm/index.tsx
import FormField from './FormField';
import { EditFormData } from '../../types';

interface UserInfoFormProps {
    isEditing: boolean;
    editForm: EditFormData;
    setEditForm: (form: EditFormData) => void;
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

    // SMS 인증코드 요청 함수 수정
    const requestVerificationCode = async (phoneNumber: string) => {
        const numberOnly = phoneNumber.replace(/[^\d]/g, '');
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
        const numberOnly = phoneNumber.replace(/[^\d]/g, '');
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

    // 주소 검색 팝업 열기
    const openAddressPopup = () => {
        new window.daum.Postcode({
            oncomplete: function (data: { roadAddress: string; jibunAddress?: string }) {
                const fullAddress = data.jibunAddress ?
                    `${data.roadAddress} (${data.jibunAddress})` :
                    data.roadAddress;

                setEditForm({
                    ...editForm,
                    location: fullAddress
                });
            }
        }).open();
    };

    const renderField = (field: keyof EditFormData, label: string, type: string = 'text') => {
        const isEditing = editingField === field;

        if (field === 'phoneNumber' && isEditing) {
            return (
                <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 min-h-[64px]">
                    <span className="font-bold text-gray-700 w-24 shrink-0">{label}</span>
                    <div className="flex flex-col gap-2 min-w-[300px]">
                        <div className="flex items-center gap-2 justify-end">
                            <input
                                type="tel"
                                value={editForm.phoneNumber || ''}
                                onChange={(e) => setEditForm({
                                    ...editForm,
                                    phoneNumber: e.target.value ? e.target.value : null  // 빈 문자열을 null로 변환
                                })}
                                className="w-48 h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                                placeholder="010-0000-0000"
                                maxLength={13}
                                disabled={verification.isVerified}
                            />
                            {!verification.isVerified && (
                                <button
                                    onClick={() => requestVerificationCode(editForm.phoneNumber || '')}
                                    disabled={verification.isSending || editForm.phoneNumber?.replace(/[^\d]/g, '').length !== 11}
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
                                        onClick={() => verifyCode(editForm.phoneNumber || '', verification.code)}
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
                                            const numberOnly = editForm.phoneNumber?.replace(/[^\d]/g, '') || null;
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

        if (field === 'location' && isEditing) {
            return (
                <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 min-h-[64px]">
                    <span className="font-bold text-gray-700 w-24 shrink-0">{label}</span>
                    <div className="flex items-center gap-2 min-w-[300px] justify-end">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={editForm.location || ''}
                                readOnly
                                className="w-48 h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm bg-gray-50"
                                placeholder="주소 검색을 클릭하세요"
                            />
                            <button
                                onClick={openAddressPopup}
                                className="h-9 px-3 bg-primary text-white rounded-lg hover:bg-opacity-90 text-sm font-medium shrink-0"
                            >
                                주소 검색
                            </button>
                        </div>
                        {editForm.location && (
                            <div className="flex items-center gap-2 w-[120px] shrink-0">
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
                                    onClick={() => {
                                        setEditingField(null);
                                        setEditForm({
                                            ...editForm,
                                            location: userInfo.location
                                        });
                                    }}
                                    className="h-9 px-3 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 text-sm font-medium"
                                >
                                    취소
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (field === 'gender' && isEditing) {
            return (
                <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 min-h-[64px]">
                    <span className="font-bold text-gray-700 w-24 shrink-0">{label}</span>
                    <div className="flex items-center gap-2 min-w-[300px] justify-end">
                        <div className="flex items-center gap-4 w-48">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={editForm.gender === 'M'}
                                    onChange={() => setEditForm({ ...editForm, gender: 'M' })}
                                    className="w-4 h-4 text-primary"
                                />
                                <span>남자</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={editForm.gender === 'W'}
                                    onChange={() => setEditForm({ ...editForm, gender: 'W' })}
                                    className="w-4 h-4 text-primary"
                                />
                                <span>여자</span>
                            </label>
                        </div>
                        <div className="flex items-center gap-2 w-[120px] shrink-0">
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
                    </div>
                </div>
            );
        }

        if (field === 'birthday' && isEditing) {
            return (
                <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 min-h-[64px]">
                    <span className="font-bold text-gray-700 w-24 shrink-0">{label}</span>
                    <div className="flex items-center gap-2 min-w-[300px] justify-end">
                        <input
                            type="date"
                            value={editForm.birthday || ''}
                            onChange={(e) => setEditForm({
                                ...editForm,
                                birthday: e.target.value || null  // undefined 대신 null 사용
                            })}
                            className="w-48 h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                        />
                        <div className="flex items-center gap-2 w-[120px] shrink-0">
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
                                onClick={() => {
                                    setEditingField(null);
                                    setEditForm({
                                        ...editForm,
                                        birthday: userInfo.birthday
                                    });
                                }}
                                className="h-9 px-3 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 text-sm font-medium"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // 위치 필드일 때만 넓은 너비 적용
        const isLocationField = field === 'location';
        const containerWidth = isLocationField ? 'min-w-[400px]' : 'min-w-[300px]';
        const inputWidth = isLocationField ? 'w-[300px]' : 'w-48';

        return (
            <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 min-h-[64px]">
                <span className="font-bold text-gray-700 w-24 shrink-0">{label}</span>
                <div className={`flex items-center gap-2 ${containerWidth} justify-end`}>
                    {isEditing ? (
                        <>
                            <input
                                type={type}
                                value={typeof editForm[field] === 'boolean' ? '' : (editForm[field] || '')}
                                onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                                className={`${inputWidth} h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm`}
                            />
                            <div className="flex items-center gap-2 w-[120px] shrink-0">
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
                        <div className={`flex items-center gap-2 justify-end ${inputWidth} h-9`}>
                            <span className="text-gray-600 leading-9 truncate">
                                {field === 'gender' ?
                                    (userInfo[field] === 'M' ? '남자' : userInfo[field] === 'W' ? '여자' : '미설정') :
                                    (userInfo[field] || '미설정')}
                            </span>
                            <button
                                onClick={() => setEditingField(field)}
                                className="h-9 px-1 text-gray-400 hover:text-primary shrink-0"
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
        <div className="space-y-6">
            <FormField
                label="전화번호"
                value={editForm.phoneNumber}
                onChange={(value) => setEditForm({ ...editForm, phoneNumber: value })}
                isEditing={isEditing}
            />
            <FormField
                label="위치"
                value={editForm.location}
                onChange={(value) => setEditForm({ ...editForm, location: value })}
                isEditing={isEditing}
            />
            <FormField
                label="성별"
                value={editForm.gender}
                onChange={(value) => setEditForm({ ...editForm, gender: value })}
                isEditing={isEditing}
                type="select"
                options={[
                    { value: 'M', label: '남성' },
                    { value: 'W', label: '여성' }
                ]}
            />
            <FormField
                label="생일"
                value={editForm.birthday}
                onChange={(value) => setEditForm({ ...editForm, birthday: value })}
                isEditing={isEditing}
                type="date"
            />
            <div className="border-b pb-3">
                <label className="flex items-center text-base font-bold text-primary mb-1">
                    <input
                        type="checkbox"
                        checked={editForm.mkAlarm}
                        onChange={(e) => setEditForm({ ...editForm, mkAlarm: e.target.checked })}
                        className="mr-2"
                        disabled={!isEditing}
                    />
                    마케팅 수신 동의
                </label>
            </div>
        </div>
    );
};

export default UserInfoForm; // default export 추가