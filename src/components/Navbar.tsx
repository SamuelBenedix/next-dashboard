// components/Navbar.jsx
export default function Navbar() {
  return (
    <nav className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme">
      <div
        className="navbar-nav-right d-flex align-items-center"
        id="navbar-collapse"
      >
        <div className="navbar-nav align-items-center">
          <div className="nav-item d-flex align-items-center">
            <i className="bx bx-search bx-md" />
            <input
              type="text"
              className="form-control border-0 shadow-none ps-1"
              placeholder="Search..."
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
