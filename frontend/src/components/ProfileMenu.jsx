import React, { useState } from 'react';
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProfileMenu = ({ avatarUrl }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
    const navigate = useNavigate();

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleOpen} sx={{ p: 0 }}>
        <Avatar src={avatarUrl} sx={{ width: 40, height: 40 }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => { navigate('/profile'); }}>Perfil</MenuItem>
        <MenuItem onClick={() => { console.log('algo') }}>Cerrar sesión</MenuItem>
      </Menu>
    </>
  );
};

export default ProfileMenu;
