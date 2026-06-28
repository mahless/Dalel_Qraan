import React from 'react';

export const KaabaIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <img 
    src="/icons/kaaba.png" 
    alt="Meccan" 
    width={size} 
    height={size} 
    className={className}
    style={{ objectFit: 'contain' }}
  />
);

export const MedinaIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <img 
    src="/icons/medina.png" 
    alt="Medinan" 
    width={size} 
    height={size} 
    className={className}
    style={{ objectFit: 'contain' }}
  />
);
