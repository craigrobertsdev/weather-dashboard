// https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}

//http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid={API key}

const apiKey = '7d23a37898f652dad9213e544cd70c75';
// capture references to HTML
const cityInput = $('#city-input');
const previousSearchesSection = $('#previous-searches');
const currentWeatherSection = $('#current-weather');
const futureWeatherSection = $('#future-weather');

function searchWeather(event) {
  event.preventDefault();

  if (!$(cityInput).val()) return;
  const location = $(cityInput).val();
  let lat, long;

  const cityUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=5&appid=${apiKey}`;
  fetch(cityUrl)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      lat = data[0].lat;
      long = data[0].lon;
      console.log(lat + ' ' + long);
    })
    .catch((msg) => {
      console.log(msg);
    });

  console.log('passing lat: ' + lat + ' and long: ' + long);
  const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=${apiKey}`;

  fetch(weatherUrl)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
    });
}
