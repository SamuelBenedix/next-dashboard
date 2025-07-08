'use client';

import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside
      id="layout-menu"
      className="layout-menu menu-vertical menu bg-menu-theme"
    >
      <div className="app-brand demo">
        <Link href={'/'} className="app-brand-link">
          <span className="app-brand-logo demo"></span>
          <span className="app-brand-text demo menu-text fw-bold ms-2">
            sneat
          </span>
        </Link>

        <a className="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none">
          <i className="bx bx-chevron-left bx-sm d-flex align-items-center justify-content-center"></i>
        </a>
      </div>

      <div className="menu-inner-shadow"></div>

      <ul className="menu-inner py-1">
        <li className="menu-item active open">
          <a className="menu-link menu-toggle">
            <i className="menu-icon tf-icons bx bx-home-smile"></i>
            <div className="text-truncate" data-i18n="Dashboards">
              Dashboards
            </div>
            <span className="badge rounded-pill bg-danger ms-auto">5</span>
          </a>
          <ul className="menu-sub">
            <li className="menu-item active">
              <Link href="/" className="menu-link">
                <div className="text-truncate" data-i18n="Analytics">
                  Analytics
                </div>
              </Link>
            </li>
          </ul>
        </li>

        <li className="menu-item open">
          <a className="menu-link menu-toggle">
            <i className="menu-icon tf-icons bx bx-layout"></i>
            <div className="text-truncate" data-i18n="Layouts">
              Layouts
            </div>
          </a>

          <ul className="menu-sub">
            <li className="menu-item">
              <a href="layouts-without-menu.html" className="menu-link">
                <div className="text-truncate" data-i18n="Without menu">
                  Without menu
                </div>
              </a>
            </li>
            <li className="menu-item">
              <a href="layouts-without-navbar.html" className="menu-link">
                <div className="text-truncate" data-i18n="Without navbar">
                  Without navbar
                </div>
              </a>
            </li>
            <li className="menu-item">
              <a href="layouts-fluid.html" className="menu-link">
                <div className="text-truncate" data-i18n="Fluid">
                  Fluid
                </div>
              </a>
            </li>
            <li className="menu-item">
              <a href="layouts-container.html" className="menu-link">
                <div className="text-truncate" data-i18n="Container">
                  Container
                </div>
              </a>
            </li>
            <li className="menu-item">
              <a href="layouts-blank.html" className="menu-link">
                <div className="text-truncate" data-i18n="Blank">
                  Blank
                </div>
              </a>
            </li>
          </ul>
        </li>

        <li className="menu-header small text-uppercase">
          <span className="menu-header-text">Apps &amp; Pages</span>
        </li>
      </ul>
    </aside>
  );
}
