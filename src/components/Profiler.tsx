import { useEffect, useRef, useState } from 'react'
import { useInterval } from '@hooks'

import { InputNumber } from 'primereact/inputnumber'

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

type ProfilerProps = {
  bufferSize?: number
}
export default function Profiler({ bufferSize:bfs = 60 }: ProfilerProps) {
  if (bfs > 120) bfs = 120
  if (bfs < 1) bfs = 1

  const [frames, set_frames] = useState<Frame[]>([])
  const [bufferSize, set_bufferSize] = useState(bfs)

  useInterval(() => {
    const newFrames = [...window.CROQUETSTATS.frames]
    if (JSON.stringify(newFrames) !== JSON.stringify(frames)) set_frames(newFrames)
  }, 0)

  const frameBuffer = frames.slice(-bufferSize)

  const users = frameBuffer?.[0]?.users
  const connected = frameBuffer?.[0]?.connected ? 'Yes' : 'No'
  const latency = frameBuffer?.[0]?.latency + 'ms'

  return (<>
    <Bar
      data={{
        labels: frameBuffer.map((f) => f.start),
        datasets: generateDatasets(frameBuffer),
      }}
      options={{
        plugins: {
          title: {
            display: true,
            text: `Users: ${users} | Connected: ${connected} | Latency: ${latency}`,
          },
        },
        responsive: true,
        scales: { x: { stacked: true }, y: { stacked: true } },
      }}
      />

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
    </>
  )
}

function generateDatasets(frames: Frame[]) {
  if (!frames.length) return []

  const ignoredTypes = ['start', 'users', 'connected', 'latency']
  const types = Object.keys(frames[0]).filter((type) => !ignoredTypes.includes(type))

  return types.map((type) => {
    return {
      // data: frames.map((f) => f[type]),
      data: frames.map((f) => f[type]),
      ...optsFromType(type),
    }
  })
}

const colors = {
  total: 'black',
  update: 'blue',
  render: 'magenta',
  simulate: 'yellow',
  snapshot: 'green',
  backlog: 'red',
  network: 'lightgray',
}

function optsFromType(type: string) {
  switch (type) {
    case 'total':
      return {
        label: 'Total',
        yAxisID: 'time',
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
      }
    case 'items':
      return {
        label: 'Items',
        yAxisID: 'items',
        backgroundColor: 'rgba(255,99,132,0.2)',
        borderColor: 'rgba(255,99,132,1)',
      }
    case 'backlog':
      return {
        label: 'Backlog',
        yAxisID: 'backlog',
        backgroundColor: 'rgba(54,162,235,0.2)',
        borderColor: 'rgba(54,162,235,1)',
      }
    case 'network':
      return {
        label: 'Network',
        yAxisID: 'network',
        backgroundColor: 'rgba(153,102,255,0.2)',
        borderColor: 'rgba(153,102,255,1)',
      }
    case 'activity':
      return {
        label: 'Activity',
        yAxisID: 'activity',
        backgroundColor: 'rgba(255,99,132,0.2)',
        borderColor: 'rgba(255,99,132,1)',
      }
    case 'connected':
      return {
        label: 'Connected',
        yAxisID: 'connected',
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
      }
    default:
      return {
        label: 'Unknown',
        yAxisID: 'unknown',
        backgroundColor: 'rgba(192,192,192,0.2)',
        borderColor: 'rgba(192,192,192,1)',
      }
  }
}
