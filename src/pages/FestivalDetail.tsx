import {useEffect, useState} from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import send from "../assets/images/send.png"
import dots from '../assets/images/three-dots.png';

interface FestivalDetail {
    festivalId: string;
    festivalName: string;
    festivalStartDate: string;
    festivalEndDate: string;
    festivalArea: string;
    festivalHallName: string;
    festivalUrl: string;
    genrenm: string;
}

interface Member {
    id: string;
    joinRoomIdList: string[];
    waitRoomIdList: string[];
}

interface Comment {
    commentId: number;
    memberId: number;
    memberNickname: string;
    content: string;
    createTime: string;
    superCommentId: number | null;
}

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

// API 응답 전체 구조
interface MeetingApiResponse {
    content: MeetingPost[];
    page: {
        totalPages: number;
        number: number; // 현재 페이지 (0부터 시작)
    };
}

export default function FestivalDetail() {
    const [searchParams] = useSearchParams();
    const selectedId = searchParams.get("id") || "";
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<Member | null>(null);
    const [post, setPost] = useState<FestivalDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [showAll, setShowAll] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [expandedComments, setExpandedComments] = useState<{ [key: number]: boolean }>({});
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [selectedComment, setSelectedComment] = useState<number | null>(null);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
    const [meetingPosts, setMeetingPosts] = useState<MeetingPost[]>([]);
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
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
    const [newRoomData, setNewRoomData] = useState({title: "", content: "", limit: 10,});

    const handleTogglePopup = (chatRoomId: string) => {
        setOpenPopupId(openPopupId === chatRoomId ? null : chatRoomId);
    };

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

    // Festival 상세 데이터 가져오는 함수
    const fetchPost = async () => {
        try {
            setIsLoading(true); // 로딩 시작
            const url = import.meta.env.VITE_CORE_API_BASE_URL + `/api/v1/posts/detail/${encodeURIComponent(selectedId)}`
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data: FestivalDetail = await response.json();
            console.log('Fetched main posts:', data);
            setPost(data);
        } catch (err) {
            console.error("Error fetching festival data:", err);
            setError("데이터를 불러오는 데 실패했습니다.");
        } finally {
            setIsLoading(false); // 로딩 종료
        }
    };

    // 댓글 데이터 가져오는 함수
    const fetchComments = async () => {
        try {
            const url = import.meta.env.VITE_CORE_API_BASE_URL + `/api/v1/posts/comments/${encodeURIComponent(selectedId)}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error("댓글 데이터를 불러오지 못했습니다.");
            const data: Comment[] = await response.json();
            setComments(data);
        } catch (err) {
            console.error("Error fetching comments:", err);
        }
    };

    // 댓글생성 함수
    const handleAddComment = async (superCommentId: number | null = null) => {
        if (!newComment.trim()) return alert("댓글을 입력해주세요!");
        try {
            const url = import.meta.env.VITE_CORE_API_BASE_URL + `/api/v1/posts/comments/${encodeURIComponent(selectedId)}`;

            const response = await fetch(url, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: newComment, // 댓글 내용
                    superCommentId, // 대댓글이면 부모 ID, 아니면 null
                }),
            });
            if (!response.ok) throw new Error("댓글 등록 실패");
            setNewComment(""); // 입력 필드 초기화
            setReplyingTo(null); // 답글 상태 초기화
            fetchComments(); // 댓글 목록 새로고침
        } catch (err) {
            console.error("Error posting comment:", err);
            alert("댓글을 등록하는 데 실패했습니다.");
        }
    };

    // 댓글생성 경과시간 표시 함수
    const formatElapsedTime = (createTime: string | number | Date) => {
        const createdAt = new Date(createTime).getTime();
        const now = Date.now();
        const diffMs = now - createdAt;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffWeeks = Math.floor(diffDays / 7);

        if (diffMinutes < 60) {
            return `${diffMinutes}분`;
        } else if (diffHours < 24) {
            return `${diffHours}시간`;
        } else if (diffDays < 7) {
            return `${diffDays}일`;
        } else {
            return `${diffWeeks}주`;
        }
    };

    // 답글 토글 함수
    const handleToggleReplies = (commentId: number) => {
        setExpandedComments(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };

    // 댓글 수정/삭제 메뉴
    const toggleOptions = (commentId: number) => {
        setSelectedComment(selectedComment === commentId ? null : commentId);
    };

    // 댓글 수정 함수
    const handleEditComment = async (commentId: number) => {
        if (!newComment.trim()) return alert("댓글을 입력해주세요!");

        try {
            const url = import.meta.env.VITE_CORE_API_BASE_URL + `/api/v1/posts/update-comment/${commentId}`;

            const response = await fetch(url, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: newComment, // 수정된 댓글 내용
                }),
            });

            if (!response.ok) throw new Error("댓글 수정 실패");

            // ✅ 상태 초기화 후 UI 업데이트
            setNewComment("");
            setEditingCommentId(null);
            fetchComments();
        } catch (err) {
            console.error("Error updating comment:", err);
            alert("댓글을 수정하는 데 실패했습니다.");
        }
    };

    // 댓글 삭제 함수
    const handleConfirmDelete = async () => {
        if (!commentToDelete) return;

        try {
            const url = import.meta.env.VITE_CORE_API_BASE_URL + `/api/v1/posts/delete-comment/${commentToDelete}`;

            const response = await fetch(url, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            if (!response.ok) throw new Error("댓글 삭제 실패");

            setSelectedComment(null);
            fetchComments();
        } catch (err) {
            console.error("Error deleting comment:", err);
            alert("댓글을 삭제하는 데 실패했습니다.");
        } finally {
            closeDeleteConfirm();
        }
    };

    // 최종 삭제하기 폼 띄우기
    const openDeleteConfirm = (commentId: number) => {
        setCommentToDelete(commentId);
        setIsConfirmDeleteOpen(true);
    };

    // 최종 삭제하기 폼 닫기
    const closeDeleteConfirm = () => {
        setIsConfirmDeleteOpen(false);
        setCommentToDelete(null);
    };

    // 모임 데이터 가져오기 (무한 스크롤)
    const fetchMeetingPosts = async (pageNumber: number) => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const url = `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/chat-rooms/${encodeURIComponent(selectedId)}?page=${pageNumber}&size=10`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data: MeetingApiResponse = await response.json();
            console.log("📊 API 응답 데이터:", data);

            setMeetingPosts(data.content); // 새로운 페이지의 데이터로 업데이트
            setTotalPages(data.page.totalPages);
            setCurrentPage(data.page.number);
        } catch (error) {
            console.error("❌ fetchMeetingPosts 오류 발생:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 페이지 변경 이벤트 핸들러
    const handlePageChange = (pageNumber: number) => {
        if (pageNumber !== currentPage) {
            fetchMeetingPosts(pageNumber);
        }
    };

    // 컴포넌트 마운트 시 첫 페이지 데이터 불러오기
    useEffect(() => {
        fetchMeetingPosts(0);
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
    const edithandleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
                await fetchUserInfo();
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

    // 모임 생성하기 메서드
    const handleCreateMeeting = async () => {
        const requestBody = {
            roomTitle: newRoomData.title,
            roomContent: newRoomData.content,
            roomMemberLimit: Number(newRoomData.limit),
        };

        console.log("🔍 요청 데이터:", JSON.stringify(requestBody, null, 2));
        console.log("📌 요청 URL:", `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/chat-rooms/${encodeURIComponent(selectedId)}`);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/chat-rooms/${encodeURIComponent(selectedId)}`,
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
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            console.log("✅ 모임 생성 성공");
            setIsCreatePopupOpen(false); // 팝업 닫기
            setNewRoomData({ title: "", content: "", limit: 10 }); // 폼 초기화
            fetchUserInfo();
            fetchMeetingPosts(0); // 리스트 갱신
        } catch (error) {
            console.error("❌ 모임 생성 실패:", error);
            alert("모임 생성에 실패했습니다.");
        }
    };

    // 생성 폼 입력값 변경 핸들러
    const createhandleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewRoomData((prev) => ({
            ...prev,
            [name]: name === "limit" ? Number(value) : value,
        }));
    };

    useEffect(() => {
        if (selectedId) {
            fetchPost();
            fetchComments();
            fetchUserInfo();
        }
    }, [selectedId]);

    if (isLoading) return <div className="text-center text-gray-500 mt-10">Loading...</div>;
    if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
    if (!post) return <div className="text-center text-gray-500 mt-10">게시글이 존재하지 않습니다.</div>;

    return (
        <div className="w-full pt-20 p-4">
            {/* 뒤로 가기 버튼 */}
            <button onClick={() => navigate(-1)} className="mb-4 text-gray-500 hover:text-primary text-base flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                뒤로가기
            </button>

            {/* 상세 카드 섹션 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-7">
                {/* 이미지 영역 */}
                <div className="relative w-full h-[500px] bg-gray-100 flex justify-center items-center">
                    <img
                        src={post.festivalUrl || "https://via.placeholder.com/500"}
                        alt={post.festivalName}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* 상세 정보 섹션 */}
                <div className="p-6">
                    <h1 className="text-2xl font-bold">{post.festivalName}</h1>
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-gray-600">{post.festivalArea}</p>
                        {post.genrenm !== "축제" && <p className="text-gray-700">{post.festivalHallName}</p>}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        {/* 날짜 */}
                        <p className="text-sm text-gray-500">
                            {post.festivalStartDate.replace(/-/g, ".")} - {post.festivalEndDate.replace(/-/g, ".")}
                        </p>
                    </div>
                </div>

                {/* 댓글 섹션 */}
                <div className="border-t px-6 py-7">
                    {comments.length > 0 ? (
                        <>
                            <div
                                className="flex items-center space-x-2 mb-5"
                                onClick={() => {
                                    setShowAll(!showAll);
                                    setExpandedComments({}); // ✅ 댓글 목록을 접을 때 답글도 모두 접기
                                }}
                            >
                                <h2 className="text-base font-semibold">댓글</h2>
                                <span className="text-gray-600 text-base">{comments.length}</span>
                            </div>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                {/* ✅ 최상위 댓글만 표시 */}
                                {(showAll ? comments : comments.slice(0, 1))
                                    .filter(comment => comment.superCommentId === null) // ✅ 최상위 댓글만 필터링
                                    .map((comment) => {
                                        const replies = comments.filter(c => c.superCommentId === comment.commentId);
                                        const isAuthor = String(comment.memberId) === String(currentUser?.id);
                                        return (
                                            <div key={comment.commentId} className="rounded-lg mb-6">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <p className="text-xs font-semibold">{comment.memberNickname}</p>
                                                    <p className="text-xs text-gray-500">{formatElapsedTime(comment.createTime)}</p>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-sm text-gray-800">{comment.content}</p>

                                                    {isAuthor && (
                                                        <div className="relative">
                                                            <button onClick={() => toggleOptions(comment.commentId)}>
                                                                <img src={dots} alt="옵션" className="h-8 mt-[5px] mr-[-6px] cursor-pointer" />
                                                            </button>
                                                            {selectedComment === comment.commentId && (
                                                                <div className="absolute right-5 bg-white shadow-md rounded-lg border border-gray-200 w-20 text-sm z-10">
                                                                    <button
                                                                        className="w-full text-left px-3 py-2 hover:bg-gray-100"
                                                                        onClick={() => {
                                                                            setEditingCommentId(comment.commentId);
                                                                            setNewComment(comment.content); // 기존 댓글 내용 입력 필드에 채우기
                                                                            setReplyingTo(null); // 답글 작성 상태 해제
                                                                            setSelectedComment(null); // ✅ 메뉴 닫기
                                                                        }}
                                                                    >
                                                                        수정하기
                                                                    </button>
                                                                    <button className="w-full text-left px-3 py-2 hover:bg-gray-100 text-primary"
                                                                            onClick={() => {
                                                                                openDeleteConfirm(comment.commentId);
                                                                                setSelectedComment(null);
                                                                            }}>
                                                                        삭제하기
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1 mb-5">
                                                    {replies.length > 0 && (
                                                        <button onClick={() => handleToggleReplies(comment.commentId)}>
                                                            {expandedComments[comment.commentId] ? "답글 숨기기" : `답글 ${replies.length}개`}
                                                        </button>
                                                    )}
                                                    {replyingTo === comment.commentId ? (
                                                        <button onClick={() => setReplyingTo(null)}>취소</button>
                                                    ) : (
                                                        <button onClick={() => setReplyingTo(comment.commentId)}>답글 달기</button>
                                                    )}
                                                </div>

                                                {/* 답글 목록 (오직 해당 상위 댓글의 내부에서만 표시) */}
                                                {expandedComments[comment.commentId] && replies.length > 0 && (
                                                    <div className="ml-4 my-5 border-l pl-4 space-y-4">
                                                        {replies.map(reply => {
                                                            const isReplyAuthor = String(reply.memberId) === String(currentUser?.id);
                                                            return (
                                                                <div key={reply.commentId} className="mb-2">
                                                                    <div className="flex items-center space-x-2 mb-2">
                                                                        <p className="text-xs font-semibold">{reply.memberNickname}</p>
                                                                        <p className="text-xs text-gray-500">{formatElapsedTime(reply.createTime)}</p>
                                                                    </div>
                                                                    <div className="flex justify-between items-center">
                                                                        <p className="text-sm text-gray-700">{reply.content}</p>

                                                                        {isReplyAuthor && (
                                                                            <div className="relative">
                                                                                <button onClick={() => toggleOptions(reply.commentId)}>
                                                                                    <img src={dots} alt="옵션" className="h-8 mt-[5px] mr-[-6px] cursor-pointer" />
                                                                                </button>
                                                                                {selectedComment === reply.commentId && (
                                                                                    <div className="absolute right-5 bg-white shadow-md rounded-lg border border-gray-200 w-20 text-sm z-10">
                                                                                        <button
                                                                                            className="w-full text-left px-3 py-2 hover:bg-gray-100"
                                                                                            onClick={() => {
                                                                                                setEditingCommentId(reply.commentId);
                                                                                                setNewComment(reply.content); // 기존 댓글 내용 입력 필드에 채우기
                                                                                                setReplyingTo(null); // 답글 작성 상태 해제
                                                                                                setSelectedComment(null); // ✅ 메뉴 닫기
                                                                                            }}
                                                                                        >
                                                                                            수정하기
                                                                                        </button>
                                                                                        <button className="w-full text-left px-3 py-2 hover:bg-gray-100 text-primary"
                                                                                                onClick={() => {
                                                                                                    openDeleteConfirm(reply.commentId);
                                                                                                    setSelectedComment(null);
                                                                                                }}>
                                                                                            삭제하기
                                                                                        </button>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        </>
                    ) : (
                        <h2 className="text-lg font-semibold mb-4">댓글</h2>
                    )}

                    {/* ✅ 맨 아래 입력 필드에서 일반 댓글/답글 입력 */}
                    <div className="flex items-center space-x-2 mt-1"
                         onClick={(e) => {
                             e.stopPropagation();
                             if (currentUserID == "") {
                                 alert("로그인이 필요합니다.");
                                 return;
                             }
                         }}>
                        <input
                            type="text"
                            placeholder={editingCommentId ? "댓글 수정 중..." : replyingTo ? "답글 추가..." : "댓글 추가..."}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            maxLength={500}
                            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                            onClick={() => editingCommentId ? handleEditComment(editingCommentId) : handleAddComment(replyingTo)}
                            style={{
                                padding: '8px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <img
                                src={send}
                                alt="전송"
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    filter: newComment.trim()
                                        ? 'invert(47%) sepia(82%) saturate(2604%) hue-rotate(337deg) brightness(97%) contrast(92%)'
                                        : 'opacity(0.5)'
                                }}
                            />
                        </button>
                        {editingCommentId && (
                            <button
                                className="text-gray-500 text-sm"
                                onClick={() => {
                                    setEditingCommentId(null);
                                    setNewComment("");
                                }}
                            >
                                취소
                            </button>
                        )}
                    </div>

                    {/* 삭제하기 최종확인 팝업창 */}
                    {isConfirmDeleteOpen && (
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-20">
                            <div className="bg-white p-6 rounded-lg shadow-md w-80">
                                <h3 className="text-lg font-semibold mb-8">정말 댓글을 삭제하시겠어요?</h3>
                                <div className="flex justify-end space-x-10">
                                    <button className="text-primary rounded-lg" onClick={closeDeleteConfirm}>
                                        취소
                                    </button>
                                    <button className="text-primary rounded-lg" onClick={handleConfirmDelete}>
                                        삭제하기
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 모임 채팅방 섹션 */}
            <div className="p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">모임</h2>
                    <div className="flex items-center space-x-7">
                        <button
                            className="text-sm text-primary" onClick={() => setIsCreatePopupOpen(true)}
                        >
                            + 추가하기
                        </button>
                        <button
                            className="text-sm text-primary"
                            onClick={() => navigate(`/chatroom`)}
                        >
                            더보기
                        </button>
                    </div>
                </div>
                <div className="space-y-3">
                    {meetingPosts.map((meeting) => {
                        const isUserWaiting = isUserInWaitRoom(meeting.chatRoomId);
                        const isUserJoined = isUserInJoinRoom(meeting.chatRoomId);
                        const isRoomOwner = meeting.memberId === currentUser?.id;

                        return (
                            <div
                                key={meeting.chatRoomId}
                                className="bg-white rounded-lg shadow-md p-4 border border-gray-100 cursor-pointer relative"
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
                                                    if (currentUserID == "") {
                                                        alert("로그인이 필요합니다.");
                                                        return;
                                                    }
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
                                        className="absolute right-5 bg-white shadow-md rounded-lg border border-gray-200 w-20 text-sm z-10"
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
                                                    onChange={edithandleChange}
                                                    maxLength={100}
                                                    className="w-full border p-2 rounded mt-1"
                                                />
                                            </label>

                                            <label className="block mb-2">
                                                내용
                                                <textarea
                                                    name="content"
                                                    value={editRoomData.content}
                                                    onChange={edithandleChange}
                                                    maxLength={500}
                                                    className="w-full border p-2 rounded mt-1 h-32"
                                                />
                                            </label>

                                            <label className="block mb-4">
                                                인원 제한
                                                <select
                                                    name="limit"
                                                    value={editRoomData.limit}
                                                    onChange={edithandleChange}
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
            </div>

            {/* 페이지네이션 UI */}
            <div className="flex justify-center mt-[-5px] mb-10">
                <div
                    className="flex space-x-2 overflow-x-auto"
                    style={{ maxWidth: '300px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index}
                            className={`px-3 py-1 border rounded-md ${
                                index === currentPage ? 'bg-primary text-white' : 'bg-white text-gray-700'
                            }`}
                            onClick={() => handlePageChange(index)}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
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

            {/* ✅ 모임 생성 팝업 */}
            {isCreatePopupOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-10 flex justify-center items-center z-20"
                     onClick={(e) => e.stopPropagation()}>
                    <div className="bg-white w-2/3 h-4/7 p-6 rounded-lg shadow-md flex flex-col">
                        <h3 className="text-lg font-semibold mb-4">모임 생성</h3>

                        <label className="block mb-2">
                            제목
                            <input
                                type="text"
                                name="title"
                                value={newRoomData.title}
                                onChange={createhandleChange}
                                maxLength={100}
                                className="w-full border p-2 rounded mt-1"
                            />
                        </label>

                        <label className="block mb-2">
                            내용
                            <textarea
                                name="content"
                                value={newRoomData.content}
                                onChange={createhandleChange}
                                maxLength={500}
                                className="w-full border p-2 rounded mt-1 h-32"
                            />
                        </label>

                        <label className="block mb-4">
                            인원 제한
                            <select
                                name="limit"
                                value={newRoomData.limit}
                                onChange={createhandleChange}
                                className="w-full border p-2 rounded mt-1 mb-2"
                            >
                                {Array.from({ length: 10 }, (_, i) => (i + 1) * 10).map((num) => (
                                    <option key={num} value={num}>{num}명</option>
                                ))}
                            </select>
                        </label>

                        <div className="flex justify-end space-x-4">
                            <button className="pl-4 py-2 text-primary" onClick={() => setIsCreatePopupOpen(false)}>취소</button>
                            <button className="pl-4 py-2 text-primary" onClick={handleCreateMeeting}>
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
