import './index.scss'
import { useState, useEffect } from 'react'

import { Card } from 'primereact/card'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { MultiSelect } from 'primereact/multiselect'

import { croquet } from '@images'
import { updateUrlParams } from '@utils'

interface DebugOption {
  label: string
  tooltip: string
}

const debugOptions: DebugOption[] = [
  { label: 'session', tooltip: 'Session ID and connections/disconnections' },
  { label: 'messages', tooltip: 'Received from reflector, after decryption (cf. encrypted messages visible in a WebSocket debugger)' },
  { label: 'sends', tooltip: 'Sent to reflector, before encryption (cf. encrypted messages visible in a WebSocket debugger)' },
  { label: 'snapshot', tooltip: 'Snapshot stats' },
  { label: 'hashing', tooltip: 'Code hashing to derive session ID/persistentId' },
  { label: 'subscribe', tooltip: 'Subscription additions/removals' },
  { label: 'classes', tooltip: 'Class registrations' },
  { label: 'ticks', tooltip: 'Each tick received' },
  { label: 'write', tooltip: 'Detect accidental writes from view code to model properties' },
  { label: 'offline', tooltip: 'Disable multiuser' },
]

const buttonSize = '40px'
const buttonMargin = '10px'
const closeBtnSize = '35px'

const menuPosition = {
  'top-left': { top: buttonMargin, left: buttonMargin },
  'top-right': { top: buttonMargin, right: buttonMargin },
  'bottom-left': { bottom: buttonMargin, left: buttonMargin },
  'bottom-right': { bottom: buttonMargin, right: buttonMargin },
}

interface DevMenuProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}
export default function CroquetDevMenu({ position = 'top-right' }: DevMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [optionsDropdown, setOptionsDropdown] = useState<DebugOption[]>([])

  const toggleDevMenu = () => setIsOpen(!isOpen)

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
    body: { style: { padding: '1rem' } },
    content: { style: { padding: 0, display: 'flex', gap: '1rem' } },
  }

  return (
    <div className='croquet-dev-menu'>
      <button onClick={toggleDevMenu} style={{ width: buttonSize, height: buttonSize, ...menuPosition[position] }}>
        <img src={croquet} alt='Croquet' style={{ width: '100%', height: '100%' }} />
      </button>

      <Dialog
        {...{
          header: 'Developer Menu',
          visible: isOpen,
          onHide: toggleDevMenu,
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
          <Button {...{ onClick: () => handleOptionChange([]), style: { display: 'flex', justifyContent: 'center' } }}>Clear</Button>
        </Card>
      </Dialog>
    </div>
  )
}
