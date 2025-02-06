import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import SearchBar from '../components/SearchBar';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

// 게시글 데이터 타입 정의
interface Festival {
    festivalId: string;
    festivalName: string;
    festivalStartDate: string;
    festivalEndDate: string;
    festivalUrl: string;
    festivalArea: string;
}

// API 응답 전체 구조
interface FestivalApiResponse {
    content: Festival[];
    page: {
        totalPages: number;
        number: number; // 현재 페이지 (0부터 시작)
    };
}

// 사용할 장르 목록
const genres = [
    "축제",
    "뮤지컬",
    "연극",
    "서커스/마술",
    "대중음악",
    "한국음악(국악)",
    "서양음악(클래식)"
];

interface MeetingPost {
    chatRoomId: string;
    roomTitle: string;
    roomContent: string;
    festivalName: string;
    roomMemberLimit: string;
    joinMemberNum: string;
    createDate: string;
}

interface Member {
    joinRoomIdList: string[];
    waitRoomIdList: string[];
}

// API 응답 전체 구조
interface MeetingApiResponse {
    content: MeetingPost[];
}

const Main = () => {
    const [mainPosts, setMainPosts] = useState<Festival[]>([]);
    const [genrePosts, setGenrePosts] = useState<Festival[][]>([]);
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가
    const navigate = useNavigate(); // 👈 페이지 이동 함수
    const [searchPosts, setSearchPosts] = useState<Festival[]>([]);
    const [meetingPosts, setMeetingPosts] = useState<MeetingPost[]>([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentUser, setCurrentUser] = useState<Member | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (keyword: string) => {
        setSearchKeyword(keyword);
        // 검색 결과가 존재하면 isSearching 상태를 true로 설정
        setIsSearching(keyword.length > 0);
    };

    // 메인 배너 게시글 가져오기 (서울 기준)
    const fetchMainPosts = async () => {
        try {
            const response = await fetch(`http://localhost:8090/api/v1/posts/view?area=서울&count=5`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data: Festival[] = await response.json();
            console.log('Fetched main posts:', data);
            setMainPosts(data.slice(0, 5)); // 최대 5개 저장
        } catch (error) {
            console.error('Error fetching main festival data:', error);
        }
    };

    // 장르별 게시글 가져오기
    const fetchGenrePosts = async () => {
        const newGenrePosts: Festival[][] = [];
        await Promise.all(
            genres.map(async (genre, index) => {
                try {
                    const response = await fetch(`http://localhost:8090/api/v1/posts/select?genre=${encodeURIComponent(genre)}&page=0&size=10`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    const data = await response.json();
                    console.log(`Fetched posts for ${genre}:`, data);

                    newGenrePosts[index] = data.content.slice(0, 10); // 최대 10개 저장
                } catch (error) {
                    console.error(`Error fetching ${genre} data:`, error);
                    newGenrePosts[index] = []; // 에러 발생 시 빈 배열 설정
                }
            })
        );

        setGenrePosts(newGenrePosts);
        setIsLoading(false); // 데이터 로딩 완료 후 로딩 상태 변경
    };

    // 축제 데이터 가져오기 (페이지 스크롤링 기준 요청)
    const fetchFestivalPosts = async (keyword = "") => {
        setIsLoading(true);
        try {
            const url = import.meta.env.VITE_CORE_API_BASE_URL + `/api/v1/posts/search?keyword=${encodeURIComponent(keyword)}&page=0&size=9`

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data: FestivalApiResponse = await response.json();
            console.log("Fetched Festival Posts:", data); // 👈 여기에서 콘솔 확인

            setSearchPosts(data.content);
        } catch (error) {
            console.error("Error fetching festival posts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 모임 데이터 가져오기
    const fetchMeetingPosts = async (keyword = "") => {
        setIsLoading(true);
        try {
            const url = keyword
                ? import.meta.env.VITE_CORE_API_BASE_URL + `/api/v1/posts/chat-rooms/search?keyword=${encodeURIComponent(keyword)}&page=$0&size=10`
                : import.meta.env.VITE_CORE_API_BASE_URL + `/api/v1/posts/chat-rooms?page=0&size=10`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data: MeetingApiResponse = await response.json();

            setMeetingPosts(data.content);
        } catch (error) {
            console.error("Error fetching meeting posts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 검색어 변경 시 자동 검색 (디바운스 적용)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchFestivalPosts(searchKeyword);
            fetchMeetingPosts(searchKeyword);
        }, 100);

        return () => clearTimeout(delayDebounceFn);
    }, [searchKeyword]);

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

    useEffect(() => {
        fetchMainPosts();
        fetchGenrePosts();
        fetchUserInfo();
    }, []);

    return (
        <div className="flex flex-col">
            {/* 검색창 */}
            <SearchBar placeholder="축제, 공연, 모임을 검색해보세요" onChange={handleSearch} />
            <div className="px-4 mb-6 mt-20">
                {/* 로딩 중 표시 */}
                {isLoading ? (
                    <div className="text-center text-gray-500 mt-4">Loading...</div>
                ) : (
                    <>
                        {/* 메인 배너 & 장르별 배너 (검색 중이 아닐 때만 표시) */}
                        {!isSearching && (
                            <>
                                {/* 메인 배너 */}
                                <Swiper
                                    modules={[Pagination, Autoplay]}
                                    pagination={{ clickable: true }}
                                    autoplay={{ delay: 3000 }}
                                    loop={true}
                                    className="w-full mx-auto mt-3"
                                    onInit={(swiper) => swiper.update()}
                                >
                                    {mainPosts.map((mainPost) => (
                                        <SwiperSlide key={mainPost.festivalId} className="flex justify-center items-center">
                                            <div className="w-full max-w-4xl bg-white rounded-lg shadow-md overflow-hidden">
                                                <div className="relative w-full h-[300px] bg-gray-100 flex justify-center items-center">
                                                    <img
                                                        src={mainPost.festivalUrl}
                                                        alt={mainPost.festivalName}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>

                                {/* 장르별 배너 섹션 */}
                                {genres.map((genre, index) => (
                                    <div key={genre} className="mt-4 lg:mt-12">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-lg font-bold">{genre}</h2>
                                            <button
                                                className="text-sm text-primary"
                                                onClick={() => navigate(`/posts?genre=${encodeURIComponent(genre)}`)}
                                            >
                                                더보기
                                            </button>
                                        </div>
                                        <Swiper slidesPerView={3} spaceBetween={12} className="w-full pb-1">
                                            {genrePosts[index]?.map((genrePost) => (
                                                <SwiperSlide key={genrePost.festivalId}>
                                                    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                                                        {/* 이미지 영역 */}
                                                        <div className="relative pb-[90%]">
                                                            <img
                                                                src={genrePost.festivalUrl || "https://via.placeholder.com/150"}
                                                                alt={genrePost.festivalName}
                                                                className="absolute inset-0 w-full h-full object-cover bg-gray-200"
                                                            />
                                                        </div>
                                                        {/* 텍스트 영역 */}
                                                        <div className="p-2">
                                                            <h3 className="text-sm font-medium leading-tight line-clamp-2">{genrePost.festivalName}</h3>
                                                            <p className="text-xs text-gray-500 mt-1 mb-[-10px]">{genrePost.festivalArea}</p>
                                                        </div>
                                                        {/* 날짜 영역을 카드 하단에 고정 */}
                                                        <div className="p-2 text-xs text-gray-500 bg-white mt-auto">
                                                            <p>
                                                                {genrePost.festivalStartDate?.replace(/-/g, '.')} - {genrePost.festivalEndDate?.replace(/-/g, '.')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>
                                ))}
                            </>
                        )}
                    </>
                )}
            </div>

            {/* 축제/공연 검색 섹션 */}
            {isSearching && (
                <>
            <div className="p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">축제/공연</h2>
                    <button
                        className="text-sm text-primary"
                        onClick={() => navigate(`/posts`)}
                    >
                        더보기
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {searchPosts.map((searchPost) => (
                        <div key={searchPost.festivalId} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                            {/* 이미지 영역 */}
                            <div className="relative pb-[90%]">
                                <img
                                    src={searchPost.festivalUrl || "https://via.placeholder.com/150"}
                                    alt={searchPost.festivalName}
                                    className="absolute inset-0 w-full h-full object-cover bg-gray-200"
                                />
                            </div>
                            {/* 텍스트 영역 */}
                            <div className="p-2">
                                <h3 className="text-sm font-medium leading-tight line-clamp-2">{searchPost.festivalName}</h3>
                                <p className="text-xs text-gray-500 mt-1 mb-[-10px]">{searchPost.festivalArea}</p>
                            </div>
                            {/* 날짜 영역을 카드 하단에 고정 */}
                            <div className="p-2 text-xs text-gray-500 bg-white mt-auto">
                                <p>
                                    {searchPost.festivalStartDate?.replace(/-/g, '.')} - {searchPost.festivalEndDate?.replace(/-/g, '.')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                {isLoading && <p className="text-center text-gray-500 mt-4">Loading...</p>}
            </div>
            </>
            )}

            {/* 모임 채팅방 섹션 */}
            <div className="p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">모임</h2>
                    <button
                        className="text-sm text-primary"
                        onClick={() => navigate(`/chatroom`)}
                    >
                        더보기
                    </button>
                </div>
                <div className="space-y-3">
                    {meetingPosts.map((meeting) => {
                        // Check if the currentUserId is in the current user's wait room list
                        const isUserWaiting = isUserInWaitRoom(meeting.chatRoomId);
                        const isUserJoined = isUserInJoinRoom(meeting.chatRoomId);

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
                                    {isUserJoined ? (<span className="text-primary text-xs">●</span>
                                    ) : (
                                        <button
                                            className={`text-sm font-medium px-3 py-1 rounded-md ${
                                                isUserWaiting ? "text-gray-500 border-gray-400" : "text-primary border-primary"
                                            }`}
                                            onClick={(e) => {
                                                e.stopPropagation(); // 클릭 시 채팅방 이동 방지
                                                handleJoinClick(meeting.chatRoomId, isUserWaiting);
                                            }}                                        >
                                            {isUserWaiting ? "취소" : "참여하기"}
                                        </button>
                                    )}
                                </div>
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
        </div>
    );
};

export default Main;
