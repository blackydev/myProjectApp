import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Box, Toolbar, Typography, IconButton, MenuItem, Menu, Avatar} from '@mui/material';
import authService from '../service/auth';
import UserAvatar from './utils/userAvatar';

const MenuBar = ()=> {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const user = authService.getUser();
    const navigate = useNavigate();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogOut = () => {
    authService.logout();
    navigate('/login');
    handleClose();
  }

  return (
    <Box sx={{ flexGrow: 1}}>
      <AppBar position="static" elevation={12}>
        <Toolbar>       
           <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/"  style={{textDecoration: "none", color: "white"}}>
              Home
            </Link>

          </Typography>
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                {user && <UserAvatar id={user._id} name={user.name}/>}
                </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                sx={{            
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: "center"
                }}
              >
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: "center"
                  }}>
                    {user && <UserAvatar id={user._id} name={user.name}/>}
                  </Box>
                  <MenuItem onClick={handleClose}> <Link to={"/users/" + user?._id}>  Profile </Link> </MenuItem>
                  <MenuItem onClick={handleClose}>  <Link to="/account"> My account </Link> </MenuItem>
                  <MenuItem onClick={handleLogOut}>Log out</MenuItem>
              </Menu>
            </div>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default MenuBar;