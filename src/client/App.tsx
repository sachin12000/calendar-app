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
  const { user, demoMode, setDemoMode, authStateCheckedOnLoad } = useContext(authStateContext)
  const userEmail = demoMode ? demoMode.email : (user && user.email ? user.email : "?");

  const onClickLogOut = () => {
    if (demoMode)
      setDemoMode(null);  // clear out the demo mode if in demo mode
    else
      signOut();
  };

  return (
    <ThemeProvider theme={theme} >
      <CssBaseline />
      <AppContextProvider>
        {
          !authStateCheckedOnLoad ?
            // render a spinner while the auth state is being checked on app load
            <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress />
            </Box> :
            user || demoMode ?
              // A user is already logged in. Show the user their calendar
              <Box display="flex" flexDirection="column" height="100%">
                <AppBar userEmail={userEmail} Icon={CalendarMonthOutlinedIcon} title="Calendar" onClickLogout={onClickLogOut} />
                <Calendar sx={{ flexGrow: 1 }} demoMode={Boolean(demoMode)} />
                <Box sx={{
                  position: 'fixed',
                  bottom: '0',
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100vw',
                  paddingBottom: '10px',
                  pointerEvents: 'none'
                }}>
                  <NotificationController />
                </Box>
              </Box>
              :
              // display the login page if a user is not logged in
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
              </Box>
        }
      </AppContextProvider>
    </ThemeProvider >
  );
}

export default App;