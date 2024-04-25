
export const debugOptions: DebugOption[] = [
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