'use client';

import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside
      id="layout-menu"
      className="layout-menu menu-vertical menu bg-menu-theme"
    >
      <div className="app-brand demo">
        <Link href="/" className="app-brand-link">
          <span className="app-brand-text demo menu-text fw-bold ms-2">
            sneat
          </span>
        </Link>
      </div>

      <div className="menu-inner-shadow"></div>

      <ul className="menu-inner py-1">
        <li className="menu-item active open">
          <a href="#" className="menu-link menu-toggle">
            <i className="menu-icon tf-icons bx bx-home-smile"></i>
            <div className="text-truncate">Dashboards</div>
            <span className="badge rounded-pill bg-danger ms-auto">5</span>
          </a>
          <ul className="menu-sub">
            <li className="menu-item active">
              <Link href="/" className="menu-link">
                <div className="text-truncate">Analytics</div>
              </Link>
            </li>
          </ul>
        </li>
      </ul>
    </aside>
  );
}
