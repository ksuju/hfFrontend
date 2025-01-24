import React from 'react';

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