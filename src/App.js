import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import "./app.css"
function App() {
  return (
    <div className='hero'>
      <nav>
        {/* <ul>
          <li>
            <Link to="/"></Link>
          </li>
        </ul> */}
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
