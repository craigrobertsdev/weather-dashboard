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
  const [lat, long] = await getCityCoords(location);
  await getWeatherDetails(lat, long);
}

async function getCityCoords(location) {
  const cityUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=5&appid=${apiKey}`;

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

// fetches weather data for the city at the provided coordinates
async function getWeatherDetails(lat, long, location) {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&units=metric&appid=${apiKey}`;

  return fetch(weatherUrl)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      weatherData = data;
      console.log(weatherData);
      const location = weatherData.city.name;
      displayCurrentWeather(location);
      saveSearch(location);
    })
    .catch((reason) => {
      console.log(reason);
    });
}

// Finds the first instance of midday in the returned dataset (search for 2100 due to time returned being UTC and ACDT being +9:30)
function determineMiddayIndex() {
  const day = weatherData.list.find((day, i) => {
    return day['dt_txt'].endsWith('21:00:00');
  });

  const index = weatherData.list.indexOf(day);
  return index;
}

function displayCurrentWeather(location) {
  $(currentWeatherSection).html('');
  if (weatherData === null) return;
  middayIndex = determineMiddayIndex();
  console.log(middayIndex);
  const date = parseDate(weatherData.list[middayIndex]['dt_txt']);
  const weatherItem = weatherData.list[middayIndex];

  const card = $('<div></div>');
  const cardHeader = $('<h2></h2>');
  const weatherImgSpan = $('<span></span');
  const weatherImg = $('<img></img>');
  const temperatureText = $('<p></p>');
  const windText = $('<p></p>');
  const humidityText = $('<p></p>');

  $(cardHeader).text(`${location} (${date})`).addClass('card-header');
  $(weatherImgSpan).append($(weatherImg).attr('src', `http://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png`).css('width', '50px'));
  $(cardHeader).append(weatherImgSpan);
  $(card).append(cardHeader);

  $(temperatureText).text(`Temp: ${weatherItem.main.temp}\u00B0F`);
  $(card).append(temperatureText);

  $(windText).text(`Wind: ${weatherItem.wind.speed} MPH`);
  $(card).append(windText);

  $(humidityText).text(`Humidity: ${weatherItem.main.humidity} %`);
  $(card).append(humidityText);

  $(currentWeatherSection).css('visibility', 'visible');
  $(currentWeatherSection).append(card);
}

function parseDate(dateString) {
  // string format from API is: "YYYY-MM-DD hh:mm:ss"
  const substrings = dateString.split('-');
  const day = substrings[2].split(' ')[0];
  return `${day}/${substrings[1]}/${substrings[0]}`;
}

function getWeatherImage(imgIcon) {
  fetch(`http://openweathermap.org/img/wn/${imgIcon}@2x.png`)
    .then((response) => {
      return response.blob();
    })
    .then((data) => {
      return URL.createObjectURL(data);
    });
}

// saves each search to local storage, disregarding any duplicates
function saveSearch(location) {
  if (weatherData === null) return;
  let savedSearches = JSON.parse(localStorage.getItem('savedSearches'));

  if (savedSearches === null) {
    savedSearches = [];
  }
  if (!savedSearches.includes(location)) {
    localStorage.setItem('savedSearches', JSON.stringify([...savedSearches, location]));
  }
}
