import React, { useId } from 'react';

// RatingBadge renders a rounded rectangle badge like the provided design.
// Props:
// - kind: 'eco' | 'water'
// - grade: string (e.g., 'A+', 'B', 'C')
// - size: 'sm' | 'md' | 'lg' (default 'md')
// - className: additional classes for positioning
export default function RatingBadge({ kind = 'eco', grade, size = 'md', compact = false, className = '' }) {
    // Hooks must run unconditionally before any early returns
    const uid = useId();
    const leafGradKey = `leafGrad-${uid}`;
    const waterGradKey = `waterGrad-${uid}`;
    if (!grade) return null;

    const isEco = kind === 'eco';
    const label = isEco ? 'Eco' : 'Water';

    // Size presets roughly matching the mock aspect ratio
    const sizeMap = {
        // ~60% scale of previous values
        sm: { box: 'w-8 h-10', icon: 10, grade: 'text-[10px]', label: 'text-[8px]' },
        md: { box: 'w-10 h-14', icon: 14, grade: 'text-sm', label: 'text-[10px]' },
        lg: { box: 'w-12 h-16', icon: 17, grade: 'text-base', label: 'text-sm' },
    };
    const sz = sizeMap[size] || sizeMap.md;

    let bgStyle;
    if (isEco) {
        bgStyle = { background: 'linear-gradient(#A5D6A7, #66BB6A)' };
    } else {
        // Use a lighter water background in compact mode (Cart/Checkout) for better icon contrast
        bgStyle = compact
            ? { background: 'linear-gradient(#BBDEFB, #64B5F6)' }
            : { background: 'linear-gradient(#90CAF9, #42A5F5)' };
    }

    return (
        <div
            className={`relative ${compact ? 'inline-flex items-center justify-center h-4 px-1.5 rounded' : `rounded-lg ${sz.box}`} text-white shadow-md ${className}`}
            style={bgStyle}
            aria-label={`${label} ${grade}`}
            title={`${label} ${grade}`}
        >
            {compact ? (
                <div className="flex items-center gap-1">
                    <div className="opacity-100 flex-shrink-0">
                        {isEco ? (
                            <svg width={sz.icon} height={sz.icon} viewBox="0 0 64 64" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id={leafGradKey} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#66BB6A" />
                                        <stop offset="100%" stopColor="#388E3C" />
                                    </linearGradient>
                                </defs>
                                <path fill={`url(#${leafGradKey})`} d="M52.2 11.8c-9.9-1.5-23.4 2.9-32.2 11.7C11.2 32.3 7 45.8 8.5 55.7c9.9 1.5 23.4-2.9 32.2-11.7C49.6 35.2 53.8 21.7 52.2 11.8Z" />
                                <path fill="#FFFFFF" fillOpacity=".35" d="M46.6 16.8c-8.4 4.5-16.3 12-23.2 22.2l-3.8 5.6c-.5.8.6 1.6 1.3.9l5-4.9C34 32.9 41.3 26.4 49.5 21.8c.9-.5.4-1.9-.7-1.6l-2.2.6Z" />
                            </svg>
                        ) : (
                            <svg width={sz.icon} height={sz.icon} viewBox="0 0 64 64" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id={waterGradKey} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#90CAF9" />
                                        <stop offset="100%" stopColor="#42A5F5" />
                                    </linearGradient>
                                </defs>
                                <path fill={`url(#${waterGradKey})`} d="M32 4C32 4 12 26 12 42c0 11 9 20 20 20s20-9 20-20C52 26 32 4 32 4Z" />
                                <path fill="#FFFFFF" fillOpacity=".35" d="M24 30c-2 5 0 12 5 15 1 .6 2-.6 1.3-1.5-3.3-3.9-4.3-8.6-2.3-13.2.5-1-1-1.8-1.5-.3Z" />
                            </svg>
                        )}
                    </div>
                    <div className={`${sz.grade} font-extrabold leading-none`}>{String(grade).toUpperCase()}</div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center pt-1 pb-1">
                    <div className="opacity-100">
                        {isEco ? (
                            <svg width={sz.icon} height={sz.icon} viewBox="0 0 64 64" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id={leafGradKey} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#66BB6A" />
                                        <stop offset="100%" stopColor="#388E3C" />
                                    </linearGradient>
                                </defs>
                                <path fill={`url(#${leafGradKey})`} d="M52.2 11.8c-9.9-1.5-23.4 2.9-32.2 11.7C11.2 32.3 7 45.8 8.5 55.7c9.9 1.5 23.4-2.9 32.2-11.7C49.6 35.2 53.8 21.7 52.2 11.8Z" />
                                <path fill="#FFFFFF" fillOpacity=".35" d="M46.6 16.8c-8.4 4.5-16.3 12-23.2 22.2l-3.8 5.6c-.5.8.6 1.6 1.3.9l5-4.9C34 32.9 41.3 26.4 49.5 21.8c.9-.5.4-1.9-.7-1.6l-2.2.6Z" />
                            </svg>
                        ) : (
                            <svg width={sz.icon} height={sz.icon} viewBox="0 0 64 64" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id={waterGradKey} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#90CAF9" />
                                        <stop offset="100%" stopColor="#42A5F5" />
                                    </linearGradient>
                                </defs>
                                <path fill={`url(#${waterGradKey})`} d="M32 4C32 4 12 26 12 42c0 11 9 20 20 20s20-9 20-20C52 26 32 4 32 4Z" />
                                <path fill="#FFFFFF" fillOpacity=".35" d="M24 30c-2 5 0 12 5 15 1 .6 2-.6 1.3-1.5-3.3-3.9-4.3-8.6-2.3-13.2.5-1-1-1.8-1.5-.3Z" />
                            </svg>
                        )}
                    </div>
                    <div className={`${sz.grade} font-extrabold leading-none mt-1`}>{String(grade).toUpperCase()}</div>
                    <div className={`${sz.label} font-semibold mt-1`}>{label}</div>
                </div>
            )}
        </div>
    );
}
