/*
TODO : WORK IN PROGRESS => Using suncalc to get various data from a given position.

      displayedSceneData?.camera?.position

      var SunCalc = require('suncalc')
      // get today's sunlight times for London
      const times = SunCalc.getTimes(new Date(), 51.5, -0.1)

      console.log(times)
      // format sunrise time from the Date object
      const sunriseStr: string = `${times.sunrise.getHours()}:${times.sunrise.getMinutes()}`

      // get position of the sun (azimuth and altitude) at today's sunrise
      const sunrisePos = SunCalc.getPosition(times.sunrise, 51.5, -0.1)

      // get sunrise azimuth in degrees
      const sunriseAzimuth: number = (sunrisePos.azimuth * 180) / Math.PI

*/

// TODO : Allow user to open mosaic modal to display all the photos, with their data displayed on hover and
pagination. + better res.
// TODO : Get more data on place using :
// https://nominatim.openstreetmap.org/lookup?osm_ids=W25284202&format=json&extratags=1
// https://nominatim.openstreetmap.org/search?q=imt%20atlantique&format=json&addressdetails=1&limit=1&polygon_svg=1
// https://nominatim.org/release-docs/latest/api/Search/
// TODO : Allow user to move a circle with selected radius on the map (spawning shapes => crud on transparent shapes
that can be spawned and move on earth).
// TODO : Search if I can integrate a street view window in the modal. Make drawers for each data panel in the main
panel. https://www.coordonnees-gps.fr/street-view/@48.360687,-4.571638,h116,p-38,z1
// https://docs.mapbox.com/api/maps/static-images/

https://en.wikipedia.org/wiki/Solar_radius

https://www.npmjs.com/package/astronomy-engine

https://github.com/cosinekitty/astronomy/tree/master/demo/nodejs


> Data used for airports is coming is
> from [ArcGIS Hub](https://hub.arcgis.com/datasets/esri-de-content::world-airports/explore?)
> Mesh line https://github.com/pmndrs/meshline
> World GEO JSON https://github.com/georgique/world-geojson/tree/develop
> Countries lat long https://github.com/eesur/country-codes-lat-long/blob/master/country-codes-lat-long-alpha3.json


// TODO : When in solar system mode :
////////// When a planet is selected :
////////////// Open modal with data on planet.
////////////// Display atmosphere on planet that uses astres color.
//// Allow user to timelapse planets position.
//////// If centered on earth, when zooming => get back to earth view.
//////// In nav bar : button to get back to Earth scene instantly.
//////// Allow user to display ellipses of astres trajectories.
//////// Refactor font loading and usage in dedicated provider.
// Hide ui when opening credit drawer for example.

Adding more functionalities by looking what's available on other websites like Google Earth, flightradar24,
vesselstracker, ...

Earth3d: En priorité fix les avions : en server side stocké les avions après un call et renvoyé uniquement le stockage
pour les call suivant ne refaire un call que plus tard
Earth3d: fix la selection d’objet et l’affichage pour avion
Possibilité pour l’utilisateur de déposer un fichier png ou jpeg qui sera mappé sur la planète genre un petit peu par
dessus et il peut jouer avec l’opacité
Fix le mesh de l’isochrone
Possibilité de placer un marqueur en cliquant sur la map