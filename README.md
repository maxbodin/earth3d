# Earth 3D

## 3D visualizer for multiple data on Earth.

## Available data: aircraft, airports and vessels

### Powered by Next.js and Three.js

> [Next.js](https://nextjs.org)

> [Three.js](https://threejs.org)

> Data used for airports is coming is from:
[ArcGIS Hub](https://hub.arcgis.com/datasets/esri-de-content::world-airports/explore?)

> Tiles making on the planet is inspired by geo-three [Geo-Three](https://github.com/tentone/geo-three)

> Meshline https://github.com/pmndrs/meshline
> World GEO JSON https://github.com/georgique/world-geojson/tree/develop
> Countries lat long https://github.com/eesur/country-codes-lat-long/blob/master/country-codes-lat-long-alpha3.json

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

See ROADMAP.md to see the project global advancement or how you can contribute.

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