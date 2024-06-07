import { IconBrandChrome, IconHelp, IconSettings, IconBusinessplan } from '@tabler/icons';

const icons = { IconBrandChrome, IconHelp };

const other = {
    id: 'sample-docs-roadmap',
    type: 'group',
    children: [
        {
            id: 'sample-page',
            title: 'Settings',
            type: 'item',
            url: '/sample-page',
            icon: IconSettings,
            breadcrumbs: false
        },
        {
            id: 'documentation',
            title: 'Support',
            type: 'item',
            url: '/sample-page',
            icon: icons.IconHelp,
            external: true,
            target: true
        },
        {
            id: 'admin-page',
            title: 'Admin',
            type: 'item',
            url: '/admin',
            icon: IconBusinessplan,
            breadcrumbs: false
        }
    ]
};

export default other;
