import { useState } from 'react'
import QRCode from 'react-qr-code'
import { useHover } from '@uidotdev/usehooks'
import { BsPin, BsPinFill } from 'react-icons/bs'
import { LuClipboardCheck, LuClipboardList } from 'react-icons/lu'

import './styles.scss'

export default function CroquetQRCode() {
  const [isPinned, setIsPinned] = useState(false)
  const [copyIcon, setCopyIcon] = useState(<LuClipboardList />)
  const [ref, hovering] = useHover()

  const SIZE_BIG = 200
  const SIZE_SMALL = 75
  const OPACITY_SMALL = 0.3
  const OPACITY_BIG = 1

  const location = window.location.href
  const isExpanded = isPinned || hovering
  const size = isExpanded ? SIZE_BIG : SIZE_SMALL

  const togglePin = () => setIsPinned((prev) => !prev)
  const handleQRClick = () => window.open(location, '_blank')

  const handleCopy = () => {
    navigator.clipboard.writeText(location)
    setCopyIcon(<LuClipboardCheck />)
    setTimeout(() => setCopyIcon(<LuClipboardList />), 1500)
  }

  return (
    <div
      ref={ref}
      className='croquet-qr-container'
      style={{
        padding: isExpanded ? '' : `calc(${SIZE_SMALL}px / 10)`,
        borderWidth: isExpanded ? '0.2rem' : `calc(${SIZE_SMALL}px / 30)`,
        width: `${size}px`,
        opacity: isExpanded ? OPACITY_BIG : OPACITY_SMALL,
      }}
    >
      {isExpanded && (
        <div className='top-bar' onClick={togglePin}>
          {isPinned ? <BsPinFill /> : <BsPin />}
        </div>
      )}

      <div className='qr' onClick={handleQRClick} style={{ padding: isExpanded ? '0.5rem 0.8rem' : '' }}>
        <QRCode value={location} />
      </div>

      {isExpanded && (
        <div className='bottom-bar'>
          <div className='url'>{location}</div>

          <div className='button' onClick={handleCopy}>
            {copyIcon}
          </div>
        </div>
      )}
    </div>
  )
}
