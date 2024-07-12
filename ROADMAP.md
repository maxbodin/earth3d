# Roadmap

Project global advancement

## To Dos

> Sorted by categories (not by priority) + may contains duplicate
> If you have ideas of upgrades, feel free to reach to me

> If you want to contribute pick a task below (one that has not a username next to it)
> Example: "- [ ] Add feature (WIP Username)" => don't pick it
> Example: "- [ ] Add feature" => have fun :)

> TODO alias WIP alias Work In Progress

### Global

- [ ] Explain global structure in README.md

### UI

- [ ] Make panel scrollable

### UX

- [ ] Reduce damping

### Map

- [ ] Add Documentation panel for map
- [ ] Add Data panel for map
- [ ] Add Credit panel for map

### Airports

- [ ] Allow user to display airports on map (We use a static json file containing all the airports data)
- [ ] Displaying airports on zoom only
- [ ] Opening details of an airport by clicking on it
- [ ] User is able to search an airport using different data
- [ ] Add Documentation panel for airports
- [ ] Add Data panel for airports
- [ ] Add Credit panel for airports

### PlanesController

- [ ] Allow user to visualize planes in live on map
- [ ] Opening details of a plane by clicking on it
- [ ] Automatic reloading of aircraft after duration (interpolation for moves with multiple cool-down categories)
- [ ] User is able to search a specific plane using different data (CALLSIGN, onGround?, ...)
- [ ] User is able to filter planes using different data (Nationality, ...)
- [ ] By selecting a plane user can display the itinerary of the plane (Use meshline)
- [ ] Explore the following idea for planes: Pour le mouvement des items on call dès le chargement de la page puis 1
  minute après, comme ça on prend 5 minutes à interpoller entre les deux points. Au bout de 5 min on call le suivant et
  on prend 10 minute à interpoller, puis 15 minutes en boucle, à chaque fois on call tous les avions comme ça on les
  déplace tous. On save la data dans un provider: oldData, newData
- [ ] Add fallback for planeDataDisplay values
- [ ] Add Documentation panel for planes
- [ ] Add Data panel for planes
- [ ] Add Credit panel for planes
- [ ] Allow user to visualize planes data from yesterday to now on map

### VesselsController

- [ ] Add Documentation panel for vessels
- [ ] Add Data panel for vessels
- [ ] Add Credit panel for vessels
- [ ] Allow user to search a vessel using many parameters (MMSI, CALLSIGN, IMO, ETA, ...)
- [ ] Make vessels move on map and not only be static
- [ ] Allow user to visualize vessels on map (Plane and Globe) (We use AIS data from aisstream.io)

### Outer space

- [ ] Add Documentation panel for outer space
- [ ] Add Data panel for outer space
- [ ] Add Credit panel for outer space

### Various upgrades for later

- [ ] Allow user to visualize weather on map
- [ ] Allow user to visualize real time clouds
- [ ] By selecting a plane user can go in cockpit view and drag a time slider to move the plane as if user was in the
  cockpit
- [ ] User can display abyss reliefs
- [ ] Make a custom logo and use it as favicon
- [ ] Use different models for each type of vessels, airports, planes (Use LOD for performance, only display high-res
  model when very close)
- [ ] For planes: use models accordingly with plane type (only when selecting)
- [ ] Use clustering for objects using zoom
- [ ] Skybox with real sun position and lighting accordingly
- [ ] Allow user to place markers and save them in local storage or in a file that could be loaded in the app
- [ ] Allow user to add a title to a marker and make the title displayed or not
- [ ] Allow user to get distance between two selected points
- [ ] When selecting an object, make it outlined by using the outline shader
- [ ] Allow user to visualize world population by country
- [ ] Allow user to visualize GES by country
- [ ] Allow user to visualize countries and their frontiers (display titles or emojis of flags ? make borders using
  meshline to make a polyline ? get polyline data of frontiers from where ?) Allow user to display only frontiers + pick
  color
- [ ] Allow user to visualize tides on map
- [ ] Allow user to visualize seismic activities on map
- [ ] Check if caching tiles is default behavior if not, implement a cache system for tiles, and make it works with
  tiles style update
- [ ] Permettre à l'utilisateur de visualiser les trains français SNCF sur la carte
- [ ] Allow user to choose a language for the application
- [ ] Get the language of the user from locale and use it for data displayed to the user
- [ ] On startup try to get user position and fly camera to position with small zoom
- [ ] When selecting object make camera zoom
- [ ] Make data panels use graph to display the data and allow graph creation with filters
- [ ] Make Earth3D responsive and usable for smartphones (LOD for textures, update controls, no models ?, ...)
- [ ] Allow user to display volcanoes on map
- [ ] Make date slider that takes a min year and a max year and use it for data that have date, in order to give user to
  display data that depends on year + same for hours of the current day
- [ ] Allow user to visualize covid data with a slider for days from min date to max date
- [ ] Make slider always displayed in dashboard only but allow user to pin it to display it outside the dashboard (
  Bottom of the screen)
- [ ] Improve searchbar (Allow user to choose object type, then field in object type and then enter data, allow user to
  add as many field as there is possible fields in object, allow user to remove the search field, when changing selected
  object type keep in storage search configuration, add reset button to reset added fields) => This one is tricky and I
  have a precise idea of what I want, so maybe it's better letting me do it
- [ ] When selecting or searching for a city, zoom on position, display data related to the city and try to get weather
  prevision for the city
- [ ] Adding more functionalities by looking what's available on other websites like Google Earth, flightradar24,
  vesselstracker, ...
- [ ] When selecting a country (double click), fetch and display data on the country
- [ ] When searching a country or a city, fly camera to coordinates of the place
- [ ] Allow user to display ports (search a static json ?)
- [ ] Allow user to display cities by population
- [ ] Allow user to add an external api to display custom data on the map. User would have to enter a link, select if
  the api need a token, if so enter the token, the object path to latitude and longitude, object paths of data that will
  be saved in the markers displayed on the map when selected. Allow user to activate or deactivate the displaying of its
  custom data (switch). Display a terminal window like with errors under the custom data block.

### Countries

- [ ] User can select a country by double-clicking on the name
- [ ] When selecting a country user can visualize data on the country
- [ ] Flag emoji is visible in each country name
- [ ] Countries frontiers can be displayed on plane scene using prebaked texture, only use meshline for selected
  country ?

// TODO WIP:
export function getWeatherForLocationEndpoint(location: Coordinate) {
return `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${location.lat}%2C23&lon${location.lng}%2C8`
}

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

