import { Slider } from '@nextui-org/react'
import { useSolarSystem } from '@/app/components/atoms/three/solarSystem/solarSystem.model'

const MIN_TRAJECTORY_LINE_WIDTH = 1
const MAX_TRAJECTORY_LINE_WIDTH = 10
const TRAJECTORY_LINE_WIDTH_STEP = 0.25

export function SolarSystemTabView() {
   const { trajectoryLineWidth, setTrajectoryLineWidth } = useSolarSystem()

   const handleLineWidthChange = (value: number | number[]): void => {
      setTrajectoryLineWidth(Array.isArray(value) ? value[0] : value)
   }

   return (
      <div className="flex w-full flex-col gap-4 p-4">
         <div className="rounded-xl border border-white/20 bg-black/20 p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
               Trajectories
            </p>
            <p className="mt-1 text-xs text-white/60">
               Tune orbital path thickness in real time.
            </p>
            <Slider
               className="mt-4"
               label="Line Width"
               step={TRAJECTORY_LINE_WIDTH_STEP}
               minValue={MIN_TRAJECTORY_LINE_WIDTH}
               maxValue={MAX_TRAJECTORY_LINE_WIDTH}
               value={trajectoryLineWidth}
               onChange={handleLineWidthChange}
               showSteps={false}
               marks={[
                  { value: MIN_TRAJECTORY_LINE_WIDTH, label: `${MIN_TRAJECTORY_LINE_WIDTH}%` },
                  { value: MAX_TRAJECTORY_LINE_WIDTH, label: `${MAX_TRAJECTORY_LINE_WIDTH}%` },
               ]}
            />
         </div>
      </div>
   )
}
