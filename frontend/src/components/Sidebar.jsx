import React, { useState } from "react";
import {
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    Divider,
    Typography,
    Drawer,
    Toolbar,
  } from '@mui/material';
  import ExpandLess from '@mui/icons-material/ExpandLess';
  import ExpandMore from '@mui/icons-material/ExpandMore';
import { useNavigate, useLocation } from 'react-router-dom';
import { sidebarRoutes } from '@/utils/SidebarRoutes';
export default function Sidebar({ open, handleDrawerToggle }) {
    const drawerWidth = 240;
    const navigate = useNavigate();
    const location = useLocation();
    const routes = sidebarRoutes;
    const [openGroups, setOpenGroups] = useState({});
    const isRouteActive = (path) => location.pathname === path;

    const goTo = (path) => {
      navigate(path);
    };
    const toggleGroup = (groupName) => {
        setOpenGroups((prev) => ({
          ...prev,
          [groupName]: !prev[groupName],
        }));
      };
    return (
        <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : 60,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : 0,
            transition: 'width 0.3s',
            overflowX: 'hidden',
          },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
      {routes.map((group, index) => {
        const firstRoute = group.routes?.[0];
        const FirstRouteIcon = firstRoute?.icon;
        const GroupIcon = group.groupicon;
          return group.nonIterative == true ? (
              <List component="div" disablePadding key={group.groupname}>
                <ListItemButton
                  sx={{ pl: 2 }}
                  selected={isRouteActive(group.routes[0].path)}
                  onClick={() => navigate(group.routes[0].path)}
                >
                   {group.routes?.[0]?.icon && <FirstRouteIcon />}
                  {open && <ListItemText 
                    primary={group.routes[0].name}
                    sx={{ 
                      pl: 4,
                      '&:hover':{textDecoration: 'underline'},
                      cursor: 'pointer'
                     }}
                    />}
                </ListItemButton>
              </List>
               
          ):(
            <div key={group.groupname}>
          <ListItemButton onClick={() => toggleGroup(group.groupname)}>
            <ListItemIcon>{<group.groupicon />}</ListItemIcon>
            {open && (
              <>
                <ListItemText primary={group.groupname} />
                {openGroups[group.groupname] ? <ExpandLess /> : <ExpandMore />}
              </>
            )}
          </ListItemButton>

          <Collapse in={openGroups[group.groupname]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {group.routes.map((route) => (
                <ListItemButton
                  key={route.name}
                  sx={{ 
                    pl: 4,
                    '&:hover':{textDecoration: 'underline'},
                    cursor: 'pointer'
                   }}
                  selected={isRouteActive(route.path)}
                  onClick={() => navigate(route.path)}
                >
                  <ListItemIcon>{<route.icon />}</ListItemIcon>
                  {open && <ListItemText primary={route.name} />}
                </ListItemButton>
              ))}
            </List>
          </Collapse>

          <Divider />
        </div>
          )
      })}
    </List>
      </Drawer>
    );
}