import { lazy, Suspense } from 'react';
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import Sales from 'pages/supermarket/sales';
import SuperMartHome from '../../public/SuperMartHome';





/* ================= DASHBOARD ================= */

const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));
const DashboardAnalytics = Loadable(lazy(() => import('pages/dashboard/analytics')));
const DashboardFinance = Loadable(lazy(() => import('pages/dashboard/finance')));




/* ================= SUPERMARKET ================= */

const Products = Loadable(
  lazy(() => import('pages/supermarket/products'))
);

/* ================= categorry ================= */

const Categories = Loadable(
  lazy(() => import('pages/supermarket/categories'))
);

/* ================= Inventory ================= */
const Inventory = Loadable(
  lazy(() => import('pages/supermarket/inventory'))
);
/* ================= Suppliers ================= */
const Suppliers = Loadable(
  lazy(() => import('pages/supermarket/suppliers'))
);
/* ================= purchases ================= */
const Purchases = Loadable(
  lazy(() => import('pages/supermarket/purchases'))
);
/* ================= Reports ================= */
const SupermarketReports = lazy(
  () => import('pages/supermarket/reports')
);
/* ================= SalesReturns ================= */
const SalesReturns = lazy(
  () => import("pages/supermarket/salesReturns")
);
/* ================= Employees ================= */
const Employees = lazy(() => import('pages/supermarket/employees'));
const Attendance = lazy(() => import("pages/supermarket/attendance"));
/* ================= ERROR ================= */

const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/error/404')));

const MainRoutes =  
  {
  path: '/',
  element: <DashboardLayout />,
  children: [
    {
      path: 'dashboard',
      children: [
        { path: 'default', element: <DashboardDefault /> },
        { path: 'analytics', element: <DashboardAnalytics /> },
        { path: 'finance', element: <DashboardFinance /> }
      ]
    },

   
/* SUPERMARKET */



{
  path: 'supermarket/products',
  element: <Products />
},

{
  path: 'supermarket/categories',
  element: <Categories />
},

{
  path: 'supermarket/inventory',
  element: <Inventory />
},

{
  path: 'supermarket/suppliers',
  element: <Suppliers />
},
{
  path: 'supermarket/purchases',
  element: <Purchases />
},

{
  path: 'supermarket/sales',
  element: <Sales />
},
{
  path:'/supermarket/sales-returns',
  element:<SalesReturns />
},
{
  path: '/supermarket/reports',
  element: <SupermarketReports />
},
{
  path: '/supermarket/employees',
  element: (
    <Suspense fallback={<div>Loading...</div>}>
      <Employees />
    </Suspense>
  )
},
{
  path: "/supermarket/attendance",
  element: (
    <Suspense fallback={<div>Loading...</div>}>
      <Attendance />
    </Suspense>
  )
},


    { path: '*', element: <MaintenanceError /> }
  ]

}

export default MainRoutes;