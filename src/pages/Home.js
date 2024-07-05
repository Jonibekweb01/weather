import React, { useState } from "react";
import Weather from "../components/Weather";

function Home() {
  const [city, setCity] = useState("Tashkent"); 
  return (
    <div className="home_box">
      <Weather city={city} setCity={setCity} />
    </div>
  );
}

export default Home;
