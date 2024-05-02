// import { 
//   useConnectedViews,
// } from '@croquet/react' //prettier-ignore

import { Chip } from 'primereact/chip'

export default function ViewInfo(views) {
  // const views = useConnectedViews()

  const vc = views?.viewCount || 0
  return (
    <div>
      <h2>{vc} Connected View{vc == 1 || 's'}</h2>
      <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
        {views?.views?.map((view: string) => (
          <Chip key={view} label={view} />
        ))}
      </div>
    </div>
  )
}
