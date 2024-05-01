// import { 
//   useConnectedViews,
// } from '@croquet/react' //prettier-ignore

import { Chip } from 'primereact/chip'

export default function ViewInfo(views) {
  // const views = useConnectedViews()

  return (
    <div>
      <h2>{views.viewCount || 0} Connected Views</h2>
      <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
        {views?.views?.map((view: string) => (
          <Chip key={view} label={view} />
        ))}
      </div>
    </div>
  )
}
