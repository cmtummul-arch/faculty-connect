import { statusTone } from '../../utils/format'

export function StatusPill({ status }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusTone(status)}`}>
      {status.replaceAll('_', ' ')}
    </span>
  )
}
