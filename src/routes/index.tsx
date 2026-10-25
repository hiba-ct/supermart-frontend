
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import MainRoutes from './MainRoutes';
import LoginRoutes from './LoginRoutes';
// import ComponentsRoutes from './ComponentsRoutes';

import Loadable from 'components/Loadable';
import SuperMartHome from '../../public/SuperMartHome';

const Landing = Loadable(lazy(() => import('pages/landing')));

const router = createBrowserRouter(
  [
    // Public SuperMart homepage — outside DashboardLayout
    {
      path: '/supermart-home',
      element: <SuperMartHome />
    },

    LoginRoutes,
    // ComponentsRoutes,
    MainRoutes
  ],
  {
    basename: import.meta.env.VITE_APP_BASE_NAME
  }
);

export default router;
