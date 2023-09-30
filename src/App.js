import { useEffect, useState } from "react";

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}

export default function App() {
  const [location, setLocation] = useState("");
  const [displayLocation, setDisplayLocation] = useState("");
  const [weather, setWeather] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getWeather() {
      if (location.length < 2) return setWeather({});
      try {
        setIsLoading(true);
        // 1) Getting location (geocoding)
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${location}`
        );
        const geoData = await geoRes.json();
        // console.log(geoData);

        if (!geoData.results) throw new Error("Location not found");

        const { latitude, longitude, timezone, name, country_code } =
          geoData.results.at(0);
        setDisplayLocation(`${name} ${convertToFlag(country_code)}`);

        // 2) Getting actual weather
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
        );
        const weatherData = await weatherRes.json();
        setWeather(weatherData.daily);
        // console.log(weatherData.daily);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    getWeather();

    return () => {
      console.log("unmounting");
      setWeather({});
    };
  }, [location]);

  function onChangeLocation(e) {
    setLocation((loc) => (loc = e.target.value));
    // console.log("here");
    // console.log(e.target.value);
  }

  return (
    <div className="app">
      <h1>Classy Weather</h1>
      <Input location={location} onChangeLocation={onChangeLocation} />
      {isLoading ? (
        <p className="loader">Loading...</p>
      ) : (
        weather.weathercode && (
          <Weather weather={weather} displayLocation={displayLocation} />
        )
      )}
    </div>
  );
}

function Weather({ weather, displayLocation }) {
  const {
    time,
    temperature_2m_max: max,
    temperature_2m_min: min,
    weathercode: code,
  } = weather;
  // console.log(time);
  return (
    <div>
      {/* <h2>{time}</h2> */}
      <h2>{displayLocation} weather</h2>
      <ul className="weather">
        {time.map((time, i) => (
          <Day
            date={time}
            max={max.at(i)}
            min={min.at(i)}
            code={code.at(i)}
            key={time}
            isToday={i === 0}
          />
        ))}
      </ul>
    </div>
  );
}

function Day({ date, max, min, code, isToday }) {
  return (
    <li className="day">
      <span>{getWeatherIcon(code)}</span>
      <p>{isToday ? "Today" : formatDay(date)}</p>
      <p>
        {Math.floor(min)}&deg; - <strong>{Math.ceil(max)}&deg;</strong>
      </p>
    </li>
  );
}
function Input({ location, onChangeLocation }) {
  return (
    <div>
      <input
        type="text"
        placeholder="enter location"
        value={location}
        onChange={onChangeLocation}
      ></input>
    </div>
  );
}
