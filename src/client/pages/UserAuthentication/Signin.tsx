import { useState, forwardRef, RefObject, CSSProperties } from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import IconButton from '@mui/material/IconButton';
import ArrowBackSharpIcon from '@mui/icons-material/ArrowBackSharp';

import { signInWithEmailAndPassword } from 'firebase/auth';

import { auth } from '../../firebaselogic';

const titleHeader =
  <Typography
    component="h1"
    variant="h5"
    flexGrow={{ xs: "1", md: "0" }}
    display="flex"
    justifyContent="center"
    alignItems="center"
  >
    Sign In
  </Typography>;

interface SigninProps {
  onSignIn?: () => void
  isMobile: boolean  // displays a back button to go back to the landing page
  onClickBack: () => void // triggered when the back button is pressed. only used in mobile view
  style?: CSSProperties
}

function SignIn(props: SigninProps, ref: RefObject<HTMLElement>) {
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);  // Login error that is not specific to email or password
  const [loginInProgress, setLoginInProgress] = useState<boolean>(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email')?.toString().trim();
    const password = data.get('password')?.toString();

    let allInputsValid = true;

    if (!email) {
      setEmailError('Email is required');
      allInputsValid = false;
    } else if (email.includes(' ') || (email.match(/@/g) || []).length != 1) {
      setEmailError('Invalid email address');
      allInputsValid = false;
    } else if (emailError)
      setEmailError(null);

    if (!password) {
      setPasswordError('Password is required');
      allInputsValid = false;
    } else if (passwordError)
      setPasswordError(null);

    if (allInputsValid && email && password) {
      setLoginInProgress(true);
      signInWithEmailAndPassword(auth, email, password).then(({ user }) => {
        // on signin the the onAuthStateChange listener will update the auth state in context for the entire app
        // to indicate that a has user authenticated successfully
        if (props.onSignIn)
          props.onSignIn();
      }).catch(error => {
        switch (error.code) {
          case 'auth/invalid-login-credentials':
          case 'auth/invalid-email':
          case 'auth/wrong-password':
          case 'auth/user-not-found':
            setLoginError('Incorrect credentials');
            break;
          case 'auth/user-disabled':
            setLoginError('This account is disabled');
            break;
          case 'auth/network-request-failed':
            setLoginError('Unable to connect to login server');
            break;
          default:
            setLoginError(error.toString ? error.toString() : 'Login error');
        }
      }).finally(() => setLoginInProgress(false));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate ref={ref} sx={{
      gridRow: 1,
      gridColumn: 1,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }} style={props.style}>
      {props.isMobile ?
        <Box display="flex">
          <IconButton aria-label='back to main page' onClick={props.onClickBack}>
            <ArrowBackSharpIcon />
          </IconButton>
          {titleHeader}
        </Box>
        :
        titleHeader
      }
      {loginError ?
        <Typography component="span" variant="subtitle2" sx={{
          color: 'text.error',
          alignSelf: 'start'
        }}>
          {loginError}
        </Typography> : null
      }
      <TextField
        variant='filled'
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        helperText={!loginError && emailError}
        error={!!emailError || !!loginError}
        disabled={loginInProgress}
        autoFocus
      />
      <TextField
        variant='filled'
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
        helperText={!loginError && passwordError}
        error={!!loginError || !!passwordError}
        disabled={loginInProgress}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2, boxShadow: 'none' }}
        disabled={loginInProgress}
      >
        Sign In
      </Button>
      <Grid container>
        <Grid item xs>
          <Link href="#" variant="body2">
            Forgot Password?
          </Link>
        </Grid>
      </Grid>
    </Box>
  );
}

export default forwardRef<HTMLElement, SigninProps>(SignIn);