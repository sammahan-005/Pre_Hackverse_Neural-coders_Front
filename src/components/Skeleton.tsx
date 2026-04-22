import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rect' | 'circle';
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width, 
  height, 
  variant = 'rect', 
  className = '' 
}) => {
  const style = {
    width: width,
    height: height,
  };

  return (
    <div 
      className={`skeleton skeleton-${variant} ${className}`} 
      style={style}
    />
  );
};
