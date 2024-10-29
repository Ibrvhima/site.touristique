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

//Recuperation des  elements du formulaire
const form = document.querySelector(".form");
const containerSites = document.querySelector(".sites");
const inputType = document.querySelector(".form__input--type");
const inputNomSite = document.querySelector(".form__input--nom");
const inputRegion = document.querySelector(".form__input--region");
const inputVille = document.querySelector(".form__input--ville");
const inputAltitude = document.querySelector(".form__input--altitude");
const inputSuperficie = document.querySelector(".form__input--superficie");
const btn = document.querySelectorAll(".form__btn")


////////////// L'architecture principale de l'application
class App {
  #map;
  #mapEvent;
  #mapZoomLevel = 13;
  #sites = [];

  constructor() {
    // Get user's position
    this._getPosition();

    // Get data from local storage
    this._getLocalStorage();

    form.addEventListener("submit", this._newSite.bind(this));

    inputType.addEventListener("change", function (e) {
      inputElevation
        .closest(".form__row")
        .classList.toggle("form__row--hidden");
      inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    });

    containersites.addEventListener("click", this._moveToPopup.bind(this));
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

    this.#sites.forEach((site) => {
      this._renderSiteMarker(site);
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

  _newsite(ev) {
    ev.preventDefault();

    const validInputs = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every((inp) => inp > 0);

    const { lat, lng } = this.#mapEvent.latlng;

    // Get data from form
    const type = inputType.value;
    const distance = Number(inputDistance.value);
    const duration = Number(inputDuration.value);

    let site;

    // if site running, create running object
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

      site = new Running([lat, lng], distance, duration, cadence);
    }

    // if site cycling, create cycling object
    if (type === "cycling") {
      const elevationGain = Number(inputElevation.value);
      // Check if data is valid
      if (
        !validInputs(distance, duration, elevationGain) ||
        !allPositive(distance, duration)
      ) {
        return alert("Inputs have to be a positif number!");
      }

      site = new Cycling([lat, lng], distance, duration, elevationGain);
    }

    // Add new object to site array
    this.#sites.push(site);

    // Render site on map as marker
    this._rendersiteMarker(site);

    // Render site on List
    this._rendersite(site);

    // Hide form + clear input fields
    this._hideForm();

    // Set local storage to all sites
    this._setLocalStorage();
  }

  _rendersiteMarker(site) {
    L.marker(site.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          minWidth: 250,
          maxWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${site.type}-popup`,
        })
      )
      .setPopupContent(
        `${site.type === "running" ? "🏃🏾" : "🚴🏾"} ${site.description}`
      )
      .openPopup();
  }

  _rendersite(site) {
    let html = `
      <li class="site site--${
        site.type === "running" ? "running" : "cycling"
      }" data-id="${site.id}">
          <h2 class="site__title">${site.description}</h2>
          <div class="site__details">
            <span class="site__icon">${
              site.type === "running" ? "🏃🏾" : "🚴🏾"
            }</span>
            <span class="site__value">${site.distance}</span>
            <span class="site__uni🏃🏾t">km</span>
          </div>
          <div class="site__details ">
            <span class="site__icon">⏱</span>
            <span class="site__value">${site.duration}</span>
            <span class="site__unit">min</span>
          </div>
        
    `;

    if (site.type === "running") {
      html += `
      <div class="site__details">
            <span class="site__icon">⚡️</span>
            <span class="site__value">${site.pace.toFixed(1)}</span>
            <span class="site__unit">min/km</span>
          </div>
          <div class="site__details">
            <span class="site__icon">🦶🏼</span>
            <span class="site__value">${site.cadence}</span>
            <span class="site__unit">spm</span>
          </div>
        </li>`;
    }

    if (site.type === "cycling") {
      html += `
      <div class="site__details">
            <span class="site__icon">⚡️</span>
            <span class="site__value">${site.speed.toFixed(1)}</span>
            <span class="site__unit">km/h</span>
          </div>
          <div class="site__details">
            <span class="site__icon">⛰</span>
            <span class="site__value">${site.elevationGain}</span>
            <span class="site__unit">m</span>
          </div>
        </li>`;
    }

    form.insertAdjacentHTML("afterend", html);
  }

  _moveToPopup(e) {
    const siteEl = e.target.closest(".site");

    if (!siteEl) return;

    const site = this.#sites.find((work) => {
      return Number(siteEl.dataset.id) === work.id;
    });

    this.#map.setView(site.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    // site.click();
  }

  _setLocalStorage() {
    localStorage.setItem("sites", JSON.stringify(this.#sites));
  }

  _getLocalStorage() {
    const sites = JSON.parse(localStorage.getItem("sites"));

    if (!sites) return;

    this.#sites = sites;

    this.#sites.forEach((site) => {
      this._rendersite(site);
    });
  }

  reset() {
    localStorage.removeItem("sites");
    location.reload();
  }
}

const app = new App();
