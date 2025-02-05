import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../components/AuthHeader';


interface EmailInfo {
    maskedEmail: string;
    createdAt: string;
}

const FindAccount = () => {
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [foundEmails, setFoundEmails] = useState<EmailInfo[]>([]);
    const [showResults, setShowResults] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/auth/find-account`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber })
            });

            if (response.ok) {
                const rsData = await response.json();
                console.log('서버 응답:', rsData);
                setFoundEmails(rsData.data.emailInfos);
                setShowResults(true);
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '등록된 계정을 찾을 수 없습니다.');
            }
        } catch (error) {
            alert('서버 연결에 실패했습니다.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <AuthHeader />
            <div className="flex-1 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-semibold text-center mb-6">아이디 찾기</h2>
                    {!showResults ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="휴대폰 번호 (- 없이 입력)"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-primary pr-24"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-0 top-0 h-full px-6 text-base font-medium text-primary border-l border-gray-200 hover:bg-primary hover:text-white transition-colors rounded-r-lg"
                                >
                                    찾기
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="border-t border-b py-4">
                                {foundEmails.map((emailInfo, index) => (
                                    <div key={index} className="text-center text-gray-700">
                                        <p>{emailInfo.maskedEmail}</p>
                                        <p className="text-sm text-gray-500">
                                            가입일: {new Date(emailInfo.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="flex-1 h-12 bg-primary text-white rounded-lg"
                                >
                                    로그인
                                </button>
                                <button
                                    onClick={() => navigate('/reset-password')}
                                    className="flex-1 h-12 border border-primary text-primary rounded-lg"
                                >
                                    비밀번호 찾기
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FindAccount;