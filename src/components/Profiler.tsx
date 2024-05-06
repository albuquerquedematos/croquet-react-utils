import { useEffect, useRef, useState } from 'react'
import { useInterval } from '@hooks'

import { Chip } from 'primereact/chip'
import { Slider } from 'primereact/slider'
import { InputNumber } from 'primereact/inputnumber'

import { 
  Chart as ChartJS,

  CategoryScale,
  LinearScale,

  PointElement,
  LineElement,
  BarElement,

  LineController,
  BarController,

  Title,
  Tooltip,
  Legend,
} from 'chart.js' //prettier-ignore
import { Bar, Line, Chart } from 'react-chartjs-2'
import { rgba, equalObjects, wordify } from '@utils'

ChartJS.register(
  CategoryScale, LinearScale, 
  PointElement, LineElement, BarElement,
  LineController, BarController,
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

// const order = ['simulate', 'update', 'render', 'snapshot']
// const types = ['total', 'items', 'backlog', 'network', 'activity']
// const types = ['start', 'total', 'items', 'backlog', 'network', 'activity']

// const _hiddenScales = ['start', 'total', 'items', 'users', 'backlog', 'network', 'latency', 'activity', 'connected']
// const _hiddenScales = []
const _hiddenScales = ['activity', 'items', 'backlog', 'network', 'latency']
// const stackedTypes = ['simulate', 'update', 'render', 'snapshot']
// const stackedTypes = ['backlog', 'network', 'items']
const stackedTypes = ['activity', 'items']
const lineTypes = ['latency']

// const dataTypes = {
//   line: ['latency'],
//   bar: {
//     stacked: ['activity', 'items'],
//     inverted: ['backlog', 'network'],
//   },
// }

// const invertedTypes = ['activity']
const invertedTypes = ['backlog', 'network']
const hiddenScales = _hiddenScales.filter(
  (scale) => stackedTypes.includes(scale) || invertedTypes.includes(scale) || lineTypes.includes(scale),
)

const _colors: any = {
  total: 'black',
  update: 'blue',
  render: 'magenta',
  simulate: 'yellow',
  snapshot: 'green',
  backlog: 'red',
  network: 'lightgray',
  latency: 'purple',
  unknown: 'pink',
}

// Activity: ms since we last sent something to the reflector (Useless to view)
// Backlog: ms of simulation time to catch up to reflector time (ideally 0)
// Network: ms since last message received from reflector

// Items.render = time to render a given frame
// Items.update = simulation time spent for a frame

type ProfilerProps = {
  bufferSize?: number
  session: any
}
export default function Profiler({ bufferSize: bfs = 60, session }: ProfilerProps) {
  if (bfs > 120) bfs = 120
  if (bfs < 1) bfs = 1

  const [frames, set_frames] = useState<Frame[]>([])
  const [latencies, set_latencies] = useState([])

  const [hide, set_hide] = useState({})
  const [paused, set_paused] = useState(false)
  const [bufferSize, set_bufferSize] = useState(bfs)

  const [colors, set_colors] = useState({})
  const [opacity, set_opacity] = useState(20)
  const [min, set_min] = useState(-150)
  const [max, set_max] = useState(1000)

  useInterval(() => {
    const newFrames = [...window.CROQUETSTATS.frames]
    if (paused) return
    // const newLatencies = session?.latencies?.map((l) => l.ms) || []
    const newLatencies = session?.latencies || []
    if (!equalObjects(latencies, newLatencies)) set_latencies(newLatencies)
    if (!equalObjects(newFrames, frames)) set_frames(newFrames)
  }, 0)

  const frameBuffer = frames.slice(-bufferSize)

  const lastIdx = frameBuffer.length - 1
  const users = frameBuffer?.[lastIdx]?.users
  const connected = frameBuffer?.[lastIdx]?.connected ? 'Yes' : 'No'
  const latency = frameBuffer?.[lastIdx]?.latency + 'ms'
  const framerate = Math.round(1000 / frameBuffer?.[0]?.total) + ' fps'
  const s = '    |    '

  const defaultOpts = {
    plugins: {
      title: {
        display: true,
        text: `Users: ${users + s}Connected: ${connected + s}Latency: ${latency + s}${framerate}`,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (ctx) => {
            const label = ctx.dataset.label || ''
            const diff = ctx?.parsed?._custom?.end - ctx?.parsed?._custom?.start || ctx.raw || 0
            if (isNaN(diff) || diff === 0) return ''
            return `${label}: ${Math.abs(diff)} ms`
          },
          title: (ctx) => `Timestamp: ${ctx[0].label}`,
        },
      },
    },
    animation: { duration: 0 },
    responsive: true,
    scales: {
      x: { stacked: true, display: false, barThickness: 10 },
      y: { stacked: true, display: false, beginAtZero: true },
    },
  }

  useEffect(() => updateScales(), [])

  function updateScales() {
    const scales = {}
    set_hide(scales)
    generateColors()
    setTimeout(() => {
      for (const scale of hiddenScales) scales[scale] = { display: false, min, max }
    }, 1)
  }

  function generateColors(alpha = opacity / 100) {
    var cs = {}
    Object.entries(_colors).forEach(([t, c]) => (cs[t] = rgba(c as string, alpha)))
    set_colors(cs)
  }

  return (
    <>
      <Chart
        data={{
          labels: frameBuffer.map((f) => f.start),
          datasets: generateDatasets(frameBuffer, colors, latencies) as any,
        }}
        options={{ ...defaultOpts, scales: { ...defaultOpts.scales, ...hide } } as any}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1rem' }}>
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

        <Chip
          {...{
            label: paused ? 'Play' : 'Pause',
            onClick: () => set_paused(!paused),
            pt: { root: { style: { cursor: 'pointer' } } },
          }}
        />

        <Slider
          {...{
            value: opacity,
            onChange: (e) => set_opacity(e.value as any),
            onSlideEnd: (e) => generateColors((e.value as any) / 100),
            min: 1,
            max: 100,
            style: { width: '10rem' },
          }}
        />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <p>Min ({min}) / Max ({max})</p>
        <Slider
          range
          {...{
            value: [min, max],
            min: -2000,
            max: 5000,
            step: 100,
            onChange: (e) => {
              const nv = e.value as number[]
              if (nv[0] <= -100) set_min(nv[0] as number)
              if (nv[1] >= 100) set_max(nv[1] as number)
              if (nv[0] <= -100 && nv[1] >= 100) updateScales()
            },
            onSlideEnd: () => updateScales(),
          }}
        />
      </div>
    </>
  )
}

// TODO? Auto Update the scale min and max based on the data (ignoring activity and network)
function updateMinMax(min, max) {
  // 10, 100, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000
}

function generateDatasets(frames: Frame[], colors, latencies = []) {
  if (!frames.length) return []
  const stack = stackedTypes.map((type) => {
    const data = frames.map((f) => {
      let sum = 0
      for (const t of stackedTypes) {
        if (t === type) break
        sum += f[t]
      }
      const sum2 = sum + f[type] || 0
      return [sum, sum2]
    })
    return { data, ...optsFromType(type, colors) }
  })

  for (const type of invertedTypes) {
    const data = frames.map((f) => -f[type]) as any
    // console.log(data)
    stack.push({ data, ...optsFromType(type, colors) })
  }

  for (const type of lineTypes) {
    const data = frames.map((f) => f[type]) as any
    stack.push({ data, ...optsFromType(type, colors) })
  }

  // stack.push({ data: latencies, ...optsFromType('latency', colors) })
  // stack.push({ data: getLatencies(frames, latencies), ...optsFromType('latency', colors) })

  return stack
}

function getOpts(type, label, color, order = null) {
  switch (type) {
    case 'bar':
      return {
        type: 'bar',
        order,
        label: wordify(label),
        yAxisID: label,
        backgroundColor: color,
        barPercentage: 0.9999,
        categoryPercentage: 1,
      }
    case 'line':
      return {
        type: 'line',
        order,
        label: wordify(label),
        yAxisID: label,
        backgroundColor: color,
        borderColor: color,
        pointStyle: false,
        tension: 0.2,
      }
    default:
      return {}
  }
}

function optsFromType(type: string, colors) {
  switch (type) {
    case 'items':    return getOpts('bar',  type, colors.update, 5) //prettier-ignore
    case 'backlog':  return getOpts('bar',  type, colors.backlog, 10) //prettier-ignore
    case 'network':  return getOpts('bar',  type, colors.network, 7) //prettier-ignore
    case 'activity': return getOpts('bar',  type, colors.activity, 100) //prettier-ignore
    case 'simulate': return getOpts('bar',  type, colors.simulate, 1) //prettier-ignore
    case 'latency':  return getOpts('line', type, colors.latency) //prettier-ignore
    default:         return getOpts('bar', 'unknown', colors.unknown, 1000) //prettier-ignore
  }
}


// TODO: Accurate event latencies (from the reflector) from events as opposed to from frames
function getLatencies(frames: Frame[], latencies) {
  // const mss = latencies.map((l) => l.ms) || []
  // const times = latencies.map((f) => f.time) || []

  const start = frames[frames.length - 1].start
  const now = performance.now()

  const delta = now - start // time per frame

  // console.log('delta', delta)

  // first 
  const _first = latencies[0]?.time || 0
  const _latest = latencies[latencies.length - 1]?.time || 0
  const first = _first < frames[0].start ? frames[0].start : _first
  const latest = _latest < frames[0].start ? frames[0].start : _latest

  // newLatencies should be of size frames.length
  const newLatencies = []
  // we want to populate newLatencies with the latencies in the right order
  // we can get the timestamp of a frame: frames[i].start
  // we can get the timestamp of a latency: latencies[i].time

  
  // console.log('newLatencies', newLatencies)

  // now for each latencies[i] if the value is lower than frames[i].start we return,
  // otherwise we add it to the newLatencies array. (in the right order)

  return newLatencies
}
// frame.start = performance.now()
// latencies[i].time = Date.now()
// Date.now() - performance.now() = latency delta
