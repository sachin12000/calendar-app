import { useContext } from "react"
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from "@mui/material/styles";
import { Box, CircularProgress } from '@mui/material';

import theme from './theme';

import { authStateContext } from "./contexts/auth";
import { AppContextProvider } from "./contexts";

import { signOut } from './firebaselogic'

import AppBar from './components/AppBar';
import UserAuthenticationPage from './pages/UserAuthentication'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';

import { Calendar } from "./pages";

import NotificationController from "./components/Notification";

const App = () => {
  const authState = useContext(authStateContext);
  const userName = authState.user && authState.user.email ? authState.user.email : "?";

  const onClickLogOut = () => signOut();
  return (
    <ThemeProvider theme={theme} >
      <CssBaseline />
      <AppContextProvider>
        {
          !authState.authStateCheckedOnLoad ?
            // render a spinner while the auth state is being checked on app load
            <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress />
            </Box> :
            authState.user ?
              // A user is already logged in. Show the user their calendar
              <Box display="flex" flexDirection="column" height="100%">
                <AppBar userName={userName} Icon={CalendarMonthOutlinedIcon} title="Calendar" onClickLogout={onClickLogOut} />
                <Calendar sx={{ flexGrow: 1 }} />
                <Box sx={{
                  width: '200px',
                  position: 'fixed',
                  top: 'calc(100vh - 100px)',
                  left: 'calc(50vw - 100px)'
                }}>
                  <NotificationController />
                </Box>
              </Box>
              :
              // display the login page if a user is not loged in
              <Box
                sx={{
                  position: 'fixed',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100vw',
                  minHeight: '100vh',
                  zIndex: 2000
              }}>
                <UserAuthenticationPage />
                <Box sx={{
                  width: '200px',
                  position: 'fixed',
                  top: { xs: 'calc(100vh - 150px)', sm: 'calc(100vh - 100px)' },
                  left: 'calc(50vw - 100px)'
                }}>
                  <NotificationController />
                </Box>
              </Box>
        }
      </AppContextProvider>
    </ThemeProvider >
  );
}

export default App;