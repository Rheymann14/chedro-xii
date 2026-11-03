import { createLucideIcon } from 'lucide-react';

/**
 * Stroke-style Facebook mark drawn on lucide's 24px grid so it matches the
 * outline icons (MapPin, Mail, Phone) used alongside it.
 */
export const FacebookIcon = createLucideIcon('FacebookOutline', [
    [
        'rect',
        { width: '18', height: '18', x: '3', y: '3', rx: '5', key: 'frame' },
    ],
    ['path', { d: 'M15.5 7.5H14a3 3 0 0 0-3 3V21', key: 'stem' }],
    ['path', { d: 'M8.5 12.5h6', key: 'bar' }],
]);
