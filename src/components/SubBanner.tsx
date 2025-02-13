import { Swiper, SwiperSlide } from 'swiper/react';
import { useNavigate } from "react-router-dom";

interface Festival {
    festivalId: string;
    festivalName: string;
    festivalUrl: string;
    festivalArea: string;
    festivalStartDate: string;
    festivalEndDate: string;
}

interface EventBannerProps {
    title: string;
    posts: Festival[];
}

const SubBanner = ({ title, posts }: EventBannerProps) => {
    const navigate = useNavigate();

    return (
        <div className="mt-4 lg:mt-12">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">{title}</h2>
            </div>
            <Swiper slidesPerView={3} spaceBetween={12} className="w-full pb-1">
                {posts?.map((post) => (
                    <SwiperSlide
                        key={post.festivalId}
                        onClick={() => navigate(`/detailposts?id=${encodeURIComponent(post.festivalId)}`)}
                    >
                        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                            <div className="relative pb-[90%]">
                                <img
                                    src={post.festivalUrl || "https://via.placeholder.com/150"}
                                    alt={post.festivalName}
                                    className="absolute inset-0 w-full h-full object-cover bg-gray-200"
                                />
                            </div>
                            <div className="p-2">
                                <h3 className="text-sm font-medium leading-tight truncate">
                                    {post.festivalName}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 mb-[-10px] truncate">
                                    {post.festivalArea}
                                </p>
                            </div>
                            <div className="p-2 text-xs text-gray-500 bg-white mt-auto">
                                <p>
                                    {post.festivalStartDate?.replace(/-/g, '.')} - {post.festivalEndDate?.replace(/-/g, '.')}
                                </p>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default SubBanner;