import { useState } from 'react';

interface PostDto {
  festivalId: string;
  festivalName: string;
  festivalStartDate: string;
  festivalEndDate: string;
  festivalUrl: string;
  location?: string;  // 지역 정보 추가
}

const Festival = () => {
  const [visibleCount] = useState(15);

  // 45개의 더미 데이터 생성
  const dummyPosts: PostDto[] = Array.from({ length: 45 }, (_, i) => ({
    festivalId: `festival-${i + 1}`,
    festivalName: `2024 벚꽃축제 ${i + 1}`,
    festivalStartDate: '2024-03-01',
    festivalEndDate: '2024-03-31',
    festivalUrl: '#',
    location: '서울특별시 영등포구'
  }));

  return (
    <div className="max-w-[430px] mx-auto">
      <div className="pt-16 pb-20">
        {/* 검색창 */}
        <div className="px-4 mt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="축제/공연을 검색해보세요"
              className="w-full h-12 pl-12 pr-4 rounded-full border border-gray-200 focus:outline-none focus:border-primary"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="px-4 mt-4">
          <div className="grid grid-cols-3 gap-3">
            {dummyPosts.slice(0, visibleCount).map((post) => (
              <div
                key={post.festivalId}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="relative pb-[75%]"> {/* 4:3 비율의 이미지 영역 */}
                  <div className="absolute inset-0 bg-gray-200">
                    {/* 이미지가 들어갈 자리 */}
                  </div>
                </div>
                <div className="p-2">
                  <h3 className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">
                    {post.festivalName}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {post.location}
                  </p>
                  <p className="text-xs text-gray-500">
                    {post.festivalStartDate.slice(5)}~{post.festivalEndDate.slice(5)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Festival;