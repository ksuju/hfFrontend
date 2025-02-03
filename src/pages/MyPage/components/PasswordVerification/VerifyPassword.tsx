interface VerifyPasswordProps {
    password: string;
    setPassword: (password: string) => void;
    handlePasswordVerify: (e: React.FormEvent) => Promise<void>;
}

const VerifyPassword = ({ password, setPassword, handlePasswordVerify }: VerifyPasswordProps) => {
    return (
        <form onSubmit={handlePasswordVerify} className="space-y-4">
            <h3 className="text-xl font-bold text-center mb-4">비밀번호 확인</h3>
            <p className="text-gray-600 text-center mb-6">
                회원 정보를 수정하기 위해 비밀번호를 입력해주세요.
            </p>
            <div>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호"
                    className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                />
            </div>
            <button
                type="submit"
                className="w-full h-12 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
                비밀번호 확인
            </button>
        </form>
    );
};

export default VerifyPassword;