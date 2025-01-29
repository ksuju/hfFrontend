// Main.tsx
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import SearchBar from '../components/SearchBar'
import {useEffect, useState} from "react";

interface Festival {
    festivalId: string;
    festivalName: string;
    festivalUrl: string;
}

const Main = () => {
    const [festivals, setFestivals] = useState<Festival[]>([])

    // 키워드로 개시글 검색하기
    const handleSearch = async (/*keyword: string*/) => {
    try {
        // const response = await fetch('http://localhost:8090/api/v1/search?keyword=${encodeURIComponent(keyword)}');
        // const data = await response.json();
        } catch (error) {
        console.error('검색 중 오류 발생:', error);
        }
    };

    // 메인 배너에 서울 기준으로 게시글 가져오기
    const fetchFestivals = async () => {
        try {
            const response = await fetch(`http://localhost:8090/api/v1/posts/view?area=서울특별시`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data: Festival[] = await response.json();
            console.log('Fetched data:', data);
            setFestivals(data.slice(0, 5)); // Save the top 5 posts
        } catch (error) {
            console.error('Error fetching festival data:', error);
        }
    };

    useEffect(() => {
        fetchFestivals();
    }, []);

    return (
        <div className="flex flex-col">
            <SearchBar
                placeholder="축제, 공연, 모임을 검색해보세요"
                onSearch={handleSearch}
            />
            <div className="px-4 my-20">
                {/* 메인 배너 */}
                <Swiper
                    modules={[Pagination, Autoplay]}
                    pagination={{ clickable: true}}
                    autoplay={{ delay: 3000 }}
                    loop={true}
                    className="w-full  mx-auto mt-3"
                    onInit={(swiper) => swiper.update()}
                >
                    {festivals.map((festival) => (
                        <SwiperSlide key={festival.festivalId} className="flex flex-col items-center">
                            <div className="relative w-full">
                                <img
                                    src={festival.festivalUrl}
                                    className="w-full h-full object-contain"
                                    style={{ aspectRatio: "3 / 2" }}
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* 중간 배너 섹션 */}
                {[1, 2].map((section) => (
                    <div key={section} className="mt-8 lg:mt-12">
                        <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">섹션 {section}</h2>
                        <button className="text-sm text-primary">더보기</button>
                    </div>
                    <Swiper
                        slidesPerView={2.5}
                        spaceBetween={12}
                        className="w-full"
                    >
                    {[1, 2, 3, 4, 5].map((item) => (
                        <SwiperSlide key={item}>
                            <div className="w-full aspect-[4/5] bg-gray-200 rounded-lg">
                                카드 {item}
                            </div>
                        </SwiperSlide>
                    ))}
                    </Swiper>
                </div>
                ))}
            </div>
        </div>
    )
}

export default Main
