"use strict";

// Application Data
// La classe parente
class Sites {
	constructor(nom, coords, region, ville) {
		this.nom = nom;
		this.coords = coords;
		this.region = region;
		this.ville = ville;
	}
}

//************************les classes enfantes********************/
// Les montagnes
class Mountains extends Sites {
	type = "montains";
	constructor(nom, coords, region, ville, altitude) {
		super(nom, coords, region, ville);
		this.altitude = altitude;
	}
}

//les chute
class Falls extends Sites {
	type = "falls";
	constructor(nom, coords, region, ville, altitude) {
		super(nom, coords, region, ville);
		this.altitude = altitude;
	}
}

// Les musées
class Museums extends Sites {
	type = "museums";
	constructor(nom, coords, region, ville, superficie) {
		super(nom, coords, region, ville);
		this.superficie = superficie;
	}
}

// Les plages
class Beaches extends Sites {
	type = "beaches";
	constructor(nom, coords, region, ville, superficie) {
		super(nom, coords, region, ville);
		this.superficie = superficie;
	}
}

// Les monuments
class Monuments extends Sites {
	type = "monuments";
	constructor(nom, coords, region, ville, superficie) {
		super(nom, coords, region, ville);
		this.superficie = superficie;
	}
}

// Les parcs nationaux
class NationalPark extends Sites {
	type = "national_park";
	constructor(nom, coords, region, ville, superficie) {
		super(nom, coords, region, ville);
		this.superficie = superficie;
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
const siteInfoContainer = document.getElementById("siteHistory");
const historiqueSite = document.querySelector('.site_history')


////////////// L'architecture principale de l'application

class App {
	#map;
	#mapEvent;

	//creation d'icone de site tourists
	icons = {
		montains: L.icon({
			iconUrl: "icons/mountain.png",
			iconSize: [38, 45],
			iconAnchor: [22, 45],
			popupAnchor: [-3, -45],
		}),

		museums: L.icon({
			iconUrl: "icons/museum.png",
			iconSize: [38, 45],
			iconAnchor: [22, 45],
			popupAnchor: [-3, -45],
		}),
		beaches: L.icon({
			iconUrl: "icons/beach.png",
			iconSize: [38, 45],
			iconAnchor: [22, 45],
			popupAnchor: [-3, -45],
		}),

		national_park: L.icon({
			iconUrl: "icons/national-park.png",
			iconSize: [38, 45],
			iconAnchor: [22, 45],
			popupAnchor: [-3, -45],
		}),

		falls: L.icon({
			iconUrl: "icons/fall.png",
			iconSize: [38, 45],
			iconAnchor: [22, 45],
			popupAnchor: [-3, -45],
		}),

		monuments: L.icon({
			iconUrl: "icons/monument.png",
			iconSize: [38, 45],
			iconAnchor: [22, 45],
			popupAnchor: [-3, -45],
		}),
	};

	constructor() {
		this.Sites = [];
		//this._clearLocalStorage();
		this._LoadMap();
		this.#map.on("click", this._showForm.bind(this));
	

		form.addEventListener("submit", this.newSite.bind(this));
		inputType.addEventListener("change", this._toogleInputAltitude.bind(this));

		this._getLocalStorage();

		containerSites.addEventListener("click", this._moveToPopup.bind(this));

		//l'evevenements pour le telechargement des donnees
		document
			.getElementById("downloadData")
			.addEventListener("click", this.exportToJson.bind(this));

		//L'evenement pour importer les donnees
		document
			.getElementById("importButton")
			.addEventListener("click", this.importFromJsonFile.bind(this));
	}

	//Les methondes
	_LoadMap() {
		// L'affichage de la carte de la Guinée
		const coords = [10.1215191, -13.160742];

		this.#map = L.map("map").setView(coords, 7);

		L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(this.#map);
	}
	// Affichage du formulaire et ajout des marqueurs au clic sur la carte
	_showForm(e) {
		this.#mapEvent = e;
		form.classList.remove("hidden");
		inputNomSite.focus();
	}


	// *******Ici on cree tous les sites**************************************
	newSite(ev) {
		ev.preventDefault();

		//Fonction pour capitaliser la premiere letre de chaque mot
		function capitalizeWords(input) {
			return input
				.trim() // Supprime les espaces en début et fin
				.toLowerCase() // Met tout en minuscules
				.replace(/\b\w/g, (char) => char.toUpperCase()); // Met la première lettre de chaque mot en majuscule
		}

		const { lat, lng } = this.#mapEvent.latlng;
		const type = inputType.value.trim();
		const nom = capitalizeWords(inputNomSite.value.trim());
		const region = capitalizeWords(inputRegion.value.trim());
		const ville = capitalizeWords(inputVille.value.trim());

		// Expression régulière pour validation des champs texte uniquement (lettres et espaces)
		const textOnlyRegex = /^[a-zA-Z\s]+$/;

		// Validation des champs texte uniquement
		if (!textOnlyRegex.test(nom))
			return alert("Erreur : Le nom du site doit contenir uniquement des lettres.");
		if (!textOnlyRegex.test(region))
			return alert("Erreur : La région doit contenir uniquement des lettres.");
		if (!textOnlyRegex.test(ville))
			return alert("Erreur : La ville doit contenir uniquement des lettres.");

		let site;
		//vallidation des données
		if (type === "montains" || type === "falls") {
			const altitude = +inputAltitude.value;
			if (!altitude) return alert("Erreur : Altitude invalide");
			site =
				type === "montains"
					? new Mountains(nom, [lat, lng], region, ville, altitude)
					: new Falls(nom, [lat, lng], region, ville, altitude);
		} else {
			const superficie = +inputSuperficie.value;
			if (!superficie) return alert("Erreur : Superficie invalide");
			site =
				type === "museums"
					? new Museums(nom, [lat, lng], region, ville, superficie)
					: type === "beaches"
					? new Beaches(nom, [lat, lng], region, ville, superficie)
					: type === "monuments"
					? new Monuments(nom, [lat, lng], region, ville, superficie)
					: new NationalPark(nom, [lat, lng], region, ville, superficie);
		}
		this.Sites.push(site);

		// Affiche le marqueur et ajoute l'historique
		this._renderSiteMarker(site);
		this.renderSiteHistory(site);

		// Vider les champs du formulaire
		inputNomSite.value =
			inputRegion.value =
			inputVille.value =
			inputAltitude.value =
			inputSuperficie.value =
				"";

		// Masquer le formulaire
		form.classList.add("hidden");
   

    
		// Sauvegarder dans le localStorage
		this._setLocalStorage();
	}

	_toogleInputAltitude() {
		if (inputType.value === "montains" || inputType.value === "falls") {
			inputAltitude.closest(".form__row").classList.remove("hidden");
			inputSuperficie.closest(".form__row").classList.add("hidden");
		} else {
			inputAltitude.closest(".form__row").classList.add("hidden");
			inputSuperficie.closest(".form__row").classList.remove("hidden");
		}
	}

	_setLocalStorage() {
		localStorage.setItem("sites", JSON.stringify(this.Sites));
	}
  

	_renderSiteMarker(site) {
		const icon = this.icons[site.type] || this.icons["default"];

		L.marker(site.coords, { icon })
			.addTo(this.#map)
			.bindPopup({ autoClose: false, closeOnClick: false })
			.setPopupContent(`${site.nom} (${site.type})`)
			.openPopup();
	}

	_attachSiteActions(site) {
		const siteElement = siteInfoContainer.querySelector(
			`.siteout[data-id="${site.nom}"]`
		);
		const deleteButton = siteElement.querySelector(".delete-site");

		// Action de suppression
		deleteButton.addEventListener("click", () => this.deleteSite(site));
	}

	
	// Méthode de suppression mise à jour
deleteSite(site) {
    // Supprimer le site du tableau de données
    this.Sites = this.Sites.filter((s) => s.nom !== site.nom);

    // Mettre à jour le localStorage
    this._setLocalStorage();

    // Supprimer dynamiquement l'élément correspondant dans l'interface
    const siteElement = siteInfoContainer.querySelector(`.siteout[data-id="${site.nom}"]`);
    if (siteElement) {
        siteElement.remove(); // Supprime l'élément de l'interface
    }

    // Supprimer le marqueur correspondant sur la carte
    this._removeSiteMarker(site);
}

// Nouvelle méthode pour supprimer le marqueur d'un site sur la carte
_removeSiteMarker(site) {
    // Parcourt tous les marqueurs pour trouver et supprimer celui correspondant au site supprimé
    this.#map.eachLayer((layer) => {
        if (layer instanceof L.Marker && layer.getLatLng().equals(site.coords)) {
            this.#map.removeLayer(layer);
        }
    });
}

	// Méthode pour afficher tous les sites après modification ou suppression
	renderSiteHistory(site) {
		const icons = {
			montains: "🏔️",
			falls: "🌊",
			museums: "🏛️",
			beaches: "🏖️",
			monuments: "🗽",
			national_park: "🌳",
		};

		const icon = icons[site.type];
		const html = `
        <li class="siteout siteout--${site.type}" data-id="${site.nom}">
          <div class="icon">
          ${icon}
          
          </div>
          <h2>${site.nom}</h2>
          <div class="details">
            
            <div class="adress"><ion-icon name="location-outline"></ion-icon> ${
					site.region
				}</div>
            <div class="adress"><ion-icon name="navigate-circle-outline"></ion-icon> ${
					site.ville
				}</div>
            
            ${
					site.altitude
						? `<div class="altitude"><ion-icon name="prism-outline"></ion-icon> ${site.altitude} m</div>`
						: ""
				}

             ${
						site.superficie
							? `<div class="altitude"><ion-icon name="prism-outline"></ion-icon> ${site.superficie} m²</div>`
							: ""
					}
           
          </div>
          <div class="site-actions">
           
            <button class="delete-site" title="Supprimer"><ion-icon name="trash-outline" class="icon-delete"></ion-icon></button>
          </div>
        </li>
      `;

		siteInfoContainer.insertAdjacentHTML("beforeend", html);

		// Associer les événements de modification et suppression
		this._attachSiteActions(site);

	}
  //Deplacement des pins
  _moveToPopup(e) {
    const siteEl = e.target.closest(".siteout");

    if (!siteEl) return;

    const siteNom = siteEl.dataset.id;
    const site = this.Sites.find((s) => s.nom === siteNom);

    if (!site) return;

    let zoomLevel = this.#map.getZoom();
    const targetZoom = 15;

    const zoomIn = () => {
        if (zoomLevel < targetZoom) {
            zoomLevel++;
            this.#map.setView(site.coords, zoomLevel, {
                animate: true,
                pan: {
                    duration: 1,
                },
            });
           
        }
    };

    zoomIn();
}

	//methode pour l'exportation des données dans un fichier json
	exportToJson() {
		const data = localStorage.getItem("sites");
		if (!data) return alert("Aucune donnée disponible pour l'exportation");

		// Convertir les données en un Blob JSON
		const blob = new Blob([data], { type: "application/json" });
		const url = URL.createObjectURL(blob);

		// Créer un élément <a> pour déclencher le téléchargement
		const link = document.createElement("a");
		link.href = url;
		link.download = "sites_data.json"; // Nom du fichier de téléchargement
		link.click();

		// Libérer l'URL
		URL.revokeObjectURL(url);
	}

	//Methode pour importer les donnees

	importFromJsonFile() {
		const input = document.getElementById("jsonFileInput");

		// Ouvrir la boîte de dialogue de fichier
		input.click();

		// Gérer le changement de fichier
		input.addEventListener("change", () => {
			const file = input.files[0];
			if (!file) return alert("Aucun fichier sélectionné");

			const reader = new FileReader();
			reader.onload = () => {
				try {
					const data = JSON.parse(reader.result);
					if (!Array.isArray(data)) throw new Error("Données de fichier invalides");

					// Mettre à jour le localStorage avec les nouvelles données
					localStorage.setItem("sites", JSON.stringify(data));

					// Mettre à jour l'affichage de la carte et de l'historique
					this.Sites = [];
					data.forEach((siteData) => {
						let site;
						switch (siteData.type) {
							case "montains":
								site = new Mountains(
									siteData.nom,
									siteData.coords,
									siteData.region,
									siteData.ville,
									siteData.altitude
								);
								break;
							case "falls":
								site = new Falls(
									siteData.nom,
									siteData.coords,
									siteData.region,
									siteData.ville,
									siteData.altitude
								);
								break;
							case "museums":
								site = new Museums(
									siteData.nom,
									siteData.coords,
									siteData.region,
									siteData.ville,
									siteData.superficie
								);
								break;
							case "beaches":
								site = new Beaches(
									siteData.nom,
									siteData.coords,
									siteData.region,
									siteData.ville,
									siteData.superficie
								);
								break;
							case "monuments":
								site = new Monuments(
									siteData.nom,
									siteData.coords,
									siteData.region,
									siteData.ville,
									siteData.superficie
								);
								break;
							case "national_park":
								site = new NationalPark(
									siteData.nom,
									siteData.coords,
									siteData.region,
									siteData.ville,
									siteData.superficie
								);
								break;
						}

						this.Sites.push(site);
						this._renderSiteMarker(site);
						this.renderSiteHistory(site);
					});

					alert("Données importées avec succès!");
				} catch (error) {
					alert("Erreur lors de l'importation des données : " + error.message);
				}
			};

			reader.readAsText(file);
		});
	}

	_getLocalStorage() {
		const data = JSON.parse(localStorage.getItem("sites"));
		if (!data) return;

		// Réinitialiser le tableau des sites et recréer chaque site
		this.Sites = data.map((siteData) => {
			let site;
			switch (siteData.type) {
				case "montains":
					site = new Mountains(
						siteData.nom,
						siteData.coords,
						siteData.region,
						siteData.ville,
						siteData.altitude
					);
					break;
				case "falls":
					site = new Falls(
						siteData.nom,
						siteData.coords,
						siteData.region,
						siteData.ville,
						siteData.altitude
					);
					break;
				case "museums":
					site = new Museums(
						siteData.nom,
						siteData.coords,
						siteData.region,
						siteData.ville,
						siteData.superficie
					);
					break;
				case "beaches":
					site = new Beaches(
						siteData.nom,
						siteData.coords,
						siteData.region,
						siteData.ville,
						siteData.superficie
					);
					break;
				case "monuments":
					site = new Monuments(
						siteData.nom,
						siteData.coords,
						siteData.region,
						siteData.ville,
						siteData.superficie
					);
					break;
				case "national_park":
					site = new NationalPark(
						siteData.nom,
						siteData.coords,
						siteData.region,
						siteData.ville,
						siteData.superficie
					);
					break;
			}

			// Affiche le marqueur sur la carte
			this._renderSiteMarker(site);
			this.renderSiteHistory(site);
			return site;
		});
	}

	searchSite() {
		const searchInput = document.getElementById("searchInput").value.toLowerCase();
		const storedSites = JSON.parse(localStorage.getItem("sites")) || [];

		// Filtrer les sites en fonction de la recherche
		const filteredSites = storedSites.filter(
			(site) =>
				site.nom.toLowerCase().includes(searchInput) ||
				site.region.toLowerCase().includes(searchInput) ||
				site.ville.toLowerCase().includes(searchInput)
		);

		// Vérifier si des résultats ont été trouvés
		if (filteredSites.length > 0) {
			// Afficher les résultats sur la carte
			this._displaySitesOnMap(filteredSites);
		} else {
			alert("Aucun site trouvé pour ce terme de recherche.");
		}
	}

	// Fonction pour afficher uniquement les sites filtrés sur la carte
	_displaySitesOnMap(sites) {
		// Supprimer les marqueurs existants de la carte
		this.#map.eachLayer((layer) => {
			if (layer instanceof L.Marker) this.#map.removeLayer(layer);
		});

		// Afficher les marqueurs pour les sites filtrés
		sites.forEach((site) => {
			this._renderSiteMarker(site);
		});
	}
}

const app = new App();
