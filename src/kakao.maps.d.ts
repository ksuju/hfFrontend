declare global {
    interface Window {
        kakao: KakaoNamespace;
    }
}

// Kakao Maps API Namespace
interface KakaoNamespace {
    maps: {
        services: KakaoServices;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Map: new (container: HTMLElement, options: MapOptions) => KakaoMap;
        load: (callback: () => void) => void;
    };
}

// Kakao LatLng Type
interface KakaoLatLng {
    getLat: () => number;
    getLng: () => number;
}

// Map Options Type
interface MapOptions {
    center: KakaoLatLng;
    level: number;
}

// Kakao Map Type
interface KakaoMap {
    setCenter: (latlng: KakaoLatLng) => void;
    setLevel: (level: number) => void;
}

// Kakao Geocoder Service Type
interface KakaoServices {
    Geocoder: {
        coord2RegionCode: (
            lng: number,
            lat: number,
            callback: (result: RegionCode[], status: string) => void
        ) => void;
    };
    Status: {
        OK: string;
    };
}

// RegionCode returned by the Geocoder
interface RegionCode {
    region_1depth_name: string; // The region (e.g., "Seoul")
    region_2depth_name?: string; // The sub-region (optional)
}

export {};
