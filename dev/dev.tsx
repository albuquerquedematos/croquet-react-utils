import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { CroquetRoot, ReactModel, useReactModelRoot, useConnectedViews, useCroquetSession } from '@croquet/react'

import { CroquetDevMenu, CroquetQRCode } from '@components'

import 'primereact/resources/themes/lara-light-cyan/theme.css'

export default class RootModel extends ReactModel {
  init(options) {
    super.init(options)
  }
}
RootModel.register('RootModel')

const container = document.getElementById('root')
createRoot(container!).render(
  <StrictMode>
    <CroquetRoot
      sessionParams={{
        model: RootModel,
        appId: 'test.croquet.react.utils',
        apiKey: '',
        password: 'password',
        name: 'test',
        options: {
          trackViews: true,
        },
      }}
    >
      <App />
    </CroquetRoot>
  </StrictMode>
)

function App() {
  const model = useReactModelRoot<RootModel>()
  const views = useConnectedViews()
  const session = useCroquetSession()

  return (
    <>
      <CroquetDevMenu {...{ model, views, session }} />
      <CroquetQRCode />
    </>
  )
}
