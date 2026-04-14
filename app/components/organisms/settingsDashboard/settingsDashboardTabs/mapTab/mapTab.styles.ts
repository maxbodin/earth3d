import { CLASSIC_STREETS_STYLE_ID, DEFAULT_MAP_STYLE_ID, } from '@/app/constants/mapStyles'

export interface MapStyleOption {
   id: string
   title: string
}

export interface MapStyleSection {
   title: string
   options: MapStyleOption[]
}

export const MAP_STYLE_SECTIONS: MapStyleSection[] = [
   {
      title: 'Classic Basemaps',
      options: [
         {
            id: DEFAULT_MAP_STYLE_ID,
            title: 'Classic Satellite',
         },
         {
            id: CLASSIC_STREETS_STYLE_ID,
            title: 'Classic Streets',
         },
      ],
   },
   {
      title: 'Modern Public Styles',
      options: [
         {
            id: 'mapbox://styles/mapbox/streets-v12',
            title: 'Streets v12',
         },
         {
            id: 'mapbox://styles/mapbox/outdoors-v12',
            title: 'Outdoors v12',
         },
         {
            id: 'mapbox://styles/mapbox/light-v11',
            title: 'Light v11',
         },
         {
            id: 'mapbox://styles/mapbox/dark-v11',
            title: 'Dark v11',
         },
         {
            id: 'mapbox://styles/mapbox/satellite-v9',
            title: 'Satellite v9',
         },
         {
            id: 'mapbox://styles/mapbox/satellite-streets-v12',
            title: 'Satellite Streets',
         },
         {
            id: 'mapbox://styles/mapbox/navigation-day-v1',
            title: 'Navigation Day',
         },
         {
            id: 'mapbox://styles/mapbox/navigation-night-v1',
            title: 'Navigation Night',
         },
         {
            id: 'mapbox://styles/mapbox/empty-v9',
            title: 'Empty v9',
         },
      ],
   },
   {
      title: 'Terrain & Elevation',
      options: [
         {
            id: 'mapbox.mapbox-terrain-v2',
            title: 'Terrain v2',
         },
         {
            id: 'mapbox.terrain-rgb',
            title: 'Terrain RGB',
         },
         {
            id: 'mapbox.mapbox-terrain-dem-v1',
            title: 'Terrain DEM',
         },
         {
            id: 'mapbox.mapbox-bathymetry-v2',
            title: 'Bathymetry v2',
         },
      ],
   },
   {
      title: 'Mobility',
      options: [
         {
            id: 'mapbox.mapbox-traffic-v1',
            title: 'Traffic v1',
         },
      ],
   },
]