// import { useState, useEffect } from 'react';
// import './App.css';
// import SearchBar from './components/SearchBar';
// import Dashboard from './components/Dashboard';

// function App() {
//   const [city, setCity] = useState('delhi');
//   const [hasPermission, setHasPermission] = useState(false);

//   // Function to get the cookie value by name
//   const getCookie = (name) => {
//     const value = `; ${document.cookie}`;
//     const parts = value.split(`; ${name}=`);
//     if (parts.length === 2) return parts.pop().split(';').shift();
//     return null;
//   };

//   // Function to set a cookie
//   const setCookie = (name, value, days) => {
//     const d = new Date();
//     d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000)); 
//     const expires = `expires=${d.toUTCString()}`;
//     document.cookie = `${name}=${value}; ${expires}; path=/`;
//   };

//   // Function to fetch city name based on user's geolocation
//   const fetchCityFromGeolocation = async () => {
//     const userConsent = window.confirm(
//       'This app needs your location to provide weather information for your area. Do you want to allow location access?'
//     );

//     if (!userConsent) {
//       alert('Location permission denied. Showing default city.');
//       setCity('delhi');
//       return;
//     }

//     if (!navigator.geolocation) {
//       alert('Geolocation is not supported by this browser.');
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const { latitude, longitude } = position.coords;

//         const apiKey = import.meta.env.VITE_OPEN_WEATHER_API;
//         const apiUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;

//         try {
//           const response = await fetch(apiUrl);
//           if (response.ok) {
//             const data = await response.json();
//             if (data.length > 0) {
//               const detectedCity = data[0].name;
//               setCity(detectedCity);
//               setCookie('city', detectedCity, 30);
//               setCookie('permission', 'granted', 365); 
//             } else {
//               alert('Could not determine the city from your location.');
//             }
//           } else {
//             console.error('Error fetching city data:', response.statusText);
//           }
//         } catch (error) {
//           console.error('Error:', error);
//           alert('Failed to fetch city data. Please try again later.');
//         }
//       },
//       (error) => {
//         console.error('Geolocation error:', error);
//         alert('Geolocation error: ' + error.message);
//       }
//     );
//   };

//   // Check for cookies on component mount
//   useEffect(() => {
//     const savedCity = getCookie('city');
//     const savedPermission = getCookie('permission');

//     if (savedCity) {
//       setCity(savedCity);
//     } else {
//       fetchCityFromGeolocation();
//     }

//     if (savedPermission === 'granted') {
//       setHasPermission(true);
//     }
//   }, []); 
  
//   return (
//     <>
//       <SearchBar setCity={setCity} />
//       <Dashboard city={city} />
//     </>
//   );
// }

// export default App;
// // src/App.js




import { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import Dashboard from './components/Dashboard';

function App() {
  const [city, setCity] = useState('delhi');
  const [hasPermission, setHasPermission] = useState(false);
  const [forecast, setForecast] = useState([]); // State to store 5-day forecast

  // Function to get the cookie value by name
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  // Function to set a cookie
  const setCookie = (name, value, days) => {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000)); 
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/`;
  };

  // Function to fetch the 5-day weather forecast for a city
  const fetchWeatherForecast = async (cityName) => {
    const apiKey = import.meta.env.VITE_OPEN_WEATHER_API;
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&cnt=40&appid=${apiKey}`;

    try {
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.list) {
          // We can filter the forecast to display data for 5 days (every 8th entry is a day)
          const fiveDayForecast = data.list.filter((item, index) => index % 8 === 0); // Filter data for 3-hour intervals
          setForecast(fiveDayForecast);
        } else {
          alert('Could not fetch weather data for the city.');
        }
      } else {
        console.error('Error fetching weather data:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to fetch weather data. Please try again later.');
    }
  };

  // Function to fetch city name based on user's geolocation
  const fetchCityFromGeolocation = async () => {
    const userConsent = window.confirm(
      'This app needs your location to provide weather information for your area. Do you want to allow location access?'
    );

    if (!userConsent) {
      alert('Location permission denied. Showing default city.');
      setCity('delhi');
      return;
    }

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const apiKey = import.meta.env.VITE_OPEN_WEATHER_API;
        const apiUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;

        try {
          const response = await fetch(apiUrl);
          if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
              const detectedCity = data[0].name;
              setCity(detectedCity);
              setCookie('city', detectedCity, 30);
              setCookie('permission', 'granted', 365); 
              fetchWeatherForecast(detectedCity); // Fetch forecast data for detected city
            } else {
              alert('Could not determine the city from your location.');
            }
          } else {
            console.error('Error fetching city data:', response.statusText);
          }
        } catch (error) {
          console.error('Error:', error);
          alert('Failed to fetch city data. Please try again later.');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Geolocation error: ' + error.message);
      }
    );
  };

  // Check for cookies on component mount
  useEffect(() => {
    const savedCity = getCookie('city');
    const savedPermission = getCookie('permission');

    if (savedCity) {
      setCity(savedCity);
      fetchWeatherForecast(savedCity); // Fetch forecast for saved city
    } else {
      fetchCityFromGeolocation();
    }

    if (savedPermission === 'granted') {
      setHasPermission(true);
    }
  }, []); 

  return (
    <>
      <SearchBar setCity={setCity} fetchWeatherForecast={fetchWeatherForecast} />
      <Dashboard city={city} forecast={forecast} />
    </>
  );
}

export default App;
