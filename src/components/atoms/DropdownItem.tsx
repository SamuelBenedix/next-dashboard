// components/atoms/DropdownItemAtom.tsx
import { ReactNode } from 'react';

type Props = {
  icon?: ReactNode;
  label: string;
  badge?: string;
  href?: string;
};

const DropdownItem = ({ icon, label, badge, href = '#' }: Props) => {
  return (
    <a className="dropdown-item" href={href}>
      <span className="d-flex align-items-center align-middle">
        {icon && <span className="flex-shrink-0 me-3">{icon}</span>}
        <span className="flex-grow-1 align-middle">{label}</span>
        {badge && (
          <span className="flex-shrink-0 badge rounded-pill bg-danger">
            {badge}
          </span>
        )}
      </span>
    </a>
  );
};

export default DropdownItem;
