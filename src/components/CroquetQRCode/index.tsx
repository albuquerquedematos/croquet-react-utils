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

  const [sizeBig, set_sizeBig] = useState(200)
  const sizeSmall = 75
  const opacitySmall = 0.3
  const opacityBig = 1

  const location = window.location.href
  const isExpanded = isPinned || hovering
  const size = isExpanded ? sizeBig : sizeSmall

  const togglePin = () => setIsPinned((prev) => !prev)
  const handleQRClick = () => window.open(location, '_blank')

  const handleCopy = () => {
    navigator.clipboard.writeText(location)
    setCopyIcon(<LuClipboardCheck />)
    setTimeout(() => setCopyIcon(<LuClipboardList />), 1500)
  }

  function handleScroll(e) {
    set_sizeBig((prev) => {
      const val = prev - e.deltaY / 2
      return (val < 200) ? 200 : val
    })
  }

  return (
    <div
      ref={ref}
      className='croquet-qr-container'
      style={{
        padding: isExpanded ? '' : `calc(${sizeSmall}px / 10)`,
        borderWidth: isExpanded ? '0.2rem' : `calc(${sizeSmall}px / 30)`,
        width: `${size}px`,
        opacity: isExpanded ? opacityBig : opacitySmall,
      }}
      onWheel={handleScroll}
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
