import React,{useMemo} from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4,
  Brightness7
} from '@mui/icons-material';
import {Outlet, Link} from 'react-router-dom'
import Sidebar from './Sidebar';
import ProfileMenu from './ProfileMenu';
const drawerWidth = 240;
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AppLogo from '../assets/AppLogo.png';

export default function Layout({ darkMode, toggleDarkMode,header, children }) {
  // const theme = useTheme();
  const [open, setOpen] = React.useState(() => {
    const stored = localStorage.getItem('sidebar_open');
    return stored === null ? true : stored === 'true';
  });
  const { user } = {};
  let role = user?.roles[0];
  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light',
      },
    }),
    [darkMode]
  );
  const handleDrawerToggle = () => {
    setOpen(prev => {
      const newState = !prev;
      localStorage.setItem('sidebar_open', newState);
      return newState;
    });
  };

  return (
    <ThemeProvider theme={theme}>
    <Box sx={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
      <CssBaseline />
      {/* Drawer */}
      <Sidebar 
        open={open}
        handleDrawerToggle={handleDrawerToggle}
      />
      {/* AppBar */}
<AppBar
  position="fixed"
  sx={{
    zIndex: (theme) => theme.zIndex.drawer + 1,
    ml: open ? `${drawerWidth}px` : `60px`,
    transition: 'all 0.3s',
    bgcolor: darkMode ? 'background.default' : '#e6e6e6',
  }}
>
  <Toolbar sx={{ justifyContent: 'space-between' }}>
    {/* Izquierda */}
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton
        color="inherit"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ mr: 2 }}
      >
        <MenuIcon />
      </IconButton>

      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <Box
          src={AppLogo}
          alt="App Logo"
          sx={{ 
            height: 65, 
            mr: 1,
          }}
          component="img"
        />
        <Typography variant="h6" sx={{ color: '#015756ff', fontWeight: 'bold', fontSize: '2.5rem', }}>
          CreditMate
        </Typography>
      </Link>
    </Box>

    {/* Centro */}
    <Typography
      variant="subtitle1"
      sx={{
        flexGrow: 1,
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'text.primary',
        textTransform: 'uppercase',
        fontSize: '1.4rem',
      }}
    >
      {header}
    </Typography>

    {/* Derecha */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="body2" color="text.primary" sx={{ fontStyle: 'italic', fontWeight: 500 }}>
          {user?.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {role?.name}
        </Typography>
      </Box>

      {/* Imagen de perfil con menú */}
      <ProfileMenu avatarUrl={user?.person_photo} />

      {/* Botón modo claro/oscuro */}
      <IconButton color="inherit" onClick={toggleDarkMode}>
        {darkMode ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Box>
  </Toolbar>
</AppBar>


      {/* Main */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // p: 2,
          // width: '100%',
          minHeight: '100vh',
          // el border es para debugear estilos
          // border: '1px solid #b21818',
          // borderRadius: 3,
        }}
      >
        <Toolbar />
        <Outlet/>
      </Box>
    </Box>
    </ThemeProvider>
  );
}
