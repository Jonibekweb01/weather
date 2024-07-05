import React, { useState, useEffect } from "react";
import Weather from "../components/Weather";
import "../app.css";

function Home() {
  const [city, setCity] = useState("Tashkent"); // Default city is Tashkent, Uzbekistan

  return (
    <div className="home_box">
      <Weather city={city} setCity={setCity}/>
    </div>
  );
}

export default Home;
