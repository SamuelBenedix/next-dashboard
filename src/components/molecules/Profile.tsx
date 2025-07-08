import React from 'react';
import ImageAtom from '../atoms/ImageAtom';

export default function Profile() {
  return (
    <div className="avatar avatar-online">
      <ImageAtom
        width={50}
        height={50}
        alt="Profile"
        src="/assets/img/avatars/1.png"
        className="w-px-40 h-auto rounded-circle"
      />
    </div>
  );
}
