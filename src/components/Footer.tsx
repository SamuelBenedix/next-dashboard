// components/Footer.jsx
export default function Footer() {
  return (
    <footer className="content-footer footer bg-footer-theme">
      <div className="container-xxl">
        <div className="footer-container d-flex align-items-center justify-content-between py-4 flex-md-row flex-column">
          <div className="text-body">
            ©, made with ❤️ by
            <a
              href="https://themeselection.com"
              target="_blank"
              className="footer-link"
            >
              ThemeSelection
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
