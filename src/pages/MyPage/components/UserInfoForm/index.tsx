// src/pages/MyPage/components/UserInfoForm/index.tsx
import FormField from './FormField';
import { EditFormData } from '../../types';

interface UserInfoFormProps {
    isEditing: boolean;
    editForm: EditFormData;
    setEditForm: (form: EditFormData) => void;
}

const UserInfoForm = ({ isEditing, editForm, setEditForm }: UserInfoFormProps) => {
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