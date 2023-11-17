import { useState, forwardRef, memo, RefObject } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ArrowBackSharpIcon from '@mui/icons-material/ArrowBackSharp';

import { auth } from '../../firebaselogic';

import { parseTextFieldInput } from '../../util';

// used by PasswordErrorsDisplay to keep track of which checks are passed/failed
interface PasswordCheckType {
  id: string,
  message: string,
  checkPassed: boolean
}

interface SignUpProps {
  onSignUp?: () => void
  onClickBack: () => void
}

function createPasswordCheckList(password: string): PasswordCheckType[] {
  const passwordCheckList: PasswordCheckType[] = [
    { id: 'shr', message: 'Password must be at least 8 letters long', checkPassed: password.length >= 8 },
    { id: 'lng', message: 'Password must not be longer than 16 letters', checkPassed: password.length <= 16 },
    { id: 'spa', message: 'Password cannot contain spaces', checkPassed: true },
    { id: 'low', message: 'Password must contain at least 1 uppsercase letter', checkPassed: false },
    { id: 'upr', message: 'Password must contain at least 1 lowercase letter', checkPassed: false },
    { id: 'dgt', message: 'Password must contain at least 1 digit', checkPassed: false }
  ]

  // check if the password contains at least 1 uppercase letter, 1 lowercase letter, 1 digit and no spaces
  for (let i = 0; i < password.length; i++) {
    const charCode = password.charCodeAt(i);
    if (!passwordCheckList[4].checkPassed && charCode >= 97 && charCode <= 122) {  // lowercase check
      passwordCheckList[4].checkPassed = true;
    } else if (!passwordCheckList[3].checkPassed && charCode >= 65 && charCode <= 90) {  // uppercase check
      passwordCheckList[3].checkPassed = true;
    } else if (!passwordCheckList[5].checkPassed && charCode >= 48 && charCode <= 57) {  // digit check
      passwordCheckList[5].checkPassed = true;
    } else if (charCode === 32 && passwordCheckList[2].checkPassed) {  // space check
      passwordCheckList[2].checkPassed = false;
    }
  }
  return passwordCheckList;
}

// component that displays a list of validation passes/fails that the password has
const PasswordErrorsDisplay = memo(({ passwordCheckList }: { passwordCheckList: PasswordCheckType[] }) =>
  <Box component="ul" sx={{ padding: 0, marginBottom: 0, alignSelf: 'flex-start' }}>
    {
      passwordCheckList.map(({ id, message, checkPassed }) =>
        <Box
          key={id}
          component="li"
          sx={{ display: 'flex', alignItems: 'center', listStyleType: "none" }}
        >
          {checkPassed ? <CheckCircleOutlineOutlinedIcon sx={{ color: 'icon.ok' }} /> : <ErrorOutlineOutlinedIcon color="error" />}
          <Typography component="span" ml='0.25rem' color={checkPassed ? 'text.ok' : 'error'}>{message}</Typography>
        </Box>)
    }
  </Box>);

function SignUp(props: SignUpProps, ref: RefObject<HTMLElement>) {
  const [password, setPassword] = useState<string>('');
  const [passwordCheckList, setPasswordCheckList] = useState<PasswordCheckType[]>([]);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [signUpError, setSignUpError] = useState<string | null>(null);  // signup error that is not specific to email or password

  const [confirmPasswordMatch, setConfirmPasswordMatch] = useState<boolean>(true);  // indicates if the password and the confirmed passwords match

  const [signUpInProgress, setSignUpInProgress] = useState<boolean>(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const emailInput = parseTextFieldInput(data.get('email')?.toString()).trim();
    const passwordInput = parseTextFieldInput(data.get('password')?.toString());
    const confirmPasswordInput = parseTextFieldInput(data.get('confirm_password')?.toString());
    let allInputsValid = false;

    // validate email
    if (!emailInput)
      setEmailError('Email address is required');
    else if (emailInput.length > 100)
      setEmailError('Email address cannot be longer than 100 letters');
    else if (emailInput.includes(' ') || (emailInput.match(/@/g) || []).length != 1)
      setEmailError('Invalid email address');
    else {
      setEmailError('');
      allInputsValid = true;
    }

    if (passwordInput) {
      setPasswordError('');
      setPassword(passwordInput);
    } else {
      setPasswordError('Password is required');
      setPassword('');
      allInputsValid = false;
    }

    // (!password && passwordCheckList.length == 0) is true when the component mounted passwordCheckList is empty.
    // this replaces the empty checks list with the proper checks list when the component is mounted
    if (passwordInput !== password || (!password && passwordCheckList.length == 0)) {
      // perform the password checks
      const passwordChecks = createPasswordCheckList(passwordInput);
      setPasswordCheckList(passwordChecks);
      if (!passwordChecks.every(({ checkPassed }) => checkPassed === true))
        allInputsValid = false;  // not all password checks passed
    }

    // check if the password input and the confirm password input match
    if (passwordInput === confirmPasswordInput)
      setConfirmPasswordMatch(true);
    else {
      setConfirmPasswordMatch(false);
      allInputsValid = false;
    }

    if (allInputsValid) {
      setSignUpInProgress(true);
      createUserWithEmailAndPassword(auth, emailInput, passwordInput).then(() => {
        // on signup the the onAuthStateChange listener will update the auth state in context for the entire app
        // to indicate that a has user authenticated successfully
        if (props.onSignUp)
          props.onSignUp();
      }).catch(error => {
        switch (error.code) {
          case 'auth/email-already-in-use':
            setSignUpError('Provided email address is already in use');
            break;
          case 'auth/invalid-email':
            setSignUpError('Invalid email address');
            break;
          case 'auth/operation-not-allowed':
            setSignUpError('Error');
            break;
          case 'auth/weak-password':
            setSignUpError('Provided password is too weak');
        }
      }).finally(() => setSignUpInProgress(false));
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate ref={ref} sx={{
      gridRow: 1,
      gridColumn: 1,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <Box display="flex" alignItems="center" width="100%">
        <IconButton aria-label='back to signin' onClick={props.onClickBack}>
          <ArrowBackSharpIcon />
        </IconButton>
        <Typography component="h1" variant="h5" flexGrow={1} display="flex" justifyContent="center">
          Sign up
        </Typography>
      </Box>
      {signUpError ?
        <Typography component="span" variant="subtitle2" sx={{
          color: 'text.error',
          alignSelf: 'start'
        }}>
          {signUpError}
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
        helperText={!signUpError && emailError}
        error={!!emailError || !!signUpError}
        disabled={signUpInProgress}
        autoFocus
      />
      <TextField
        variant='filled'
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="text"
        id="password"
        helperText={!signUpError && passwordError}
        error={!!passwordError}
        disabled={signUpInProgress}
      />
      <TextField
        variant='filled'
        margin="normal"
        required
        fullWidth
        name="confirm_password"
        label="Confirm Password"
        type="text"
        id="confirm_password"
        helperText={!confirmPasswordMatch && "Password and confirm password do not match"}
        error={!confirmPasswordMatch}
        disabled={signUpInProgress}
      />
      <PasswordErrorsDisplay passwordCheckList={passwordCheckList} />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2, boxShadow: 'none' }}
        disabled={signUpInProgress}
      >
        Sign Up
      </Button>
    </Box>
  );
}

export default forwardRef<HTMLElement, SignUpProps>(SignUp);