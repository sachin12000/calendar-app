/**
 * Page that handles the signing in existing users and signing up new users
 */

import { useState, useRef } from "react";
import { Box, Slide, useTheme } from '@mui/material';

import SignIn from "./Signin";
import SignUp from "./Signup";

export default () => {
    // displays the signin page if true and displays the signup page otherwise
    const [displaySignInPage, setDisplaySignInPage] = useState<boolean>(true);

    const theme = useTheme();

    const containerRef = useRef<HTMLElement>(null);

    const onClickSignUp = () => setDisplaySignInPage(false);

    // go back to sign in page when the back button on the signup page is pressed
    const onClickBackFromSignUp = () => setDisplaySignInPage(true);

    return <Box ref={containerRef} sx={{
        display: 'grid',
        marginLeft: '1rem',
        marginRight: '1rem',
        width: { xs: '100%', sm: '550px' },
        margin: { sm: 0 },
        overflow: 'hidden'
    }}
    >
        <Slide in={displaySignInPage} direction='left' container={containerRef.current} timeout={500} easing={{
            enter: theme.transitions.easing.sharp,
            exit: theme.transitions.easing.sharp
        }}
        >
            <SignIn onClickSignUp={onClickSignUp} />
        </Slide>
        <Slide in={!displaySignInPage} direction='right' container={containerRef.current} timeout={500} easing={{
            enter: theme.transitions.easing.sharp,
            exit: theme.transitions.easing.sharp
        }}
        >
            <SignUp onClickBack={onClickBackFromSignUp} />
        </Slide>
    </Box >;
}