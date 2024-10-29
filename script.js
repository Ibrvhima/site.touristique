"use strict";

// Application Data
//La classe parente
class Sites {
  constructor(id, nom, coords, region, ville) {
    (this.id = id),
      (this.nom = nom),
      (this.coords = coords),
      (this.region = region),
      (this.ville = ville);
    this.itineraire();
  }
}

//************************les classes enfants******************** */
//Les montagnes
class Mountains extends Sites {
  type = "mountains";
  constructor(id, nom, coords, region, ville, altitude) {
    super(id, nom, coords, region, ville);
    this.altitude = altitude;
  }
}

//les musées
class Museums extends Sites {
  type = "museums";
  constructor(id, nom, coords, region, ville, ouverture, fermeture, tarifs) {
    super(id, nom, coords, region, ville);
    (this.ouverture = ouverture),
      (this.fermeture = fermeture),
      (this.tarifs = tarifs);
  }
}

//les plages
class Beaches extends Sites {
  type = "beaches";
  constructor(id, nom, coords, region, ville, ouverture, fermeture, tarifs) {
    super(id, nom, coords, region, ville);
    (this.ouverture = ouverture),
      (this.fermeture = fermeture),
      (this.tarifs = tarifs);
  }
}

//les monuments
class Monuments extends Sites {
  type = "monuments";
  constructor(id, nom, coords, region, ville, ouverture, fermeture, tarifs) {
    super(id, nom, coords, region, ville);
    (this.ouverture = ouverture),
      (this.fermeture = fermeture),
      (this.tarifs = tarifs);
  }
}

//les parc national
class NationalPark extends Sites {
  type = "national_park";
  constructor(id, nom, coords, region, ville, ouverture, fermeture, tarifs) {
    super(id, nom, coords, region, ville);
    (this.ouverture = ouverture),
      (this.fermeture = fermeture),
      (this.tarifs = tarifs);
  }
}

/// Application Architecture

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".sites");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class App {
  #map;
  #mapEvent;
  #mapZoomLevel = 13;
  #workouts = [];

  constructor() {
    // Get user's position
    this._getPosition();

    // Get data from local storage
    this._getLocalStorage();

    form.addEventListener("submit", this._newWorkout.bind(this));

    inputType.addEventListener("change", function (e) {
      inputElevation
        .closest(".form__row")
        .classList.toggle("form__row--hidden");
      inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    });

    containerWorkouts.addEventListener("click", this._moveToPopup.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Could not get your current location!");
        }
      );
    }
  }

  _loadMap(position) {
    const { longitude, latitude } = position.coords;

    const coords = [latitude, longitude];

    this.#map = L.map("map").setView(coords, this.#mapZoomLevel);

    L.tileLayer("https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    L.marker(coords)
      .addTo(this.#map)
      .bindPopup("A pretty CSS popup.<br> Easily customizable.")
      .openPopup();

    this.#map.on("click", this._showForm.bind(this));

    this.#workouts.forEach((workout) => {
      this._renderWorkoutMarker(workout);
    });
  }

  _showForm(e) {
    this.#mapEvent = e;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";

    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => {
      form.style.display = "grid";
    }, 500);
  }

  _newWorkout(ev) {
    ev.preventDefault();

    const validInputs = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every((inp) => inp > 0);

    const { lat, lng } = this.#mapEvent.latlng;

    // Get data from form
    const type = inputType.value;
    const distance = Number(inputDistance.value);
    const duration = Number(inputDuration.value);

    let workout;

    // if workout running, create running object
    if (type === "running") {
      const cadence = Number(inputCadence.value);
      // Check if data is valid
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)

        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      ) {
        return alert("Inputs have to be a positif number!");
      }

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // if workout cycling, create cycling object
    if (type === "cycling") {
      const elevationGain = Number(inputElevation.value);
      // Check if data is valid
      if (
        !validInputs(distance, duration, elevationGain) ||
        !allPositive(distance, duration)
      ) {
        return alert("Inputs have to be a positif number!");
      }

      workout = new Cycling([lat, lng], distance, duration, elevationGain);
    }

    // Add new object to workout array
    this.#workouts.push(workout);

    // Render workout on map as marker
    this._renderWorkoutMarker(workout);

    // Render workout on List
    this._renderWorkout(workout);

    // Hide form + clear input fields
    this._hideForm();

    // Set local storage to all workouts
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          minWidth: 250,
          maxWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === "running" ? "🏃🏾" : "🚴🏾"} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
      <li class="workout workout--${
        workout.type === "running" ? "running" : "cycling"
      }" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === "running" ? "🏃🏾" : "🚴🏾"
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__uni🏃🏾t">km</span>
          </div>
          <div class="workout__details ">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
        
    `;

    if (workout.type === "running") {
      html += `
      <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
    }

    if (workout.type === "cycling") {
      html += `
      <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;
    }

    form.insertAdjacentHTML("afterend", html);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest(".workout");

    if (!workoutEl) return;

    const workout = this.#workouts.find((work) => {
      return Number(workoutEl.dataset.id) === work.id;
    });

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    // workout.click();
  }

  _setLocalStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const workouts = JSON.parse(localStorage.getItem("workouts"));

    if (!workouts) return;

    this.#workouts = workouts;

    this.#workouts.forEach((workout) => {
      this._renderWorkout(workout);
    });
  }

  reset() {
    localStorage.removeItem("workouts");
    location.reload();
  }
}

const app = new App();
