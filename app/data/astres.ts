import { Body } from 'astronomy-engine'
import { EARTH_RADIUS, SUN_RADIUS } from '@/app/constants/numbers'
import { Astre } from '@/app/types/astre'
import * as THREE from 'three'
import {
   EARTH_TEXTURE_JPG,
   JUPITER_TEXTURE_JPG,
   MARS_TEXTURE_JPG,
   MERCURY_TEXTURE_JPG,
   MOON_TEXTURE_JPG,
   NEPTUNE_TEXTURE_JPG,
   PLUTO_SURFACE_TEXTURE_JPG,
   SATURN_TEXTURE_JPG,
   SUN_TEXTURE_JPG,
   URANUS_TEXTURE_JPG,
   VENUS_SURFACE_TEXTURE_JPG,
} from '@/app/constants/paths'

export const astres: Astre[] = [
   {
      name: 'Sun',
      radius: SUN_RADIUS,
      color: 0xffff00,
      surfacePressure: undefined, // Sun is a plasma.
      mass: 1.989e30,
      astreMesh: null as any,
      body: Body.Sun,
      texture: new THREE.TextureLoader().load(
         SUN_TEXTURE_JPG,
      ),
   },
   {
      name: 'Mercury',
      radius: 2_439_700,
      color: 0xaaaaaa,
      surfacePressure: 0, // Virtually no atmosphere.
      mass: 3.3011e23, // kg
      astreMesh: null as any,
      body: Body.Mercury,
      texture: new THREE.TextureLoader().load(
         MERCURY_TEXTURE_JPG,
      ),
   },
   {
      name: 'Venus',
      radius: 6_051_800,
      color: 0xffddaa,
      surfacePressure: 92_000_000, // 92 bar or 9.2 MPa.
      mass: 4.8675e24,
      astreMesh: null as any,
      body: Body.Venus,
      texture: new THREE.TextureLoader().load(
         VENUS_SURFACE_TEXTURE_JPG,
      ),
   },
   {
      name: 'Earth',
      radius: EARTH_RADIUS,
      color: 0x00aaff,
      surfacePressure: 101_325, // 1 bar or 101.3 kPa.
      mass: 5.9724e24,
      astreMesh: null as any,
      body: Body.Earth,
      texture: new THREE.TextureLoader().load(
         EARTH_TEXTURE_JPG,
      ),
   },
   {
      name: 'Moon',
      radius: 1.7371e6,
      color: 0xd9d9d9, // Grayish color.
      surfacePressure: 0, // No atmosphere.
      mass: 7.342e22, // kg
      astreMesh: null as any,
      body: Body.Moon,
      texture: new THREE.TextureLoader().load(
         MOON_TEXTURE_JPG,
      ),
   },
   {
      name: 'Mars',
      radius: 3_389_500,
      color: 0xff5500,
      surfacePressure: 610, // ~0.6 kPa (very thin atmosphere).
      mass: 6.4171e23,
      astreMesh: null as any,
      body: Body.Mars,
      texture: new THREE.TextureLoader().load(
         MARS_TEXTURE_JPG,
      ),
   },
   {
      name: 'Jupiter',
      radius: 69_911_000,
      color: 0xffa500,
      surfacePressure: undefined, // No solid surface, gas giant.
      mass: 1.8982e27,
      astreMesh: null as any,
      body: Body.Jupiter,
      texture: new THREE.TextureLoader().load(
         JUPITER_TEXTURE_JPG,
      ),
   },
   {
      name: 'Saturn',
      radius: 58_232_000,
      color: 0xffcc00,
      surfacePressure: undefined, // No solid surface, gas giant.
      mass: 5.6834e26,
      astreMesh: null as any,
      body: Body.Saturn,
      texture: new THREE.TextureLoader().load(
         SATURN_TEXTURE_JPG,
      ),
   },
   {
      name: 'Uranus',
      radius: 25_362_000,
      color: 0xaaaaff,
      surfacePressure: undefined, // Ice giant, gaseous.
      mass: 8.6810e25,
      astreMesh: null as any,
      body: Body.Uranus,
      texture: new THREE.TextureLoader().load(
         URANUS_TEXTURE_JPG,
      ),
   },
   {
      name: 'Neptune',
      radius: 24_622_000,
      color: 0x0000ff,
      surfacePressure: undefined, // Ice giant, gaseous.
      mass: 1.02413e26,
      astreMesh: null as any,
      body: Body.Neptune,
      texture: new THREE.TextureLoader().load(
         NEPTUNE_TEXTURE_JPG,
      ),
   },
   {
      name: 'Pluto',
      radius: 1.1883e6,
      color: 0x8b8680, // Dark grey-brown.
      surfacePressure: 1e-5, // Pa (very thin atmosphere).
      mass: 1.309e22, // kg
      astreMesh: null as any,
      body: Body.Pluto,
      texture: new THREE.TextureLoader().load(
         PLUTO_SURFACE_TEXTURE_JPG,
      ),
   },
]
