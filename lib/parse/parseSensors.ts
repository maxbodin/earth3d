import { parseNumber } from '@/lib/parse/parseNumber'

export function parseSensors(value: unknown): number[] | null {
   if (!Array.isArray(value)) return null

   const sensors = value
      .map((sensorValue) => parseNumber(sensorValue))
      .filter((sensorValue): sensorValue is number => sensorValue != null)

   return sensors.length > 0 ? sensors : null
}