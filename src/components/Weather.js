import React, { useEffect, useState, useCallback } from "react";
import debounce from "lodash.debounce";
import Rain from "../images/rain.svg";
import Left from "../images/left.svg";
import Burger from "../images/burger.svg";
import Location from "../images/location.svg";
import Plus from "../images/Symbol.svg";
import Cloudy from "../images/mono.svg";
import "../app.css";

function Weather({ city, setCity }) {
  const [weatherData, setWeatherData] = useState([]);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [error, setError] = useState(null);
  const [sidePanelVisible, setSidePanelVisible] = useState(false);
  const [sidePanelClosing, setSidePanelClosing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  const [countryDegrees, setCountryDegrees] = useState([]);

  const defaultCountries = ["USA", "UK", "Canada", "Australia", "Germany"];

  const fetchWeatherData = useCallback(
    debounce(async (city) => {
      try {
        if (city) {
          const response = await fetch(`https://wttr.in/${city}?format=j1`);
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          console.log("Raw weather data:", data); // Log raw data

          if (
            data &&
            data.weather &&
            data.weather[0] &&
            data.weather[0].hourly
          ) {
            const hourlyData = data.weather[0].hourly;
            setWeatherData(hourlyData);
            const currentHour = new Date().getHours();
            console.log("Current hour:", currentHour); // Log current hour for debugging

            const padZero = (num) => (num < 10 ? `0${num}` : num.toString());

            const currentWeather = hourlyData.find((item) => {
              const itemTime = item.time.padStart(4, "0");
              const formattedCurrentHour = `${padZero(currentHour)}00`;
              console.log(
                "Comparing itemTime:",
                itemTime,
                "with formattedCurrentHour:",
                formattedCurrentHour
              );
              return itemTime === formattedCurrentHour;
            });

            console.log("Current weather object:", currentWeather); // Log currentWeather object
            setCurrentWeather(
              currentWeather
                ? {
                    tempC: currentWeather.tempC,
                    humidity: currentWeather.humidity,
                    windspeedMiles: currentWeather.windspeedMiles,
                  }
                : null
            );
          } else {
            throw new Error("Invalid data format");
          }
        }
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setError(error.message);
        setWeatherData([]);
        setCurrentWeather(null);
      }
    }, 500),
    []
  );

  const fetchCountryDegrees = useCallback(async () => {
    try {
      const degrees = await Promise.all(
        defaultCountries.map(async (country) => {
          const response = await fetch(`https://wttr.in/${country}?format=j1`);
          if (!response.ok) {
            throw new Error(`Failed to fetch weather data for ${country}`);
          }
          const data = await response.json();
          if (data && data.current_condition && data.current_condition[0]) {
            return {
              country,
              tempC: data.current_condition[0].temp_C,
            };
          }
          return { country, tempC: "N/A" };
        })
      );
      setCountryDegrees(degrees);
    } catch (error) {
      console.error("Error fetching country degrees:", error.message);
      // Handle error gracefully, e.g., set a default state or display an error message
      setCountryDegrees([]);
      // Optionally, set an error state to display to the user
    }
  }, []);

  useEffect(() => {
    if (city) {
      fetchWeatherData(city);
      fetchCountryDegrees();
    }
  }, [city, fetchWeatherData, fetchCountryDegrees]);

  const formatTime = useCallback((time) => {
    const date = new Date();
    date.setHours(time, 0, 0, 0);
    const formattedTime = date.toLocaleTimeString([], {
      hour: "numeric",
      hour12: true,
    });
    return formattedTime.toUpperCase(); // Convert to uppercase for AM/PM
  }, []);

  const getWeatherAtTime = useCallback(
    (hour) => {
      return weatherData.find((item) => parseInt(item.time, 10) === hour * 100);
    },
    [weatherData]
  );

  const generateTimesToShow = useCallback((currentHour) => {
    const times = [];
    for (let i = 0; i < 16; i++) {
      times.push((currentHour + i) % 24);
    }
    return times;
  }, []);

  const currentHour = new Date().getHours();
  const timesToShow = generateTimesToShow(currentHour);

  const handleClosePanel = useCallback(() => {
    setSidePanelClosing(true);
    setTimeout(() => {
      setSidePanelVisible(false);
      setSidePanelClosing(false);
    }, 500); // Duration of the slideOut animation
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false); // Closing the modal
  }, []);

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (searchCity.trim()) {
        fetchWeatherData(searchCity.trim());
      }
    },
    [fetchWeatherData, searchCity]
  );

  const handleInputChange = useCallback((event) => {
    setSearchCity(event.target.value);
  }, []);

  // Log currentWeather state in the render method
  console.log("Current weather state:", currentWeather);

  return (
    <div>
      {error ? (
        <div>Error: {error}</div>
      ) : (
        <div>
          <h2 className="title_city">{city}</h2>
          {currentWeather && (
            <div className="weatherBoxDeg" style={{ marginBottom: "10px" }}>
              <p>
                <span className="degreeTitle">{currentWeather.tempC}°</span>
                <div className="degreeBo">
                  <span className="degreeText">
                    H:{currentWeather.humidity}%
                  </span>
                  <span className="degreeText">
                    WS: {currentWeather.windspeedMiles} mph
                  </span>
                </div>
              </p>
            </div>
          )}
          <div className="weatherBox">
            <div>
              {timesToShow.map((hour) => {
                if (hour === currentHour || !weatherData.length) return null; // Skip current hour or when data is not available
                const weatherAtTime = getWeatherAtTime(hour);
                return weatherAtTime ? (
                  <div className="timeBig" key={hour}>
                    <p className="timeBox">
                      <span>{formatTime(hour)}</span>{" "}
                      <img
                        src={Rain}
                        alt="Rain"
                        width={"32px"}
                        height={"32px"}
                      />
                      <span className="humid">{weatherAtTime.humidity}%</span>
                      <span className="degree">
                        {weatherAtTime.tempC}°
                      </span>{" "}
                    </p>
                  </div>
                ) : null;
              })}
            </div>
            <div className="weatherBoxButton">
              <button className="wd" onClick={() => setSidePanelVisible(true)}>
                <img src={Location} alt="Location" />
              </button>
              <div className="newBox">
                <div>
                  <button onClick={() => setModalVisible(true)}>
                    <img src={Plus} alt="Plus" />
                  </button>
                </div>
              </div>
              <button className="wd" onClick={() => setSidePanelVisible(true)}>
                <img src={Burger} alt="Burger" />
              </button>
            </div>
          </div>
          {sidePanelVisible && (
            <div
              className={`sideePanel sidePanel ${
                sidePanelClosing ? "hidden" : ""
              }`}
            >
              <button className="backButton" onClick={handleClosePanel}>
                <img src={Left} alt="Left" />
                Weather
              </button>
              <div className="formWe">
                <form className="degreeForm" onSubmit={handleSearch}>
                  <input
                    type="text"
                    placeholder="Enter city or country"
                    value={searchCity} // Use searchCity instead of city
                    onChange={handleInputChange}
                  />
                  <button style={{ opacity: 0 }} type="submit">
                    Search
                  </button>
                </form>
              </div>

              <div className="def__countries">
                <ul>
                  {countryDegrees.map((country) => (
                    <li className="def" key={country.country}>
                      <div>
                        <span className="tem">{country.tempC}°</span>
                        <span>{country.country}</span>
                      </div>
                      <img width={160} height={160} src={Cloudy} alt="" />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {modalVisible && (
            <div className="modal">
              <button className="closeModalButton" onClick={handleCloseModal}>
                Close Modal
              </button>
              <p>Modal content here...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Weather;
