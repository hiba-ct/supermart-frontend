
import { useState, MouseEvent, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import {
  Setting2,
  Profile,
  Notification,
  ShieldSecurity
} from 'iconsax-reactjs';

export default function SettingTab() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [selectedIndex, setSelectedIndex] = useState<number>();

  const handleListItemClick = (
    event: MouseEvent<HTMLDivElement>,
    index: number,
    route = ''
  ) => {
    setSelectedIndex(index);

    if (route) {
      navigate(route);
    }
  };

  useEffect(() => {
    const pathToIndex: Record<string, number> = {
      '/apps/profiles/account/settings': 0
    };

    setSelectedIndex(pathToIndex[pathname]);
  }, [pathname]);

  return (
    <List
      component="nav"
      sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}
    >
      <ListItemButton
        selected={selectedIndex === 0}
        onClick={(event) =>
          handleListItemClick(
            event,
            0,
            '/apps/profiles/account/settings'
          )
        }
      >
        <ListItemIcon>
          <Setting2 variant="Bulk" size={18} />
        </ListItemIcon>
        <ListItemText primary="Account Settings" />
      </ListItemButton>

      <ListItemButton
        onClick={(event) => handleListItemClick(event, 1)}
      >
        <ListItemIcon>
          <Notification variant="Bulk" size={18} />
        </ListItemIcon>
        <ListItemText primary="Notification Preferences" />
      </ListItemButton>

      <ListItemButton
        onClick={(event) => handleListItemClick(event, 2)}
      >
        <ListItemIcon>
          <ShieldSecurity variant="Bulk" size={18} />
        </ListItemIcon>
        <ListItemText primary="Security" />
      </ListItemButton>

      <ListItemButton
        onClick={(event) => handleListItemClick(event, 3)}
      >
        <ListItemIcon>
          <Profile variant="Bulk" size={18} />
        </ListItemIcon>
        <ListItemText primary="Business Profile" />
      </ListItemButton>
    </List>
  );
}
