interface FormFieldProps {
    label: string;
    value: string | null;
    onChange?: (value: string) => void;
    isEditing?: boolean;
    type?: 'text' | 'select' | 'date' | 'checkbox';
    options?: { value: string; label: string }[];
}

const FormField = ({ label, value, onChange, isEditing, type = 'text', options }: FormFieldProps) => {
    const handleChange = (value: string) => {
        onChange?.(value);
    };

    return (
        <div className="border-b pb-3 bg-primary/5">
            <div className="flex items-center gap-4 p-3">
                <label className="block text-base font-bold text-primary w-24">
                    {label}
                </label>
                {isEditing ? (
                    type === 'select' ? (
                        <select
                            value={value || ''}
                            onChange={(e) => handleChange(e.target.value)}
                            className="flex-1 h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                        >
                            <option value="">선택안함</option>
                            {options?.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    ) : type === 'date' ? (
                        <input
                            type="date"
                            value={value || ''}
                            onChange={(e) => handleChange(e.target.value)}
                            className="flex-1 h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                        />
                    ) : (
                        <input
                            type={type}
                            value={value || ''}
                            onChange={(e) => handleChange(e.target.value)}
                            className="flex-1 h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                        />
                    )
                ) : (
                    <p className="text-base text-gray-900 flex-1">{value || "정보 없음"}</p>
                )}
            </div>
        </div>
    );
};

export default FormField;