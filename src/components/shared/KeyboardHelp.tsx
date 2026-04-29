import { Modal } from './Modal.tsx'

const SHORTCUTS: { keys: string[]; label: string; scope: string }[] = [
  { keys: ['Enter'],  label: 'Start roleplay',         scope: 'Configurator' },
  { keys: ['Esc'],    label: 'End call',               scope: 'Live call' },
  { keys: ['W'],      label: 'Hold whisper for later', scope: 'Live call' },
  { keys: ['1'],      label: 'Roleplay tab',           scope: 'Anywhere' },
  { keys: ['2'],      label: 'Prompt Lab tab',         scope: 'Anywhere' },
  { keys: ['3'],      label: 'Demo Guide tab',         scope: 'Anywhere' },
  { keys: ['?'],      label: 'Show this help',         scope: 'Anywhere' },
]

export function KeyboardHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Keyboard shortcuts" width={460}>
      <table className="kbd-table">
        <tbody>
          {SHORTCUTS.map((s) => (
            <tr key={s.keys.join('+')}>
              <td>
                {s.keys.map((k, i) => (
                  <span key={i}>
                    <span className="kbd">{k}</span>
                    {i < s.keys.length - 1 && <span style={{ margin: '0 4px', color: 'var(--text-mute)' }}>+</span>}
                  </span>
                ))}
              </td>
              <td className="kbd-label">{s.label}</td>
              <td className="kbd-scope">{s.scope}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: 11.5, color: 'var(--text-mute)', marginTop: 14, lineHeight: 1.5 }}>
        Tip: <span className="kbd">?</span> opens this dialog from anywhere except text inputs.
      </p>
    </Modal>
  )
}
