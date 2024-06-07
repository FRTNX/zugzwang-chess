// assets
import {
    IconLeaf,
    IconUser,
    IconCurrencyDollar,
    IconMailFast
} from '@tabler/icons';


const dashboard = {
    id: 'home',
    title: 'Menu',
    type: 'group',
    children: [
        {
            id: 'home',
            title: 'Home',
            type: 'item',
            url: '/',
            icon: IconLeaf,
            breadcrumbs: false
        },
        {
            id: 'profile',
            title: 'Profile',
            type: 'item',
            url: '/user-profile',
            icon: IconUser,
            breadcrumbs: false
        },
        {
            id: 'make-deposit',
            title: 'Inbox',
            type: 'item',
            url: '/inbox',
            icon: IconMailFast,
            breadcrumbs: false
        },
        {
            id: 'make-deposit',
            title: 'Withdraw/Deposit',
            type: 'item',
            url: '/deposit',
            icon: IconCurrencyDollar,
            breadcrumbs: false
        },
       
    ]
};

export default dashboard;
