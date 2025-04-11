import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, TextField, Button, IconButton, Box, Typography, CircularProgress, Tooltip, Dialog, DialogActions,
    DialogContent, DialogTitle, Alert, Snackbar
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '' }); // Added password
    const [editUser, setEditUser] = useState({ _id: '', username: '', email: '', password: '' }); // Added password
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/user/get');
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            setUsers(data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setSnackbarMessage(`Failed to fetch users: ${error.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddDialog = () => setNewUser({ username: '', email: '', password: '' }, setOpenAddDialog(true)); // Reset password on open
    const handleCloseAddDialog = () => setOpenAddDialog(false);
    const handleOpenEditDialog = (user) => {
        setEditUser({ ...user, password: '' }); // Optionally clear password on edit open
        setOpenEditDialog(true);
    };
    const handleCloseEditDialog = () => setOpenEditDialog(false);

    const handleInputChangeNewUser = (e) => {
        setNewUser({ ...newUser, [e.target.name]: e.target.value });
    };

    const handleInputChangeEditUser = (e) => {
        setEditUser({ ...editUser, [e.target.name]: e.target.value });
    };

    const handleAddUser = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/user/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || `Error: ${response.status}`);
            }

            fetchUsers();
            handleCloseAddDialog();
            setNewUser({ username: '', email: '', password: '' }); // Reset all fields
            setSnackbarMessage('User added successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Error adding user:', error);
            setSnackbarMessage(`Failed to add user: ${error.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleUpdateUser = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/user/update/${editUser._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editUser),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || `Error: ${response.status}`);
            }

            fetchUsers();
            handleCloseEditDialog();
            setEditUser({ _id: '', username: '', email: '', password: '' }); // Reset edit form
            setSnackbarMessage('User updated successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Error updating user:', error);
            setSnackbarMessage(`Failed to update user: ${error.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/user/delete/${userId}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || `Error: ${response.status}`);
            }

            fetchUsers();
            setSnackbarMessage('User deleted successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Error deleting user:', error);
            setSnackbarMessage(`Failed to delete user: ${error.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box sx={{ p: 3, maxWidth: '1200px', margin: 'auto' }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
                User Management
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ flex: 1, minWidth: '250px', maxWidth: '600px' }}
                    InputProps={{ startAdornment: <Search color="action" sx={{ mr: 1 }} /> }}
                />
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleOpenAddDialog}
                    sx={{ bgcolor: 'primary.main', color: 'white', px: 3, minWidth: '150px' }}
                >
                    Add User
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'primary.main' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <TableRow key={user._id} hover>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>
                                            <Tooltip title="Edit User">
                                                <IconButton onClick={() => handleOpenEditDialog(user)}>
                                                    <Edit color="primary" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete User">
                                                <IconButton onClick={() => handleDeleteUser(user._id)}>
                                                    <Delete color="error" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        <Typography variant="body2" color="textSecondary">No users found.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Add User Dialog */}
            <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
                <DialogTitle>Add User</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Username"
                        name="username"
                        value={newUser.username}
                        onChange={handleInputChangeNewUser}
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Email"
                        type="email"
                        name="email"
                        value={newUser.email}
                        onChange={handleInputChangeNewUser}
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Password"
                        type="password"
                        name="password"
                        value={newUser.password}
                        onChange={handleInputChangeNewUser}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddDialog}>Cancel</Button>
                    <Button onClick={handleAddUser} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Username"
                        name="username"
                        value={editUser.username}
                        onChange={handleInputChangeEditUser}
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Email"
                        type="email"
                        name="email"
                        value={editUser.email}
                        onChange={handleInputChangeEditUser}
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="New Password (Optional)"
                        type="password"
                        name="password"
                        value={editUser.password}
                        onChange={handleInputChangeEditUser}
                        helperText="Leave blank if you don't want to change the password."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog}>Cancel</Button>
                    <Button onClick={handleUpdateUser} variant="contained">Update</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Users;