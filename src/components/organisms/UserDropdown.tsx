// components/molecules/UserDropdown.tsx
import { FaUser, FaCog, FaCreditCard, FaPowerOff } from 'react-icons/fa';
import Profile from '../molecules/Profile';
import DropdownItem from '../atoms/DropdownItem';

const UserDropdown = () => {
  return (
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
            <div className="dropdown-divider my-1" />
          </li>

          <li>
            <DropdownItem icon={<FaUser />} label="My Profile" />
          </li>
          <li>
            <DropdownItem icon={<FaCog />} label="Settings" />
          </li>
          <li>
            <DropdownItem
              icon={<FaCreditCard />}
              label="Billing Plan"
              badge="4"
            />
          </li>

          <li>
            <div className="dropdown-divider my-1" />
          </li>

          <li>
            <DropdownItem icon={<FaPowerOff />} label="Log Out" />
          </li>
        </ul>
      </li>
    </ul>
  );
};

export default UserDropdown;
