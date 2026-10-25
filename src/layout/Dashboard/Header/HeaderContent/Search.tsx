
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Material UI
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Typography from '@mui/material/Typography';

// Icons
import { SearchNormal1 } from 'iconsax-reactjs';

const searchItems = [
  { label: 'Products', path: '/supermarket/products' },
  { label: 'Categories', path: '/supermarket/categories' },
  { label: 'Inventory', path: '/supermarket/inventory' },
  { label: 'Suppliers', path: '/supermarket/suppliers' },
  { label: 'Purchases', path: '/supermarket/purchases' },
  { label: 'Sales / POS', path: '/supermarket/sales' },
  { label: 'Sales Returns', path: '/supermarket/sales-returns' },
  { label: 'Reports', path: '/supermarket/reports' },
  { label: 'Employees', path: '/supermarket/employees' },
  { label: 'Attendance', path: '/supermarket/attendance' }
];

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filteredItems = searchItems.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    setQuery('');
    setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box
        sx={{
          width: '100%',
          ml: { xs: 0, md: 2 },
          position: 'relative'
        }}
      >
        <FormControl sx={{ width: { xs: '100%', md: 280 } }}>
          <OutlinedInput
            id="supermarket-header-search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              if (query.trim()) setOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && filteredItems.length > 0) {
                handleSelect(filteredItems[0].path);
              }

              if (event.key === 'Escape') {
                setOpen(false);
              }
            }}
            startAdornment={
              <InputAdornment position="start">
                <SearchNormal1 size={18} />
              </InputAdornment>
            }
            placeholder="Search supermart..."
            inputProps={{
              'aria-label': 'Search supermarket modules'
            }}
            sx={{
              '& .MuiOutlinedInput-input': { p: 1.5 },
              borderRadius: 2
            }}
          />
        </FormControl>

        {open && query.trim() && (
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              width: { xs: '100%', md: 280 },
              zIndex: 1400,
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            {filteredItems.length > 0 ? (
              <List dense disablePadding>
                {filteredItems.map((item) => (
                  <ListItemButton
                    key={item.path}
                    onClick={() => handleSelect(item.path)}
                  >
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  No matching supermarket pages found.
                </Typography>
              </Box>
            )}
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
}
