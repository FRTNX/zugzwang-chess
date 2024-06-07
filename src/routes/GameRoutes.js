import { lazy } from 'react';

import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

const ArenaSelect = Loadable(lazy(() => import('views/arena-selection')));
const ChessGame = Loadable(lazy(() => import('views/chess-game/Default')));

const GameRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
        {
            path: 'game/:gameId/:side',
            element: <ChessGame />
        },
        {
            path: 'bullet-1plus0-arenas',
            element: <ArenaSelect data={{ type: 'BULLET_1PLUS0', title: 'Bullet 1+0' }} />
        },
        {
            path: 'bullet-2plus1-arenas',
            element: <ArenaSelect data={{ type: 'BULLET_2PLUS1', title: 'Bullet 2+1' }} />
        },
        {
            path: 'blitz-3plus0-arenas',
            element: <ArenaSelect data={{ type: 'BLITZ_3PLUS0', title: 'Blitz 3+0' }} />
        },
        {
            path: 'blitz-3plus2-arenas',
            element: <ArenaSelect data={{ type: 'BLITZ_3PLUS2', title: 'Blitz 3+2' }} />
        },
        {
            path: 'blitz-5plus0-arenas',
            element: <ArenaSelect data={{ type: 'BLITZ_5PLUS0', title: 'Blitz 5+0' }} />
        },
        {
            path: 'blitz-5plus3-arenas',
            element: <ArenaSelect data={{ type: 'BLITZ_5PLUS3', title: 'Blitz 5+3' }} />
        }
    ]
};

export default GameRoutes;
