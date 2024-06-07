import { lazy } from 'react';

import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';

const AuthLogin3 = Loadable(lazy(() => import('views/pages/authentication/authentication3/Login3')));
const AuthRegister3 = Loadable(lazy(() => import('views/pages/authentication/authentication3/Register3')));
const DemoRegister3 = Loadable(lazy(() => import('views/pages/authentication/authentication3/DemoRegister3')));

const AuthenticationRoutes = {
    path: '/',
    element: <MinimalLayout />,
    children: [
        {
            path: '/login',
            element: <AuthLogin3 />
        },
        {
            path: '/signup',
            element: <AuthRegister3 />
        },
        {
            path: '/demo-signin',
            element: <DemoRegister3 />
        },
    ]
};

export default AuthenticationRoutes;
