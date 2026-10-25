
import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import type { MenuProps, NavItemType } from 'types/menu';
import supermarket from 'menu-items/supermarket';

const initialState: MenuProps = {
  isDashboardDrawerOpened: false,
  isComponentDrawerOpened: false
};

// ==============================|| API - MENU ||============================== //

const endpoints = {
  master: 'master'
};

export function useGetMenu() {
  const memoizedValue = useMemo(
    () => ({
      menu: supermarket as NavItemType,
      menuLoading: false,
      menuError: undefined,
      menuValidating: false,
      menuEmpty: false
    }),
    []
  );

  return memoizedValue;
}

export function useGetMenuMaster() {
  const { data, isLoading } = useSWR(
    endpoints.master,
    () => initialState,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  const memoizedValue = useMemo(
    () => ({
      menuMaster: data as MenuProps,
      menuMasterLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handlerComponentDrawer(isComponentDrawerOpened: boolean) {
  mutate(
    endpoints.master,
    (currentMenuMaster: MenuProps | undefined) => ({
      ...(currentMenuMaster ?? initialState),
      isComponentDrawerOpened
    }),
    false
  );
}

export function handlerDrawerOpen(isDashboardDrawerOpened: boolean) {
  mutate(
    endpoints.master,
    (currentMenuMaster: MenuProps | undefined) => ({
      ...(currentMenuMaster ?? initialState),
      isDashboardDrawerOpened
    }),
    false
  );
}
