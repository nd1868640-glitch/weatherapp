const apiKey = "6a63a67dd8f845852703006a17a171de"; // Replace with your OpenWeatherMap API key

document.getElementById("search-btn").addEventListener("click", () => {
  const city = document.getElementById("city-input").value.trim();
  if (city) {
    getWeather(city);
  } else {
    alert("Please enter a city name.");
  }
});

async function getWeather(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("City not found");
    }

    const data = await response.json();
    console.log("Weather data:", data);

    // Extract data
    const temp = Math.round(data.main.temp);
    const humidity = data.main.humidity;
    const condition = data.weather[0].description;
    const wind = Math.round(data.wind.speed);
    const feelsLike = Math.round(data.main.feels_like);
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    // Update UI
    document.getElementById("location").textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById("temperature").textContent = `${temp}°C`;
    document.getElementById("description").textContent = condition;
    document.getElementById("humidity").textContent = `${humidity}%`;
    document.getElementById("wind").textContent = `${wind} km/h`;
    document.getElementById("feels-like").textContent = `${feelsLike}°C`;
    document.getElementById("weather-icon").src = iconUrl;

  } catch (error) {
    console.error("Error fetching weather:", error);
    alert("Could not fetch weather data. Please check the city name.");
  }
}

// Display date and time
function displayCurrentDate() {
  const el = document.getElementById("current-date");
  const now = new Date();
  el.textContent = now.toLocaleString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
displayCurrentDate();
setInterval(displayCurrentDate, 60 * 1000);
