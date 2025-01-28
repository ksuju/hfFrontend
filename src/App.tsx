import './App.css'
import KakaoMap from './components/KakaoMap'
import Header from './components/Header'
import Footer from './components/Footer'
import Test from './components/test'
import Main from './components/Main'
import Chat from '../websocket-app/src/components/Chat';
import { BrowserRouter, Route, Routes } from 'react-router-dom';//Router 설정


function App() {

  console.log(import.meta.env.VITE_CORE_FRONT_BASE_URL);
  console.log(import.meta.env.VITE_CORE_API_BASE_URL);

  // fetch(import.meta.env.VITE_CORE_API_BASE_URL + "/api")
  //   .then((data) => console.log(data));

  return (
    <BrowserRouter>
      <div id="commonLayoutComponent" className="commonLayoutContainer">
        <Header />
        <main className="route-content">
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/Map" element={<KakaoMap />} />
            <Route path="/test" element={<Test />} />
            <Route path="/chat" element={<Chat chatRoomId={1} memberId={1} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
