import './index.scss'
import { useState, useEffect } from 'react'

import { Card } from 'primereact/card'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { MultiSelect } from 'primereact/multiselect'

import { croquet } from '@images'
import { updateUrlParams, theme } from '@utils'
import { InspectModel, SessionInfo } from '@components'

import { debugOptions } from './data'

const buttonSize = '40px'
const buttonMargin = '10px'

const menuPosition = {
  'top-left': { top: buttonMargin, left: buttonMargin },
  'top-right': { top: buttonMargin, right: buttonMargin },
  'bottom-left': { bottom: buttonMargin, left: buttonMargin },
  'bottom-right': { bottom: buttonMargin, right: buttonMargin },
}

interface DevMenuProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  model?: any
  views?: any
  session?: any
  changeSession?: any
}
export default function CroquetDevMenu({ position = 'top-right', model, views, session, changeSession}: DevMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [optionsDropdown, setOptionsDropdown] = useState<DebugOption[]>([])
  const [modelInspectOpen, set_modelInspectOpen] = useState(false)
  const [sessionInspectOpen, set_sessionInspectOpen] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const debugParam = urlParams.get('debug')
    if (debugParam) {
      const options = debugParam.split(',')
      const validOptions = options.filter((option) => debugOptions.some((debugOption) => debugOption.label === option))
      setOptionsDropdown(debugOptions.filter((option) => validOptions.includes(option.label)))
    }
  }, [])

  const handleOptionChange = (option: DebugOption[]) => {
    setOptionsDropdown(option)
    const updatedOptions = option.map((item) => item.label)
    updateUrlParams(updatedOptions, 'debug')
  }

  // Card Pass-through props
  const pt = {
    body: { style: { padding: '1rem', marginTop: '1rem' } },
    content: { style: { padding: 0, display: 'flex', gap: '1rem' } },
  }

  return (
    <div className='croquet-dev-menu'>
      <button onClick={() => setIsOpen(true)} style={{ width: buttonSize, height: buttonSize, ...menuPosition[position] }}>
        <img src={croquet} alt='Croquet' style={{ width: '100%', height: '100%' }} />
      </button>

      <Dialog
        {...{
          header: 'Developer Menu',
          visible: isOpen,
          onHide: () => setIsOpen(false),
          style: { minWidth: '25rem', width: '60vw', background: 'lightgray' },
          pt: { header: { style: { background: 'transparent' } }, content: { style: { background: 'transparent' } } },
        }}
      >
        <Card {...{ subTitle: 'Debug Log Options', pt }}>
          <MultiSelect
            {...{
              display: 'chip',
              placeholder: 'Select',
              value: optionsDropdown,
              options: debugOptions,
              onChange: (e) => handleOptionChange(e.value),
              optionLabel: 'label',
              style: { padding: 0, width: 'calc(100% - 6rem)' },
            }}
          />
          <Button {...{ onClick: () => handleOptionChange([]), pt: theme.buttonPT, style: { display: 'flex', justifyContent: 'center' } }}>Clear</Button>
        </Card>

        <Card {...{ pt }}>
          <Button {...{ pt: theme.buttonPT, onClick: () => {
            set_modelInspectOpen(true)
            setIsOpen(false)
          }}}>
            Inspect Model
          </Button>

          <Button {...{ pt: theme.buttonPT, onClick: () => {
            set_sessionInspectOpen(true)
            setIsOpen(false)
          }}}>
            Inspect Session
          </Button>
        </Card>
      </Dialog>

      <Dialog
        {...{
          header: 'Inspect Model',
          modal: false,
          visible: modelInspectOpen,
          onHide: () => set_modelInspectOpen(false),
          style: { minWidth: '10rem', width: '60vw', height: '60vh', maxHeight: '100vh', background: 'lightgray', fontSize: '0.7rem' },
        }}
      >
        <InspectModel {...{ model }}/>
      </Dialog>

      <Dialog
        {...{
          header: 'Inspect Session',
          modal: false,
          visible: sessionInspectOpen,
          onHide: () => set_sessionInspectOpen(false),
          style: { minWidth: '10rem', width: '60vw', background: 'lightgray', fontSize: '0.7rem' },
        }}
      >
        <SessionInfo {...{ views, session, changeSession }}/>
      </Dialog>

    </div>
  )
}
