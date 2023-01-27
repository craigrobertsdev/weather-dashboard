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

// fires when search button is clicked,
async function searchWeather(event) {
  event.preventDefault();

  // if no data entered, do nothing
  if (!$(cityInput).val()) return;

  let location = $(cityInput).val();
  $(cityInput).val('');
  const [lat, long] = await getCityCoords(location);
  location = await getWeatherDetails(lat, long);
  displayCurrentWeather(location);
  displayFutureWeather();
  saveSearch(location);
  displaySavedSearches();
}

// gets lat and long for the city the user searches for
async function getCityCoords(location) {
  const cityUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=5&appid=${apiKey}`;

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
  const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&units=imperial&cnt=48&appid=${apiKey}`;

  return fetch(weatherUrl)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      weatherData = data;
      return (location = weatherData.city.name);
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

// clears current weather section and the 5-day forecast text, creates new card based on location search result
function displayCurrentWeather(location) {
  $(currentWeatherSection).html('');
  $('#5-day').remove();
  if (weatherData === null) return;
  middayIndex = determineMiddayIndex();
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
  $(weatherImgSpan).append($(weatherImg).attr('src', `https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png`).css('width', '50px'));
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

  $('<h3></h3>').text('5-Day Forecast:').attr('id', '5-day').insertAfter(currentWeatherSection);
}

// adds 4 of the same time weather items then gets the last one from the list as the API only returns 5 days but we're required to provide forecast data for 6.
function displayFutureWeather() {
  // clear previous weather data on new search
  $(futureWeatherSection).html('');

  // get 5 days worth of weather data
  const weatherItems = [];
  for (let i = middayIndex + 8; i < weatherData.list.length; i += 8) {
    weatherItems.push(weatherData.list[i]);
  }
  weatherItems.push(weatherData.list[weatherData.list.length - 1]);

  // create each weather data card
  for (let i = 0; i < weatherItems.length; i++) {
    const card = $('<div></div>');
    const cardHeader = $('<h4></h4>');
    const weatherImgSpan = $('<p></p>');
    const weatherImg = $('<img></img>');
    const temperatureText = $('<p></p>');
    const windText = $('<p></p>');
    const humidityText = $('<p></p>');
    const date = parseDate(weatherItems[i]['dt_txt']);

    $(card).addClass('bg-dark text-white col mx-2 fs-6');

    $(cardHeader).text(date);
    $(weatherImgSpan).append(
      $(weatherImg).attr('src', `https://openweathermap.org/img/wn/${weatherItems[i].weather[0].icon}@2x.png`).css('width', '50px')
    );
    $(cardHeader).append(weatherImgSpan);
    $(card).append(cardHeader);

    $(temperatureText).text(`Temp: ${weatherItems[i].main.temp}\u00B0F`);
    $(card).append(temperatureText);

    $(windText).text(`Wind: ${weatherItems[i].wind.speed} MPH`);
    $(card).append(windText);

    $(humidityText).text(`Humidity: ${weatherItems[i].main.humidity} %`);
    $(card).append(humidityText);

    $(futureWeatherSection).append(card);
  }
  $(futureWeatherSection).css('visibility', 'visible');
}

// utility function to convert date provided by API to user-friendly date format
function parseDate(dateString) {
  // string format from API is: "YYYY-MM-DD hh:mm:ss"
  const substrings = dateString.split('-');
  const day = substrings[2].split(' ')[0];
  return `${day}/${substrings[1]}/${substrings[0]}`;
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

// called on page load to populate any previously entered searches by the user
function displaySavedSearches() {
  const savedSearches = JSON.parse(localStorage.getItem('savedSearches'));
  if (savedSearches !== null) {
    $(previousSearchesSection).html('');
    for (let search of savedSearches) {
      const button = $('<button></button>').text(search).addClass('btn btn-secondary mt-3 w-100');
      $(button).on('click', (event) => {
        $(cityInput).val($(button).text());
        searchWeather(event);
      });
      $(previousSearchesSection).append(button);
    }
  }
}

displaySavedSearches();
