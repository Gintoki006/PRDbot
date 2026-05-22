"use client";

import React, { useEffect, useRef } from 'react';

const glowColorMap = {
  blue: { base: 212, spread: 20 }, // #58a6ff (GitHub blue)
  purple: { base: 268, spread: 20 }, // #bf87ff (Purple)
  green: { base: 140, spread: 20 }, // #238636 (GitHub green)
  orange: { base: 24, spread: 20 },
  red: { base: 3, spread: 20 } // #f85149 (GitHub red)
};

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96'
};

export const GlowCard = ({ 
  children, 
  className = '', 
  glowColor = 'blue',
  size = 'md',
  width,
  height,
  customSize = false,
  radius = 24,
  outerGlow = true,
  trackingMode = 'fixed' // 'fixed' or 'relative'
}) => {
  const cardRef = useRef(null);
  const innerRef = useRef(null);

  useEffect(() => {
    const syncPointer = (e) => {
      if (cardRef.current) {
        if (trackingMode === 'fixed') {
          cardRef.current.style.setProperty('--x', e.clientX.toFixed(2));
          cardRef.current.style.setProperty('--y', e.clientY.toFixed(2));
        } else {
          const rect = cardRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          cardRef.current.style.setProperty('--x', x.toFixed(2));
          cardRef.current.style.setProperty('--y', y.toFixed(2));
        }
        
        cardRef.current.style.setProperty('--xp', (e.clientX / window.innerWidth).toFixed(2));
        cardRef.current.style.setProperty('--yp', (e.clientY / window.innerHeight).toFixed(2));
      }
    };

    document.addEventListener('pointermove', syncPointer);
    return () => document.removeEventListener('pointermove', syncPointer);
  }, [trackingMode]);

  const { base, spread } = glowColorMap[glowColor] || glowColorMap.blue;

  const getSizeClasses = () => {
    if (customSize) {
      return 'w-full h-full'; 
    }
    return sizeMap[size];
  };

  const getInlineStyles = () => {
    const baseStyles = {
      '--base': base,
      '--spread': spread,
      '--radius': radius.toString(), // Dynamic radius
      '--border': '1',
      '--backdrop': '#0d1117', // Match current bg color
      '--backup-border': '#30363d', // Match current border color
      '--size': '250',
      '--outer': outerGlow ? '1' : '0',
      '--border-size': 'calc(var(--border, 1) * 1px)',
      '--spotlight-size': 'calc(var(--size, 150) * 1px)',
      '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
      backgroundImage: `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.05)), transparent
      )`,
      backgroundColor: 'var(--backdrop, transparent)',
      backgroundSize: 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))',
      backgroundPosition: '50% 50%',
      border: 'var(--border-size) solid var(--backup-border)',
      borderRadius: 'calc(var(--radius) * 1px)',
      position: 'relative',
      touchAction: 'none',
    };

    if (trackingMode === 'fixed') {
      baseStyles.backgroundAttachment = 'fixed';
    }

    if (width !== undefined) {
      baseStyles.width = typeof width === 'number' ? `${width}px` : width;
    }
    if (height !== undefined) {
      baseStyles.height = typeof height === 'number' ? `${height}px` : height;
    }

    return baseStyles;
  };

  const beforeAfterStyles = `
    [data-glow]::before,
    [data-glow]::after {
      pointer-events: none;
      content: "";
      position: absolute;
      inset: calc(var(--border-size) * -1);
      border: var(--border-size) solid transparent;
      border-radius: calc(var(--radius) * 1px);
      background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
      background-repeat: no-repeat;
      background-position: 50% 50%;
      mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
      mask-clip: padding-box, border-box;
      mask-composite: intersect;
    }
    
    [data-glow-tracking="fixed"]::before,
    [data-glow-tracking="fixed"]::after {
      background-attachment: fixed;
    }
    
    [data-glow]::before {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / var(--border-spot-opacity, 1)), transparent 100%
      );
      filter: brightness(2);
    }
    
    [data-glow]::after {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(0 100% 100% / var(--border-light-opacity, 1)), transparent 100%
      );
    }
    
    [data-glow] [data-glow] {
      position: absolute;
      inset: 0;
      will-change: filter;
      opacity: var(--outer, 1);
      border-radius: calc(var(--radius) * 1px);
      border-width: calc(var(--border-size) * 20);
      filter: blur(calc(var(--border-size) * 10));
      background: none;
      pointer-events: none;
      border: none;
    }
    
    [data-glow] > [data-glow]::before {
      inset: -10px;
      border-width: 10px;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: beforeAfterStyles }} />
      <div
        ref={cardRef}
        data-glow
        data-glow-tracking={trackingMode}
        style={getInlineStyles()}
        className={`
          ${getSizeClasses()}
          rounded-3xl 
          relative 
          ${className}
        `}
      >
        <div ref={innerRef} data-glow data-glow-tracking={trackingMode}></div>
        {children}
      </div>
    </>
  );
};
