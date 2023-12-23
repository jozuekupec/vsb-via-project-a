class App {
    _inputs = [];
    _formId = "weather-form";
    _rapidApiHost = "weatherapi-com.p.rapidapi.com";
    _ApiBaseURL = "https://weatherapi-com.p.rapidapi.com";
    _realtimeWeatherEndpoint = this._ApiBaseURL + "/current.json";
    _historyWeatherEndpoint = this._ApiBaseURL + "/history.json";
    _latitudeInputName = "latitude";
    _longitudeInputName = "longitude";

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

    fetchHistoryDate() {
        const settings = {
            async: true,
            crossDomain: true,
            url: this._historyWeatherEndpoint + '?q=48.8567%2C2.3508',
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

    generateDataForChart() {
        const data = [
            {
                x: 'Jan',
                temp: 100,
                windSpeed: 50,
                vis: 50
            },
            {
                x: 'Feb',
                temp: 120,
                windSpeed: 55,
                vis: 75
            },
            {
                x: 'Mar',
                temp: 100,
                windSpeed: 60,
                vis: 50
            }
        ];
        return data;
    }

    renderChart() {
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
        const chart = new Chart(chartElement, cfg);
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
        if (typeof latitude === "number") {
            this.setValidityState(this._inputs[this._latitudeInputName], true);
        } else {
            errors[this._latitudeInputName] = [];
            if (latitude === null) {
                errors[this._latitudeInputName].push("The field is required!");
            } else if (latitude === false) {
                errors[this._latitudeInputName].push("Not a number!");
            }

            validForm = false;
            latitude = 0;
            this.setValidityState(this._inputs[this._latitudeInputName], false);
        }

        longitude = this.validateNumberElement(this._inputs[this._longitudeInputName], true);
        if (typeof longitude === "number") {
            this.setValidityState(this._inputs[this._longitudeInputName], true);
        } else {
            errors[this._longitudeInputName] = [];
            if (longitude === null) {
                errors[this._longitudeInputName].push("The field is required!");
            } else if (longitude === false) {
                errors[this._longitudeInputName].push("Not a number!");
            }

            validForm = false;
            longitude = 0;
            this.setValidityState(this._inputs[this._longitudeInputName], false);
        }

        if (!validForm) {
            this.renderErrors(errors);
            return;
        }
        // this.fetchHistoryDate();
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

window.app = new App("063566bc2amshddc215a5b60ba7cp137d79jsn3eef728107ee");
