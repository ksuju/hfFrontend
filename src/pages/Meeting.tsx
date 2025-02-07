import { useEffect, useState } from 'react';
import SearchBar from '../components/SearchBar';
import {useNavigate} from "react-router-dom";
import dots from '../assets/images/three-dots.png';

interface MeetingPost {
    memberId: string;
    chatRoomId: string;
    roomTitle: string;
    roomContent: string;
    festivalName: string;
    roomMemberLimit: string;
    joinMemberNum: string;
    createDate: string;
    joinMemberIdNickNameList: string[][];
    waitingMemberIdNickNameList: string[][];
}

interface Member {
    id: string;
    joinRoomIdList: string[];
    waitRoomIdList: string[];
}

// API 응답 전체 구조
interface MeetingApiResponse {
    content: MeetingPost[];
    page: {
        totalPages: number;
        number: number; // 현재 페이지 (0부터 시작)
    };
}

const Meeting = () => {
    const [meetingPosts, setMeetingPosts] = useState<MeetingPost[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate(); // 페이지 이동을 위한 훅
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentUser, setCurrentUser] = useState<Member | null>(null);
    const [openPopupId, setOpenPopupId] = useState<string | null>(null);
    const [isConfirmLeaveOpen, setIsConfirmLeaveOpen] = useState<string | null>(null);
    const [isManagePopupOpen, setIsManagePopupOpen] = useState(false);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [editRoomData, setEditRoomData] = useState({title: "", content: "", limit: 10,});
    const [activeTab, setActiveTab] = useState("참여자");
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const selectedMeeting = meetingPosts.find(meeting => meeting.chatRoomId === selectedRoomId);
    const currentUserID = currentUser?.id ?? ""; // 기본값을 빈 문자열로 설정하여 undefined 방지
    const [isConfirmDelegateOpen, setIsConfirmDelegateOpen] = useState(false);
    const [selectedDelegateId, setSelectedDelegateId] = useState<string | null>(null);
    const [selectedChatRoomId, setSelectedChatRoomId] = useState<string | null>(null);
    const [isConfirmKickOpen, setIsConfirmKickOpen] = useState(false);
    const [kickTargetId, setKickTargetId] = useState<string | null>(null);
    const [kickChatRoomId, setKickChatRoomId] = useState<string | null>(null);

    const handleTogglePopup = (chatRoomId: string) => {
        setOpenPopupId(openPopupId === chatRoomId ? null : chatRoomId);
    };

    const handleSearch = async (keyword: string) => {
        setSearchKeyword(keyword);
        setPage(0);
        setHasMore(true);
    };

    // 모임 데이터 가져오기 (무한 스크롤)
    const fetchMeetingPosts = async (pageNumber: number, keyword = "") => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        try {
            const url = keyword
                ? import.meta.env.VITE_CORE_API_BASE_URL + `/api/v1/posts/chat-rooms/search?keyword=${encodeURIComponent(keyword)}&page=${pageNumber}&size=10`
                : import.meta.env.VITE_CORE_API_BASE_URL + `/api/v1/posts/chat-rooms?page=${pageNumber}&size=10`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data: MeetingApiResponse = await response.json();

            setMeetingPosts((prev) => (pageNumber === 0 ? data.content : [...prev, ...data.content]));
            setHasMore(data.page.number + 1 < data.page.totalPages);
            setPage(data.page.number + 1);
        } catch (error) {
            console.error("Error fetching meeting posts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 검색어 변경 시 자동 검색 (디바운스 적용)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchMeetingPosts(0, searchKeyword);
        }, 100);

        return () => clearTimeout(delayDebounceFn);
    }, [searchKeyword]);

    // 무한 스크롤 이벤트 리스너
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && !isLoading) {
                fetchMeetingPosts(page, searchKeyword);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [page, isLoading, searchKeyword]);

    // 현재 로그인한 유저 정보 업데이트
    const fetchUserInfo = async () => {
        try {
            const response = await fetch(import.meta.env.VITE_CORE_API_BASE_URL + "/api/v1/auth/me", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data: { resultCode: string; msg: string; data: Member } = await response.json();
            console.log('API response data:', data);
            setCurrentUser(data.data);
        } catch (error) {
            console.error("사용자 정보 로드 실패:", error);
        }
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    // 참여하기/취소 버튼 로직 구현
    const handleJoinClick = async (chatRoomId: string, isUserWaiting: boolean | undefined) => {
        try {
            const url = import.meta.env.VITE_CORE_API_BASE_URL +
                (isUserWaiting ? `/api/v1/posts/cancel-apply-chat-room/${chatRoomId}` : `/api/v1/posts/apply-chat-room/${chatRoomId}`);
            const response = await fetch(url, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            // 최신 참여 채팅방 리스트 가져오기
            await fetchUserInfo();
        } catch (error) {
            console.error("Error toggling chat room participation:", error);
        }
    };

    // 유저가 채팅방 대기자 목록에 있는지 확인
    const isUserInWaitRoom = (chatRoomId: number | string) => {
        const chatRoomIdStr = String(chatRoomId); // 문자열 변환
        return currentUser?.waitRoomIdList.includes(chatRoomIdStr) || false;
    };

    // 유저가 이미 참여한 채팅방인지 확인하는 함수
    const isUserInJoinRoom = (chatRoomId: number | string) => {
        const chatRoomIdStr = String(chatRoomId); // 문자열 변환
        return currentUser?.joinRoomIdList.includes(chatRoomIdStr) || false;
    };

    // 채팅방 클릭 시 이동 메서드
    const handleChatRoomClick = (chatRoomId: string, isUserJoined: boolean) => {
        if (isUserJoined) {
            navigate(`/chat/${chatRoomId}`); // 참여한 채팅방만 이동 가능
        }
    };

    // 인원관리 버튼 메서드
    const handleManageMembers = (chatRoomId: string) => {
        setSelectedRoomId(chatRoomId);
        console.log(selectedRoomId);
        setIsManagePopupOpen(true);
    };

    // 인원관리 창 나가기 메서드
    const closeManagePopup = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setIsManagePopupOpen(false);
        setSelectedRoomId(null);
    };

    // 수정하기 버튼 메서드
    const handleEditRoom = (chatRoomId: string) => {
        const selectedRoom = meetingPosts.find((room) => room.chatRoomId === chatRoomId);
        if (selectedRoom) {
            setSelectedRoomId(chatRoomId);
            setEditRoomData({
                title: selectedRoom.roomTitle,
                content: selectedRoom.roomContent,
                limit: Number(selectedRoom.roomMemberLimit),
            });
            setIsEditPopupOpen(true);
        }
    };

    // 수정 폼 입력값 변경 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditRoomData((prev) => ({
            ...prev,
            [name]: name === "limit" ? Number(value) : value,
        }));
    };

    // 수정내용 저장하기 버튼 메서드
    const handleSaveEdit = async (chatRoomId: string) => {
        const requestBody = {
            roomTitle: editRoomData.title,
            roomContent: editRoomData.content,
            roomMemberLimit: Number(editRoomData.limit),
        };

        console.log("🔍 요청 데이터:", JSON.stringify(requestBody, null, 2));
        console.log("📌 요청 URL:", `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/update-chat-room/${chatRoomId}`);
        console.log(chatRoomId);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/update-chat-room/${chatRoomId}`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                }
            );
            if (!response.ok) {
                throw new Error("채팅방 수정 실패");
            }
            console.log("채팅방 수정 성공");
            setIsEditPopupOpen(false);
            // 수정하기 후 최신 데이터 다시 불러오기
            await fetchMeetingPosts(0);
        } catch (error) {
            console.error("에러 발생:", error);
        }
    };

    // 나가기 버튼 메서드
    const handleLeaveRoom = (chatRoomId: string) => {
        console.log(`나가기: ${chatRoomId}`);
        setIsConfirmLeaveOpen(chatRoomId); // Open confirmation popup
        setOpenPopupId(null);
    };

    // 최종확인 나가기 버튼 메서드
    const confirmLeaveRoom = async (chatRoomId: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/leave-chat-room/${chatRoomId}`, {
                method: 'GET', // Or use the correct method (POST/DELETE)
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                console.log('Successfully left the chat room');
                setIsConfirmLeaveOpen(null); // Close the confirmation popup
                // 나가기 후 최신 데이터 다시 불러오기
                await fetchMeetingPosts(0);
            } else {
                console.error('Error leaving chat room');
            }
        } catch (error) {
            console.error('Request failed:', error);
        }
    };

    // 나가기 취소 버튼 메서드
    const cancelLeaveRoom = () => {
        setIsConfirmLeaveOpen(null); // Close the confirmation popup
    };

    // ID로 닉네임 찾기 함수
    const getNicknameById = (id: string | null) => {
        const member = selectedMeeting?.joinMemberIdNickNameList.find(([memberId]) => memberId === id);
        return member ? member[1] : "알 수 없음";
    };

    // 참여자 목록에서 방장위치 맨 위에 고정
    const sortedJoinMembers = selectedMeeting ? (() => {
        const ownerIndex = selectedMeeting.joinMemberIdNickNameList.findIndex(([id]) => id === String(currentUserID));
        if (ownerIndex !== -1) {
            const sortedList = [
                selectedMeeting.joinMemberIdNickNameList[ownerIndex],
                ...selectedMeeting.joinMemberIdNickNameList.filter((_, idx) => idx !== ownerIndex)
            ];
            return sortedList;
        }
        return selectedMeeting.joinMemberIdNickNameList;
    })() : [];

    // 위임 버튼 클릭 시 확인 팝업 띄우기
    const handleConfirmDelegate = (chatRoomId: string, memberId: string) => {
        setSelectedChatRoomId(chatRoomId);
        setSelectedDelegateId(memberId);
        setIsConfirmDelegateOpen(true);
    };

    // 위임 최종 확인 후 실행
    const confirmDelegate = () => {
        if (selectedChatRoomId && selectedDelegateId) {
            handleDelegate(selectedChatRoomId, selectedDelegateId);
        }
        setIsConfirmDelegateOpen(false);
        setSelectedDelegateId(null);
        setSelectedChatRoomId(null);
    };

    // 위임하기 요청 메서드
    const handleDelegate = async (chatRoomId: string, memberId: string) => {
        if (!chatRoomId || !memberId) return;
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/delegate-chat-room/${chatRoomId}/${memberId}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.ok) {
                setIsManagePopupOpen(false);
                // 위임 후 최신 데이터 다시 불러오기
                await fetchMeetingPosts(0);
            } else {
                alert("위임에 실패했습니다.");
            }
        } catch (error) {
            console.error("위임 요청 실패:", error);
        }
    };

    // 위임 최종확인 팝업 닫기
    const cancelDelegate = () => {
        setIsConfirmDelegateOpen(false);
        setSelectedDelegateId(null);
        setSelectedChatRoomId(null);
    };

    // 강퇴 확인 팝업 열기
    const handleConfirmKick = (chatRoomId: string, memberId: string) => {
        setKickChatRoomId(chatRoomId);
        setKickTargetId(memberId);
        setIsConfirmKickOpen(true);
    };

    // 강퇴 요청 실행
    const confirmKick = async () => {
        if (!kickChatRoomId || !kickTargetId) return;
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/unqualify-chat-room/${kickChatRoomId}/${kickTargetId}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.ok) {
                // 강퇴 후 최신 데이터 다시 불러오기
                await fetchMeetingPosts(0);
            } else {
                alert("강퇴에 실패했습니다.");
            }
        } catch (error) {
            console.error("강퇴 요청 실패:", error);
        }
        setIsConfirmKickOpen(false);
    };

    // 강퇴 최종확인 팝업 닫기
    const cancelKick = () => {
        setIsConfirmKickOpen(false);
        setKickTargetId(null);
        setKickChatRoomId(null);
    };

    // 대기자 승인하기 요청 메서드
    const handleApprove = async (chatRoomId: string, memberId: string) => {
        if (!chatRoomId || !memberId) return;
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/approve-apply-chat-room/${chatRoomId}/${memberId}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.ok) {
                // 승인 후 최신 데이터 다시 불러오기
                await fetchMeetingPosts(0);
            } else {
                alert("승인에 실패했습니다.");
            }
        } catch (error) {
            console.error("승인 요청 실패:", error);
        }
    };

    // 대기자 거절하기 요청 메서드
    const handleRefuse = async (chatRoomId: string, memberId: string) => {
        if (!chatRoomId || !memberId) return;
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/refuse-apply-chat-room/${chatRoomId}/${memberId}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.ok) {
                // 거절 후 최신 데이터 다시 불러오기
                await fetchMeetingPosts(0);
            } else {
                alert("거절에 실패했습니다.");
            }
        } catch (error) {
            console.error("거절 요청 실패:", error);
        }
    };

    return (
        <div className="max-w-[600px] mx-auto">
            <SearchBar placeholder="모임을 검색해보세요" onChange={handleSearch} />
            <div className="p-4 my-20">
                <div className="space-y-3">
                    {meetingPosts.map((meeting) => {
                        const isUserWaiting = isUserInWaitRoom(meeting.chatRoomId);
                        const isUserJoined = isUserInJoinRoom(meeting.chatRoomId);
                        const isRoomOwner = meeting.memberId === currentUser?.id;

                        return (
                            <div
                                key={meeting.chatRoomId}
                                className="bg-white rounded-lg shadow-md p-4 border border-gray-100 cursor-pointer"
                                onClick={() => {
                                    if (!isUserJoined) {
                                        console.log("채팅방에 참여해야 이동할 수 있습니다.");
                                        return; // 클릭 가능하지만 동작 안 함
                                    }
                                    handleChatRoomClick(meeting.chatRoomId, isUserJoined);
                                }}
                            >
                                {/* 제목 + 버튼 */}
                                <div className="flex justify-between items-start">
                                    <h3 className="font-medium text-base flex-grow truncate max-w-[75%]">
                                        {meeting.roomTitle}
                                    </h3>
                                    {/* 참여 상태 표시 */}
                                    <div className="flex items-center space-x-3 relative">
                                        {isUserJoined && (
                                            <img
                                                src={dots}
                                                alt="사이드바"
                                                className="h-8 mt-[-6px] mr-[-6px] cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // 채팅방 클릭 방지
                                                    handleTogglePopup(meeting.chatRoomId);
                                                }}
                                            />
                                        )}
                                        {!isUserJoined && (
                                            <button
                                                className={`text-sm font-medium px-3 rounded-md ${
                                                    isUserWaiting ? "text-gray-500 border-gray-400" : "text-primary border-primary"
                                                }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleJoinClick(meeting.chatRoomId, isUserWaiting);
                                                }}
                                            >
                                                {isUserWaiting ? "취소" : "참여하기"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {/* 팝업 메뉴 */}
                                {openPopupId === meeting.chatRoomId && (
                                    <div
                                        className="absolute right-12 bg-white shadow-md rounded-lg border border-gray-200 w-20 text-sm z-10"
                                        onClick={(e) => e.stopPropagation()} // 채팅방 클릭 방지
                                        onBlur={() => setOpenPopupId(null)}
                                        tabIndex={0} // 포커스 유지
                                    >
                                        {isRoomOwner && (
                                            <>
                                                <button
                                                    className="w-full text-left px-3 py-2 hover:bg-gray-100"
                                                    onClick={() => handleManageMembers(meeting.chatRoomId)}
                                                >
                                                    인원 관리
                                                </button>
                                                <button
                                                    className="w-full text-left px-3 py-2 hover:bg-gray-100"
                                                    onClick={() => handleEditRoom(meeting.chatRoomId)}
                                                >
                                                    수정하기
                                                </button>
                                            </>
                                        )}
                                        <button
                                            className="w-full text-left px-3 py-2 hover:bg-gray-100 text-primary"
                                            onClick={() => handleLeaveRoom(meeting.chatRoomId)}
                                        >
                                            나가기
                                        </button>
                                    </div>
                                )}

                                {/* 인원관리 팝업창 */}
                                {isManagePopupOpen && (
                                    <div
                                        className="fixed inset-0 bg-gray-500 bg-opacity-10 flex justify-center items-center z-20"
                                        onClick={(e) => e.stopPropagation()} // 팝업 외부 클릭 방지
                                    >
                                        <div className="bg-white w-2/3 h-3/4 p-6 rounded-lg shadow-md flex flex-col">
                                            <h3 className="text-lg font-semibold mb-4">인원 관리</h3>
                                            {/* 메뉴바 */}
                                            <div className="flex border-b">
                                                {[
                                                    { label: "참여자", count: sortedJoinMembers.length },
                                                    { label: "대기자", count: selectedMeeting?.waitingMemberIdNickNameList?.length ?? 0 },
                                                ].map(({ label, count }) => (
                                                    <button
                                                        key={label}
                                                        className={`flex-1 p-2 text-center text-lg font-medium ${
                                                            activeTab === label ? "border-b-2 border-primary text-primary" : "text-gray-500"
                                                        }`}
                                                        onClick={() => setActiveTab(label)}
                                                    >
                                                        {`${label} ${count}`}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* 내용 */}
                                            <div className="flex-grow overflow-y-auto p-4">
                                                {activeTab === "참여자" ? (
                                                    <ul>
                                                        {sortedJoinMembers.map(([id, nickname], index) => (
                                                            <li key={id} className="p-2 border-b flex items-center w-full">
                                                                <span>{nickname}</span>
                                                                {index === 0 && <span className="text-yellow-500 ml-1">👑</span>}
                                                                {index !== 0 && (
                                                                    <div className="ml-auto flex space-x-4">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleConfirmDelegate(selectedMeeting?.chatRoomId ?? '', id);
                                                                            }}
                                                                            className="text-primary"
                                                                        >
                                                                            위임
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleConfirmKick(selectedMeeting?.chatRoomId ?? '', id);
                                                                            }}
                                                                            className="text-gray-500"
                                                                        >
                                                                            강퇴
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <ul>
                                                        {(selectedMeeting?.waitingMemberIdNickNameList?.length ?? 0) > 0 ? (
                                                            selectedMeeting?.waitingMemberIdNickNameList.map(([id, nickname]) => (
                                                                <li key={id} className="p-2 border-b flex items-center w-full">
                                                                    <span>{nickname}</span>
                                                                    <div className="ml-auto flex space-x-4">
                                                                        <button
                                                                            className="text-primary"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleApprove(selectedMeeting?.chatRoomId ?? '', id); // 승인 버튼 클릭 시 승인 처리
                                                                            }}
                                                                        >
                                                                            승인
                                                                        </button>
                                                                        <button
                                                                            className="text-gray-500"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleRefuse(selectedMeeting?.chatRoomId ?? '', id); // 거절 버튼 클릭 시 거절 처리
                                                                            }}
                                                                        >
                                                                            거절
                                                                        </button>
                                                                    </div>
                                                                </li>
                                                            ))
                                                        ) : (
                                                            <p className="text-center text-gray-500">대기자가 없습니다.</p>
                                                        )}
                                                    </ul>
                                                )}
                                            </div>

                                            {/* 닫기 버튼 */}
                                            <div className="text-right mt-4">
                                                <button className="px-4 py-2 text-primary rounded-lg" onClick={(e) => closeManagePopup(e)}>
                                                    닫기</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 수정하기 팝업 */}
                                {isEditPopupOpen && (
                                    <div className="fixed inset-0 bg-gray-500 bg-opacity-10 flex justify-center items-center z-20"
                                         onClick={(e) => e.stopPropagation()}>
                                        <div className="bg-white w-2/3 h-4/7 p-6 rounded-lg shadow-md flex flex-col">
                                            <h3 className="text-lg font-semibold mb-4">채팅방 수정</h3>

                                            <label className="block mb-2">
                                                제목
                                                <input
                                                    type="text"
                                                    name="title"
                                                    value={editRoomData.title}
                                                    onChange={handleChange}
                                                    maxLength={100}
                                                    className="w-full border p-2 rounded mt-1"
                                                />
                                            </label>

                                            <label className="block mb-2">
                                                내용
                                                <textarea
                                                    name="content"
                                                    value={editRoomData.content}
                                                    onChange={handleChange}
                                                    maxLength={500}
                                                    className="w-full border p-2 rounded mt-1 h-32"
                                                />
                                            </label>

                                            <label className="block mb-4">
                                                인원 제한
                                                <select
                                                    name="limit"
                                                    value={editRoomData.limit}
                                                    onChange={handleChange}
                                                    className="w-full border p-2 rounded mt-1 mb-2"
                                                >
                                                    {Array.from({ length: 10 }, (_, i) => (i + 1) * 10).map((num) => (
                                                        <option key={num} value={num}>{num}명</option>
                                                    ))}
                                                </select>
                                            </label>

                                            <div className="flex justify-end space-x-4">
                                                <button className="pl-4 py-2 text-primary" onClick={() => setIsEditPopupOpen(false)}>취소</button>
                                                <button className="pl-4 py-2 text-primary" onClick={() => handleSaveEdit(selectedMeeting?.chatRoomId ?? '')}>
                                                    저장
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 내용 */}
                                <p className="text-sm text-gray-500 mt-1 truncate max-w-full">{meeting.roomContent}</p>
                                <div className="flex justify-between text-xs text-gray-400 mt-2">
                                    {/* 생성 날짜 + 축제 이름 */}
                                    <div className="flex items-center">
                                        <p>{new Date(meeting.createDate).toISOString().slice(0, 10).replace(/-/g, ".")}</p>
                                        <p className="ml-2 text-xs text-gray-500">{meeting.festivalName}</p>
                                    </div>
                                    {/* 참여 인원 */}
                                    <div className="text-xs text-gray-500 whitespace-nowrap ml-auto">
                                        {meeting.joinMemberNum}/{meeting.roomMemberLimit}명
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {isLoading && <p className="text-center text-gray-500 mt-4">Loading...</p>}
            </div>

            {/* 나가기 최종확인 팝업창 */}
            {isConfirmLeaveOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-20">
                    <div className="bg-white p-6 rounded-lg shadow-md w-80">
                        <h3 className="text-lg font-semibold mb-8">정말 모임을 떠나시겠어요?</h3>
                        <div className="flex justify-end space-x-10">
                            <button
                                className=" text-primary rounded-lg"
                                onClick={cancelLeaveRoom}>
                                취소
                            </button>
                            <button
                                className="text-primary rounded-lg"
                                onClick={() => confirmLeaveRoom(isConfirmLeaveOpen)}>
                                나가기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 위임하기 최종확인 팝업창 */}
            {isConfirmDelegateOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-20">
                    <div className="bg-white p-6 rounded-lg shadow-md w-80">
                        <h3 className="text-lg font-semibold mb-8">
                            <span className="text-primary">{getNicknameById(selectedDelegateId)}</span>님에게 방장권한을 위임하시겠어요?
                        </h3>
                        <div className="flex justify-end space-x-10">
                            <button className="text-primary rounded-lg" onClick={cancelDelegate}>
                                취소
                            </button>
                            <button className="text-gray-500 rounded-lg" onClick={confirmDelegate}>
                                위임하기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 강퇴하기 최종확인 팝업창 */}
            {isConfirmKickOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-20">
                    <div className="bg-white p-6 rounded-lg shadow-md w-80">
                        <h3 className="text-lg font-semibold mb-8">
                            <span className="text-primary">{getNicknameById(kickTargetId)}</span>님을 강퇴하시겠어요?
                        </h3>
                        <div className="flex justify-end space-x-10">
                            <button className="text-primary rounded-lg" onClick={cancelKick}>
                                취소
                            </button>
                            <button className="text-gray-500 rounded-lg" onClick={confirmKick}>
                                강퇴하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Meeting