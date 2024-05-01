import ViewInfo from './ViewInfo'
import { Chip } from 'primereact/chip'
import { Button } from 'primereact/button'
import { Divider } from 'primereact/divider'
import { InputText } from 'primereact/inputtext'

import { useState } from 'react'

import { theme } from '@utils'

export default function SessionInfo({ views, session, changeSession }) {
  const inputStyle = { width: '100%', maxWidth: '13rem' }

  const [sName, set_sName] = useState(session?.name || '')
  const [sPassword, set_sPassword] = useState(session?.password || '')

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        <InputText
          {...{
            placeholder: 'Name',
            style: inputStyle,
            value: sName,
            onChange: (e) => set_sName(e.target.value),
          }}
        />
        <InputText
          {...{
            placeholder: 'Password',
            style: inputStyle,
            value: sPassword,
            onChange: (e) => set_sPassword(e.target.value),
          }}
        />
        <div style={{ flexGrow: 1 }} />
        <Button
          {...{
            pt: theme.buttonPT,
            onClick: () => changeSession({ name: sName, password: sPassword }),
          }}
        >
          Update Session
        </Button>
      </div>
      <Divider />

      <h2>Current Session Data</h2>
      <Property {...{ name: 'ID', value: session?.id }} />
      <Property {...{ name: 'Persistent ID', value: session?.persistentId }} />
      <Property {...{ name: 'Version ID', value: session?.versionId }} />
      <Divider />
      <ViewInfo {...views} />
    </div>
  )
}

function Property({ name, value }) {
  const br = '0.3rem'
  return (
    <div style={{ wordWrap: 'break-word', marginBottom: '0.5rem' }}>
      <div
        style={{
          borderRadius: `${br} ${br} 0 0`,
          display: 'inline-block',
          background: 'gray',
          color: 'white',
          padding: '0.1rem 0.4rem',
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontSize: '0.8rem',
          background: 'lightgray',
          padding: '0.5rem',
          borderRadius: `0 ${br} ${br}`,
          color: 'black',
        }}
      >
        {value}
      </div>
    </div>
  )
}
