import { lazy } from 'react';

import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));
const UtilsMaterialIcons = Loadable(lazy(() => import('views/utilities/MaterialIcons')));
const UtilsTablerIcons = Loadable(lazy(() => import('views/utilities/TablerIcons')));

const SamplePage = Loadable(lazy(() => import('views/sample-page')));
const InboxPage = Loadable(lazy(() => import('views/inbox')));
const ChatPage = Loadable(lazy(() => import('views/chat')));

const DepositPage = Loadable(lazy(() => import('views/deposit')));
const ProfilePage = Loadable(lazy(() => import('views/profile')));


const AdminPage = Loadable(lazy(() => import('views/admin')));

const MainRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
        {
            path: '/',
            element: <DashboardDefault />
        },
        {
            path: 'home',
            children: [
                {
                    path: 'default',
                    element: <DashboardDefault />
                }
            ]
        },
        {
            path: 'utils',
            children: [
                {
                    path: 'util-typography',
                    element: <UtilsTypography />
                }
            ]
        },
        {
            path: 'utils',
            children: [
                {
                    path: 'util-color',
                    element: <UtilsColor />
                }
            ]
        },
        {
            path: 'utils',
            children: [
                {
                    path: 'util-shadow',
                    element: <UtilsShadow />
                }
            ]
        },
        {
            path: 'icons',
            children: [
                {
                    path: 'tabler-icons',
                    element: <UtilsTablerIcons />
                }
            ]
        },
        {
            path: 'icons',
            children: [
                {
                    path: 'material-icons',
                    element: <UtilsMaterialIcons />
                }
            ]
        },
        {
            path: 'sample-page',
            element: <SamplePage />
        },
        {
            path: 'deposit',
            element: <DepositPage />
        },
        {
            path: 'user-profile',
            element: <ProfilePage />
        },
        {
            path: 'inbox',
            element: <InboxPage />
        },
        {
            path: 'chat/:chatId',
            element: <ChatPage />
        },
        {
            path: 'admin',
            element: <AdminPage />
        },
        {
            path: 'u/:username',
            element: <ProfilePage />
        },
    ]
};

export default MainRoutes;
