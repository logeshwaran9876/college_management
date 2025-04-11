import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    Stack,
    Paper,
    Box,
    Button,
    AppBar,
    Toolbar,
    IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
    School as SchoolIcon,
    Person as PersonIcon,
    Book as BookIcon,
    Apartment as ApartmentIcon,
    TrendingUp as TrendingUpIcon,
    Event as EventIcon,
    Notifications as NotificationsIcon,
    ExitToApp as LogoutIcon,
} from '@mui/icons-material';

const stats = [
    { title: 'Students', value: '1,254', icon: <SchoolIcon />, color: '#4a90e2' },
    { title: 'Staff', value: '84', icon: <PersonIcon />, color: '#7ed321' },
    { title: 'Courses', value: '32', icon: <BookIcon />, color: '#f5a623' },
    { title: 'Departments', value: '8', icon: <ApartmentIcon />, color: '#d0021b' },
];

const widgets = [
    { title: 'Performance', description: 'Overall student performance is up by 12% this semester.', icon: <TrendingUpIcon />, color: '#6200ea' },
    { title: 'Upcoming Events', description: 'Annual Tech Fest is scheduled for next month.', icon: <EventIcon />, color: '#ff5722' },
    { title: 'Notifications', description: '3 new important announcements.', icon: <NotificationsIcon />, color: '#009688' },
];

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // Optional: Call a backend API endpoint for logout (e.g., to invalidate session)
            const response = await fetch('http://localhost:5000/api/user/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // If you're using JWT
                },
            });

            if (response.ok) {
                // Clear local storage (token, user info)
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Redirect to the login page
                navigate('/login');
            } else {
                const data = await response.json();
                console.error('Logout failed:', data.message || 'Something went wrong during logout.');
                // Optionally show a snackbar or alert for logout failure
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Optionally show a snackbar or alert for logout error
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Dashboard
                    </Typography>
                    <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>
            <Box sx={{ p: 4, backgroundColor: '#f4f6f8', flexGrow: 1 }}>
                <Typography variant="h4" fontWeight={600} gutterBottom>
                    Dashboard Overview
                </Typography>

                <Grid container spacing={3} alignItems="stretch">
                    {stats.map((stat, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <motion.div whileHover={{ scale: 1.05 }}>
                                <Card sx={{
                                    background: `linear-gradient(135deg, ${stat.color} 30%, #fff 90%)`,
                                    color: '#fff',
                                    boxShadow: 3,
                                    borderRadius: 2,
                                    height: '100%',
                                }}>
                                    <CardContent>
                                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                                            <Typography variant="h6" fontWeight={500}>{stat.title}</Typography>
                                            <Avatar sx={{ bgcolor: '#ffffff33' }}>{stat.icon}</Avatar>
                                        </Stack>
                                        <Typography variant="h3" sx={{ mt: 2, fontWeight: 700 }}>{stat.value}</Typography>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}

                    <Grid item xs={12} md={8}>
                        <Paper sx={{
                            p: 3,
                            height: '100%',
                            background: 'linear-gradient(135deg, #1e3c72 30%, #2a5298 90%)',
                            color: '#fff',
                            borderRadius: 2,
                            boxShadow: 4,
                        }}>
                            <Typography variant="h6" fontWeight={500} gutterBottom>
                                Academic Overview
                            </Typography>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: 'calc(100% - 40px)',
                            }}>
                                <Typography color="inherit">Chart will be displayed here</Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Stack spacing={2} sx={{ height: '100%' }}>
                            {widgets.map((widget, index) => (
                                <motion.div whileHover={{ scale: 1.05 }} key={index}>
                                    <Card sx={{ boxShadow: 3, borderRadius: 2, height: '100%' }}>
                                        <CardContent>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <Avatar sx={{ bgcolor: widget.color, color: '#fff' }}>{widget.icon}</Avatar>
                                                <Box>
                                                    <Typography variant="h6" fontWeight={500}>{widget.title}</Typography>
                                                    <Typography variant="body2" color="textSecondary">{widget.description}</Typography>
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default Dashboard;