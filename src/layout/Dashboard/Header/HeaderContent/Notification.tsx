
import { useCallback, useEffect, useRef, useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import Badge from '@mui/material/Badge';
import CardContent from '@mui/material/CardContent';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import { useNavigate } from 'react-router-dom';

import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

import { getProductsAPI } from 'api/productApi';
import { Notification as NotificationIcon } from 'iconsax-reactjs';

interface Product {
  _id: string;
  name: string;
  sku?: string;
  stock: number;
  lowStockThreshold?: number;
  isActive?: boolean;
}

export default function NotificationPage() {
  const downMD = useMediaQuery((theme) =>
    theme.breakpoints.down('md')
  );

  const navigate = useNavigate();
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Products whose stock is at or below their threshold.
  const lowStockProducts = products.filter(
    (product) =>
      product.isActive !== false &&
      Number(product.stock) <=
        Number(product.lowStockThreshold ?? 10)
  );

  // Fetch product data from the backend.
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getProductsAPI();

      // Supports the usual { success, products } response.
      const data = Array.isArray(response)
        ? response
        : Array.isArray(response?.products)
          ? response.products
          : [];

      setProducts(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to load stock notifications.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // IMPORTANT: Load notifications on the first dashboard render.
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleToggle = () => {
    setOpen((previous) => !previous);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (
      anchorRef.current &&
      event.target instanceof Node &&
      anchorRef.current.contains(event.target)
    ) {
      return;
    }

    setOpen(false);
  };

  const openInventory = () => {
    setOpen(false);
    navigate('/supermarket/inventory');
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.5 }}>
      {/* Notification icon and live badge count */}
      <IconButton
        color="secondary"
        variant="light"
        aria-label="Open supermarket notifications"
        ref={anchorRef}
        aria-controls={open ? 'supermarket-notifications' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        sx={{ color: 'text.primary' }}
      >
        <Badge
          badgeContent={lowStockProducts.length}
          color="error"
          max={99}
          showZero={false}
        >
          <NotificationIcon variant="Bold" />
        </Badge>
      </IconButton>

      {/* Notification popup */}
      <Popper
        placement={downMD ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [downMD ? -5 : 0, 9]
              }
            }
          ]
        }}
        sx={{
          zIndex: 1200,
          width: 420,
          maxWidth: 'calc(100vw - 32px)'
        }}
      >
        {({ TransitionProps }) => (
          <Transitions
            type="grow"
            position={downMD ? 'top' : 'top-right'}
            in={open}
            {...TransitionProps}
          >
            <Paper
              sx={{
                boxShadow: 4,
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} content={false}>
                  <CardContent>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={2}
                      sx={{ mb: 2 }}
                    >
                      <Box>
                        <Typography variant="h5">
                          Supermarket Alerts
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {lowStockProducts.length} low-stock
                          product(s)
                        </Typography>
                      </Box>

                      <Button
                        size="small"
                        onClick={loadNotifications}
                        disabled={loading}
                      >
                        Refresh
                      </Button>
                    </Stack>

                    <SimpleBar
                      sx={{
                        maxHeight: 360,
                        '& .simplebar-content': {
                          display: 'flex',
                          flexDirection: 'column'
                        }
                      }}
                    >
                      <List
                        disablePadding
                        id="supermarket-notifications"
                      >
                        {loading && (
                          <Box
                            sx={{
                              py: 4,
                              display: 'flex',
                              justifyContent: 'center'
                            }}
                          >
                            <CircularProgress size={28} />
                          </Box>
                        )}

                        {!loading && error && (
                          <Alert
                            severity="error"
                            sx={{ mb: 1 }}
                            action={
                              <Button
                                color="inherit"
                                size="small"
                                onClick={loadNotifications}
                              >
                                Retry
                              </Button>
                            }
                          >
                            {error}
                          </Alert>
                        )}

                        {!loading &&
                          !error &&
                          lowStockProducts.map((product) => (
                            <ListItem
                              key={product._id}
                              disablePadding
                              sx={{
                                mb: 1,
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 2
                              }}
                              secondaryAction={
                                <Typography
                                  variant="subtitle2"
                                  color="error.main"
                                  sx={{ mr: 0.5 }}
                                >
                                  Stock: {product.stock}
                                </Typography>
                              }
                            >
                              <ListItemButton
                                onClick={openInventory}
                                sx={{ borderRadius: 2, py: 1.5, pr: 12 }}
                              >
                                <ListItemAvatar>
                                  <Avatar
                                    type="filled"
                                    color="error"
                                  >
                                    !
                                  </Avatar>
                                </ListItemAvatar>

                                <ListItemText
                                  primary={
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight={600}
                                    >
                                      Low stock: {product.name}
                                    </Typography>
                                  }
                                  secondary={
                                    <>
                                      SKU: {product.sku || 'N/A'}
                                      {' · '}
                                      Threshold:{' '}
                                      {product.lowStockThreshold ?? 10}
                                    </>
                                  }
                                />
                              </ListItemButton>
                            </ListItem>
                          ))}

                        {!loading &&
                          !error &&
                          lowStockProducts.length === 0 && (
                            <Box
                              sx={{
                                py: 4,
                                textAlign: 'center'
                              }}
                            >
                              <Typography variant="h6">
                                All stocked up!
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                No low-stock products found.
                              </Typography>
                            </Box>
                          )}
                      </List>
                    </SimpleBar>

                    {!loading && !error && (
                      <Button
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 2 }}
                        onClick={openInventory}
                      >
                        View Inventory
                      </Button>
                    )}
                  </CardContent>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
