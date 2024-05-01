import { useState, useContext } from 'react'

import {
  useReactModelRoot,
  ReactModel,
  // CroquetContext
} from '@croquet/react'

export default function InspectModel({ model }: { model?: any }) {
  // const rootModel = useReactModelRoot()
  // const ctx = useCroquetContext()
  // const rootModel = useReactModelRoot<T>()

  return (
    <div className='inspect-model'>
      <h1>Inspect Model</h1>
      <pre>
        {JSON.stringify(model, null, 2)}
        {/* {JSON.stringify(rootModel, null, 2)} */}
        {/* {JSON.stringify(ctx, null, 2)} */}
      </pre>
    </div>
  )
}

// export function useCroquetContext() {
//   const contextValue = useContext(CroquetContext)
//   console.log(contextValue)
//   if (!contextValue) throw new Error('--- Not inside Croquet context')
//   return contextValue
// }
