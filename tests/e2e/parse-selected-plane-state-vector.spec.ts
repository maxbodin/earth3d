import { expect, test } from '@playwright/test'
import { parseSelectedPlaneStateVector } from '@/lib/parse/parseSelectedPlaneStateVector'

test.describe('parseSelectedPlaneStateVector', () => {
   test('parses OpenSky state vectors from userData.data payloads', () => {
      const parsed = parseSelectedPlaneStateVector({
         data: [
            '39de4b',
            'TVF431J ',
            'France',
            1776887414,
            1776887414,
            2.3672,
            48.7267,
            null,
            true,
            3.34,
            11.25,
            null,
            null,
            null,
            '3524',
            false,
            0,
         ],
      })

      expect(parsed).not.toBeNull()
      expect(parsed?.[0]).toBe('39de4b')
      expect(parsed?.[1]).toBe('TVF431J')
      expect(parsed?.[2]).toBe('France')
      expect(parsed?.[5]).toBe(2.3672)
      expect(parsed?.[6]).toBe(48.7267)
      expect(parsed?.[16]).toBe(0)
      expect(parsed?.[17]).toBeNull()
   })

   test('parses object-shaped plane payloads when vector schema differs', () => {
      const parsed = parseSelectedPlaneStateVector({
         icao24: '4acb23',
         callsign: 'NSZ5075',
         origin_country: 'Sweden',
         time_position: 1776887650,
         last_contact: 1776887650,
         longitude: 2.0094,
         latitude: 47.4111,
         baro_altitude: 11277.6,
         on_ground: false,
         velocity: 233.01,
         true_track: 210.81,
         vertical_rate: 0,
         sensors: null,
         geo_altitude: 11452.86,
         squawk: '0753',
         spi: false,
         position_source: 0,
         category: 3,
      })

      expect(parsed).not.toBeNull()
      expect(parsed?.[0]).toBe('4acb23')
      expect(parsed?.[1]).toBe('NSZ5075')
      expect(parsed?.[2]).toBe('Sweden')
      expect(parsed?.[7]).toBe(11277.6)
      expect(parsed?.[10]).toBe(210.81)
      expect(parsed?.[17]).toBe(3)
   })
})
