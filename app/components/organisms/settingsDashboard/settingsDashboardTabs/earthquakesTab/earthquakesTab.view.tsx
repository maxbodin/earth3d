import { SwitchTitled } from '@/app/components/atoms/ui/switchTitled'
import {
   useEarthquakesTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/earthquakesTab/earthquakesTab.model'
import {
   EarthquakesTabController,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/earthquakesTab/earthquakesTab.controller'
import { useEarthquakes, } from '@/app/components/atoms/three/earthquakes/earthquakes.model'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { TIME_RANGE_OPTIONS, TimeRangeLabel } from '@/app/types/timeRangeLabel'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { UsgsEarthquakeFeature } from '@/app/types/earthquake/usgsEarthquakeFeature'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { ObjectType } from '@/app/enums/objectType'
import { ONE_HOUR_IN_MS, ONE_MINUTE_IN_MS } from '@/app/constants/numbers'
import { formatEpochToLocale } from '@/lib/format/formatEpochToLocale'
import {
   EarthquakeTable,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/earthquakesTab/earthquakeTable'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shadcn/ui/select'
import { useSettingsDashboard } from '@/app/components/organisms/settingsDashboard/settingsDashboard.model'

const MAGNITUDE_OPTIONS: { value: number; label: string }[] = [
   { value: 0, label: 'All (0+)' },
   { value: 1, label: '1.0+' },
   { value: 2.5, label: '2.5+' },
   { value: 4, label: '4.0+' },
   { value: 5, label: '5.0+' },
   { value: 6, label: '6.0+' },
   { value: 7, label: '7.0+' },
]

const PLAYBACK_INTERVAL_MS = 100

export function EarthquakesTabView() {
   const {
      earthquakesActivated,
      earthquakeHeatmapEnabled,
      setEarthquakeHeatmapEnabled,
      earthquakeDepthLinesEnabled,
      setEarthquakeDepthLinesEnabled,
      earthquakeMinMagnitude,
      setEarthquakeMinMagnitude,
      earthquakeTimeRange,
      setEarthquakeTimeRange,
   } = useEarthquakesTab()

   const {
      earthquakeData,
      setSelectedEarthquake,
      playbackTime,
      setPlaybackTime,
      isPlaying,
      setIsPlaying,
   } = useEarthquakes()

   const { activateEarthquakes, deactivateEarthquakes } = EarthquakesTabController()
   const { flyToCoordinates } = CameraFlyController()
   const { setSelectedObjectData, setSelectedObjectType } = useSelection()
   const { handleSettingsOpenChange } = useSettingsDashboard()

   const playbackIntervalRef = useRef<number | null>(null)

   // Compute time bounds from loaded data.
   const { timeMin, timeMax } = useMemo(() => {
      if (earthquakeData.length === 0) return { timeMin: 0, timeMax: 0 }
      let min = Infinity
      let max = -Infinity
      for (const f of earthquakeData) {
         const t = f.properties.time
         if (t < min) min = t
         if (t > max) max = t
      }
      return { timeMin: min, timeMax: max }
   }, [earthquakeData])

   // Time-lapse playback loop.
   useEffect(() => {
      if (!isPlaying || timeMax === 0) {
         if (playbackIntervalRef.current != null) {
            window.clearInterval(playbackIntervalRef.current)
            playbackIntervalRef.current = null
         }
         return
      }

      playbackIntervalRef.current = window.setInterval(() => {
         setPlaybackTime(prev => {
            const next = (prev ?? timeMin) + ONE_MINUTE_IN_MS
            if (next >= timeMax) {
               setIsPlaying(false)
               return timeMax
            }
            return next
         })
      }, PLAYBACK_INTERVAL_MS)

      return () => {
         if (playbackIntervalRef.current != null) {
            window.clearInterval(playbackIntervalRef.current)
            playbackIntervalRef.current = null
         }
      }
   }, [isPlaying, timeMin, timeMax, setPlaybackTime, setIsPlaying])

   const handlePlayPause = useCallback((): void => {
      if (isPlaying) {
         setIsPlaying(false)
      } else {
         if (playbackTime == null || playbackTime >= timeMax) {
            setPlaybackTime(timeMin)
         }
         setIsPlaying(true)
      }
   }, [isPlaying, playbackTime, timeMin, timeMax, setIsPlaying, setPlaybackTime])

   const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
      setIsPlaying(false)
      setPlaybackTime(Number(e.target.value))
   }, [setIsPlaying, setPlaybackTime])

   const handleResetTimelapse = useCallback((): void => {
      setIsPlaying(false)
      setPlaybackTime(null)
   }, [setIsPlaying, setPlaybackTime])

   const focusOnEarthquake = useCallback((feature: UsgsEarthquakeFeature): void => {
      const [longitude, latitude] = feature.geometry.coordinates
      setSelectedEarthquake(feature)
      setSelectedObjectData(feature)
      setSelectedObjectType(ObjectType.EARTHQUAKE)
      flyToCoordinates(latitude, longitude)
      handleSettingsOpenChange(false)
   }, [flyToCoordinates, setSelectedEarthquake, setSelectedObjectData, setSelectedObjectType, handleSettingsOpenChange])

   // Filter earthquake data to the playback time window.
   const visibleEarthquakeData = useMemo((): UsgsEarthquakeFeature[] => {
      if (playbackTime == null) return earthquakeData
      if (earthquakeData.length === 0) return []
      const totalRange = timeMax - timeMin
      const windowSize = Math.max(totalRange * 0.1, ONE_HOUR_IN_MS)
      return earthquakeData.filter(f => {
         const t = f.properties.time
         return t <= playbackTime && t >= playbackTime - windowSize
      })
   }, [earthquakeData, playbackTime, timeMin, timeMax])

   return (
      <div className="flex flex-col w-full gap-2">
         <SwitchTitled
            title={'Activate Earthquakes on Map'}
            defaultChecked={earthquakesActivated}
            onCheck={activateEarthquakes}
            onUncheck={deactivateEarthquakes}
         />

         {earthquakesActivated && (
            <div className="flex flex-col gap-4">
               {/* Stats */}
               <div className="text-sm text-white/70">
                  Earthquakes loaded: {earthquakeData.length.toLocaleString()}
               </div>

               <div className="flex flex-row gap-4">
                  {/* Time Range Filter */}
                  <div className="flex flex-col gap-1">
                     <label className="text-sm text-white/90" htmlFor="eq-time-range">Time Range</label>
                     <Select
                        value={earthquakeTimeRange}
                        onValueChange={(value: string) => setEarthquakeTimeRange(value as TimeRangeLabel)}
                     >
                        <SelectTrigger id="eq-time-range">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                           {TIME_RANGE_OPTIONS.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>
                                 {opt.label}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>

                  {/* Min Magnitude Filter */}
                  <div className="flex flex-col gap-1">
                     <label className="text-sm text-white/90" htmlFor="eq-min-mag">Minimum Magnitude</label>
                     <Select
                        value={String(earthquakeMinMagnitude)}
                        onValueChange={(value: string) => setEarthquakeMinMagnitude(Number(value))}
                     >
                        <SelectTrigger id="eq-min-mag">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                           {MAGNITUDE_OPTIONS.map(opt => (
                              <SelectItem key={opt.value} value={String(opt.value)}>
                                 {opt.label}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>
               </div>


               {/* Depth Lines Toggle */}
               <SwitchTitled
                  title={'Show Depth Lines'}
                  defaultChecked={earthquakeDepthLinesEnabled}
                  onCheck={() => setEarthquakeDepthLinesEnabled(true)}
                  onUncheck={() => setEarthquakeDepthLinesEnabled(false)}
               />

               {/* Heatmap Toggle */}
               <SwitchTitled
                  title={'Show Heatmap Overlay'}
                  defaultChecked={earthquakeHeatmapEnabled}
                  onCheck={() => setEarthquakeHeatmapEnabled(true)}
                  onUncheck={() => setEarthquakeHeatmapEnabled(false)}
               />

               {/* Time-Lapse Controls */}
               {earthquakeData.length > 0 && timeMax > timeMin && (
                  <div className="flex flex-col gap-2 border border-white/20 rounded-lg p-3">
                     <div className="text-sm text-white/90 font-medium">Time-Lapse Playback</div>
                     <div className="flex items-center gap-2">
                        <button
                           onClick={handlePlayPause}
                           className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
                        >
                           {isPlaying ? '⏸ Pause' : '▶ Play'}
                        </button>
                        <button
                           onClick={handleResetTimelapse}
                           className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
                        >
                           ↺ Reset
                        </button>
                     </div>

                     <input
                        type="range"
                        min={timeMin}
                        max={timeMax}
                        step={ONE_MINUTE_IN_MS}
                        value={playbackTime ?? timeMax}
                        onChange={handleSliderChange}
                        className="w-full accent-primary"
                     />

                     <div className="flex justify-between text-xs text-white/50">
                        <span>{formatEpochToLocale(timeMin)}</span>
                        <span className="text-white/80">
                           {playbackTime != null ? formatEpochToLocale(playbackTime) : 'All'}
                        </span>
                        <span>{formatEpochToLocale(timeMax)}</span>
                     </div>
                  </div>
               )}

               {/* Earthquake Data Table */}
               {visibleEarthquakeData.length > 0 && (
                  <EarthquakeTable
                     earthquakeData={visibleEarthquakeData}
                     onFocusEarthquake={focusOnEarthquake}
                  />
               )}
            </div>
         )}
      </div>
   )
}
