// TODO Work in progress, the goal is to generate various heatmaps on the user client, or find a way to do it on server
// Maybe there is a way to create texture or canvas on server. 
// 'use client'
// import { useEffect, useRef } from 'react'
// import * as THREE from 'three'
// import { useScenes } from '@/app/components/templates/scenes/scenes.model'
// import { SceneType } from '@/app/enums/sceneType'
// import { removeObject3D } from '@/app/helpers/threeHelper'
// import { EARTH_RADIUS, SPHERE_HEIGHT_SEGMENTS, SPHERE_WIDTH_SEGMENTS } from '@/app/constants/numbers'
//
// // TODO import weather from '../../../../data/weather_test.json'
// import { latLongToVector3 } from '@/app/helpers/latLongHelper'
//
//
// /*export interface WeatherData {
//    latitude: number;
//    longitude: number;
//    generationtime_ms: number;
//    utc_offset_seconds: number;
//    timezone: string;
//    timezone_abbreviation: string;
//    elevation: number;
//    hourly_units: {
//       time: string;
//       temperature_2m: string;
//    };
//    hourly: {
//       time: string[];
//       temperature_2m: number[];
//    };
// }*/
//
// interface WeatherData {
//    city: {
//       id: number;
//       name: string;
//       findname: string;
//       country: string;
//       coord: {
//          lon: number;
//          lat: number;
//       };
//       zoom: number;
//    };
//    time: number;
//    main: {
//       temp: number;
//       temp_min: number;
//       temp_max: number;
//       pressure: number;
//       sea_level: number;
//       grnd_level: number;
//       humidity: number;
//    };
//    wind: {
//       speed: number;
//       deg: number;
//    };
//    clouds: {
//       all: number;
//    };
//    weather: {
//       id: number;
//       main: string;
//       description: string;
//       icon: string;
//    }[];
// }
//
// export function Heatmap(): null {
//    const heatmap = useRef<THREE.Mesh<
//       THREE.SphereGeometry,
//       THREE.ShaderMaterial,
//       THREE.Object3DEventMap
//    > | null>(null)
//
//    const { displayedSceneData } = useScenes()
//
//    const heatMapTexture = new THREE.Texture()
//
//    /**
//     *
//     */
//    const createHeatmap = (): void => {
//       if (displayedSceneData == null || displayedSceneData.scene == null
//          || displayedSceneData.type != SceneType.SPHERICAL) return
//
//       if (heatmap.current != null)
//          removeObject3D(heatmap.current, displayedSceneData.scene)
//
//       const shaderMaterial =
//          new THREE.ShaderMaterial({
//             transparent: true,
//             vertexShader: `
//                varying vec2 vertexUV;
//
//                void main() {
//                   vertexUV = uv;
//                   gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
//                } `,
//             fragmentShader: `
//                uniform sampler2D heatMapTexture;
//                varying vec2 vertexUV;
//
//                void main(){
//                   gl_FragColor = texture2D(heatMapTexture, vertexUV);
//                }`,
//             uniforms: {
//                heatMapTexture: {
//                   value: heatMapTexture,
//                },
//             },
//          })
//
//
//       heatmap.current = new THREE.Mesh(
//          new THREE.SphereGeometry(
//             EARTH_RADIUS * 1.03,
//             SPHERE_WIDTH_SEGMENTS,
//             SPHERE_HEIGHT_SEGMENTS,
//          ), shaderMaterial)
//
//       heatmap.current.renderOrder = 100000
//       heatmap.current.name = 'HEATMAP'
//       heatmap.current?.position.set(0, 0, 0)
//       displayedSceneData.scene?.add(heatmap.current)
//    }
//
//    const computeHeatmap = (data: WeatherData[]): void => {
//       const canvas = document.createElement('canvas')
//       canvas.width = 2048
//       canvas.height = 1024
//       const context = canvas.getContext('2d')
//
//       if (!context) return
//
//       context.clearRect(0, 0, canvas.width, canvas.height)
//       context.translate(canvas.width, 0)
//       context.scale(-1, 1)
//
//       // Determine maximum weight for scaling color
//       const maxWeight = Math.max(...data.map(point => (point.main.temp - 273.15 < 0 ? 0 : point.main.temp - 273.15)))
//
//       const drawPoint = (lat: number, lon: number, temp: number) => {
//          const worldPposition = latLongToVector3(lat, lon)
//
//          // Convert 3D coordinates to UV coordinates
//          const uv = {
//             x: 0.5 + Math.atan2(worldPposition.z, worldPposition.x) / (2.0 * Math.PI),
//             y: 0.5 - Math.asin(worldPposition.y / Math.sqrt(worldPposition.x * worldPposition.x + worldPposition.y * worldPposition.y + worldPposition.z * worldPposition.z)) / Math.PI,
//          }
//
//          const size = Math.max(10, Math.log(temp + 1))
//          const alpha = Math.min(1, temp / maxWeight)
//          const hue = (1 - temp / maxWeight) * 240
//          const color = `hsla(${hue}, 100%, 50%, ${alpha})`
//
//          const gradient = context.createRadialGradient(
//             uv.x * canvas.width, uv.y * canvas.height, 0,
//             uv.x * canvas.width, uv.y * canvas.height, size,
//          )
//
//          gradient.addColorStop(0, color)
//          gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`)
//
//          context.fillStyle = gradient
//          context.beginPath()
//          context.arc(uv.x * canvas.width, uv.y * canvas.height, size, 0, 2 * Math.PI)
//          context.fill()
//       }
//
//       const findNearestNeighbors = (lat: number, lon: number, numNeighbors: number) => {
//          return data
//             .map(point => {
//                const distance = Math.sqrt(
//                   Math.pow(lat - point.city.coord.lat, 2) +
//                   Math.pow(lon - point.city.coord.lon, 2),
//                )
//                return { point, distance }
//             })
//             .sort((a, b) => a.distance - b.distance)
//             .slice(0, numNeighbors)
//       }
//
//       const interpolateTemperature = (lat: number, lon: number, numNeighbors: number) => {
//          const neighbors = findNearestNeighbors(lat, lon, numNeighbors)
//          let totalWeight = 0
//          let weightedTempSum = 0
//
//          neighbors.forEach(({ point, distance }) => {
//             const weight = 1 / (distance + 0.00001)
//             const temperature = point.main.temp - 273.15 < 0 ? 0 : point.main.temp - 273.15
//             weightedTempSum += temperature * weight
//             totalWeight += weight
//          })
//
//          return weightedTempSum / totalWeight
//       }
//
//       const generatePointsAround = (lat: number, lon: number, radius: number, numPoints: number) => {
//          const points = []
//          for (let i = 0; i < numPoints; i++) {
//             const angle = Math.random() * 2 * Math.PI
//             const distance = Math.random() * radius
//             const newLat = lat + (distance * Math.cos(angle)) / 111 // Approximate conversion from km to degrees
//             const newLon = lon + (distance * Math.sin(angle)) / (111 * Math.cos(lat * Math.PI / 180)) // Adjust for latitude
//             points.push({ lat: newLat, lon: newLon })
//          }
//          return points
//       }
//
//       const radius = 10 // Radius in kilometers to generate points around the original points
//       const numInterpolatedPoints = 5 // Number of interpolated points to generate around each original point
//
//       data.forEach(point => {
//          const lat = point.city.coord.lat
//          const lon = point.city.coord.lon
//          const temp = point.main.temp - 273.15 < 0 ? 0 : point.main.temp - 273.15
//
//          // Draw the original point
//          drawPoint(lat, lon, temp)
//
//          // Generate interpolated points around the original point
//          const interpolatedPoints = generatePointsAround(lat, lon, radius, numInterpolatedPoints)
//
//          interpolatedPoints.forEach(interpolatedPoint => {
//             const interpolatedTemp = interpolateTemperature(interpolatedPoint.lat, interpolatedPoint.lon, 2)
//             drawPoint(interpolatedPoint.lat, interpolatedPoint.lon, interpolatedTemp)
//          })
//       })
//
//       // Update the heat map texture
//       heatMapTexture.image = canvas
//       heatMapTexture.needsUpdate = true
//    }
//
//
//    /*   const interpolate = (start: number, end: number, factor: number) => {
//          return start + (end - start) * factor
//       }
//
//       const lerpPoints = (pointA: WeatherData, pointB: WeatherData, steps: number) => {
//          const latA = pointA.city.coord.lat
//          const lonA = pointA.city.coord.lon
//          const tempA = pointA.main.temp - 273.15 < 0 ? 0 : pointA.main.temp - 273.15
//
//          const latB = pointB.city.coord.lat
//          const lonB = pointB.city.coord.lon
//          const tempB = pointB.main.temp - 273.15 < 0 ? 0 : pointB.main.temp - 273.15
//
//          const interpolatedPoints = []
//
//          for (let i = 0; i <= steps; i++) {
//             const factor = i / steps
//             const interpolatedLat = interpolate(latA, latB, factor)
//             const interpolatedLon = interpolate(lonA, lonB, factor)
//             let interpolatedTemp = interpolate(tempA, tempB, factor)
//             interpolatedTemp = interpolatedTemp - 273.15 < 0 ? 0 : interpolatedTemp - 273.15
//             interpolatedPoints.push({ lat: interpolatedLat, lon: interpolatedLon, temp: interpolatedTemp })
//          }
//
//          return interpolatedPoints
//       }
//
//
//       const drawPoint = (lat: number, lon: number, temp: number, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void => {
//          const worldPosition: THREE.Vector3 = latLongToVector3(lat, lon)
//
//          // Convert 3D coordinates to UV coordinates.
//          const uv = {
//             x: 0.5 + Math.atan2(worldPosition.z, worldPosition.x) / (2.0 * Math.PI),
//             y: 0.5 - Math.asin(worldPosition.y / Math.sqrt(worldPosition.x * worldPosition.x + worldPosition.y * worldPosition.y + worldPosition.z * worldPosition.z)) / Math.PI,
//          }
//
//          // Define gradient size and intensity
//          const size: number = Math.max(10, Math.log(temp + 1))
//          const alpha: number = Math.min(1, temp / maxTemperature)
//
//          // Calculate color based on weight using HSL (0: blue, max: red)
//          const hue = (1 - temp / maxTemperature) * 240
//          const color = `hsla(${hue}, 100%, 50%, ${alpha})`
//
//          // Create radial gradient
//          const gradient = context.createRadialGradient(
//             uv.x * canvas.width, uv.y * canvas.height, 0,
//             uv.x * canvas.width, uv.y * canvas.height, size,
//          )
//
//          // Apply gradient stops
//          gradient.addColorStop(0, color) // Center
//          gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`) // Edge
//
//          // Draw gradient circle
//          context.fillStyle = gradient
//          context.beginPath()
//          context.arc(uv.x * canvas.width, uv.y * canvas.height, size, 0, 2 * Math.PI)
//          context.fill()
//       }
//
//       let maxTemperature: number = 0
//
//       const computeHeatmap = (data: WeatherData[]): void => {
//          const canvas = document.createElement('canvas')
//          canvas.width = 2048
//          canvas.height = 1024
//          const context = canvas.getContext('2d')
//
//          if (!context) return
//
//          context.clearRect(0, 0, canvas.width, canvas.height)
//          // Reverse the context horizontally by scaling and translating.
//          context.translate(canvas.width, 0)
//          context.scale(-1, 1)
//
//          maxTemperature = Math.max(...data.map(point => (point.main.temp - 273.15 < 0 ? 0 : point.main.temp - 273.15)))
//
//          // Draw original and interpolated points
//          for (let i = 0; i < data.length - 1; i++) {
//             const pointA = data[i]
//             const pointB = data[i + 1]
//             const interpolatedPoints = lerpPoints(pointA, pointB, 1)
//
//             interpolatedPoints.forEach(interpolatedPoint => {
//                drawPoint(interpolatedPoint.lat, interpolatedPoint.lon, interpolatedPoint.temp, canvas, context)
//             })
//          }
//
//          // Update the heat map texture
//          heatMapTexture.image = canvas
//          heatMapTexture.needsUpdate = true
//       }*/
//
//
//    useEffect((): void => {
//       const weatherData = weather as WeatherData[]
//       computeHeatmap(weatherData)
//       createHeatmap()
//    }, [displayedSceneData])
//
//    return null
// }
