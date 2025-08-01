const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');

api_key = "DIGITE SUA CHAVE DA API"
function updateWeather(data) {
  document.getElementById('temperature').textContent = `${data.main.temp.toFixed(1)}°C`;
  document.getElementById('description').textContent = data.weather[0].description;
  document.getElementById('city-name').textContent = data.name;
  document.getElementById('feels-like').textContent = `${data.main.feels_like.toFixed(1)}°C`;
  document.getElementById('humidity').textContent = `${data.main.humidity}%`;
  document.getElementById('wind').textContent = `${data.wind.speed} km/h`;
  document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
}

function getWeatherByCity(city) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}&units=metric&lang=pt_br`)
    .then(response => response.json())
    .then(data => {
      if (data.cod === 200) {
        updateWeather(data);
      } else {
        alert('Cidade não encontrada!');
      }
    })
    .catch(err => console.error('Erro:', err));
}

function getWeatherByCoords(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric&lang=pt_br`)
    .then(response => response.json())
    .then(data => {
      if (data.cod === 200) {
        updateWeather(data);
      }
    })
    .catch(err => console.error('Erro:', err));
}

// Ao clicar na busca manual
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (!city) return;
  getWeatherByCity(city);
});

// Obtém localização do navegador
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      getWeatherByCoords(latitude, longitude);
    },
    (error) => {
      console.error('Erro ao obter localização:', error);
      // fallback caso não permita localização
      getWeatherByCity("São Paulo");
    }
  );
} else {
  // fallback caso navegador não suporte
  getWeatherByCity("São Paulo");
}
