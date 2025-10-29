const apiKey = "6a63a67dd8f845852703006a17a171de"; // Replace with your OpenWeatherMap API key

document.getElementById("search-btn").addEventListener("click", () => {
  const city = document.getElementById("city-input").value.trim();
  if (city) {
    getWeather(city);
  } else {
    alert("Please enter a city name.");
  }
});

// Create a 'Use my location' button dynamically and append next to the search button
;(function createLocationButton() {
  const searchRow = document.querySelector('.weather-search');
  if (!searchRow) return;
  const locBtn = document.createElement('button');
  locBtn.id = 'loc-btn';
  locBtn.textContent = 'Use my location';
  locBtn.style.padding = '0.6rem 1rem';
  locBtn.style.borderRadius = '8px';
  locBtn.style.border = 'none';
  locBtn.style.background = '#f0f0f0';
  locBtn.style.cursor = 'pointer';
  locBtn.style.marginLeft = '4px';
  searchRow.appendChild(locBtn);

  locBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    locBtn.disabled = true;
    locBtn.textContent = 'Locating...';
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      console.log('User coords:', latitude, longitude);
      await getWeatherByCoords(latitude, longitude);
      locBtn.disabled = false;
      locBtn.textContent = 'Use my location';
    }, (err) => {
      console.error('Geolocation error:', err);
      alert('Unable to retrieve your location.');
      locBtn.disabled = false;
      locBtn.textContent = 'Use my location';
    });
  });
})();

async function getWeather(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {72
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

    // After showing current weather, also fetch and show 5-day forecast
    getFiveDayForecast(city);

  } catch (error) {
    console.error("Error fetching weather:", error);
    alert("Could not fetch weather data. Please check the city name.");
  }
}

// Fetch current weather by coordinates and update UI
async function getWeatherByCoords(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Location weather not found');
    const data = await response.json();
    console.log('Weather data (coords):', data);

    // Extract and update UI same as getWeather
    const temp = Math.round(data.main.temp);
    const humidity = data.main.humidity;
    const condition = data.weather[0].description;
    const wind = Math.round(data.wind.speed);
    const feelsLike = Math.round(data.main.feels_like);
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    document.getElementById("location").textContent = `${data.name || 'Your location'}, ${data.sys && data.sys.country ? data.sys.country : ''}`;
    document.getElementById("temperature").textContent = `${temp}°C`;
    document.getElementById("description").textContent = condition;
    document.getElementById("humidity").textContent = `${humidity}%`;
    document.getElementById("wind").textContent = `${wind} km/h`;
    document.getElementById("feels-like").textContent = `${feelsLike}°C`;
    document.getElementById("weather-icon").src = iconUrl;

    // Fetch forecast for coords
    getFiveDayForecastByCoords(lat, lon);

  } catch (error) {
    console.error('Error fetching weather by coords:', error);
    alert('Could not fetch weather for your location.');
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


// Fetch 5-day forecast (OpenWeatherMap 3-hour interval data) and summarize by day
async function getFiveDayForecast(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Forecast not available');
    const data = await response.json();
    console.log('Raw 5-day forecast data:', data);

    // Group list items by date (YYYY-MM-DD)
    const groups = {};
    data.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });

    // Build summary for up to 5 days (preserve chronological order)
    const dates = Object.keys(groups).slice(0, 5);
    const summary = dates.map(date => {
      const items = groups[date];
      const temps = items.map(i => i.main.temp);
      const minTemp = Math.round(Math.min(...temps));
      const maxTemp = Math.round(Math.max(...temps));

      // pick the most frequent weather (by icon code)
      const freq = {};
      items.forEach(i => {
        const key = i.weather[0].icon + '|' + i.weather[0].description;
        freq[key] = (freq[key] || 0) + 1;
      });
      const most = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
      const [iconCode, description] = most.split('|');

      return {
        date,
        minTemp,
        maxTemp,
        iconCode,
        description
      };
    });

    console.log('5-day summary:', summary);

    renderForecast(summary);

  } catch (error) {
    console.error('Error fetching 5-day forecast:', error);
  }
}

// Fetch 5-day forecast by coordinates and summarize by date
async function getFiveDayForecastByCoords(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Forecast not available for coords');
    const data = await response.json();
    console.log('Raw 5-day forecast data (coords):', data);

    // Group list items by date (YYYY-MM-DD)
    const groups = {};
    data.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });

    const dates = Object.keys(groups).slice(0, 5);
    const summary = dates.map(date => {
      const items = groups[date];
      const temps = items.map(i => i.main.temp);
      const minTemp = Math.round(Math.min(...temps));
      const maxTemp = Math.round(Math.max(...temps));

      const freq = {};
      items.forEach(i => {
        const key = i.weather[0].icon + '|' + i.weather[0].description;
        freq[key] = (freq[key] || 0) + 1;
      });
      const most = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
      const [iconCode, description] = most.split('|');

      return { date, minTemp, maxTemp, iconCode, description };
    });

    console.log('5-day summary (coords):', summary);
    renderForecast(summary);

  } catch (error) {
    console.error('Error fetching 5-day forecast by coords:', error);
  }
}

// Render simple forecast cards into the DOM (creates container if missing)
function renderForecast(summary) {
  let container = document.getElementById('forecast-container');
  if (!container) {
    const parent = document.querySelector('.weather-app-container');
    container = document.createElement('div');
    container.id = 'forecast-container';
    container.style.display = 'flex';
    container.style.gap = '0.5rem';
    container.style.justifyContent = 'space-between';
    container.style.marginTop = '0.8rem';
    parent.appendChild(container);
  }

  // Clear existing
  container.innerHTML = '';

  summary.forEach(day => {
    const card = document.createElement('div');
    card.style.background = '#f8f9fb';
    card.style.padding = '0.6rem';
    card.style.borderRadius = '8px';
    card.style.flex = '1';
    card.style.textAlign = 'center';

    const dateLabel = new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const iconUrl = `https://openweathermap.org/img/wn/${day.iconCode}@2x.png`;

    card.innerHTML = `
      <div style="font-weight:600;margin-bottom:6px;">${dateLabel}</div>
      <img src="${iconUrl}" alt="icon" style="width:48px;height:48px;">
      <div style="margin-top:6px;font-size:0.95rem">${day.description}</div>
      <div style="margin-top:6px;font-weight:600">${day.maxTemp}° / ${day.minTemp}°</div>
    `;

    container.appendChild(card);
  });
} ``
