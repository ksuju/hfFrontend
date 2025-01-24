import Chat from './Chat';  // Chat 컴포넌트 import

function App() {

  console.log(import.meta.env.VITE_CORE_FRONT_BASE_URL);
  console.log(import.meta.env.VITE_CORE_API_BASE_URL);

  fetch(import.meta.env.VITE_CORE_API_BASE_URL + "/api")
    .then((data) => console.log(data));

  return (
    <>
      <h1>Hello World!</h1>
      <Chat
        chatRoomId={1}  // 채팅방 고유 식별자 
        memberId={1}  // 현재 사용자 ID
      />
    </>
  )
}

export default App
