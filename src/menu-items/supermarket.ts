
import {
  Element3,
  HomeTrendUp,
  Chart,
  Wallet2,
  Box1,
  Category2,
  Archive,
  Truck,
  ShoppingCart,
  Shop,
  Refresh,
  People,
  Calendar
} from 'iconsax-reactjs';

import type { NavItemType } from 'types/menu';

const icons = {
  dashboard: Element3,
  default: HomeTrendUp,
  analytics: Chart,
  finance: Wallet2,
  supermarket: Shop,
  products: Box1,
  categories: Category2,
  inventory: Archive,
  suppliers: Truck,
  purchases: ShoppingCart,
  sales: Shop,
  returns: Refresh,
  reports: Chart,
  employees: People,
  attendance: Calendar
};

const supermarket: NavItemType = {
  id: 'supermart',
  title: 'SuperMart',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'collapse',
      icon: icons.dashboard,
      children: [
        {
          id: 'dashboard-default',
          title: 'Default',
          type: 'item',
          icon: icons.default,
          url: '/dashboard/default',
          breadcrumbs: false
        },
        {
          id: 'dashboard-analytics',
          title: 'Analytics',
          type: 'item',
          icon: icons.analytics,
          url: '/dashboard/analytics',
          breadcrumbs: false
        },
        {
          id: 'dashboard-finance',
          title: 'Finance',
          type: 'item',
          icon: icons.finance,
          url: '/dashboard/finance',
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'supermarket-operations',
      title: 'SuperMart Operations',
      type: 'collapse',
      icon: icons.supermarket,
      children: [
        {
          id: 'supermarket-products',
          title: 'Products',
          type: 'item',
          icon: icons.products,
          url: '/supermarket/products'
        },
        {
          id: 'categories',
          title: 'Categories',
          type: 'item',
          icon: icons.categories,
          url: '/supermarket/categories'
        },
        {
          id: 'inventory',
          title: 'Inventory',
          type: 'item',
          icon: icons.inventory,
          url: '/supermarket/inventory'
        },
        {
          id: 'suppliers',
          title: 'Suppliers',
          type: 'item',
          icon: icons.suppliers,
          url: '/supermarket/suppliers'
        },
        {
          id: 'purchases',
          title: 'Purchases',
          type: 'item',
          icon: icons.purchases,
          url: '/supermarket/purchases'
        },
        {
          id: 'sales',
          title: 'Sales / POS',
          type: 'item',
          icon: icons.sales,
          url: '/supermarket/sales'
        },
        {
          id: 'sales-returns',
          title: 'Sales Returns',
          type: 'item',
          icon: icons.returns,
          url: '/supermarket/sales-returns'
        },
        {
          id: 'reports',
          title: 'Reports',
          type: 'item',
          icon: icons.reports,
          url: '/supermarket/reports'
        }
      ]
    },
    {
      id: 'employee-management',
      title: 'Employees',
      type: 'collapse',
      icon: icons.employees,
      children: [
        {
          id: 'employee-list',
          title: 'Employee List',
          type: 'item',
          icon: icons.employees,
          url: '/supermarket/employees'
        },
        {
          id: 'attendance',
          title: 'Attendance',
          type: 'item',
          icon: icons.attendance,
          url: '/supermarket/attendance'
        }
      ]
    }
  ]
};

export default supermarket;
