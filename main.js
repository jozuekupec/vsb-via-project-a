class App {
    /** @var {Chart|null} */
    _chart = null;
    _inputs = [];
    _oneDayInMilliseconds = 24 * 60 * 60 * 1000;
    _formId = "weather-form";
    _rapidApiHost = "weatherapi-com.p.rapidapi.com";
    _ApiBaseURL = "https://weatherapi-com.p.rapidapi.com";
    _realtimeWeatherEndpoint = this._ApiBaseURL + "/current.json";
    _historyWeatherEndpoint = this._ApiBaseURL + "/history.json";
    _latitudeInputName = "latitude";
    _longitudeInputName = "longitude";
    _location = {
        name: "",
        region: "",
        country: "",
    };
    /** @var {ForecastDay[]} */
    _forecastDays = [];

    /**
     * @param {string} apiKey
     */
    constructor(apiKey) {
        this._apiKey = apiKey;

        this._form = document.querySelector("#" + this._formId);
        this._inputs[this._latitudeInputName] = this._form.querySelector('#latitude');
        this._inputs[this._longitudeInputName] = this._form.querySelector('#longitude');
        this._submitButton = this._form.querySelector('button[type="submit"]');

        // this.fetchRealTimeDate();
        this.addEventListeners();
        this.renderChart();
    }

    fetchRealTimeDate() {
        const settings = {
            async: true,
            crossDomain: true,
            url: this._realtimeWeatherEndpoint + '?q=53.1%2C-0.13',
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': this._apiKey,
                'X-RapidAPI-Host': this._rapidApiHost
            }
        };

        $.ajax(settings).done(function (response) {
            console.log(response);
        });
    }

    /**
     * @param {number} latitude
     * @param {number} longitude
     * @param {number} daysBack
     */
    fetchHistoryDate(latitude, longitude, daysBack) {
        const params = new URLSearchParams();
        const endDate = new Date(Date.now() - this._oneDayInMilliseconds);
        const startDate = new Date(endDate.getTime() - daysBack * this._oneDayInMilliseconds);

        params.set("q", `${latitude},${longitude}`);
        params.set("dt", `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`);
        params.set("end_dt", `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`);
        params.set("lang", "cs");

        console.log("PARAMS", params.toString());

        const settings = {
            async: true,
            crossDomain: true,
            url: this._historyWeatherEndpoint + '?' + params.toString(),
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': this._apiKey,
                'X-RapidAPI-Host': this._rapidApiHost
            }
        };

        $.ajax(settings).done(response => {
            this.processHistoryResponse(response);
        });
    }

    /**
     * @param {Object} data
     */
    processHistoryResponse(data) {
        const forecast = data.forecast;
        const location = data.location;

        this._location.name = location.name;
        this._location.region = location.region;
        this._location.country = location.country;

        this._forecastDays = [];
        for (const forecastdayKey in forecast.forecastday) {
            this._forecastDays.push(new ForecastDay(
                forecast.forecastday[forecastdayKey].day.avgtemp_c,
                forecast.forecastday[forecastdayKey].day.maxwind_kph,
                forecast.forecastday[forecastdayKey].day.avgvis_km,
                new Date(forecast.forecastday[forecastdayKey].date)));
        }

        this.renderChart();
        this.renderLocation();
    }

    generateDataForChart() {
        let data = [];
        for (const forecastDaysKey in this._forecastDays) {
            const day = this._forecastDays[forecastDaysKey];
            data.push({
                x: day.date.getDate(),
                temp: day.avgTemperatureC,
                windSpeed: day.maxWindKph,
                vis: day.avgVisibilityKm
            });
        }

        return data;
    }

    renderChart() {
        if (this._chart !== null) {
            this._chart.destroy();
        }

        const data = this.generateDataForChart();
        const cfg = {
            type: 'line',
            data: {
                labels: Array.from(data).map(e => e.x),
                datasets: [{
                    label: 'Temperature',
                    data: data,
                    parsing: {
                        yAxisKey: 'temp'
                    }
                }, {
                    label: 'Max wind speed',
                    data: data,
                    parsing: {
                        yAxisKey: 'windSpeed'
                    }
                }, {
                    label: 'Visibility',
                    data: data,
                    parsing: {
                        yAxisKey: 'vis'
                    }
                }]
            },
        };

        const chartElement = document.querySelector("#weather-history-chart");
        this._chart = new Chart(chartElement, cfg);
    }

    renderLocation() {
        const locationName = document.querySelector('[data-location-name]');
        const locationCountry = document.querySelector('[data-location-country]');
        const locationRegion = document.querySelector('[data-location-region]');

        locationName.innerHTML = this._location.name;
        locationCountry.innerHTML = this._location.country;
        locationRegion.innerHTML = this._location.region;
    }

    /**
     * @param {Event} event
     */
    processForm(event) {
        event.preventDefault();
        let validForm = true;
        let latitude = 0;
        let longitude = 0;
        let errors = {};

        latitude = this.validateNumberElement(this._inputs[this._latitudeInputName], true);
        if (typeof latitude === "number" && this.isInRange(latitude, -90, 90)) {
            this.setValidityState(this._inputs[this._latitudeInputName], true);
        } else {
            errors[this._latitudeInputName] = [];
            if (latitude === null) {
                errors[this._latitudeInputName].push("The field is required!");
            } else if (latitude === false) {
                errors[this._latitudeInputName].push("Not a number!");
            } else {
                errors[this._latitudeInputName].push("Out of range <-90, 90>!");
            }

            validForm = false;
            latitude = 0;
            this.setValidityState(this._inputs[this._latitudeInputName], false);
        }

        longitude = this.validateNumberElement(this._inputs[this._longitudeInputName], true);
        if (typeof longitude === "number" && this.isInRange(longitude, -180, 180)) {
            this.setValidityState(this._inputs[this._longitudeInputName], true);
        } else {
            errors[this._longitudeInputName] = [];
            if (longitude === null) {
                errors[this._longitudeInputName].push("The field is required!");
            } else if (longitude === false) {
                errors[this._longitudeInputName].push("Not a number!");
            } else {
                errors[this._longitudeInputName].push("Out of range <-180, 180>!");
            }

            validForm = false;
            longitude = 0;
            this.setValidityState(this._inputs[this._longitudeInputName], false);
        }

        if (!validForm) {
            this.renderErrors(errors);
            return;
        }

        this.fetchHistoryDate(latitude, longitude, 6);
    }

    /**
     * @param {HTMLInputElement} element
     * @param {boolean} isRequired
     * @return {number|false|null}
     */
    validateNumberElement(element, isRequired) {

        if (isRequired && element.value.length === 0) {
            return null;
        }

        const result = Number.parseFloat(element.value);
        if (isNaN(result)) {
            return false
        }

        return result;
    }

    /**
     * @param value
     * @param {number} min
     * @param {number} max
     * @return {boolean}
     */
    isInRange(value, min, max) {
        return value >= min && value <= max;
    }

    /**
     * @param {Array<string, string[]>} errors
     */
    renderErrors(errors) {
        for (const elementName in errors) {
            const element = this._inputs[elementName];
            if (!element instanceof HTMLDivElement) {
                console.error("Input element NOT FOUND!");
                return;
            }
            const formElement = element.closest(".FormElement");
            if (!formElement instanceof HTMLDivElement) {
                console.error("FormElement NOT FOUND!");
                return;
            }
            const errorsElement = formElement.querySelector(".errors");
            if (!errorsElement instanceof HTMLDivElement) {
                console.error("Errors container NOT FOUND!");
                return;
            }
            const elementErrors = errors[elementName];

            errorsElement.innerHTML = ""; // Reset content
            for (const errorKey in elementErrors) {
                const paragraph = document.createElement("p");
                paragraph.innerText = elementErrors[errorKey];
                errorsElement.appendChild(paragraph);
            }
        }
    }

    /**
     * @param {HTMLDivElement} element
     * @param {boolean} valid
     */
    setValidityState(element, valid) {
        const formElement = element.closest(".FormElement");
        if (!formElement instanceof HTMLDivElement) {
            console.error("FormElement NOT FOUND!");
            return;
        }

        formElement.classList.remove("invalid", "valid"); // Remove previous states
        valid
            ? formElement.classList.add("valid")
            : formElement.classList.add("invalid");
    }

    addEventListeners() {
        this._submitButton.addEventListener('click', event => this.processForm(event));
    }
}

class ForecastDay {
    avgTemperatureC = 0;
    maxWindKph = 0;
    avgVisibilityKm = 0;
    date = new Date();

    constructor(avgtemp_c, maxwind_kph, avgvis_km, date) {
        this.avgTemperatureC = avgtemp_c;
        this.maxWindKph = maxwind_kph;
        this.avgVisibilityKm = avgvis_km;
        this.date = date;
    }
}

window.app = new App("063566bc2amshddc215a5b60ba7cp137d79jsn3eef728107ee");
