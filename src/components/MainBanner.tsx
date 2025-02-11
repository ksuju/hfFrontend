import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import { useNavigate } from "react-router-dom";
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface Festival {
    festivalId: string;
    festivalName: string;
    festivalUrl: string;
}

interface MainBannerProps {
    mainPosts: Festival[];
}

const MainBanner = ({ mainPosts }: MainBannerProps) => {
    const navigate = useNavigate();

    return (
        <div className="relative">
            <Swiper
                modules={[Pagination, Autoplay, Navigation]}
                pagination={{ clickable: true }}
                navigation={true}
                autoplay={{ delay: 3000 }}
                loop={true}
                className="w-full mx-auto mt-3"
                onInit={(swiper) => swiper.update()}
            >
                {mainPosts.map((mainPost) => (
                    <SwiperSlide
                        key={mainPost.festivalId}
                        className="flex justify-center items-center"
                        onClick={() => navigate(`/detailposts?id=${encodeURIComponent(mainPost.festivalId)}`)}
                    >
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

            <style>
                {`
                    .swiper-button-prev,
                    .swiper-button-next {
                        color: #666;
                        transition: all 0.3s ease;
                        width: 40px;
                        height: 40px;
                        background-color: rgba(255, 255, 255, 0.8);
                        border-radius: 50%;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    }

                    .swiper-button-prev:hover,
                    .swiper-button-next:hover {
                        color: #F26A2E;
                        background-color: rgba(255, 255, 255, 0.95);
                        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                    }

                    .swiper-button-prev,
                    .swiper-button-next {
                        opacity: 1 !important;
                    }

                    .swiper-button-prev:after,
                    .swiper-button-next:after {
                        font-size: 18px;
                        font-weight: bold;
                    }

                    .swiper-button-prev {
                        left: 10px;
                    }

                    .swiper-button-next {
                        right: 10px;
                    }

                    .swiper-pagination-bullet-active {
                        background-color: #F26A2E !important;
                    }
                `}
            </style>
        </div>
    );
};

export default MainBanner; 