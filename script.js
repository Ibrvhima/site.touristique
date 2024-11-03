"use strict";

// Application Data
// La classe parente
class Sites {
  constructor(id, nom, coords, region, ville) {
    this.id = id;
    this.nom = nom;
    this.coords = coords;
    this.region = region;
    this.ville = ville;
  }
}

//************************les classes enfants********************/
// Les montagnes
class Mountains extends Sites {
  type = "mountains";
  constructor(id, nom, coords, region, ville, altitude) {
    super(id, nom, coords, region, ville);
    this.altitude = altitude;
  }
}

//les chute
class Falls extends Sites {
  type = "falls";
  constructor(id, nom, coords, region, ville, altitude) {
    super(id, nom, coords, region, ville);
    this.altitude = altitude;
  }
}

// Les musées
class Museums extends Sites {
  type = "museums";
  constructor(id, nom, coords, region, ville, ouverture, fermeture, tarifs) {
    super(id, nom, coords, region, ville);
    this.ouverture = ouverture;
    this.fermeture = fermeture;
    this.tarifs = tarifs;
  }
}

// Les plages
class Beaches extends Sites {
  type = "beaches";
  constructor(id, nom, coords, region, ville, ouverture, fermeture, tarifs) {
    super(id, nom, coords, region, ville);
    this.ouverture = ouverture;
    this.fermeture = fermeture;
    this.tarifs = tarifs;
  }
}

// Les monuments
class Monuments extends Sites {
  type = "monuments";
  constructor(id, nom, coords, region, ville, ouverture, fermeture, tarifs) {
    super(id, nom, coords, region, ville);
    this.ouverture = ouverture;
    this.fermeture = fermeture;
    this.tarifs = tarifs;
  }
}

// Les parcs nationaux
class NationalPark extends Sites {
  type = "national_park";
  constructor(id, nom, coords, region, ville, ouverture, fermeture, tarifs) {
    super(id, nom, coords, region, ville);
    this.ouverture = ouverture;
    this.fermeture = fermeture;
    this.tarifs = tarifs;
  }
}


// Récupération des éléments du formulaire
const form = document.querySelector(".form");
const containerSites = document.querySelector(".sites");
const inputType = document.querySelector(".form_input--type");
const inputNomSite = document.querySelector(".form_input--nom");
const inputRegion = document.querySelector(".form_input--region");
const inputVille = document.querySelector(".form_input--ville");
const inputAltitude = document.querySelector(".form_input--altitude");
const inputSuperficie = document.querySelector(".form_input--superficie");
const btn = document.querySelectorAll(".form_btn");



////////////// L'architecture principale de l'application

class App {
  #map;
  #mapEvent;
  constructor() {
    this._LoadMap();
    this.#map.on("click", this._showForm.bind(this)); 

    form.addEventListener("submit", this.newSite.bind(this))

    
  }

  //Les methondes
  _LoadMap() {
    // L'affichage de la carte de la Guinée
    const coords = [11.1779033, -12.7000269];

    this.#map = L.map('map').setView(coords, 7);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    L.marker([11.1779033, -12.7000269])
      .addTo(this.#map)
      .bindPopup({
        maxwidth: 250,
        maxwidth: 100,
        autclose: false,
        closeOnClick: false,
      })
      .setPopupContent("Merveilles de guinée")
      .openPopup();


  }

  _showForm() {
    this.#mapEvent = e;
      //const { lat, lng } = e.latlng;

      form.classList.remove("hidden");
      inputNomSite.focus();
    // Affichage du formulaire et ajout des marqueurs au clic sur la carte
     
  }

  _toogleInputAltitude() {
    inputType.addEventListener("change", function (e) {
      e.preventDefault();

      const selectedValue = inputType.value;
      if (selectedValue === "mountains" || selectedValue === "falls") {
        inputSuperficie.closest(".form__row").classList.add("form_row--hidden");
        inputAltitude
          .closest(".form__row")
          .classList.remove("form_row--hidden");
      } else {
        inputSuperficie
          .closest(".form__row")
          .classList.remove("form_row--hidden");
        inputAltitude.closest(".form__row").classList.add("form_row--hidden");
      }
    });
  }

  newSite() { 
    // Soumission du formulaire
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      const { lat, lng } = this.#mapEvent.latlng;

      //recuperation des données
      const type = inputType.value;


      //validation des données


      //si le select est mountain de creée un objet mountain
      if(type === "mountains" || type === "falls"){
      const altitude = Number(inputAltitude)


      }

      //si le select est museums de creée un objet museums
      if(type === "museums" || type === "beaches" || type === "monuments" || type === "national_park"){
      const superficie = Number(inputSuperficie)

        
      }


      //afficher le type de site sur la carte
      L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup({
        maxWidth: 250,
        maxHeight: 100,
        autoClose: false,
        closeOnClick: false,
      })
      .setPopupContent("Merveilles de Guinée")
      .openPopup();

      //afficher le type de site sur  la  liste du sidbare

      //vider les champ de saisie puis masquer le formulaire


     

      // Nettoyage des champs du formulaire
      inputNomSite.value = "";
      inputRegion.value = "";
      inputVille.value = "";
      inputAltitude.value = "";
      inputSuperficie.value = "";

      // Masquage du formulaire après la soumission
      form.classList.add("hidden");
    });
  }
}

//Instantiation de la classe App

const app = new App()

