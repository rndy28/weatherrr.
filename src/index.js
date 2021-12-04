import './main.css';

const OPENWEATHERMAPAPIKEY = 'f8fc3d49501b6e98fb4c4cc98c678350'


async function fetchData(url) {
    try {
        const res = await fetch(url)
        const data = await res.json()
        return data
    } catch (error) {
        alert(error)
    }
}

async function getData() {
    const locationData = await fetchData('https://api.ipgeolocation.io/ipgeo?apiKey=7bb60ddeb98e4fb78aa1871630149afd')
    const forecastData = await fetchData(`https://api.openweathermap.org/data/2.5/onecall?lat=${locationData.latitude}&lon=${locationData.longitude}&units=imperial&exclude=minutely,hourly,alerts&appid=${OPENWEATHERMAPAPIKEY}`);
    document.querySelector('.loading').classList.add('hide-loading')
    const forecasts = [forecastData.current, ...forecastData.daily]
    Card(forecasts, locationData)
}

function Card(forecasts, locationData) {
    renderHeader(forecasts, locationData)
    renderFooter(forecasts)
    changeDay(forecasts)
}

function renderHeader(forecasts, locationData) {
    const cardHeader = document.querySelector('.js-card-header')
    cardHeader.innerHTML = `<div class="card-wrapper ">
    <img src=http://openweathermap.org/img/wn/${forecasts[0].weather[0].icon}@2x.png alt="" class="js-card-weather-icon"/>
    <h3 class="card-weather-degree js-celcius-unit">${FtoC(forecasts[0].temp)}</h3>
    <h3 class="card-weather-degree is-hidden js-fahrenheit-unit">${Math.round(forecasts[0].temp)}</h3>
    <div class="card-weather-units js-units">
    <span class="card-weather-unit is-active">°C</span>
    <span class="card-weather-unit js-fahrenheit-symbol">°F</span>
    </div>
        <div class="card-weather-info">
            <span class="js-weather-cloudiness">Cloudiness: ${forecasts[0].clouds}%</span>
            <span class="js-weather-humidity">Humidity: ${forecasts[0].humidity}%</span>
            <span class="js-weather-wind">Wind: ${MtoKM(forecasts[0].wind_speed)} km/h</span>
        </div>
    </div>
    <div>
    <h2 class="card-weather-location">${locationData.city ?? locationData.name}, ${locationData.country_code2 ?? locationData.sys.country}</h2>
    <h4 class="card-weather-description js-weather-desc">${forecasts[0].weather[0].description}</h4>
    </div>
    `
    changeUnit()
}

function renderFooter(forecasts) {
    const cardFooter = document.querySelector('.js-card-footer')
    cardFooter.innerHTML = `<div class="card-weather-day js-card-weather-day" data-date=${forecasts[0].dt}>
    <h3 class="card-weather-day-name" >Now</h3>
        <img src=http://openweathermap.org/img/wn/${forecasts[0].weather[0].icon}.png alt=""/>
        <div class="card-weather-degrees"->
        <h4 class="card-weather-daily-temp">${FtoC(forecasts[0].temp)}°</h4>
        </div>
    </div>
    ${forecasts.slice(2, 9).map(daily => {
        return `<div class="card-weather-day js-card-weather-day" data-date=${daily.dt}>
        <h3 class="card-weather-day-name">${getDayName(daily.dt)}</h3>
        <img src=http://openweathermap.org/img/wn/${daily.weather[0].icon}.png alt=""/>
        <div class="card-weather-degrees"->
        <h4 class="card-weather-daily-temp">${FtoC(daily.temp.max)}°</h4>
        </div>
        </div>`}).join('')}`
}

function changeUnit() {
    const units = document.querySelector('.js-units');
    const celciusUnit = document.querySelector('.js-celcius-unit')
    const fahrenheitUnit = document.querySelector('.js-fahrenheit-unit')

    units.addEventListener('click', (e) => {
        if (e.target.classList.contains('card-weather-unit')) {
            removeActiveClass(document.querySelectorAll('.card-weather-unit'))
            e.target.classList.add('is-active')
            if (e.target.classList.contains('js-fahrenheit-symbol')) {
                fahrenheitUnit.classList.remove('is-hidden')
                celciusUnit.classList.add('is-hidden')
            } else {
                fahrenheitUnit.classList.add('is-hidden')
                celciusUnit.classList.remove('is-hidden')
            }
        }
    })
}

function changeDay(forecasts) {
    const cardDays = document.querySelectorAll('.js-card-weather-day');
    const celciusUnit = document.querySelector('.js-celcius-unit');
    const fahrenheitUnit = document.querySelector('.js-fahrenheit-unit');
    const weatherIcon = document.querySelector('.js-card-weather-icon');
    const weatherCloudiness = document.querySelector('.js-weather-cloudiness');
    const weatherHumidity = document.querySelector('.js-weather-humidity');
    const weatherWind = document.querySelector('.js-weather-wind');
    const weatherDesc = document.querySelector('.js-weather-desc')

    cardDays[0].classList.add('is-active');
    cardDays.forEach(day => {
        day.addEventListener('click', () => {
            removeActiveClass(cardDays);
            day.classList.add('is-active');
            if (day.classList.contains('is-active')) {
                const selectedDay = forecasts.find(d => d.dt === +day.dataset.date)
                celciusUnit.textContent = day.children[2].children[0].textContent.replace('°', '')
                fahrenheitUnit.textContent = CtoF(+celciusUnit.textContent)
                weatherIcon.src = `http://openweathermap.org/img/wn/${selectedDay.weather[0].icon}@2x.png`
                weatherCloudiness.textContent = `Cloudiness: ${selectedDay.clouds}%`
                weatherHumidity.textContent = `Humidity: ${selectedDay.humidity}%`
                weatherWind.textContent = `Wind: ${selectedDay.wind_speed}`
                weatherDesc.textContent = selectedDay.weather[0].description
            }
        })
    })
}

function searchCity() {
    const form = document.querySelector('.js-form')
    const searchTerm = document.querySelector('.js-input')
    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        if (searchTerm.value === '' || searchTerm.value === undefined) return alert('please fill search term')
        const locationData = await fetchData(`https://api.openweathermap.org/data/2.5/weather?q=${searchTerm.value}&appid=${OPENWEATHERMAPAPIKEY}`)
        if (+locationData.cod === 404) return alert('city not found')
        const forecastData = await fetchData(`https://api.openweathermap.org/data/2.5/onecall?lat=${locationData.coord.lat}&lon=${locationData.coord.lon}&units=imperial&exclude=minutely,hourly,alerts&appid=${OPENWEATHERMAPAPIKEY}`);
        const forecasts = [forecastData.current, ...forecastData.daily]

        Card(forecasts, locationData)

        searchTerm.value = ''
    })
}


function removeActiveClass(elements) {
    elements.forEach(el => el.classList.remove('is-active'))
}
function FtoC(F) {
    const c = (F - 32) * 5 / 9
    return Math.round(c);
}

function CtoF(C) {
    const f = C * 9 / 5 + 32
    return Math.round(f)
}

function MtoKM(M) {
    const km = M * 1.60934
    return Math.round(km)
}

function getDayName(forecastDate) {
    const unixDate = forecastDate * 1000
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const date = new Date(unixDate);
    const dayName = days[date.getDay()];
    return dayName;
}

getData()
searchCity()