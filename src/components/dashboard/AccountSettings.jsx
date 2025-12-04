function AccountSettings() {
  return (
    <div className="panel">
      <h3>Account settings</h3>
      <p className="small-text">
        Manage your account security. Profile and exam data are linked to your email.
      </p>
      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault()
          alert(
            'To change your password, use the "Forgot password?" link on the login form. A secure reset link will be sent to your email.',
          )
        }}
      >
        <h4>Change password</h4>
        <p className="small-text">
          Changing password is handled via the secure reset flow to protect your account.
        </p>
        <button type="submit" className="secondary-outline-btn small">
          View password reset instructions
        </button>
      </form>
    </div>
  )
}

export default AccountSettings

