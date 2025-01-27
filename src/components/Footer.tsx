import React from 'react';
import { Link } from 'react-router-dom';


const Footer = () => {
    return (
      <footer className="footer">
        <div className="_gnb__menu_1h8bp_13">
          <ul>
            <li><Link to="/">메인화면</Link></li>  
            <li><Link to="/Map">지도</Link></li>   
            <li><Link to="/test">테스트</Link></li>  
            <li><Link to="/chat">채팅 테스트</Link></li>  
          </ul>
        </div>
      </footer>
    );
  };
  
  export default Footer;
