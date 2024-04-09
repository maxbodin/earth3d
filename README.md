# Earth 3D

## 3D visualizer for multiple data on Earth.

## Available data: aircraft, airports and vessels

### Powered by Next.js and Three.js

> [Next.js](https://nextjs.org)

> [Three.js](https://threejs.org)

> Data used for airports is coming is from:
[ArcGIS Hub](https://hub.arcgis.com/datasets/esri-de-content::world-airports/explore?)

> Tiles making on the planet is inspired by geo-three [Geo-Three](https://github.com/tentone/geo-three)

### Table of Contents

- [Introduction](#introduction)
- [Roadmap](#roadmap)
- [License](#license)
- [Contact](#contact)

## Introduction

**Earth 3D** is vowed to be a public 3D visualizer for aircraft, airports and other vehicles or data, hosted
using vercel, developed by [MaxBodin](https://github.com/maxbodin), and
available [here](https://earth3d.vercel.app/).

## Roadmap

Project global advancement

- [x] Project global structure
- [ ] Explain global structure in README.md
- [x] Planet made with Three.js
- [ ] Displaying airports on zoom only
- [x] Relief on ground using displacement map
- [ ] Opening details of a plane by clicking on it
- [ ] Opening details of an airport by clicking on it
- [x] Being able to close the details panel
- [ ] Automatic reloading of aircraft after duration (interpolation for moves with multiple cooldown categories)
- [ ] User is able to search a specific plane using different data (CALLSIGN, onGround?, ..)
- [ ] User is able to filter planes using different data (Nationality, ...)
- [x] User can zoom on the planet with no loss of image quality (We achieved this using geo-three lib and MapBox)
- [ ] User can choose to visualize vessels on map (We used AIS data from aisstream.io)
- [ ] By selecting a plane user can go in cockpit view and drag a time slider to move the plane as if user was in the
  cockpit
- [ ] By selecting a plane user can display the itinerary of the plane (Use meshline)
- [ ] User can display abyss reliefs
- [ ] Make a custom logo and use it as favicon
- [ ] Use different models for each type of vessels, airports, planes (Use LOD for performance, only display high res
  model when very close)
- [ ] Explore the following idea for planes: Pour le mouvement des items on call dès le chargement de la page puis 1
  minute après, comme ça on prend 5 minutes à interpoller entre les deux points. Au bout de 5 min on call le suivant et
  on prend 10 minute à interpoller, puis 15 minutes en boucle, à chaque fois on call tous les avions comme ça on les
  déplace tous. On save la data dans un provider: oldData, newData
- [ ] User is able to search an airport using different data
- [ ] Use clustering for objects using zoom
- [ ] Add fallback for planeDataDisplay values

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

- Create .env.local file with:
    - SECRET_PUBLIC_MAPBOX_TOKEN='Your secret public mapbox token'
    - AISSTREAM_TOKEN='Your aisstream token'

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## License

This project is under the [MIT Licence](https://opensource.org/license/mit/).

## Contact

Currently only developed by **[MaxBodin](https://github.com/maxbodin)**.