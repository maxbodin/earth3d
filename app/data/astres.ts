import * as THREE from 'three'
import * as Astronomy from 'astronomy-engine'
import { Body } from 'astronomy-engine'

export const astres: {
   name: string;
   radius: number;            // Radius in meters.
   color: number;             // Hex color for visualization.
   surfacePressure?: number;  // Surface pressure in pascals (Pa).
   mass?: number;             // Mass in kg.
   planetMesh: THREE.Mesh;
   body: Astronomy.Body
}[] = [
   {
      name: 'Mercury',
      radius: 2_439_700,
      color: 0xaaaaaa,
      surfacePressure: 0, // Virtually no atmosphere.
      mass: 3.3011e23, // kg
      planetMesh: null as any,
      body: Body.Mercury,
   },
   {
      name: 'Venus',
      radius: 6_051_800,
      color: 0xffddaa,
      surfacePressure: 92_000_000, // 92 bar or 9.2 MPa.
      mass: 4.8675e24,
      planetMesh: null as any,
      body: Body.Venus,
   },
   {
      name: 'Earth',
      radius: 6_371_000,
      color: 0x00aaff,
      surfacePressure: 101_325, // 1 bar or 101.3 kPa.
      mass: 5.9724e24,
      planetMesh: null as any,
      body: Body.Earth,
   },
   {
      name: 'Mars',
      radius: 3_389_500,
      color: 0xff5500,
      surfacePressure: 610, // ~0.6 kPa (very thin atmosphere).
      mass: 6.4171e23,
      planetMesh: null as any,
      body: Body.Mars,
   },
   {
      name: 'Jupiter',
      radius: 69_911_000,
      color: 0xffa500,
      surfacePressure: undefined, // No solid surface, gas giant.
      mass: 1.8982e27,
      planetMesh: null as any,
      body: Body.Jupiter,
   },
   {
      name: 'Saturn',
      radius: 58_232_000,
      color: 0xffcc00,
      surfacePressure: undefined, // No solid surface, gas giant.
      mass: 5.6834e26,
      planetMesh: null as any,
      body: Body.Saturn,
   },
   {
      name: 'Uranus',
      radius: 25_362_000,
      color: 0xaaaaff,
      surfacePressure: undefined, // Ice giant, gaseous.
      mass: 8.6810e25,
      planetMesh: null as any,
      body: Body.Uranus,
   },
   {
      name: 'Neptune',
      radius: 24_622_000,
      color: 0x0000ff,
      surfacePressure: undefined, // Ice giant, gaseous.
      mass: 1.02413e26,
      planetMesh: null as any,
      body: Body.Neptune,
   },
   {
      name: 'Sun',
      radius: 696_340_000,
      color: 0xffff00,
      surfacePressure: undefined, // Sun is a plasma.
      mass: 1.989e30,
      planetMesh: null as any,
      body: Body.Sun,
   },
]
