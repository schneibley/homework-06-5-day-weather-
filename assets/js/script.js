document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'db3320e04205a4755f01124e5c36c33e';
    const form = document.querySelector('.searchContainer');
    const userInput = document.getElementById('searchBox');
    const currentCity = document.getElementById('city');
    const currentTemp = document.getElementById('temp');
    const currentWind = document.getElementById('wind');
    const currentHumidity = document.getElementById('humidity');
    const forecastContainer = document.querySelector('.forecast-container');
    const searchHistory = document.getElementById('search-history');

    let cities = JSON.parse(localStorage.getItem('cities')) || [];

    
    function updateSearchHistory(city) {
        if (!cities.includes(city)) {
            cities.push(city);
            localStorage.setItem('cities', JSON.stringify(cities));

            const historyItem = document.createElement('button');
            historyItem.textContent = city;
            historyItem.classList.add('history-item');
            historyItem.addEventListener('click', () => {
                userInput.value = city;
                form.dispatchEvent(new Event('submit'));
            });

            searchHistory.appendChild(historyItem);
        }
    }

    
    cities.forEach(city => {
        const historyItem = document.createElement('button');
        historyItem.textContent = city;
        historyItem.classList.add('history-item');
        historyItem.addEventListener('click', () => {
            userInput.value = city;
            form.dispatchEvent(new Event('submit'));
        });

        searchHistory.appendChild(historyItem);
    });

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        let search = userInput.value.trim();
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${search}&appid=${apiKey}`;

        fetch(geoUrl)
            .then(response => response.json())
            .then(data => {
                let lat = data[0].lat;
                let lon = data[0].lon;
                const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
                const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

                fetch(currentUrl)
                    .then(response => response.json())
                    .then(data => {
                        currentCity.textContent = data.name;

                        const currentIcon = data.weather[0].icon;
                        const currentIconUrl = `https://openweathermap.org/img/wn/${currentIcon}.png`;
                        const iconImg = document.createElement('img');
                        iconImg.src = currentIconUrl;
                        iconImg.alt = 'Weather Icon';
                        iconImg.classList.add('weather-icon');

                        const existingIcon = document.querySelector('.weather-icon');
                        if (existingIcon) {
                            existingIcon.remove();
                        }
                        currentCity.insertAdjacentElement('afterend', iconImg);

                        currentTemp.textContent = `Temperature: ${convertKelvinToFahrenheit(data.main.temp)} °F`;
                        currentWind.textContent = `Wind: ${data.wind.speed} MPH`;
                        currentHumidity.textContent = `Humidity: ${data.main.humidity}%`;

                        updateSearchHistory(data.name);
                    })
                    .catch(error => {
                        console.error('Error fetching current weather:', error);
                    });

                fetch(forecastUrl)
                    .then(response => response.json())
                    .then(data => {
                        forecastContainer.innerHTML = '';

                        const dailyForecasts = {};
                        data.list.forEach(forecast => {
                            const forecastDate = new Date(forecast.dt * 1000);
                            const forecastTime = forecastDate.getUTCHours();

                            if (forecastTime === 15 && !dailyForecasts[forecastDate.toDateString()]) {
                                const weekIcon = forecast.weather[0].icon;
                                const weekUrl = `https://openweathermap.org/img/wn/${weekIcon}.png`;

                                const forecastDayContainer = document.createElement('div');
                                forecastDayContainer.classList.add('forecast-day');
                                forecastDayContainer.style.border = '2px solid blue';

                                const forecastItem = document.createElement('div');
                                forecastItem.classList.add('card');
                                forecastItem.innerHTML = `
                                    <h3>Date: ${forecastDate.toDateString()}</h3>
                                    <p>Temperature: ${convertKelvinToFahrenheit(forecast.main.temp)} °F</p>
                                    <p>Wind: ${forecast.wind.speed} MPH</p>
                                    <p>Humidity: ${forecast.main.humidity}%</p>
                                    <img src="${weekUrl}" alt="Weather Icon">
                                `;
                                forecastDayContainer.appendChild(forecastItem);
                                forecastContainer.appendChild(forecastDayContainer);

                                dailyForecasts[forecastDate.toDateString()] = true;
                            }
                        });
                    })
                    .catch(error => {
                        console.error('Error fetching forecast:', error);
                    });
            })
            .catch(error => {
                console.error('Error fetching geolocation data:', error);
            });
    });

    function convertKelvinToFahrenheit(kelvin) {
        return ((kelvin - 273.15) * 9/5 + 32).toFixed(1);
    }
});