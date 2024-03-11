# Flight Radar 3D

## 3D visualizer for aircraft, airports and other vehicles

### Powered by Next.js and Three.js

> [Next.js](https://nextjs.org)

> [Three.js](https://threejs.org)

> Data used for airports is coming is from:
[ArcGIS Hub](https://hub.arcgis.com/datasets/esri-de-content::world-airports/explore?)

### Table of Contents

- [Introduction](#introduction)
- [Roadmap](#roadmap)
- [License](#license)
- [Contact](#contact)

## Introduction

**Flight Radar 3D** is vowed to be a public 3D visualizer for aircraft, airports and other vehicles or data, hosted
using vercel, developed by [MaxBodin](https://github.com/maxbodin), and
available [here](https://flightradar3d.vercel.app/).

## Roadmap

Project global advancement

- [x] Project global structure
- [x] Planet made with Three js
- [x] Displaying airports on zoom only
- [x] Relief on ground using displacement map
- [x] Opening details of a plane by clicking on it
- [x] Opening details of an airport by clicking on it
- [x] Being able to close the details panel
- [ ] Automatic reloading of aircraft after duration (interpolation for moves with multiple cooldown categories)
  // Recherche sur les avions : Filtre sur conditions genre on ground, une checkbox ?
  // Radar pour les bateaux, récupérer les données ais => il faut un backend
  // Ajouter une bd en backend comme ça côté client on ne fait que des calls vers une bd unique qui va stocker et faire
  les calls
  // Itinéraire 3d en vue cockpit
  // Afficher itinéraire tracé du vol sélectionné
  // Ajouter les reliefs de fonds marins
  // Pour le mouvement des items on call dès le chargement de la page puis 1 minute après, comme ça on prend 5 minutes à
  interpoller entre les deux points
  // Au bout de 5 min on call le suivant et on prend 10 minute à interpoller, puis 15 minutes en boucle, à chaque fois
  on call tous les avions comme ça on les déplace tous.
  // On save la data dans un provider: oldData, newData
  // Meshes différents pour chaque type d'airports avec couleurs différentes
  // Pouvoir faire des recherche d'airports et avoir un système de clustering quand on a trop de résultats mais que l'on
  veut quand même les afficher
  // Pourvoir ajouter des filtres dans les settings genre filtre sur les types d'airports
  // Fix airport under ground problem with displacement map

## Start the project - development

- Clone this repository with `git clone https://github.com/maxbodin/flightradar3d`
- Execute `cd flightradar3d/`
- Install dependencies.
- Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## License

This project is under the [MIT Licence](https://opensource.org/license/mit/).

## Contact

Developed by **me**.