import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

import { CroquetRoot, ReactModel, useReactModelRoot, useConnectedViews, useCroquetSession } from '@croquet/react'

import { CroquetDevMenu, CroquetQRCode } from '@components'

import 'primereact/resources/themes/lara-light-cyan/theme.css'
import { useInterval } from '@hooks'

export default class RootModel extends ReactModel {
  init(options) {
    super.init(options)
    this.subscribe(this.id, 'ping', this.ping)
    this.simulate()
  }
  simulate() {
    for (let i = 0; i < 100000; i++) {
      const b = Math.sin(this.now() / 1000)
    }
    this.future(100).simulate()
  }
  ping() { console.log('Pong') }
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
          tps: 0,
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

  useEffect(() => {
    setInterval(() => model.ping(), 750)
  }, [])

  return (
    <>
      <CroquetDevMenu {...{ model, views, session }} />
      <CroquetQRCode />
    </>
  )
}
