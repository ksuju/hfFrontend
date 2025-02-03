import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import SearchBar from '../components/SearchBar';
import { useEffect, useState } from 'react';
import {useNavigate} from "react-router-dom";

// 게시글 데이터 타입 정의
interface Festival {
    festivalId: string;
    festivalName: string;
    festivalStartDate: string;
    festivalEndDate: string;
    festivalUrl: string;
    festivalArea: string;
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

const Main = () => {
    const [mainPosts, setMainPosts] = useState<Festival[]>([]);
    const [genrePosts, setGenrePosts] = useState<Festival[] []>([]);
    const navigate = useNavigate(); // 👈 페이지 이동 함수


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
    };

    useEffect(() => {
        fetchMainPosts();
        fetchGenrePosts();
    }, []);

    return (
        <div className="flex flex-col">
            {/* 검색창 */}
            <SearchBar placeholder="축제, 공연, 모임을 검색해보세요" onChange={() => {}} />
            <div className="px-4 my-20">
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
                            <button className="text-sm text-primary"
                                    onClick={() => navigate(`/posts?genre=${encodeURIComponent(genre)}`)}
                            >더보기</button>
                        </div>
                        <Swiper slidesPerView={3} spaceBetween={12} className="w-full pb-1" >
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
            </div>
        </div>
    );
};

export default Main;
