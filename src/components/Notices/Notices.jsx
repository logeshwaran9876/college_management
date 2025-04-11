import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, TextField, Button, IconButton, Box, Typography, CircularProgress, Dialog, DialogActions,
    DialogContent, DialogTitle, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';

const Notices = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false); // Correct state variable name
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentNotice, setCurrentNotice] = useState({ issued_by: "", title: "", description: "" });
    const [staffMembers, setStaffMembers] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    // Fetch Notices from Backend
    useEffect(() => {
        fetchNotices();
        fetchStaffMembers();
    }, []);

    const fetchNotices = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/notice/get");
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            setNotices(data);
        } catch (error) {
            console.error('Error fetching notices:', error);
            setSnackbarMessage('Failed to fetch notices.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const fetchStaffMembers = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/staff/get"); // Assuming your staff route is /api/staff/get
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            setStaffMembers(data);
        } catch (error) {
            console.error('Error fetching staff members:', error);
            setSnackbarMessage('Failed to fetch staff members for the form.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    // Handle Dialog Open for Add
    const handleOpenAddDialog = () => {
        setIsEditMode(false);
        setCurrentNotice({ issued_by: "", title: "", description: "" });
        setFormErrors({});
        setIsAddEditDialogOpen(true);
    };

    // Handle Dialog Open for Edit
    const handleOpenEditDialog = async (noticeId) => {
        setIsEditMode(true);
        try {
            const response = await fetch(`http://localhost:5000/api/notice/get/${noticeId}`);
            if (!response.ok) throw new Error(`Error fetching notice: ${response.status}`);
            const data = await response.json();
            setCurrentNotice({
                _id: data._id,
                issued_by: data.issued_by._id,
                title: data.title,
                description: data.description,
            });
            setFormErrors({});
            setIsAddEditDialogOpen(true);
        } catch (error) {
            console.error("Error fetching notice for edit:", error);
            setSnackbarMessage('Failed to fetch notice for editing.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    // Handle Dialog Close
    const handleCloseDialog = () => setIsAddEditDialogOpen(false); // Corrected line

    // Handle Input Change
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setCurrentNotice(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Validate Form
    const validateForm = () => {
        let errors = {};
        if (!currentNotice.issued_by) errors.issued_by = "Issued By is required";
        if (!currentNotice.title) errors.title = "Title is required";
        if (!currentNotice.description) errors.description = "Description is required";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle Add/Edit Notice
    const handleSaveNotice = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const apiUrl = isEditMode
                ? `http://localhost:5000/api/notice/update/${currentNotice._id}`
                : "http://localhost:5000/api/notice/create";
            const method = isEditMode ? "PUT" : "POST";

            const response = await fetch(apiUrl, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentNotice),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || `Failed to ${isEditMode ? 'update' : 'add'} notice`);
            }

            setSnackbarMessage(`Notice ${isEditMode ? 'updated' : 'added'} successfully!`);
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            fetchNotices();
            handleCloseDialog();
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} notice:`, error);
            setSnackbarMessage(`Failed to ${isEditMode ? 'update' : 'add'} notice: ${error.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    // Handle Delete Notice
    const handleDeleteNotice = async (noticeId) => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/notice/delete/${noticeId}`, { method: "DELETE" });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || "Failed to delete notice");
            }
            setNotices(prevNotices => prevNotices.filter(notice => notice._id !== noticeId));
            setSnackbarMessage('Notice deleted successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Error deleting notice:", error);
            setSnackbarMessage(`Error deleting notice: ${error.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    // Filter Notices
    const filteredNotices = notices.filter(notice =>
        notice.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Notice Board</Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <TextField
                    size="small"
                    placeholder="Search notices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{ startAdornment: <Search color="action" /> }}
                />
                <Button variant="contained" startIcon={<Add />} onClick={handleOpenAddDialog}>
                    Add Notice
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Issued By</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredNotices.length > 0 ? (
                                filteredNotices.map((notice) => (
                                    <TableRow key={notice._id}>
                                        <TableCell>{notice.issued_by?.name || "N/A"}</TableCell>
                                        <TableCell>{notice.title}</TableCell>
                                        <TableCell>{notice.description}</TableCell>
                                        <TableCell>{new Date(notice.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleOpenEditDialog(notice._id)}>
                                                <Edit color="primary" />
                                            </IconButton>
                                            <IconButton onClick={() => handleDeleteNotice(notice._id)}>
                                                <Delete color="error" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Typography variant="body2" color="textSecondary">No notices found.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Add/Edit Notice Dialog */}
            <Dialog open={isAddEditDialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>{isEditMode ? "Edit Notice" : "Add New Notice"}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense" error={!!formErrors.issued_by}>
                        <InputLabel id="issued-by-label">Issued By (Staff)</InputLabel>
                        <Select
                            labelId="issued-by-label"
                            id="issued_by"
                            name="issued_by"
                            value={currentNotice.issued_by}
                            label="Issued By (Staff)"
                            onChange={handleInputChange}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {staffMembers.map((staff) => (
                                <MenuItem key={staff._id} value={staff._id}>
                                    {staff.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {formErrors.issued_by && (
                            <Typography variant="caption" color="error">
                                {formErrors.issued_by}
                            </Typography>
                        )}
                    </FormControl>
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Title"
                        name="title"
                        value={currentNotice.title}
                        onChange={handleInputChange}
                        error={!!formErrors.title}
                        helperText={formErrors.title}
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Description"
                        name="description"
                        multiline
                        rows={4}
                        value={currentNotice.description}
                        onChange={handleInputChange}
                        error={!!formErrors.description}
                        helperText={formErrors.description}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSaveNotice} variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : isEditMode ? "Update" : "Add"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
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

export default Notices;