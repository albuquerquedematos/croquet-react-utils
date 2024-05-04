import { useEffect, useRef, useState } from 'react'
import { useInterval } from '@hooks'

import { InputNumber } from 'primereact/inputnumber'
import { Chip } from 'primereact/chip'

import { 
  Chart,

  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,

  Title,
  Tooltip,
  Legend,
} from 'chart.js' //prettier-ignore
import { Bar } from 'react-chartjs-2'
import { rgba } from '@utils'

Chart.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend,
) //prettier-ignore

declare global {
  interface Window {
    CROQUETSTATS: {
      frames: Frame[]
    }
  }
}

type Frame = {
  start: number
  total: number
  items: Record<string, any>
  users: number
  backlog: number
  network: number
  latency: number
  activity: number
  connected: boolean
}

const emptyFrame = { start: 0, total: 0, items: {}, users: 0, backlog: 0, network: 0, latency: 0, activity: 0, connected: false }

// const order = ['simulate', 'update', 'render', 'snapshot']
// const types = ['total', 'items', 'backlog', 'network', 'activity']
// const types = ['start', 'total', 'items', 'backlog', 'network', 'activity']

const _hiddenScales = ['start', 'total', 'items', 'users', 'backlog', 'network', 'latency', 'activity', 'connected']
// const stackedTypes = ['simulate', 'update', 'render', 'snapshot']
const stackedTypes = ['backlog', 'network', 'activity', 'items', 'simulate']
const otherTypes = []
const hiddenScales = _hiddenScales.filter((scale) => stackedTypes.includes(scale) || otherTypes.includes(scale))

const alpha = 0.3
const _colors: any = {
  total: 'black',
  update: 'blue',
  render: 'magenta',
  simulate: 'yellow',
  snapshot: 'green',
  backlog: 'red',
  network: 'lightgray',
  unknown: 'gray',
}

type ProfilerProps = {
  bufferSize?: number
}
export default function Profiler({ bufferSize: bfs = 60 }: ProfilerProps) {
  if (bfs > 120) bfs = 120
  if (bfs < 1) bfs = 1

  const [frames, set_frames] = useState<Frame[]>([])
  const [bufferSize, set_bufferSize] = useState(bfs)
  const [hide, set_hide] = useState({})
  const [paused, set_paused] = useState(false)
  const [colors, set_colors] = useState({})

  useInterval(() => {
    const newFrames = [...window.CROQUETSTATS.frames]
    if (paused) return
    if (JSON.stringify(newFrames) !== JSON.stringify(frames)) set_frames(newFrames)
  }, 0)

  const frameBuffer = frames.slice(-bufferSize)

  const users = frameBuffer?.[0]?.users
  const connected = frameBuffer?.[0]?.connected ? 'Yes' : 'No'
  const latency = frameBuffer?.[0]?.latency + 'ms'
  const framerate = Math.round(1000 / frameBuffer?.[0]?.total) + ' fps'
  const s = '    |    '

  const defaultOpts = {
    plugins: {
      title: {
        display: true,
        text: `Users: ${users + s}Connected: ${connected + s}Latency: ${latency + s}${framerate}`,
      },
    },
    responsive: true,
    scales: { x: { stacked: true, display: false }, y: { stacked: true, display: false } },
    animation: { duration: 0 },
  }

  useEffect(() => {
    const scales = {}
    for (const scale of hiddenScales) scales[scale] = { display: false }
    set_hide(scales)
    generateColors()
  }, [])

  function generateColors() {
    var cs = {}
    Object.entries(_colors).forEach(([t, c]) => (cs[t] = rgba(c as string, alpha)))
    set_colors(cs)
  }

  return (
    <>
      <Bar
        data={{
          labels: frameBuffer.map((f) => f.start),
          datasets: generateDatasets(frameBuffer, colors),
        }}
        options={{ ...defaultOpts, scales: { ...defaultOpts.scales, ...hide } }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <InputNumber
          {...{
            value: bufferSize,
            onValueChange: (e) => set_bufferSize(e.value),
            showButtons: true,
            min: 1,
            max: 120,
            step: 5,
          }}
        />

        <Chip {...{
          label: paused ? 'Play' : 'Pause',
          onClick: () => set_paused(!paused),
          pt: { root: { style: { cursor: 'pointer' } } },
        }} />
      </div>
    </>
  )
}

function generateDatasets(frames: Frame[], colors) {
  if (!frames.length) return []
  const stack = stackedTypes.map((type) => {
    const data = frames.map((f) => {
      let sum = 0
      for (const t of stackedTypes) {
        if (t === type) break
        sum += f[t]
      }
      const sum2 = f[type] || 0
      return [sum, sum2]
    })
    return { data, ...optsFromType(type, colors) }
  })

  for (const type of otherTypes) {
    if (!stackedTypes.includes(type)) {
      const data = frames.map((f) => f[type])
      stack.push({ data, ...optsFromType(type, colors) })
    }
  }

  return stack
}

function optsFromType(type: string, colors) {
  switch (type) {
    case 'items':
      return {
        label: 'Items',
        yAxisID: 'items',
        backgroundColor: colors.update,
      }
    case 'backlog':
      return {
        label: 'Backlog',
        yAxisID: 'backlog',
        backgroundColor: colors.backlog,
      }
    case 'network':
      return {
        label: 'Network',
        yAxisID: 'network',
        backgroundColor: colors.network,
      }
    case 'activity':
      return {
        label: 'Activity',
        yAxisID: 'activity',
        backgroundColor: colors.snapshot,
      }
    case 'simulate':
      return {
        label: 'Simulate',
        yAxisID: 'simulate',
        backgroundColor: colors.simulate,
      }
    default:
      return {
        label: 'Unknown',
        yAxisID: 'unknown',
        backgroundColor: colors.unknown,
      }
  }
}
