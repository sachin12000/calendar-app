import { useState, MouseEvent, useCallback } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';

import { OverridableComponent } from '@mui/material/OverridableComponent';
import { SvgIconTypeMap } from '@mui/material';

interface AppBarProps {
    userName: string
    Icon?: OverridableComponent<SvgIconTypeMap<{}, "svg">>  // icon form the mui library to be displayed on the app bar
    title?: string  // title to be displayed on the app bar
    onClickAccount?: () => void  // account info click callback
    onClickLogout: () => void  // logout click callback
}

function ResponsiveAppBar(props: AppBarProps) {
    const { userName, Icon, title: mainText = '', onClickLogout } = props;
    const avatarText = userName.length > 0 ? userName[0].toUpperCase() : '?';
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);  // stores the element that the user dropdown anchors on

    const handleOpenUserMenu = useCallback((event: MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    }, []);

    const handleCloseUserMenu = useCallback(() => {
        setAnchorElUser(null);
    }, []);

    return (
        <AppBar position="static">
            <Container maxWidth={false}>
                <Toolbar disableGutters variant="regular" sx={{ justifyContent: 'space-between' }}>
                    <Box display='flex' alignItems="center">
                        {/* Display the icon and the title */}
                        {Icon ? <Icon sx={{ mr: 2 }} /> : null}
                        <Typography
                            variant="h6"
                            noWrap
                            component="h1"
                            sx={{
                                fontWeight: 'thin',
                                color: 'inherit',
                                textDecoration: 'none',
                                userSelect: 'none'
                            }}
                        >
                            {mainText}
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 0 }}>
                        {/* Display the user drop down menu */}
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar>{avatarText}</Avatar>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            <MenuItem>
                                <Typography component="span" textAlign="center">Account</Typography>
                            </MenuItem>
                            <MenuItem>
                                <Typography component="span" onClick={onClickLogout} textAlign="center">Logout</Typography>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
export default ResponsiveAppBar;
