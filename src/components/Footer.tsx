// components/Footer.jsx
export default function Footer() {
  return (
    <footer className="content-footer footer bg-footer-theme">
      <div className="container-xxl d-flex justify-content-between py-4">
        <div>
          © {new Date().getFullYear()}, made with ❤️ by{' '}
          <a href="https://themeselection.com">ThemeSelection</a>
        </div>
        <div>
          <a
            href="https://themeselection.com/license/"
            className="footer-link me-4"
          >
            License
          </a>
          <a href="https://themeselection.com/" className="footer-link me-4">
            More Themes
          </a>
          <a
            href="https://demos.themeselection.com/sneat-bootstrap-html-admin-template/documentation/"
            className="footer-link me-4"
          >
            Docs
          </a>
          <a
            href="https://github.com/themeselection/sneat-html-admin-template-free/issues"
            className="footer-link"
          >
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}
