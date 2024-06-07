import {
    IconChess,
    IconChessBishop,
    IconChessKing,
    IconChessQueen,
    IconChessRook,
    IconCubeSend
} from '@tabler/icons';

const pages = {
    id: 'pages',
    title: 'Arenas',
    caption: 'Live Matches',
    type: 'group',
    children: [
        {
            id: 'bullet-arenas',
            title: 'Bullet Arenas',
            type: 'collapse',
            icon: IconChessKing,

            children: [
                {
                    id: 'bullet-1+0-arena',
                    title: 'Bullet 1+0 Arena',
                    type: 'item',
                    url: '/bullet-1plus0-arenas',
                    icon: IconChess,
                    breadcrumbs: false
                },
                {
                    id: 'bullet-2+1-arena',
                    title: 'Bullet 2+1 Arena',
                    type: 'item',
                    url: '/bullet-2plus1-arenas',
                    icon: IconChess,
                    breadcrumbs: false
                }
            ]
        },
        {
            id: 'blitz-arenas',
            title: 'Blitz Arenas',
            type: 'collapse',
            icon: IconChessQueen,

            children: [
                {
                    id: 'blits-3+0-arena',
                    title: 'Blitz 3+0 Arena',
                    type: 'item',
                    url: '/blitz-3plus0-arenas',
                    icon: IconChess,
                    breadcrumbs: false
                },
                {
                    id: 'blits-3+2-arena',
                    title: 'Blitz 3+2 Arena',
                    type: 'item',
                    url: '/blitz-3plus2-arenas',
                    icon: IconChess,
                    breadcrumbs: false
                },
                {
                    id: 'blits-5+0-arena',
                    title: 'Blitz 5+0 Arena',
                    type: 'item',
                    url: '/blitz-5plus0-arenas',
                    icon: IconChess,
                    breadcrumbs: false
                },
                {
                    id: 'blits-5+3-arena',
                    title: 'Blitz 5+3 Arena',
                    type: 'item',
                    url: '/blitz-5plus3-arenas',
                    icon: IconChess,
                    breadcrumbs: false
                },
            ]
        },
        {
            id: 'rapid-arenas',
            title: 'Rapid Arenas',
            type: 'collapse',
            icon: IconChessBishop,

            children: [
                {
                    id: 'rapid-10+0-arena',
                    title: 'Rapid 10+0 Arena',
                    type: 'item',
                    url: '/',
                    icon: IconChess,
                    breadcrumbs: false
                },
                {
                    id: 'rapid-10+5-arena',
                    title: 'Rapid 10+5 Arena',
                    type: 'item',
                    url: '/',
                    icon: IconChess,
                    breadcrumbs: false
                },
                {
                    id: 'rapid-15+10-arena',
                    title: 'Rapid 15+10 Arena',
                    type: 'item',
                    url: '/',
                    icon: IconChess,
                    breadcrumbs: false
                }
            ]
        },
        {
            id: 'classical-arenas',
            title: 'Classical Arenas',
            type: 'collapse',
            icon: IconChessRook,

            children: [
                {
                    id: 'classical-30+0-arena',
                    title: 'Classical 30+0 Arena',
                    type: 'item',
                    url: '/',
                    icon: IconChess,
                    breadcrumbs: false
                },
                {
                    id: 'classical-30+20-arena',
                    title: 'Classical 30+20 Arena',
                    type: 'item',
                    url: '/',
                    icon: IconChess,
                    breadcrumbs: false
                }
            ]
        },
        {
            id: 'custom-arenas',
            title: 'Custom Arenas',
            type: 'collapse',
            icon: IconCubeSend,

            children: [
                {
                    id: 'death-pit-arena',
                    title: 'Death Pit Arena',
                    type: 'item',
                    url: '/',
                    icon: IconChess,
                    breadcrumbs: false
                }
            ]
        }
    ]
};

export default pages;
