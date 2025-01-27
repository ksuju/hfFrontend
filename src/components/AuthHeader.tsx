import { Link } from 'react-router-dom';

const AuthHeader = () => {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm">
            <div className="max-w-[430px] mx-auto h-full px-4 flex justify-center items-center">
                <Link to="/" className="flex items-center">
                    <h1 className="text-xl font-bold text-primary">숨은사람찾기</h1>
                </Link>
            </div>
        </header>
    );
};

export default AuthHeader; 