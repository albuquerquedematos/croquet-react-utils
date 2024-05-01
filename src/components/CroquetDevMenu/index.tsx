import './index.scss'
import { useState, useEffect } from 'react'

import { Card } from 'primereact/card'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { MultiSelect } from 'primereact/multiselect'

import { croquet } from '@images'
import { updateUrlParams } from '@utils'
import { InspectModel, ViewInfo } from '@components'

import { debugOptions } from './data'

const buttonSize = '40px'
const buttonMargin = '10px'
const mainColor = '#ee483e'
const bpt = { root: { style: { background: mainColor, border: 'none' } } }

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
}
export default function CroquetDevMenu({ position = 'top-right', model, views }: DevMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [optionsDropdown, setOptionsDropdown] = useState<DebugOption[]>([])
  const [modelInspectOpen, set_modelInspectOpen] = useState(false)
  const [viewInfoOpen, set_viewInfoOpen] = useState(false)

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
          <Button {...{ onClick: () => handleOptionChange([]), pt: bpt, style: { display: 'flex', justifyContent: 'center' } }}>Clear</Button>
        </Card>

        <Card {...{ pt }}>
          <Button {...{ pt: bpt, onClick: () => {
            set_modelInspectOpen(true)
            setIsOpen(false)
          }}}>
            Inspect Model
          </Button>

          <Button {...{ pt: bpt, onClick: () => {
            set_viewInfoOpen(true)
            setIsOpen(false)
          }}}>
            Inspect Views
          </Button>
        </Card>
      </Dialog>

      <Dialog
        {...{
          header: 'Inspect Model',
          modal: false,
          visible: modelInspectOpen,
          onHide: () => set_modelInspectOpen(false),
          style: { minWidth: '10rem', width: '60vw', background: 'lightgray', fontSize: '0.7rem' },
        }}
      >
        <InspectModel {...{ model }}/>
      </Dialog>

      <Dialog
        {...{
          header: 'View Info',
          modal: false,
          visible: viewInfoOpen,
          onHide: () => set_viewInfoOpen(false),
          style: { minWidth: '10rem', width: '60vw', background: 'lightgray', fontSize: '0.7rem' },
        }}
      >
        <ViewInfo {...views}/>
      </Dialog>

    </div>
  )
}
