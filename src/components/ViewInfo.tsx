// import { 
//   useConnectedViews,
// } from '@croquet/react' //prettier-ignore

import { Chip } from 'primereact/chip'

export default function ViewInfo(v) {
  // const views = useConnectedViews()

  return (
    <div>
      <h2>{v.viewCount || 0} Connected Views</h2>
      <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
        {v?.views?.map((view: string) => (
          <Chip key={view} label={view} />
        ))}
      </div>
    </div>
  )
}
