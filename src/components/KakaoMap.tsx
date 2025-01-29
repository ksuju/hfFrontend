import {useEffect} from "react";

export const getUserLocation = (): Promise<GeolocationCoordinates | null> => {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => resolve(position.coords),
                (error) => reject(error)
            );
        } else {
            reject("Geolocation is not supported by this browser.");
        }
    });
};

// Function to get region from coordinates
export const getRegionFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        window.kakao.maps.load(() => {
            const geocoder = window.kakao.maps.services.Geocoder;
            const coords = new window.kakao.maps.LatLng(lat, lng);

            // Using Kakao Geocoder to convert coordinates to region
            geocoder.coord2RegionCode(coords.getLng(), coords.getLat(), (result, status) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    // Extract region name from the first result
                    const region = result[0].region_1depth_name;
                    resolve(region);
                } else {
                    reject("Unable to get region");
                }
            });
        });
    });
};

const KakaoMap = () => {
    useEffect(() => {
        // Example usage: Get region for given coordinates
        const latitude = 37.5665;
        const longitude = 126.978; // Coordinates for Seoul
        getRegionFromCoordinates(latitude, longitude)
            .then((region) => {
                console.log("Current region:", region);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    return (
        <div>
            <div id="map" className="w-full h-96 bg-gray-200"></div>
        </div>
    );
};

export default KakaoMap;
