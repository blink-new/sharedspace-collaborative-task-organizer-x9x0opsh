import React from 'react'

export const EmptyTasksIllustration = () => (
  <svg
    width="200"
    height="200"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mx-auto opacity-60"
  >
    <defs>
      <linearGradient id="taskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    
    {/* Background circle */}
    <circle cx="100" cy="100" r="80" fill="url(#taskGradient)" />
    
    {/* Checklist icon */}
    <rect x="60" y="60" width="80" height="100" rx="8" fill="hsl(var(--primary))" fillOpacity="0.1" stroke="hsl(var(--primary))" strokeWidth="2" />
    
    {/* Checkboxes */}
    <rect x="70" y="80" width="12" height="12" rx="2" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
    <rect x="70" y="100" width="12" height="12" rx="2" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
    <rect x="70" y="120" width="12" height="12" rx="2" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
    
    {/* Lines */}
    <line x1="90" y1="86" x2="120" y2="86" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="90" y1="106" x2="115" y2="106" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="90" y1="126" x2="125" y2="126" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
    
    {/* Floating elements */}
    <circle cx="140" cy="50" r="3" fill="hsl(var(--accent))" opacity="0.6" />
    <circle cx="160" cy="70" r="2" fill="hsl(var(--primary))" opacity="0.4" />
    <circle cx="50" cy="140" r="2.5" fill="hsl(var(--accent))" opacity="0.5" />
  </svg>
)

export const EmptyFamiliesIllustration = () => (
  <svg
    width="200"
    height="200"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mx-auto opacity-60"
  >
    <defs>
      <linearGradient id="familyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    
    {/* Background */}
    <circle cx="100" cy="100" r="80" fill="url(#familyGradient)" />
    
    {/* House shape */}
    <path d="M100 50 L140 80 L140 130 L60 130 L60 80 Z" fill="hsl(var(--primary))" fillOpacity="0.1" stroke="hsl(var(--primary))" strokeWidth="2" />
    <path d="M100 50 L140 80 L60 80 Z" fill="hsl(var(--primary))" fillOpacity="0.2" />
    
    {/* Door */}
    <rect x="90" y="110" width="20" height="20" fill="hsl(var(--accent))" fillOpacity="0.3" />
    <circle cx="105" cy="120" r="1.5" fill="hsl(var(--accent))" />
    
    {/* Windows */}
    <rect x="70" y="95" width="15" height="15" fill="hsl(var(--primary))" fillOpacity="0.2" />
    <rect x="115" y="95" width="15" height="15" fill="hsl(var(--primary))" fillOpacity="0.2" />
    
    {/* People icons around */}
    <circle cx="70" cy="160" r="8" fill="hsl(var(--primary))" fillOpacity="0.3" />
    <circle cx="130" cy="160" r="8" fill="hsl(var(--accent))" fillOpacity="0.3" />
    <circle cx="50" cy="120" r="6" fill="hsl(var(--primary))" fillOpacity="0.4" />
    <circle cx="150" cy="120" r="6" fill="hsl(var(--accent))" fillOpacity="0.4" />
  </svg>
)

export const CalendarIllustration = () => (
  <svg
    width="200"
    height="200"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mx-auto opacity-60"
  >
    <defs>
      <linearGradient id="calendarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    
    {/* Background */}
    <circle cx="100" cy="100" r="80" fill="url(#calendarGradient)" />
    
    {/* Calendar base */}
    <rect x="50" y="60" width="100" height="80" rx="8" fill="white" stroke="hsl(var(--primary))" strokeWidth="2" />
    
    {/* Calendar header */}
    <rect x="50" y="60" width="100" height="20" rx="8" fill="hsl(var(--primary))" fillOpacity="0.2" />
    
    {/* Rings */}
    <rect x="65" y="50" width="4" height="20" rx="2" fill="hsl(var(--primary))" />
    <rect x="130" y="50" width="4" height="20" rx="2" fill="hsl(var(--primary))" />
    
    {/* Calendar grid */}
    <g stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.3">
      <line x1="65" y1="90" x2="135" y2="90" />
      <line x1="65" y1="105" x2="135" y2="105" />
      <line x1="65" y1="120" x2="135" y2="120" />
      <line x1="80" y1="80" x2="80" y2="140" />
      <line x1="95" y1="80" x2="95" y2="140" />
      <line x1="110" y1="80" x2="110" y2="140" />
      <line x1="125" y1="80" x2="125" y2="140" />
    </g>
    
    {/* Highlighted dates */}
    <circle cx="87.5" cy="97.5" r="4" fill="hsl(var(--accent))" fillOpacity="0.6" />
    <circle cx="117.5" cy="112.5" r="4" fill="hsl(var(--primary))" fillOpacity="0.6" />
  </svg>
)

export const SettingsIllustration = () => (
  <svg
    width="200"
    height="200"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mx-auto opacity-60"
  >
    <defs>
      <linearGradient id="settingsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    
    {/* Background */}
    <circle cx="100" cy="100" r="80" fill="url(#settingsGradient)" />
    
    {/* Main gear */}
    <g transform="translate(100,100)">
      <path
        d="M-20,-5 L-20,-15 L-15,-20 L15,-20 L20,-15 L20,-5 L15,0 L20,5 L20,15 L15,20 L-15,20 L-20,15 L-20,5 L-15,0 Z"
        fill="hsl(var(--primary))"
        fillOpacity="0.2"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
      />
      <circle cx="0" cy="0" r="8" fill="white" stroke="hsl(var(--primary))" strokeWidth="2" />
    </g>
    
    {/* Smaller gears */}
    <g transform="translate(140,70)">
      <path
        d="M-10,-3 L-10,-8 L-8,-10 L8,-10 L10,-8 L10,-3 L8,0 L10,3 L10,8 L8,10 L-8,10 L-10,8 L-10,3 L-8,0 Z"
        fill="hsl(var(--accent))"
        fillOpacity="0.3"
        stroke="hsl(var(--accent))"
        strokeWidth="1.5"
      />
      <circle cx="0" cy="0" r="4" fill="white" stroke="hsl(var(--accent))" strokeWidth="1.5" />
    </g>
    
    <g transform="translate(60,130)">
      <path
        d="M-8,-2 L-8,-6 L-6,-8 L6,-8 L8,-6 L8,-2 L6,0 L8,2 L8,6 L6,8 L-6,8 L-8,6 L-8,2 L-6,0 Z"
        fill="hsl(var(--accent))"
        fillOpacity="0.3"
        stroke="hsl(var(--accent))"
        strokeWidth="1.5"
      />
      <circle cx="0" cy="0" r="3" fill="white" stroke="hsl(var(--accent))" strokeWidth="1.5" />
    </g>
  </svg>
)

export const LoadingSpinner = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="animate-spin"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="hsl(var(--primary))"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="60"
      strokeDashoffset="60"
      opacity="0.3"
    />
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="hsl(var(--primary))"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="15"
      strokeDashoffset="15"
      className="animate-spin"
    />
  </svg>
)

export const SuccessCheckmark = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-green-500"
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
    <path
      d="M8 12l2 2 4-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)