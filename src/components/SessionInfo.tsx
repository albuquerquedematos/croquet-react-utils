import ViewInfo from './ViewInfo'
import { Tag } from 'primereact/tag'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { Divider } from 'primereact/divider'
import { InputText } from 'primereact/inputtext'

import { useState } from 'react'
import { FiEdit } from 'react-icons/fi'

import { theme } from '@utils'

export default function SessionInfo({ views, session, changeSession }) {
  const [sName, set_sName] = useState(session?.name || '')
  const [sPassword, set_sPassword] = useState(session?.password || '')
  const [changeOpen, setChangeOpen] = useState(false)

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>
        Current Session Data
        <Tag
          {...{
            icon: <FiEdit style={{ marginRight: '0.4rem' }} />,
            value: 'Edit',
            style: {
              cursor: 'pointer',
              marginLeft: '0.5rem',
              background: theme.primary,
            },
            onClick: () => setChangeOpen(true),
          }}
        />
      </h2>
      <Property {...{ name: 'Name', value: session?.name }} />
      <Property {...{ name: 'Password', value: session?.password }} />
      <Property {...{ name: 'ID', value: session?.id }} />
      <Property {...{ name: 'Persistent ID', value: session?.persistentId }} />
      <Property {...{ name: 'Version ID', value: session?.versionId }} />
      <Divider />
      <ViewInfo {...views} />

      <Dialog
        {...{
          header: 'Change Session',
          visible: changeOpen,
          resizable: false,
          draggable: false,
          onHide: () => setChangeOpen(false),
          style: { minWidth: '10rem', width: '30rem', background: theme.light, fontSize: '0.7rem' },
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <InputText
            {...{
              placeholder: 'Name',
              style: { width: '100%' },
              value: sName,
              onChange: (e) => set_sName(e.target.value),
            }}
          />
          <InputText
            {...{
              placeholder: 'Password',
              style: { width: '100%' },
              value: sPassword,
              onChange: (e) => set_sPassword(e.target.value),
            }}
          />
          <div style={{ flexGrow: 1 }} />
          <div style={{ display: 'flex', width: '100%' }}>
            <Button
              {...{
                pt: theme.buttonPTSecondary,
                onClick: () => {
                  setChangeOpen(false)
                  set_sName(session?.name || '')
                  set_sPassword(session?.password || '')
                },
              }}
            >
              Cancel
            </Button>
            <div style={{ flexGrow: 1 }} />
            <Button {...{ pt: theme.buttonPT, onClick: () => changeSession({ name: sName, password: sPassword }) }}>Change Session</Button>
          </div>
        </div>
      </Dialog>
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
          background: theme.dark,
          color: theme.textDark,
          padding: '0.1rem 0.4rem',
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontSize: '0.8rem',
          background: theme.light,
          padding: '0.5rem',
          borderRadius: `0 ${br} ${br}`,
          color: theme.text,
        }}
      >
        {value}
      </div>
    </div>
  )
}
