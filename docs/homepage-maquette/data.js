/* Maquette jetable de la homepage : projets, ambiances et textes. */
(function () {
	"use strict";

	const FAVICON = "../../apps/client/public/favicon/";

	const LOREM = [
		"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus, posuere velit aliquet.",
		"Sed posuere consectetur est at lobortis. Maecenas faucibus mollis interdum, nulla vitae elit libero, a pharetra augue.",
		"Cras mattis consectetur purus sit amet fermentum. Donec ullamcorper nulla non metus auctor fringilla, vestibulum id ligula porta.",
		"Vestibulum id ligula porta felis euismod semper. Aenean lacinia bibendum nulla sed consectetur, cum sociis natoque penatibus.",
		"Curabitur blandit tempus porttitor. Etiam porta sem malesuada magna mollis euismod, vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.",
		"Nullam quis risus eget urna mollis ornare vel eu leo. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.",
	];

	function facts(offset) {
		return [
			{ title: "À quoi ça sert", text: LOREM[offset % 6] },
			{ title: "Pour qui", text: LOREM[(offset + 2) % 6] },
			{ title: "Comment ça marche", text: LOREM[(offset + 4) % 6] },
		];
	}

	// Une ambiance par projet : polices, formes, couleurs en clair et en sombre.
	// blobs : les 4 couleurs de la lampe à lave. overlay : le fond animé propre au projet.
	const ambiances = {
		citadel: {
			fonts: { display: '"Unbounded", sans-serif', body: '"Outfit", sans-serif' },
			weight: 700,
			radius: 12,
			cut: 0,
			tracking: 0.04,
			titleCase: "none",
			overlay: null,
			transition: "hex",
			dark: {
				bg: "#100d1c",
				text: "#f6f3ff",
				muted: "#b9b2d9",
				accent: "#ff5bd1",
				accentText: "#1a0016",
				surface: "#1d1933",
				line: "#3b3560",
				blobs: ["#7b2ff7", "#f107a3", "#00b8f0", "#ff7a45"],
			},
			light: {
				bg: "#f5f1ea",
				text: "#18142b",
				muted: "#5a5476",
				accent: "#c0137f",
				accentText: "#ffffff",
				surface: "#ffffff",
				line: "#d9d1e6",
				blobs: ["#9b6bff", "#ff4fb5", "#3fd2ff", "#ffa06b"],
			},
		},
		gameDeathCounter: {
			fonts: { display: '"Cinzel", serif', body: '"EB Garamond", serif' },
			weight: 700,
			radius: 0,
			cut: 0,
			tracking: 0.1,
			titleCase: "uppercase",
			overlay: "embers",
			transition: "fire",
			dark: {
				bg: "#0b0807",
				text: "#f2e6d8",
				muted: "#b29c86",
				accent: "#ff7a1a",
				accentText: "#1a0b02",
				surface: "#1a1310",
				line: "#3d2c22",
				blobs: ["#e8510a", "#f59e0b", "#9f1d0b", "#ffbe55"],
			},
			light: {
				bg: "#f2ebe0",
				text: "#21160f",
				muted: "#6e5a49",
				accent: "#c2410c",
				accentText: "#ffffff",
				surface: "#fffaf3",
				line: "#dccbb6",
				blobs: ["#f97316", "#fbbf24", "#dc2626", "#fdba74"],
			},
		},
		backlog: {
			fonts: { display: '"Nunito", sans-serif', body: '"Nunito", sans-serif' },
			weight: 900,
			radius: 22,
			cut: 0,
			tracking: 0.01,
			titleCase: "none",
			overlay: "shapes",
			transition: "tiles",
			dark: {
				bg: "#110d2e",
				text: "#eef0ff",
				muted: "#a9acd9",
				accent: "#3ddc84",
				accentText: "#04210f",
				surface: "#1d1747",
				line: "#37307a",
				blobs: ["#6d28d9", "#14b8a6", "#3b82f6", "#c026d3"],
			},
			light: {
				bg: "#eef3fb",
				text: "#1d1a4a",
				muted: "#4f5b88",
				accent: "#0f9d58",
				accentText: "#ffffff",
				surface: "#ffffff",
				line: "#cfd8ee",
				blobs: ["#8b5cf6", "#2dd4bf", "#60a5fa", "#d946ef"],
			},
		},
		angersIrigo: {
			fonts: { display: '"Overpass", sans-serif', body: '"Overpass", sans-serif' },
			weight: 800,
			radius: 999,
			cut: 0,
			tracking: 0,
			titleCase: "none",
			overlay: "stripes",
			transition: "tram",
			dark: {
				bg: "#2b3034",
				text: "#ffffff",
				muted: "#c4cacf",
				accent: "#ffe600",
				accentText: "#1d1d1b",
				surface: "#383e43",
				line: "#525a61",
				blobs: ["#e30613", "#009fe3", "#f39200", "#94499a"],
			},
			light: {
				bg: "#eef0f1",
				text: "#1f2427",
				muted: "#59636b",
				accent: "#312783",
				accentText: "#ffffff",
				surface: "#ffffff",
				line: "#d3d8dc",
				blobs: ["#e30613", "#009fe3", "#f39200", "#c3d600"],
			},
		},
		satisfactory: {
			fonts: { display: '"Chakra Petch", sans-serif', body: '"Chakra Petch", sans-serif' },
			weight: 700,
			radius: 0,
			cut: 12,
			tracking: 0.06,
			titleCase: "uppercase",
			overlay: "hexgrid",
			transition: "hexes",
			dark: {
				bg: "#08181e",
				text: "#e3fbff",
				muted: "#8db3bd",
				accent: "#ff8a2a",
				accentText: "#1e0d00",
				surface: "#0f2730",
				line: "#1f4652",
				blobs: ["#0fd0da", "#0b6f7a", "#ff8a2a", "#1aa7ff"],
			},
			light: {
				bg: "#ecf5f6",
				text: "#0b2b34",
				muted: "#4b6e78",
				accent: "#e0670f",
				accentText: "#ffffff",
				surface: "#ffffff",
				line: "#c7dde1",
				blobs: ["#22d3dd", "#5eead4", "#fb923c", "#38bdf8"],
			},
		},
	};

	// Même ordre que projectsDictionary, sans la Homepage. progress et tip : inventés.
	// screen : la fausse page de projet affichée après la transition.
	const projects = [
		{
			slug: "satisfactory",
			name: "Satisfactory",
			path: "/satisfactory",
			kicker: "Jeu vidéo · Usine",
			lead: "Projet en lien avec le jeu éponyme : recettes, calculateur de production et suivi de l’usine en direct.",
			illustration: FAVICON + "satisfactory.png",
			ambiance: "satisfactory",
			screen: "grid",
			tip: "le calculateur part du produit voulu et remonte toute la chaîne de production.",
			progress: 20,
			requiresAuth: false,
			facts: facts(0),
		},
		{
			slug: "game-death-counter",
			name: "Game Death Counter",
			path: "/game-death-counter",
			kicker: "Jeux vidéo · Souls-like",
			lead: "Le compteur de morts des jeux de type Souls : chaque boss, chaque tentative, chaque partie.",
			illustration: FAVICON + "game-death-counter.png",
			ambiance: "gameDeathCounter",
			screen: "cards",
			tip: "chaque mort compte, même celles contre le premier boss.",
			progress: 90,
			requiresAuth: true,
			facts: facts(1),
		},
		{
			slug: "backlog",
			name: "Backlog",
			path: "/backlog",
			kicker: "Jeux, films et séries",
			lead: "Le suivi du backlog : ce qui attend, ce qui est en cours, ce qui est fini, avec les données d’IGDB.",
			illustration: FAVICON + "backlog.png",
			ambiance: "backlog",
			screen: "table",
			tip: "les colonnes du tableau se réorganisent et se masquent, et la disposition est gardée.",
			progress: 70,
			requiresAuth: true,
			facts: facts(2),
		},
		{
			slug: "angers-irigo",
			name: "Angers Irigo",
			path: "/angers-irigo",
			kicker: "Transports · Angers",
			lead: "Les bus et les trams d’Angers en temps réel, sur une carte : où ils sont, quand ils passent.",
			illustration: FAVICON + "angersIrigo.png",
			ambiance: "angersIrigo",
			screen: "map",
			tip: "un arrêt mis en favori s’ouvre directement au lancement.",
			progress: 85,
			requiresAuth: false,
			facts: facts(3),
		},
	];

	// Pour voir la roue avec beaucoup de projets.
	const fakeProjects = [
		"Bibliothèque",
		"Recettes",
		"Photothèque",
		"Speedruns",
		"Budget",
		"Carnet de voyage",
		"Météo",
		"Collection",
	].map((name, i) => ({
		slug: `fictif-${i + 1}`,
		name,
		path: "/",
		kicker: "Projet fictif",
		lead: LOREM[i % 6],
		illustration: null,
		ambiance: "citadel",
		screen: "cards",
		tip: LOREM[(i + 1) % 6],
		progress: (i * 37) % 100,
		requiresAuth: i % 3 === 0,
		facts: facts(i),
	}));

	const welcome = {
		kicker: "Bienvenue",
		title: "Des projets perso, ouverts à tous",
		lead: "Des outils construits d’abord pour mon usage : suivre mes parties, mon backlog, les trams d’Angers. Ils sont en ligne, autant les montrer.",
		hint: "Sélectionner un projet pour découvrir à quoi il sert.",
	};

	function sections(titles) {
		return titles.map((title, i) => ({
			title,
			paras: [LOREM[i % 6], LOREM[(i + 3) % 6] + " " + LOREM[(i + 1) % 6]],
		}));
	}

	const pages = [
		{
			slug: "a-propos",
			title: "À propos",
			intro: LOREM[4],
			sections: sections(["Le site", "La stack", "L’hébergement", "Le code source"]),
		},
		{
			slug: "mentions-legales",
			title: "Mentions légales",
			intro: LOREM[0],
			sections: sections([
				"Propriétaire du site",
				"Hébergement",
				"Nom de domaine et réseau",
				"Propriété intellectuelle",
			]),
		},
		{
			slug: "donnees-personnelles",
			title: "Données personnelles",
			intro: LOREM[2],
			sections: sections([
				"Ce que le navigateur garde",
				"Le cookie de connexion",
				"Les journaux du serveur",
				"Cloudflare",
				"Les ressources tierces",
				"Vos droits",
			]),
		},
	];

	window.MOCK = { ambiances, projects, fakeProjects, welcome, pages };
})();
