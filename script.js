
async function getWeather(city) {
	const url = `https://api.open-meteo.com/v1/forecast?latitude=28.61&longitude=77.23&current_weather=true`;
	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error('Network response was not ok');
		const data = await response.json();
		console.log('Weather data for', city, ':', data);
	} catch (error) {
		console.error('Error fetching weather:', error);
	}
}

getWeather('mumbai');
