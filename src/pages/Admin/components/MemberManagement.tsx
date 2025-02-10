import { useState, useEffect } from 'react';

interface Member {
    id: number;
    nickname: string;
    phoneNumber: string | null;
    state: string;
    role: 'ROLE_ADMIN' | 'ROLE_USER';
    createDate: string;
}

interface EditingMember {
    id: number;
    phoneNumber: string;
    state: string;
}

const MemberManagement = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingRow, setEditingRow] = useState<EditingMember | null>(null);
    const [editingMemberId, setEditingMemberId] = useState<number | null>(null);

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

    const handleStartEdit = (member: Member) => {
        setEditingRow({
            id: member.id,
            phoneNumber: member.phoneNumber || '',
            state: member.state
        });
    };

    const handleSaveChanges = async () => {
        if (!editingRow) return;

        try {
            // API 요청 시 헤더에 Authorization 토큰 추가
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/${editingRow.id}/update`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`  // 토큰 추가
                    },
                    body: JSON.stringify({
                        phoneNumber: editingRow.phoneNumber || null,  // 빈 문자열일 경우 null로 전송
                        state: editingRow.state
                    })
                }
            );

            if (response.ok) {
                alert('회원 정보가 수정되었습니다.');
                setEditingRow(null);
                fetchMembers();
            } else {
                const responseData = await response.json();
                console.error('수정 실패 응답:', responseData);  // 실패 응답 로깅
                alert(responseData.msg || '회원 정보 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('회원 정보 수정 중 에러:', error);
            alert('회원 정보 수정 중 오류가 발생했습니다.');
        }
    };

    const getRoleBadgeStyle = (role: string) => {
        switch (role) {
            case 'ROLE_ADMIN':
                return 'bg-purple-100 text-purple-800 border border-purple-200';
            case 'ROLE_USER':
                return 'bg-blue-100 text-blue-800 border border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'ROLE_ADMIN':
                return '관리자';
            case 'ROLE_USER':
                return '일반회원';
            default:
                return role;
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
                        <th className="p-4 text-left">권한</th>
                        <th className="p-4 text-left">상태</th>
                        <th className="p-4 text-left">가입일</th>
                        <th className="p-4 text-left">관리</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map(member => (
                        <tr key={member.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">{member.id}</td>
                            <td className="p-4">{member.nickname}</td>
                            <td className="p-4">
                                {member.phoneNumber || '전화번호 없음'}
                            </td>
                            <td className="p-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeStyle(member.role)}`}>
                                    {member.role === 'ROLE_ADMIN' && (
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    )}
                                    {getRoleDisplayName(member.role)}
                                </span>
                            </td>
                            <td className="p-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStateBadgeStyle(member.state)}`}>
                                    {getStateDisplayName(member.state)}
                                </span>
                            </td>
                            <td className="p-4">
                                {new Date(member.createDate).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                                {editingRow?.id === member.id ? (
                                    <div className="space-x-2">
                                        <button
                                            onClick={handleSaveChanges}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            저장
                                        </button>
                                        <button
                                            onClick={() => setEditingRow(null)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            취소
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleStartEdit(member)}
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        수정
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MemberManagement;
