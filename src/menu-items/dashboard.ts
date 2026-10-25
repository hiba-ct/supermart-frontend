
import { useGetMenu } from 'api/menu';

import {
  Refresh,
  HomeTrendUp,
  Box1,
  ShoppingCart,
  Shop,
  Truck,
  Chart,
  People,
  Calendar,
  ReceiptItem,
  Category
} from 'iconsax-reactjs';

import type { NavItemType } from 'types/menu';

// ==============================|| SUPERMART ICONS ||============================== //

const icons = {
  dashboard: HomeTrendUp,
  products: Box1,
  categories: Category,
  inventory: Box1,
  suppliers: Truck,
  purchases: ShoppingCart,
  sales: Shop,
  returns: ReceiptItem,
  reports: Chart,
  employees: People,
  attendance: Calendar,
  loading: Refresh
};

// ==============================|| SUPERMART LOADING MENU ||============================== //

const loadingMenu: NavItemType = {
  id: 'group-supermart-loading',
  title: 'SuperMart',
  type: 'group',
  icon: icons.loading,
  children: [
    {
      id: 'supermart-loading',
      title: 'Supermarket',
      type: 'collapse',
      icon: icons.dashboard,
      children: [
        {
          id: 'products-loading',
          title: 'Products',
          type: 'item',
          icon: icons.products,
          url: '/supermarket/products',
          breadcrumbs: false
        },
        {
          id: 'categories-loading',
          title: 'Categories',
          type: 'item',
          icon: icons.categories,
          url: '/supermarket/categories',
          breadcrumbs: false
        },
        {
          id: 'inventory-loading',
          title: 'Inventory',
          type: 'item',
          icon: icons.inventory,
          url: '/supermarket/inventory',
          breadcrumbs: false
        },
        {
          id: 'suppliers-loading',
          title: 'Suppliers',
          type: 'item',
          icon: icons.suppliers,
          url: '/supermarket/suppliers',
          breadcrumbs: false
        },
        {
          id: 'purchases-loading',
          title: 'Purchases',
          type: 'item',
          icon: icons.purchases,
          url: '/supermarket/purchases',
          breadcrumbs: false
        },
        {
          id: 'sales-loading',
          title: 'Sales / POS',
          type: 'item',
          icon: icons.sales,
          url: '/supermarket/sales',
          breadcrumbs: false
        },
        {
          id: 'returns-loading',
          title: 'Sales Returns',
          type: 'item',
          icon: icons.returns,
          url: '/supermarket/sales-returns',
          breadcrumbs: false
        },
        {
          id: 'reports-loading',
          title: 'Reports',
          type: 'item',
          icon: icons.reports,
          url: '/supermarket/reports',
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'employees-loading',
      title: 'Employees',
      type: 'collapse',
      icon: icons.employees,
      children: [
        {
          id: 'employee-list-loading',
          title: 'Employee List',
          type: 'item',
          icon: icons.employees,
          url: '/supermarket/employees',
          breadcrumbs: false
        },
        {
          id: 'attendance-loading',
          title: 'Attendance',
          type: 'item',
          icon: icons.attendance,
          url: '/supermarket/attendance',
          breadcrumbs: false
        }
      ]
    }
  ]
};

// ==============================|| MENU ITEMS - API ||============================== //

export function MenuFromAPI() {
  const { menu, menuLoading } = useGetMenu();

  // Show SuperMart menu while the API menu is loading
  if (menuLoading || !menu) {
    return loadingMenu;
  }

  const subChildrenList = (children: NavItemType[] = []) => {
    return children.map((subList) => itemList(subList));
  };

  const itemList = (subList: NavItemType): NavItemType => {
    const list = fillItem(subList);

    if (subList.type === 'collapse' && subList.children) {
      list.children = subChildrenList(subList.children);
    }

    return list;
  };

  const childrenList = menu.children?.map((subList) => itemList(subList));

  return fillItem(menu, childrenList);
}

// ==============================|| MAP MENU ICONS ||============================== //

function fillItem(
  item: NavItemType,
  children?: NavItemType[]
): NavItemType {
  const iconName = item?.icon as keyof typeof icons;

  return {
    ...item,
    title: item?.title,
    icon: icons[iconName] ?? item?.icon,
    ...(children && { children })
  };
}
