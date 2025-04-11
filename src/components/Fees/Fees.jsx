import React, { useState, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    TextField, Button, IconButton, Box, Typography, CircularProgress, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
    Snackbar, Alert
} from "@mui/material";
import { Add, Edit, Delete, Search } from "@mui/icons-material";

const Fees = () => {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [selectedFeeId, setSelectedFeeId] = useState(null);
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentFee, setCurrentFee] = useState({
        student_id: "",
        amount: "",
        status: "Pending",
        date: new Date().toISOString().split('T')[0], // Default to today's date
    });
    const [students, setStudents] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    useEffect(() => {
        fetchFees();
        fetchStudents();
    }, []);

    const fetchFees = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5000/api/fees/get");
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            setFees(data);
        } catch (error) {
            console.error("Error fetching fees:", error);
            setSnackbarMessage("Failed to fetch fees.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/student/get");
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            setStudents(data);
        } catch (error) {
            console.error("Error fetching students:", error);
            setSnackbarMessage("Failed to fetch students for the form.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    const handleAddFee = () => {
        setIsEditMode(false);
        setCurrentFee({ student_id: "", amount: "", status: "Pending", date: new Date().toISOString().split('T')[0] });
        setFormErrors({});
        setIsAddEditDialogOpen(true);
    };

    const handleEditFee = async (feeId) => {
        setIsEditMode(true);
        try {
            const response = await fetch(`http://localhost:5000/api/fees/get/${feeId}`);
            if (!response.ok) throw new Error(`Error fetching fee: ${response.status}`);
            const data = await response.json();
            setCurrentFee({
                _id: data._id,
                student_id: data.student_id._id,
                amount: data.amount,
                status: data.status,
                date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            });
            setFormErrors({});
            setIsAddEditDialogOpen(true);
        } catch (error) {
            console.error("Error fetching fee for edit:", error);
            setSnackbarMessage("Failed to fetch fee for editing.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    const closeAddEditDialog = () => {
        setIsAddEditDialogOpen(false);
    };

    const openDeleteDialog = (feeId) => {
        setSelectedFeeId(feeId);
        setConfirmDelete(true);
    };

    const closeDeleteDialog = () => {
        setSelectedFeeId(null);
        setConfirmDelete(false);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setCurrentFee(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const validateForm = () => {
        let errors = {};
        if (!currentFee.student_id) errors.student_id = "Student is required";
        if (!currentFee.amount || isNaN(Number(currentFee.amount)) || Number(currentFee.amount) <= 0) {
            errors.amount = "Amount must be a positive number";
        }
        if (!currentFee.status) errors.status = "Status is required";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveFee = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const apiUrl = isEditMode
                ? `http://localhost:5000/api/fees/update/${currentFee._id}`
                : "http://localhost:5000/api/fees/create";
            const method = isEditMode ? "PUT" : "POST";

            const response = await fetch(apiUrl, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(currentFee),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || `Failed to ${isEditMode ? "update" : "add"} fee`);
            }

            setSnackbarMessage(`Fee ${isEditMode ? "updated" : "added"} successfully!`);
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
            fetchFees();
            closeAddEditDialog();
        } catch (error) {
            console.error(`Error ${isEditMode ? "updating" : "adding"} fee:`, error);
            setSnackbarMessage(`Failed to ${isEditMode ? "update" : "add"} fee: ${error.message}`);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFee = async () => {
        if (!selectedFeeId) return;
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/fees/delete/${selectedFeeId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || "Failed to delete fee");
            }

            setFees((prevFees) => prevFees.filter((fee) => fee._id !== selectedFeeId));
            console.log("✅ Fee deleted:", selectedFeeId);
            setSnackbarMessage("Fee deleted successfully!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } catch (error) {
            console.error("❌ Error deleting fee:", error);
            setSnackbarMessage(`Error deleting fee: ${error.message}`);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            closeDeleteDialog();
            setLoading(false);
        }
    };

    const statusColors = {
        Paid: "success",
        Pending: "warning",
        Overdue: "error",
    };

    const filteredFees = fees.filter((fee) =>
        (fee.student_id?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (fee.status || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Fee Management</Typography>

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <TextField
                    size="small"
                    placeholder="Search by Student Name or Status..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{ startAdornment: <Search color="action" /> }}
                />
                <Button variant="contained" startIcon={<Add />} onClick={handleAddFee}>
                    Add Fee
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Student</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredFees.map((fee) => (
                            <TableRow key={fee._id}>
                                <TableCell>{fee.student_id?.name || "N/A"}</TableCell>
                                <TableCell>${fee.amount?.toFixed(2) || "N/A"}</TableCell>
                                <TableCell>
                                    <Chip label={fee.status} color={statusColors[fee.status] || "default"} />
                                </TableCell>
                                <TableCell>{fee.date ? new Date(fee.date).toLocaleDateString() : "N/A"}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEditFee(fee._id)}>
                                        <Edit color="primary" />
                                    </IconButton>
                                    <IconButton onClick={() => openDeleteDialog(fee._id)}>
                                        <Delete color="error" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Fee Dialog */}
            <Dialog open={isAddEditDialogOpen} onClose={closeAddEditDialog}>
                <DialogTitle>{isEditMode ? "Edit Fee" : "Add New Fee"}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense" error={!!formErrors.student_id}>
                        <InputLabel id="student-label">Student</InputLabel>
                        <Select
                            labelId="student-label"
                            id="student_id"
                            name="student_id"
                            value={currentFee.student_id}
                            label="Student"
                            onChange={handleInputChange}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {students.map((student) => (
                                <MenuItem key={student._id} value={student._id}>
                                    {student.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {formErrors.student_id && (
                            <Typography variant="caption" color="error">
                                {formErrors.student_id}
                            </Typography>
                        )}
                    </FormControl>
                    <TextField
                        margin="dense"
                        id="amount"
                        name="amount"
                        label="Amount"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={currentFee.amount}
                        onChange={handleInputChange}
                        error={!!formErrors.amount}
                        helperText={formErrors.amount}
                    />
                    <FormControl fullWidth margin="dense" error={!!formErrors.status}>
                        <InputLabel id="status-label">Status</InputLabel>
                        <Select
                            labelId="status-label"
                            id="status"
                            name="status"
                            value={currentFee.status}
                            label="Status"
                            onChange={handleInputChange}
                        >
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Paid">Paid</MenuItem>
                            <MenuItem value="Overdue">Overdue</MenuItem>
                        </Select>
                        {formErrors.status && (
                            <Typography variant="caption" color="error">
                                {formErrors.status}
                            </Typography>
                        )}
                    </FormControl>
                    <TextField
                        margin="dense"
                        id="date"
                        name="date"
                        label="Date"
                        type="date"
                        fullWidth
                        variant="outlined"
                        value={currentFee.date}
                        onChange={handleInputChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeAddEditDialog}>Cancel</Button>
                    <Button onClick={handleSaveFee} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : isEditMode ? "Update" : "Add"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDelete} onClose={closeDeleteDialog}>
                <DialogTitle>Are you sure you want to delete this fee?</DialogTitle>
                <DialogActions>
                    <Button onClick={closeDeleteDialog}>Cancel</Button>
                    <Button onClick={handleDeleteFee} color="error" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : "Delete"}
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

export default Fees;