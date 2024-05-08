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
import { rgba, equalObjects, wordify, round, getNested } from '@utils'

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
    CROQUETVM: any
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
// const hidden = ['start', 'total', 'items', 'users', 'backlog', 'network', 'latency', 'activity', 'connected']

const dt: any = {
  line: ['latency'],
  bar: {
    // normal: ['activity'],
    stacked: ['items_simulate', 'items_snapshot', 'items_update', 'items_render'],
    inverted: ['backlog', 'network'],
  },
  show: [],
  // show: ['items_update', 'items_render', 'items_snapshot', 'items_simulate'],
}

const ptChipBtn = { root: { style: { cursor: 'pointer' } } }

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
// Items.simulate = time to simulate a frame
// Items.snapshot = time to take a snapshot

// FrameTime = time to process a frame

// min of all the totals. "normal render time"

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
  const [opacity, set_opacity] = useState(60)
  const [min, set_min] = useState(-100)
  const [max, set_max] = useState(50)

  const [itemMaxAll, set_itemMaxAll] = useState([0, 0, 0])
  const [itemMax, set_itemMax] = useState([0, 0, 0])

  useInterval(() => {
    const newFrames = [...window.CROQUETSTATS.frames]
    if (paused) return
    // const newLatencies = session?.latencies?.map((l) => l.ms) || []
    const newLatencies = session?.latencies || []
    if (!equalObjects(latencies, newLatencies)) set_latencies(newLatencies)
    if (!equalObjects(newFrames, frames)) set_frames(newFrames)
  }, 0)

  useInterval(() => updateItemMax(), 1000)

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
    },
  }

  useEffect(() => updateScales(), [])

  function updateScales() {
    const scales = {} as any
    set_hide(scales)
    generateColors()
    setTimeout(() => scales.stack = { stacked: true, display: false, min, max }, 1)
    // setTimeout(() => hiddenScales.forEach((s) => (scales[s] = { display: false, min, max })), 1)
  }

  function generateColors(alpha = opacity / 100) {
    var cs = {}
    Object.entries(_colors).forEach(([t, c]) => (cs[t] = rgba(c as string, alpha)))
    set_colors(cs)
  }

  function updateItemMax() {
    const updates = frameBuffer.map((f) => f?.items?.update) || []
    const renders = frameBuffer.map((f) => f?.items?.render) || []
    const simulates = frameBuffer.map((f) => f?.items?.simulate) || []
    const newMaxAll = [Math.max(...updates, itemMaxAll[0]), Math.max(...renders, itemMaxAll[1]), Math.max(...simulates, itemMaxAll[2])]
    const newMax = [Math.max(...updates), Math.max(...renders), Math.max(...simulates)]
    if (!equalObjects(newMaxAll, itemMaxAll)) set_itemMaxAll(newMaxAll)
    if (!equalObjects(newMax, itemMax)) set_itemMax(newMax)
  }

  function getScaleMinMax(trackedScales, step) {
    // trac
  }


  return (
    <>
      <Chart
        {...{
          type: 'bar',
          data: {
            labels: frameBuffer.map((f) => f.start),
            datasets: generateDatasets(frameBuffer, colors, latencies, min, max) as any,
          },
          // options: defaultOpts as any,
          options: { ...defaultOpts, scales: { ...defaultOpts.scales, ...hide } } as any,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1rem' }}>
        <InputNumber showButtons {...{ min: 1, max: 120, step: 5, value: bufferSize, onValueChange: (e) => set_bufferSize(e.value) }} />

        <Chip {...{ label: paused ? 'Play' : 'Pause', onClick: () => set_paused(!paused), pt: ptChipBtn }} />

        <Chip {...{ label: 'Force Snapshot', onClick: () => (window.CROQUETVM.controller.cpuTime = 100000), pt: ptChipBtn }} />

        <Slider
          {...{
            min: 1,
            max: 100,
            value: opacity,
            onChange: (e) => set_opacity(e.value as any),
            onSlideEnd: (e) => generateColors((e.value as any) / 100),
            style: { width: '10rem' },
          }}
        />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <p>
          Min ({min}) / Max ({max})
        </p>
        <Slider
          range
          {...{
            value: [min, max],
            min: -2000,
            max: 2000,
            step: 10,
            onChange: (e) => {
              set_min(e.value[0] as number)
              set_max(e.value[1] as number)
              updateScales()
            },
            onSlideEnd: () => updateScales(),
          }}
        />
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
        <span> Session / Buffer Max</span>
        <span>Update ---- {round(itemMaxAll[0], 2)} ms  /  {round(itemMax[0], 2)} ms</span>
        <span>Render ---- {round(itemMaxAll[1], 2)} ms  /  {round(itemMax[1], 2)} ms</span>
        <span>Simulate -- {round(itemMaxAll[2], 2)} ms  /  {round(itemMax[2], 2)} ms</span>
      </div>
    </>
  )
}

function generateDatasets(frames: Frame[], colors, latencies = [], min, max) {
  if (!frames.length) return []
  const datasets = []

  function processType({ ts, inverted = false, fs = frames, stack = 'stack' }) {
    for (const t of ts || []) {
      const data = fs.map((f) => getNested(f, t.split('_')) * (inverted ? -1 : 1)) as any
      datasets.push({ data, ...optsFromType(t, colors, stack) })
    }
  }

  processType({ ts: dt?.bar?.stacked })
  processType({ ts: dt?.bar?.inverted, inverted: true })
  processType({ ts: dt?.bar?.normal, stack: 'normal' })
  processType({ ts: dt?.line })

  return datasets
}

function optsFromType(type: string, colors, stack = 'stack') {
  switch (type) {
    case 'items_update':   return getOpts('bar', stack, 'Update', colors.update, 5) //prettier-ignore
    case 'items_render':   return getOpts('bar', stack, 'Render', colors.render, 6) //prettier-ignore
    case 'items_simulate': return getOpts('bar', stack, 'Simulate', colors.simulate, 7) //prettier-ignore
    case 'items_snapshot': return getOpts('bar', stack, 'Snapshot', colors.snapshot, 8) //prettier-ignore

    case 'backlog':  return getOpts('bar',  stack, wordify(type), colors.backlog, 10) //prettier-ignore
    case 'network':  return getOpts('bar',  stack, wordify(type), colors.network, 7) //prettier-ignore
    case 'activity': return getOpts('bar',  stack, wordify(type), colors.activity, 100) //prettier-ignore
    case 'simulate': return getOpts('bar',  stack, wordify(type), colors.simulate, 1) //prettier-ignore
    case 'latency':  return getOpts('line', stack, wordify(type), colors.latency) //prettier-ignore

    default: return getOpts('bar', 'unknown', 'Unknown', colors.unknown, 1000) //prettier-ignore
  }
}

function getOpts(type, yAxisID, label, color, order = null) {
  switch (type) {
    case 'bar':
      return {
        type: 'bar',
        order,
        label: label,
        yAxisID: yAxisID,
        backgroundColor: color,
        barPercentage: 0.9999,
        categoryPercentage: 1,
      }
    case 'line':
      return {
        type: 'line',
        order,
        label: label,
        yAxisID: yAxisID,
        backgroundColor: color,
        borderColor: color,
        pointStyle: false,
        tension: 0.2,
      }
    default:
      return {}
  }
}


//======================================================================================================
//======================================================================================================
//======================================================================================================


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
