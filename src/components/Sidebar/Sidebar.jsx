import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Avatar,
  Typography,
  Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Book as BookIcon,
  Apartment as ApartmentIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Poll as PollIcon,
  MonetizationOn as MonetizationOnIcon,
  Announcement as AnnouncementIcon
} from '@mui/icons-material';

const Sidebar = () => {
  const location = useLocation();
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Users', icon: <PeopleIcon />, path: '/users' },
    { text: 'Students', icon: <SchoolIcon />, path: '/students' },
    { text: 'Staff', icon: <PersonIcon />, path: '/staff' },
    { text: 'Courses', icon: <BookIcon />, path: '/courses' },
    { text: 'Departments', icon: <ApartmentIcon />, path: '/departments' },
    { text: 'Attendance', icon: <CheckCircleIcon />, path: '/attendance' },
    { text: 'Exams', icon: <AssignmentIcon />, path: '/exams' },
    { text: 'Results', icon: <PollIcon />, path: '/results' },
    { text: 'Fees', icon: <MonetizationOnIcon />, path: '/fees' },
    { text: 'Notices', icon: <AnnouncementIcon />, path: '/notices' },
  ];

  return (
    <Box
      component={motion.div}
      initial={{ x: -200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      sx={{
        width: 260,
        height: '100vh',
        bgcolor: '#1A202C',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 3,
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
        <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 48, height: 48 }}>CMS</Avatar>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>College CMS</Typography>
      </Box>
      <Divider sx={{ borderColor: 'grey.700' }} />
      <List sx={{ flexGrow: 1, py: 2 }}>
        {menuItems.map((item) => (
          <Tooltip key={item.text} title={item.text} placement="right" arrow>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                py: 1.5,
                mx: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.dark',
                  color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' },
                },
              }}
            >
              <ListItemIcon sx={{ color: 'grey.400' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
      <Divider sx={{ borderColor: 'grey.700' }} />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="grey.400">
          Academic Year: 2025-26
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;