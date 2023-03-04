import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Box, Toolbar, Typography, IconButton, MenuItem, Menu, Avatar} from '@mui/material';
import authService from '../service/auth';
import { Grid } from '@mui/material';
import userService from '../service/users';

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
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
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
                <Avatar alt={user?.name} src={user && userService.getAvatarURL(user._id) || ""} />
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
                }}
              >
                <Grid> 
                  <Avatar alt={user?.name} src="/static/images/avatar/1.jpg" sx={{marginX: "auto", mb: 1}} />
                  <MenuItem onClick={handleClose}> <Link to={"/users/" + user?._id}>  Profile </Link> </MenuItem>
                  <MenuItem onClick={handleClose}>  <Link to="/account"> My account </Link> </MenuItem>
                  <MenuItem onClick={handleLogOut}>Log out</MenuItem>
                </Grid>             
              </Menu>
            </div>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default MenuBar;