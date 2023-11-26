/**
 * Page that handles the signing in existing users and signing up new users
 */

import { useState } from "react";
import { Box, Button, Typography, Fade } from '@mui/material';

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import PersonUsingComputer from '../../assets/person_using_computer.svg';

import SignIn from "./Signin";
import SignUp from "./Signup";

export default () => {
    const [mode, setMode] = useState<'signin' | 'signup' | null>(null);

    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down('md'));

    const onClickBack = () => setMode(null);  // when the back button is pressed from the signin or signup page

    return <Box sx={{
        width: '100vw',
        height: '100vh',
        backgroundImage: "radial-gradient(#fff, #d7d7d7)",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }}>
        <Box width='min-content'>
            <Typography component="h2" width="max-content" display="flex" flexDirection="column" paddingBottom="1rem">
                <Typography
                    component="span"
                    color="#8656cd"
                    fontFamily="Montserrat"
                    fontSize="3.5rem"
                    lineHeight="3.5rem"
                >
                    TIMEGURU
                </Typography>
                <Typography
                    component="span"
                    color="#47a3bf"
                    fontFamily="Montserrat"
                    fontWeight="500"
                    fontSize="3.5rem"
                    lineHeight="3.5rem"
                >
                    Calendar
                </Typography>
            </Typography>
            <Typography fontSize="2.5rem" color="#B00084" fontWeight="700" lineHeight="3rem" marginBottom="1rem">
                Seamlessly manage events, appointments, and tasks in one place.
            </Typography>
            <Box display="flex" columnGap={{ xs: '5px', sm: "10px" }}>
                <Button
                    fullWidth
                    variant={mode == 'signin' ? "contained" : "outlined"}
                    onClick={() => setMode('signin')}>
                    Sign In
                </Button>
                <Button
                    fullWidth
                    variant={mode == 'signup' ? "contained" : "outlined"}
                    onClick={() => setMode('signup')}>
                    Sign Up
                </Button>
            </Box>
        </Box>
        {/* Following box displays the sign in/up pages and possibly the svg image.
        If screen is larger than or equal to md size then the image will be displayed.
        Otherwise it will be considered mobile view and the image will not be displayed. */}
        <Box sx={{
            paddingLeft: { xs: '15px', sm: "50px", md: '50px', lg: '5rem' },
            paddingRight: { xs: "15px", sm: "50px", md: "0" },
            width: { xs: '100vw', md: '450px', lg: "calc(5rem  + 500px)" },
            height: { xs: '100vh', md: 'auto' },
            backgroundImage: { xs: "radial-gradient(#fff, #d7d7d7)", md: 'none' },
            display: 'grid',
            position: { xs: 'fixed', md: 'static' },
            top: { xs: 0, md: 'auto' },
            left: { xs: 0, md: 'auto' },
            zIndex: { xs: mode ? 10 : -1, md: "auto" }
        }} >
            <Fade in={mode == 'signin'} timeout={500} >
                <SignIn onClickBack={onClickBack} isMobile={mobile} />
            </Fade>
            <Fade in={mode == 'signup'} timeout={500}>
                <SignUp isMobile={mobile} onClickBack={onClickBack} />
            </Fade>
            <Fade in={!mode} timeout={500}>
                <Box
                    component="img"
                    src={PersonUsingComputer}
                    gridRow="1"
                    gridColumn="1"
                    width="100%"
                    display={{ xs: 'none', md: 'block' }}
                />
            </Fade>
        </Box>
    </Box >
}