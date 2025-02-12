import { useState, useEffect } from 'react';

interface Member {
    id: number;
    nickname: string;
    phoneNumber: string | null;
    state: string;
    role: 'ROLE_ADMIN' | 'ROLE_USER';
    createDate: string;
}

const MemberManagement = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchMembers = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members`,
                { credentials: 'include' }
            );
            if (response.ok) {
                const data = await response.json();
                console.log('전체 회원 데이터:', data);
                if (data && data.length > 0) {
                    console.log('첫 번째 회원 데이터:', data[0]);
                    console.log('첫 번째 회원의 role 값:', data[0].role);
                    console.log('첫 번째 회원의 모든 필드:', Object.keys(data[0]));
                }
                setMembers(data);
            }
        } catch (error) {
            console.error('회원 목록 조회 실패:', error);
        }
    };

    const getStateDisplayName = (state: string) => {
        switch (state) {
            case 'NORMAL':
                return '활성';
            case 'BANNED':
                return '차단';
            case 'DELETED':
                return '탈퇴';
            default:
                return state;
        }
    };

    const getStateBadgeStyle = (state: string) => {
        switch (state) {
            case 'NORMAL':
                return 'bg-green-100 text-green-800 border border-green-200';
            case 'BANNED':
                return 'bg-red-100 text-red-800 border border-red-200';
            case 'DELETED':
                return 'bg-gray-100 text-gray-800 border border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    return (
        <div>
            <div className="flex justify-between mb-4">
                <input
                    type="text"
                    placeholder="회원 검색..."
                    className="px-4 py-2 border rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <table className="w-full">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="p-4 text-left">회원 ID</th>
                        <th className="p-4 text-left">닉네임</th>
                        <th className="p-4 text-left">전화번호</th>
                        <th className="p-4 text-left">상태</th>
                        <th className="p-4 text-left">가입일</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map(member => (
                        <tr key={member.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">{member.id}</td>
                            <td className="p-4">{member.nickname}</td>
                            <td className="p-4">{member.phoneNumber || '전화번호 없음'}</td>
                            <td className="p-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStateBadgeStyle(member.state)}`}>
                                    {getStateDisplayName(member.state)}
                                </span>
                            </td>
                            <td className="p-4">
                                {new Date(member.createDate).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MemberManagement;
