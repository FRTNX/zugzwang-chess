// assets
import {
    IconTypography,
    IconPalette,
    IconShadow,
    IconWindmill,
    IconChess,
    IconShield
} from '@tabler/icons';

// constant
const icons = {
    IconTypography,
    IconPalette,
    IconShadow,
    IconWindmill,
    IconChess
};

// ==============================|| UTILITIES MENU ITEMS ||============================== //

const utilities = {
    id: 'utilities',
    title: 'Tournaments',
    type: 'group',
    children: [
        {
            id: 'daily-rapid-tournament',
            title: 'Daily Rapid Tournament',
            type: 'item',
            url: '/',
            icon: IconShield,
            breadcrumbs: false
        },
        {
            id: 'daily-blitz-tournament',
            title: 'Daily Blitz Tournament',
            type: 'item',
            url: '/',
            icon: IconShield,
            breadcrumbs: false
        },
        {
            id: 'daily-antichess-tournament',
            title: 'Antichess Tournament',
            type: 'item',
            url: '/',
            icon: IconShield,
            breadcrumbs: false
        }
    ]
};

export default utilities;
