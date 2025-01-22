import React from 'react';
import '../css/Header.css'; // 스타일을 적용하려면 반드시 import 해야 합니다.

const Header = () => {
  return (
    <header>
      <div className="container">
        <h1>My Application</h1>
        <nav>
          <ul>
            <li>
              <a href="/login">Login</a>
            </li>
            <li>
              <a href="/signup">Sign Up</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;