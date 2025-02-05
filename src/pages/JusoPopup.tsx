import { useEffect } from 'react';

const JusoPopup = () => {
    useEffect(() => {
        const address = new URLSearchParams(window.location.search).get('address');
        if (address) {
            window.opener.postMessage({ address }, '*');
            window.close();
        }
    }, []);

    return <div>주소 검색 결과 처리 중...</div>;
};

export default JusoPopup;
