import { Body } from 'astronomy-engine'
import { SUN_RADIUS } from '@/app/constants/numbers'
import { Astre } from '@/app/types/astre'

export const astres: Astre[] = [
   {
      name: 'Sun',
      radius: SUN_RADIUS,
      color: 0xffff00,
      surfacePressure: undefined, // Sun is a plasma.
      mass: 1.989e30,
      astreMesh: null as any,
      body: Body.Sun,
   },
   {
      name: 'Mercury',
      radius: 2_439_700,
      color: 0xaaaaaa,
      surfacePressure: 0, // Virtually no atmosphere.
      mass: 3.3011e23, // kg
      astreMesh: null as any,
      body: Body.Mercury,
   },
   {
      name: 'Venus',
      radius: 6_051_800,
      color: 0xffddaa,
      surfacePressure: 92_000_000, // 92 bar or 9.2 MPa.
      mass: 4.8675e24,
      astreMesh: null as any,
      body: Body.Venus,
   },
   {
      name: 'Earth',
      radius: 6_371_000,
      color: 0x00aaff,
      surfacePressure: 101_325, // 1 bar or 101.3 kPa.
      mass: 5.9724e24,
      astreMesh: null as any,
      body: Body.Earth,
   },
   {
      name: 'Moon',
      radius: 1.7371e6,
      color: 0xd9d9d9, // Grayish color.
      surfacePressure: 0, // No atmosphere.
      mass: 7.342e22, // kg
      astreMesh: null as any,
      body: Body.Moon,
   },
   {
      name: 'Mars',
      radius: 3_389_500,
      color: 0xff5500,
      surfacePressure: 610, // ~0.6 kPa (very thin atmosphere).
      mass: 6.4171e23,
      astreMesh: null as any,
      body: Body.Mars,
   },
   {
      name: 'Jupiter',
      radius: 69_911_000,
      color: 0xffa500,
      surfacePressure: undefined, // No solid surface, gas giant.
      mass: 1.8982e27,
      astreMesh: null as any,
      body: Body.Jupiter,
   },
   {
      name: 'Saturn',
      radius: 58_232_000,
      color: 0xffcc00,
      surfacePressure: undefined, // No solid surface, gas giant.
      mass: 5.6834e26,
      astreMesh: null as any,
      body: Body.Saturn,
   },
   {
      name: 'Uranus',
      radius: 25_362_000,
      color: 0xaaaaff,
      surfacePressure: undefined, // Ice giant, gaseous.
      mass: 8.6810e25,
      astreMesh: null as any,
      body: Body.Uranus,
   },
   {
      name: 'Neptune',
      radius: 24_622_000,
      color: 0x0000ff,
      surfacePressure: undefined, // Ice giant, gaseous.
      mass: 1.02413e26,
      astreMesh: null as any,
      body: Body.Neptune,
   },
   {
      name: 'Pluto',
      radius: 1.1883e6,
      color: 0x8b8680, // Dark grey-brown.
      surfacePressure: 1e-5, // Pa (very thin atmosphere).
      mass: 1.309e22, // kg
      astreMesh: null as any,
      body: Body.Pluto,
   },
]
