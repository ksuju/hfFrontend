// Festival.tsx
import { useState } from 'react';
import SearchBar from '../components/SearchBar';

interface PostDto {
  festivalId: string;
  festivalName: string;
  festivalStartDate: string;
  festivalEndDate: string;
  festivalUrl: string;
  location?: string;
}

const Festival = () => {
  const [visibleCount] = useState(15);

  const dummyPosts: PostDto[] = Array.from({ length: 45 }, (_, i) => ({
    festivalId: `festival-${i + 1}`,
    festivalName: `2024 벚꽃축제 ${i + 1}`,
    festivalStartDate: '2024-03-01',
    festivalEndDate: '2024-03-31',
    festivalUrl: '#',
    location: '서울특별시 영등포구'
  }));

  const handleSearch = async (/*keyword: string*/) => {
    try {
      // const response = await fetch(`/api/v1/posts/search?keyword=${encodeURIComponent(keyword)}&type=festival`);
      // const data = await response.json();
    } catch (error) {
      console.error('검색 중 오류 발생:', error);
    }
  };

  return (
      <div className="max-w-[600px] mx-auto">
        <SearchBar
            placeholder="축제/공연을 검색해보세요"
            onSearch={handleSearch}
        />
        <div className="p-4 my-20">
          <div className="grid grid-cols-3 gap-3">
            {dummyPosts.slice(0, visibleCount).map((post) => (
                <div
                    key={post.festivalId}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="relative pb-[75%]">
                    <div className="absolute inset-0 bg-gray-200">
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
  );
};

export default Festival