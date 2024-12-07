
import React, { useState, useEffect } from 'react';
import SeekBar from './Seekbar';
import SunArc from './SunArc';
import WeatherMetrics from './WeatherMetrics';

const Dashboard = ({ city }) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]); // New state for forecast data
  const [aqi, setAqi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('dark'); // State to track theme

  const api = import.meta.env.VITE_OPEN_WEATHER_API;

  // Function to toggle the theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const updateBackground = (sunrise, sunset) => {
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    let gradient = '';

    // Calculate time ranges
    const dayDuration = sunset - sunrise;
    const morningEnd = sunrise + dayDuration / 4; // Morning ends at 1/4th of the day
    const afternoonStart = morningEnd;
    const eveningStart = sunset - dayDuration / 4; // Evening starts at 3/4th of the day

    if (currentTime < sunrise || currentTime >= sunset) {
      // Night
      gradient = theme === 'light' ? 'linear-gradient(315deg, #525c93, #2e3868)' : 'linear-gradient(315deg, #111, #333)';
    } else if (currentTime >= sunrise && currentTime < morningEnd) {
      // Morning
      gradient = theme === 'light'
        ? 'linear-gradient(to bottom, #627294, #9fa7b0, #eeae5f, #c1614e)'
        : 'linear-gradient(to bottom, #444, #666, #eeae5f, #c1614e)';
    } else if (currentTime >= afternoonStart && currentTime < eveningStart) {
      // Afternoon
      gradient = theme === 'light' ? 'linear-gradient(to bottom, #7bc1f0, #5a99dd)' : 'linear-gradient(to bottom, #444, #777)';
    } else if (currentTime >= eveningStart && currentTime < sunset) {
      // Evening
      gradient = theme === 'light' ? 'linear-gradient(to bottom, #808cb6, #385b93)' : 'linear-gradient(to bottom, #444, #555)';
    }

    document.body.style.background = gradient;
  };

  const getWeatherImage = (sunrise, sunset) => {
    const currentTime = Math.floor(Date.now() / 1000);

    if (currentTime < sunrise || currentTime >= sunset) {
      return theme === 'light' ? '/moon.png' : '/moon.png'; // Night (moon)
    } else if (currentTime >= sunrise && currentTime < sunrise + (sunset - sunrise) / 3) {
      return theme === 'light' ? '/sunrise.png' : '/sunrise.png'; // Morning
    } else {
      return theme === 'light' ? '/sunrise.png' : '/sunrise.png'; // Day
    }
  };

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!city || !api) {
        setError('City or API key is missing.');
        setLoading(false);
        return;
      }

      try {
        // Fetch current weather data
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api}&units=metric`
        );
        if (!weatherResponse.ok) {
          throw new Error('City not found');
        }
        const weatherData = await weatherResponse.json();
        setWeather(weatherData);

        const { lat, lon } = weatherData.coord;
        
        // Fetch air quality data
        const aqiResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api}`
        );
        if (!aqiResponse.ok) {
          throw new Error('Failed to fetch AQI data');
        }
        const aqiData = await aqiResponse.json();
        setAqi(aqiData.list[0].main.aqi);

        // Fetch 5-day weather forecast
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${api}&units=metric`
        );
        if (!forecastResponse.ok) {
          throw new Error('Failed to fetch forecast data');
        }
        const forecastData = await forecastResponse.json();
        const fiveDayForecast = forecastData.list.filter((item, index) => index % 8 === 0); // Get 1 entry per day
        setForecast(fiveDayForecast);

        // Update the background based on sunrise and sunset
        if (weatherData.sys.sunrise && weatherData.sys.sunset) {
          updateBackground(weatherData.sys.sunrise, weatherData.sys.sunset);
        }

        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [city, theme]); // Add theme as dependency

  if (loading) {
    return (
      <div className="flex items-center justify-center mx-auto  flex-col w-screen h-screen fixed top-0 left-0">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border"></div>
      </div>
    );
  }

  if (error) {
    alert('City not found');
    setLoading(false);
  }

  return (
    <div className={`flex items-center justify-center mx-auto h-auto relative flex-col w-[90vw] pt-1 md:w-[70vw] ${theme}`}>
      {/* Toggle button for dark/light mode */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 text-white p-2 bg-black rounded-full"
      >
        {theme === 'light' ? '🌞' : '🌛'}
      </button>

      <div className="w-[100%] md:w-3/4 flex row justify-between mx-auto items-center">
        <div className="text-left w-[60%] p-2">
          <p className=" text-textSecondary text-[1rem] py-1 flex justify-start gap-[2px] font-normal items-center">
            {weather.name}
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-[.7rem] w-[.7rem]" viewBox="0 0 16 16">
              <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6" />
            </svg>
          </p>
          <h3 className="my-[0px] md:my-[3px] text-white font-medium text-[3.5rem] md:text-[5rem]">
            {Math.trunc(weather.main.temp)}°
          </h3>
          <p className=" text-white font-medium text-[.9rem] md:text-lg py-1">{weather.weather[0].description}</p>
          <p className="text-white text-[1rem] md:text-lg mt-2 py-1 font-medium">
            {Math.trunc(weather.main.temp_max)}° / {Math.trunc(weather.main.temp_min)}° Feels like {Math.trunc(weather.main.feels_like)}°
          </p>
        </div>

        <div className="w-[40%] p-2">
          <img src={getWeatherImage(weather.sys.sunrise, weather.sys.sunset)} alt="Weather" className="w-[100%] h-[100%] md:w-[300px]" />
        </div>
      </div>

      {aqi && <SeekBar aqi={aqi} />}

      <WeatherMetrics
        humidity={weather.main.humidity}
        pressure={weather.main.pressure}
        wind={weather.wind.speed}
        visibility={weather.visibility}
        windAngle={weather.wind.deg}
      />

      {/* Display the 5-day forecast */}
      <div className="forecast-container w-full mt-4">
        <div className="flex justify-between">
          {forecast.map((day, index) => (
            <div key={index} className="forecast-day text-center text-white p-4">
              <p>{new Date(day.dt * 1000).toLocaleDateString()}</p>
              <p>{Math.trunc(day.main.temp)}°</p>
              <p>{day.weather[0].description}</p>
            </div>
          ))}
        </div>
      </div>

      {weather.sys.sunrise && weather.sys.sunset && (
        <SunArc
          sunrise={weather.sys.sunrise}
          sunset={weather.sys.sunset}
          currentTime={Math.floor(Date.now() / 1000)}
        />
      )}
    </div>
  );
};

export default Dashboard;



