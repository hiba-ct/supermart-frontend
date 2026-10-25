
import { useState, MouseEvent, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import {
  Profile,
  Profile2User,
  Setting2,
  Logout
} from 'iconsax-reactjs';

interface Props {
  handleLogout: () => void;
}

export default function ProfileTab({ handleLogout }: Props) {
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
      '/supermarket/employees': 1,
      '/apps/profiles/account/settings': 2
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
        onClick={(event) => handleListItemClick(event, 0)}
      >
        <ListItemIcon>
          <Profile variant="Bulk" size={18} />
        </ListItemIcon>
        <ListItemText primary="My Profile" />
      </ListItemButton>

      <ListItemButton
        selected={selectedIndex === 1}
        onClick={(event) =>
          handleListItemClick(event, 1, '/supermarket/employees')
        }
      >
        <ListItemIcon>
          <Profile2User variant="Bulk" size={18} />
        </ListItemIcon>
        <ListItemText primary="Employee Management" />
      </ListItemButton>

      <ListItemButton
        selected={selectedIndex === 2}
        onClick={(event) =>
          handleListItemClick(
            event,
            2,
            '/apps/profiles/account/settings'
          )
        }
      >
        <ListItemIcon>
          <Setting2 variant="Bulk" size={18} />
        </ListItemIcon>
        <ListItemText primary="Account Settings" />
      </ListItemButton>

      <ListItemButton onClick={handleLogout}>
        <ListItemIcon>
          <Logout variant="Bulk" size={18} />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
    </List>
  );
}