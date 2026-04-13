import {
   CLASSIC_STREETS_STYLE_ID,
   DEFAULT_MAP_STYLE_ID,
} from '@/app/constants/mapStyles'

export interface MapStyleOption {
   id: string
   title: string
   fallbackStyleId: string
}

export interface MapStyleSection {
   title: string
   options: MapStyleOption[]
}

export const MAP_STYLE_SECTIONS: MapStyleSection[] = [
   {
      title: 'Classic basemaps',
      options: [
         {
            id: DEFAULT_MAP_STYLE_ID,
            title: 'Classic Satellite',
            fallbackStyleId: CLASSIC_STREETS_STYLE_ID,
         },
         {
            id: CLASSIC_STREETS_STYLE_ID,
            title: 'Classic Streets v8',
            fallbackStyleId: DEFAULT_MAP_STYLE_ID,
         },
      ],
   },
   {
      title: 'Modern public styles',
      options: [
         {
            id: 'mapbox://styles/mapbox/streets-v12',
            title: 'Streets v12',
            fallbackStyleId: DEFAULT_MAP_STYLE_ID,
         },
         {
            id: 'mapbox://styles/mapbox/outdoors-v12',
            title: 'Outdoors v12',
            fallbackStyleId: DEFAULT_MAP_STYLE_ID,
         },
         {
            id: 'mapbox://styles/mapbox/light-v11',
            title: 'Light v11',
            fallbackStyleId: DEFAULT_MAP_STYLE_ID,
         },
         {
            id: 'mapbox://styles/mapbox/dark-v11',
            title: 'Dark v11',
            fallbackStyleId: DEFAULT_MAP_STYLE_ID,
         },
         {
            id: 'mapbox://styles/mapbox/satellite-v9',
            title: 'Satellite v9',
            fallbackStyleId: DEFAULT_MAP_STYLE_ID,
         },
         {
            id: 'mapbox://styles/mapbox/satellite-streets-v12',
            title: 'Satellite Streets v12',
            fallbackStyleId: DEFAULT_MAP_STYLE_ID,
         },
         {
            id: 'mapbox://styles/mapbox/navigation-day-v1',
            title: 'Navigation Day v1',
            fallbackStyleId: DEFAULT_MAP_STYLE_ID,
         },
         {
            id: 'mapbox://styles/mapbox/navigation-night-v1',
            title: 'Navigation Night v1',
            fallbackStyleId: DEFAULT_MAP_STYLE_ID,
         },
         {
            id: 'mapbox://styles/mapbox/empty-v9',
            title: 'Empty v9',
            fallbackStyleId: DEFAULT_MAP_STYLE_ID,
         },
      ],
   },
   {
      title: 'Terrain and elevation',
      options: [
         {
            id: 'mapbox.mapbox-terrain-v2',
            title: 'Terrain v2',
            fallbackStyleId: DEFAULT_MAP_STYLE_ID,
         },
         {
            id: 'mapbox.terrain-rgb',
            title: 'Terrain RGB v1',
            fallbackStyleId: DEFAULT_MAP_STYLE_ID,
         },
         {
            id: 'mapbox.mapbox-terrain-dem-v1',
            title: 'Terrain DEM v1',
            fallbackStyleId: DEFAULT_MAP_STYLE_ID,
         },
         {
            id: 'mapbox.mapbox-bathymetry-v2',
            title: 'Bathymetry v2',
            fallbackStyleId: DEFAULT_MAP_STYLE_ID,
         },
      ],
   },
   {
      title: 'Mobility',
      options: [
         {
            id: 'mapbox.mapbox-traffic-v1',
            title: 'Traffic v1',
            fallbackStyleId: DEFAULT_MAP_STYLE_ID,
         },
      ],
   },
]