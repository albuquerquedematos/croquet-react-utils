import { useState, useContext, useEffect } from 'react'
import { JSONTree } from 'react-json-tree'

import {
  ReactModel,
// useReactModelRoot,
// CroquetContext
} from '@croquet/react'

import { filterModel } from '@utils'

export default function InspectModel({ model }: { model?: ReactModel }) {
  // const rootModel = useReactModelRoot()
  // const ctx = useCroquetContext()
  // const rootModel = useReactModelRoot<T>()

  // const getModels = () => {
  //   const models = []
  //   for (const [key, value] of Object.entries(model)) {
  //     console.log(key, value, value instanceof ReactModel)
  //     if (value instanceof ReactModel) models.push(value)
  //   }
  //   return models
  // }

  return (
    <div className='inspect-model'>
      {/* dropdown tree to select model or submodel */}
      {/* Models: {JSON.stringify(getModels())} */}

      <JSONTree
        {...{
          data: filterModel(model) || {},
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
