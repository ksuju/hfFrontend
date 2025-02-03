interface CreatePasswordProps {
    newPassword: string;
    confirmNewPassword: string;
    passwordError: string;
    setNewPassword: (password: string) => void;
    setConfirmNewPassword: (password: string) => void;
    handleCreatePassword: (e: React.FormEvent) => Promise<void>;
}

const CreatePassword = ({
    newPassword,
    confirmNewPassword,
    passwordError,
    setNewPassword,
    setConfirmNewPassword,
    handleCreatePassword
}: CreatePasswordProps) => {
    return (
        <form onSubmit={handleCreatePassword} className="space-y-4">
            <h3 className="text-xl font-bold text-center mb-4">비밀번호 설정</h3>
            <p className="text-gray-600 text-center mb-6">
                소셜 로그인 계정입니다. 정보 확인을 위해 비밀번호를 설정해주세요.
            </p>
            <div>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호"
                    className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                />
            </div>
            <div>
                <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="새 비밀번호 확인"
                    className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                />
            </div>
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            <button
                type="submit"
                className="w-full h-12 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
                비밀번호 설정
            </button>
        </form>
    );
};

export default CreatePassword;