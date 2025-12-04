function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <p className="footer-title">Nepal Driving Licence Online System</p>
          <p className="footer-text">
            An official initiative of the Government of Nepal to make driving licence
            services simple, transparent, and citizen-friendly.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <p className="footer-heading">Government links</p>
            <a href="#">Ministry of Physical Infrastructure & Transport</a>
            <a href="#">Department of Transport Management</a>
            <a href="#">Nepal Traffic Police</a>
          </div>
          <div>
            <p className="footer-heading">Support</p>
            <a href="#">FAQs</a>
            <a href="#">Help & documentation</a>
            <a href="#">Feedback</a>
          </div>
          <div>
            <p className="footer-heading">Connect</p>
            <a href="#">Facebook</a>
            <a href="#">Twitter</a>
            <a href="#">YouTube</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Government of Nepal. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer

