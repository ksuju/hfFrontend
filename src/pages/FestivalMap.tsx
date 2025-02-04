import KakaoMap from "../components/KakaoMap";

const Map = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 mt-16 mb-16">
                <div className="max-w-[600px] lg:max-w-screen-lg mx-auto lg:py-6">
                    <div className="bg-white lg:rounded-2xl lg:shadow-md p-6">
                        <h1 className="text-2xl font-bold text-center mb-4">카카오 지도</h1>
                        <KakaoMap />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Map;
