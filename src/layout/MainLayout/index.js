import { useState, useEffect, forwardRef } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

import config from 'config/config';


// material-ui
import { styled, useTheme } from '@mui/material/styles';
import {
  AppBar,
  Box,
  CssBaseline,
  Toolbar,
  useMediaQuery,
  Snackbar,
  Typography
} from '@mui/material';

// project imports
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Header from './Header';
import Sidebar from './Sidebar';
import Customization from '../Customization';
import navigation from 'menu-items';
import { drawerWidth } from 'store/constant';
import { SET_MENU } from 'store/actions';

import ReconnectingWebSocket from 'reconnecting-websocket';

import { pingServer } from 'api/api';

import auth from 'auth/auth-helper';

// assets
import { IconChevronRight } from '@tabler/icons';

import MuiAlert from '@mui/material/Alert';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// styles
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  ...theme.typography.mainContent,
  ...(!open && {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    [theme.breakpoints.up('md')]: {
      marginLeft: -(drawerWidth - 20),
      width: `calc(100% - ${drawerWidth}px)`
    },
    [theme.breakpoints.down('md')]: {
      marginLeft: '20px',
      width: `calc(100% - ${drawerWidth}px)`,
      // padding: '16px'
    },
    [theme.breakpoints.down('sm')]: {
      marginLeft: '10px',
      width: `calc(100% - ${drawerWidth}px)`,
      // padding: '16px',
      marginRight: '10px'
    }
  }),
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    }),
    marginLeft: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    width: `calc(100% - ${drawerWidth}px)`,
    [theme.breakpoints.down('md')]: {
      // marginLeft: '20px',
      // marginRight: '20px'
    },
    [theme.breakpoints.down('sm')]: {
      marginLeft: '0px',
      marginRight: '0px'
    }
  })
}));

// ==============================|| MAIN LAYOUT ||============================== //

const STYLE_MAP = {
  MESSAGE: 'zugzwang-snackbar-message',
  INFO: 'zugzwang-snackbar-default',
  SUCCESS: 'zugzwang-snackbar-win',
  WARNING: 'zugzwang-snackbar-lose',
  ERROR: 'zugzwang-snackbar-lose'
}

const MainLayout = () => {
  const theme = useTheme();

  const jwt = auth.isAuthenticated();

  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));
  // Handle left drawer
  const leftDrawerOpened = useSelector((state) => state.customization.opened);
  const dispatch = useDispatch();
  const handleLeftDrawerToggle = () => {
    dispatch({ type: SET_MENU, opened: !leftDrawerOpened });
  };

  const [websocket, setWebscoket] = useState(null);

  const [socketStatus, setSocketStatus] = useState({
    connected: false,
    reason: ''
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    style: 'zugzwang-snackbar-notification'
  });

  // Global notifications. Can be used to send transaction statuses to user
  // along with notify user of messages and activities of friends
  useEffect(() => {
    const ws = new ReconnectingWebSocket(config.socketUrl);

    ws.addEventListener('open', event => {
      console.log('opening socket');

      setWebscoket(ws);

      ws.send(JSON.stringify({
        message_type: 'NOTIFICATIONS_INIT',
        user_id: jwt.user._id
      }));

      setSocketStatus({ ...socketStatus, connected: true })
    });

    ws.addEventListener('close', event => {
      console.log('socket closed')
      setSocketStatus({ ...socketStatus, connected: false });
      pingServer();
    });

    ws.addEventListener('message', event => {
      if (event.data) {
        const data = JSON.parse(event.data);
        console.log('got chat message: ', data)
        setSnackbar({ ...snackbar, open: true, message: data.text, style: STYLE_MAP[data.severity] });
      }
    });

    return () => ws.close();
  }, []);

  const handleClose = event => {
    setSnackbar({ ...snackbar, open: false });
  }

  if (!auth.isAuthenticated()) {
    return <Navigate to={'/demo-signin'} />;
  }

  return (
    <Box sx={{ display: 'flex', }}>
      <CssBaseline />
      {/* header */}
      <AppBar
        enableColorOnDark
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          bgcolor: theme.palette.background.default,
          transition: leftDrawerOpened ? theme.transitions.create('width') : 'none'
        }}
      >
        <Toolbar style={{ background: '#121212' }}>
          <Header handleLeftDrawerToggle={handleLeftDrawerToggle} />
        </Toolbar>
      </AppBar>

      {/* drawer */}
      <Sidebar drawerOpen={!matchDownMd ? leftDrawerOpened : !leftDrawerOpened} drawerToggle={handleLeftDrawerToggle} />

      {/* main content */}
      <Main theme={theme} open={leftDrawerOpened}>
        {/* breadcrumb */}
        <Breadcrumbs separator={IconChevronRight} navigation={navigation} icon title rightAlign />
        <Outlet />
        <Snackbar
          className={snackbar.style}
          style={{ maxWidth: 300 }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleClose}
        >
          <Alert className={snackbar.style} onClose={handleClose} sx={{ width: '100%' }}>
            <Typography>
              {snackbar.message}
            </Typography>
          </Alert>
        </Snackbar>
      </Main>
      {/* <Customization /> */}
    </Box>
  );
};

export default MainLayout;
