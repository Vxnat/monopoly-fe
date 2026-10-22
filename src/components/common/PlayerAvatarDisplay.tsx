'use client';

import React from 'react';
import Image from 'next/image';

interface PlayerAvatarDisplayProps {
  avatar: string;
  name?: string;
  className?: string;
}

export const PlayerAvatarDisplay: React.FC<PlayerAvatarDisplayProps> = ({
  avatar,
  name = 'Player',
  className = 'w-full h-full object-cover',
}) => {
  const isImage = avatar?.startsWith('/') || avatar?.startsWith('http');

  if (isImage) {
    return (
      <Image
        src={avatar}
        alt={name}
        width={64}
        height={64}
        unoptimized
        className={`rounded-full pointer-events-none select-none ${className}`}
      />
    );
  }

  return <span className="select-none">{avatar || '👤'}</span>;
};
