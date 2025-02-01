import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import SearchBar from '../components/SearchBar';
import { useEffect, useState } from 'react';

// 게시글 데이터 타입 정의
interface Festival {
    festivalId: string;
    festivalUrl: string;
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
    const [genrePosts, setGenrePosts] = useState<{ [key: string]: Festival[] }>({});

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
        const newGenrePosts: { [key: string]: Festival[] } = {};

        await Promise.all(
            genres.map(async (genre) => {
                try {
                    const response = await fetch(`http://localhost:8090/api/v1/posts/select?genre=${encodeURIComponent(genre)}&count=10`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    const data: Festival[] = await response.json();
                    console.log(`Fetched posts for ${genre}:`, data);
                    newGenrePosts[genre] = data.slice(0, 10); // 최대 10개 저장
                } catch (error) {
                    console.error(`Error fetching ${genre} data:`, error);
                    newGenrePosts[genre] = []; // 에러 발생 시 빈 배열 설정
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
            <SearchBar placeholder="축제, 공연, 모임을 검색해보세요" onSearch={() => {}} />

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
                        <SwiperSlide key={mainPost.festivalId} className="flex flex-col items-center">
                            <div className="relative w-full">
                                <img
                                    src={mainPost.festivalUrl}
                                    className="w-full h-full object-contain"
                                    style={{ aspectRatio: "3 / 2" }}
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* 장르별 배너 섹션 */}
                {genres.map((genre) => (
                    <div key={genre} className="mt-8 lg:mt-12">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">{genre}</h2>
                            <button className="text-sm text-primary">더보기</button>
                        </div>
                        <Swiper slidesPerView={3} spaceBetween={12} className="w-full">
                            {genrePosts[genre]?.map((genrePost) => (
                                <SwiperSlide key={genrePost.festivalId}>
                                    <div className="w-full aspect-[4/5] bg-gray-200 rounded-lg">
                                        <img
                                            src={genrePost.festivalUrl}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
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
