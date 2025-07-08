import Profile from './molecules/Profile';
import SearchBar from './molecules/SearchBar';

// components/Navbar.jsx
export default function Navbar() {
  return (
    <nav
      className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme"
      id="layout-navbar"
    >
      <div className="layout-menu-toggle navbar-nav align-items-xl-center me-4 me-xl-0 d-xl-none">
        <a className="nav-item nav-link px-0 me-xl-6" href="javascript:void(0)">
          <i className="bx bx-menu bx-md"></i>
        </a>
      </div>

      <div
        className="navbar-nav-right d-flex align-items-center"
        id="navbar-collapse"
      >
        <div className="navbar-nav align-items-center">
          <SearchBar />
        </div>

        <ul className="navbar-nav flex-row align-items-center ms-auto">
          <li className="nav-item navbar-dropdown dropdown-user dropdown">
            <a
              className="nav-link dropdown-toggle hide-arrow p-0"
              data-bs-toggle="dropdown"
            >
              <Profile />
            </a>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <a className="dropdown-item" href="#">
                  <div className="d-flex">
                    <div className="flex-shrink-0 me-3"></div>
                    <div className="flex-grow-1">
                      <h6 className="mb-0">John Doe</h6>
                      <small className="text-muted">Admin</small>
                    </div>
                  </div>
                </a>
              </li>
              <li>
                <div className="dropdown-divider my-1"></div>
              </li>
              <li>
                <a className="dropdown-item" href="#">
                  <i className="bx bx-user bx-md me-3"></i>
                  <span>My Profile</span>
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#">
                  <i className="bx bx-cog bx-md me-3"></i>
                  <span>Settings</span>
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#">
                  <span className="d-flex align-items-center align-middle">
                    <i className="flex-shrink-0 bx bx-credit-card bx-md me-3"></i>
                    <span className="flex-grow-1 align-middle">
                      Billing Plan
                    </span>
                    <span className="flex-shrink-0 badge rounded-pill bg-danger">
                      4
                    </span>
                  </span>
                </a>
              </li>
              <li>
                <div className="dropdown-divider my-1"></div>
              </li>
              <li>
                <a className="dropdown-item">
                  <i className="bx bx-power-off bx-md me-3"></i>
                  <span>Log Out</span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
}
