import { useState, useContext } from 'react'
import { JSONTree } from 'react-json-tree'

import // useReactModelRoot,
// ReactModel,
// CroquetContext
'@croquet/react'

import { filterModel } from '@utils'

export default function InspectModel({ model }: { model?: any }) {
  // const rootModel = useReactModelRoot()
  // const ctx = useCroquetContext()
  // const rootModel = useReactModelRoot<T>()

  return (
    <div className='inspect-model'>
      {/* dropdown tree to select model or submodel */}

      <JSONTree
        {...{
          data: filterModel(model),
          labelRenderer: ([key]) => <strong>{key}</strong>,
          shouldExpandNodeInitially: () => true,
        }}
      />
    </div>
  )
}

// export function useCroquetContext() {
//   const contextValue = useContext(CroquetContext)
//   console.log(contextValue)
//   if (!contextValue) throw new Error('--- Not inside Croquet context')
//   return contextValue
// }
