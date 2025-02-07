import { useState, useEffect } from 'react';

interface Member {
    id: number;
    username: string;
    nickname: string;
    phoneNumber: string | null;
    state: string;
    role: 'ROLE_ADMIN' | 'ROLE_USER' | 'ROLE_BANNED';
    createDate: string;
    gender: string;
    location: string;
    birthday: string;
    mkAlarm: boolean;
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

    const fetchMembers = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members`,
                { credentials: 'include' }
            );
            if (response.ok) {
                const data = await response.json();
                console.log('API 응답 전체:', data);
                if (data && data.length > 0) {
                    console.log('첫 번째 회원의 모든 필드:', Object.keys(data[0]));
                    console.log('첫 번째 회원 데이터:', data[0]);
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

    const handleStatusChange = async (memberId: number, currentRole: string) => {
        // ROLE_USER <-> ROLE_BANNED 전환
        const newRole = currentRole === 'ROLE_BANNED' ? 'ROLE_USER' : 'ROLE_BANNED';
        
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/reports/${memberId}/change-role`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ role: newRole })
                }
            );

            if (response.ok) {
                alert(`회원 상태가 ${newRole === 'ROLE_BANNED' ? '차단' : '활성화'} 되었습니다.`);
                fetchMembers();  // 목록 새로고침
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '회원 상태 변경에 실패했습니다.');
            }
        } catch (error) {
            console.error('회원 상태 변경 실패:', error);
            alert('회원 상태 변경 중 오류가 발생했습니다.');
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
                        <th className="p-4 text-left">ID</th>
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
                                {editingRow?.id === member.id ? (
                                    <input
                                        type="text"
                                        className="px-2 py-1 border border-gray-200 rounded-lg text-sm bg-white w-full"
                                        value={editingRow.phoneNumber}
                                        onChange={(e) => {
                                            const phoneRegex = /^[0-9-]*$/;
                                            if (phoneRegex.test(e.target.value)) {
                                                setEditingRow({
                                                    ...editingRow,
                                                    phoneNumber: e.target.value
                                                });
                                            }
                                        }}
                                        placeholder="전화번호를 입력하세요"
                                    />
                                ) : (
                                    <div className="px-2 py-1">
                                        {member.phoneNumber || '전화번호를 입력하지 않음'}
                                    </div>
                                )}
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
                                {editingRow?.id === member.id ? (
                                    <select
                                        className="px-2 py-1 border border-gray-200 rounded-lg text-sm bg-white"
                                        value={editingRow.state}
                                        onChange={(e) => setEditingRow({
                                            ...editingRow,
                                            state: e.target.value
                                        })}
                                    >
                                        <option value="NORMAL">활성</option>
                                        <option value="BANNED">차단됨</option>
                                        <option value="DELETED">탈퇴</option>
                                    </select>
                                ) : (
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                        member.state === 'NORMAL' 
                                            ? 'bg-green-100 text-green-800 border border-green-200'
                                            : member.state === 'BANNED'
                                            ? 'bg-red-100 text-red-800 border border-red-200'
                                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                                    }`}>
                                        {member.state === 'NORMAL' ? '활성' : 
                                         member.state === 'BANNED' ? '차단됨' :
                                         member.state === 'DELETED' ? '탈퇴' : member.state}
                                    </span>
                                )}
                            </td>
                            <td className="p-4">{new Date(member.createDate).toLocaleDateString()}</td>
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
