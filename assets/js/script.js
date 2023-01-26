// https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}

//http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid={API key}

// http://openweathermap.org/img/wn/${icon}@2x.png

const apiKey = '7d23a37898f652dad9213e544cd70c75';
// capture references to HTML
const cityInput = $('#city-input');
const previousSearchesSection = $('#previous-searches');
const currentWeatherSection = $('#current-weather');
const futureWeatherSection = $('#future-weather');

let weatherData;
let middayIndex;

async function searchWeather(event) {
  event.preventDefault();

  // if no data entered, do nothing
  if (!$(cityInput).val()) return;

  const location = $(cityInput).val();

  const cityUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=5&appid=${apiKey}`;
  const [lat, long] = await getCityCoords(cityUrl);

  const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&units=metric&appid=${apiKey}`;
  await getWeatherDetails(weatherUrl);
}

async function getCityCoords(cityUrl) {
  return fetch(cityUrl)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return [data[0].lat, data[0].lon];
    })
    .catch((reason) => {
      console.log(reason);
    });
}

async function getWeatherDetails(weatherUrl) {
  return fetch(weatherUrl)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      weatherData = data;
      console.log(weatherData);
      displayCurrentWeather(location);
    })
    .catch((reason) => {
      console.log(reason);
    });
}

// Finds the first instance of midday in the returned dataset
function determineMiddayIndex() {
  const day = weatherData.list.find((day, i) => {
    return day['dt_txt'].endsWith('12:00:00');
  });

  const index = weatherData.list.indexOf(day);
  return index;
}

function displayCurrentWeather(location) {
  if (weatherData === null) return;
  middayIndex = determineMiddayIndex();

  const card = $('<div></div>');
  const cardHeader = $('<p></p>');
  const weatherImgSpan = $('<span></span');
  const weatherImg = $('<img></img>');
  const temperatureText = $('<p></p>');
  const windText = $('<p></p>');
  const humidityText = $('<p></p>');

  $(cardHeader).text(`${location.toUpperCase()} (${data[middayIndex]})`);
}
