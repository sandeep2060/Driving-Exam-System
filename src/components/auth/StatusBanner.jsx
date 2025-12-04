function StatusBanner({ status }) {
  if (!status.error && !status.message) return null

  return (
    <div className={status.error ? 'status error' : 'status success'}>
      {status.error || status.message}
    </div>
  )
}

export default StatusBanner

