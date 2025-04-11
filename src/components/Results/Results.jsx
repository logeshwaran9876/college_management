import React, { useState, useEffect } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    IconButton,
    Box,
    TextField,
    Button,
    CircularProgress,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
    Alert
} from '@mui/material';
import { Add, Edit, Delete, Search, School } from '@mui/icons-material';
import { motion } from 'framer-motion';

const Results = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [selectedResultId, setSelectedResultId] = useState(null);
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentResult, setCurrentResult] = useState({
        student_id: '',
        exam_id: '',
        marks_obtained: '',
        grade: '',
    });
    const [students, setStudents] = useState([]);
    const [exams, setExams] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [formErrors, setFormErrors] = useState({});

    const fetchResults = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5000/api/result/get");
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Error fetching results:', error);
            setSnackbarMessage('Failed to fetch results.');
            setSnackbarSeverity('error');
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
            console.error('Error fetching students:', error);
            setSnackbarMessage('Failed to fetch students for the form.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const fetchExams = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/exam/get");
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            setExams(data);
        } catch (error) {
            console.error('Error fetching exams:', error);
            setSnackbarMessage('Failed to fetch exams for the form.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    useEffect(() => {
        fetchResults();
        fetchStudents();
        fetchExams();
    }, []);

    const handleAddResult = () => {
        setIsEditMode(false);
        setCurrentResult({ student_id: '', exam_id: '', marks_obtained: '', grade: '' });
        setFormErrors({});
        setIsAddEditDialogOpen(true);
    };

    const handleEditResult = async (resultId) => {
        setIsEditMode(true);
        try {
            const response = await fetch(`http://localhost:5000/api/result/get/${resultId}`);
            if (!response.ok) throw new Error(`Error fetching result: ${response.status}`);
            const data = await response.json();
            setCurrentResult({
                _id: data._id,
                student_id: data.student_id._id,
                exam_id: data.exam_id._id,
                marks_obtained: data.marks_obtained,
                grade: data.grade,
            });
            setFormErrors({});
            setIsAddEditDialogOpen(true);
        } catch (error) {
            console.error('Error fetching result for edit:', error);
            setSnackbarMessage('Failed to fetch result for editing.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const closeAddEditDialog = () => {
        setIsAddEditDialogOpen(false);
    };

    const openDeleteDialog = (resultId) => {
        setSelectedResultId(resultId);
        setConfirmDelete(true);
    };

    const closeDeleteDialog = () => {
        setSelectedResultId(null);
        setConfirmDelete(false);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setCurrentResult(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const validateForm = () => {
        let errors = {};
        if (!currentResult.student_id) errors.student_id = 'Student is required';
        if (!currentResult.exam_id) errors.exam_id = 'Exam is required';
        if (!currentResult.marks_obtained) {
            errors.marks_obtained = 'Marks Obtained is required';
        } else if (isNaN(Number(currentResult.marks_obtained))) {
            errors.marks_obtained = 'Marks Obtained must be a number';
        }
        if (!currentResult.grade) errors.grade = 'Grade is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveResult = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const apiUrl = isEditMode
                ? `http://localhost:5000/api/result/update/${currentResult._id}`
                : "http://localhost:5000/api/result/create";
            const method = isEditMode ? "PUT" : "POST";

            const response = await fetch(apiUrl, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(currentResult),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || `Failed to ${isEditMode ? 'update' : 'add'} result`);
            }

            setSnackbarMessage(`Result ${isEditMode ? 'updated' : 'added'} successfully!`);
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            fetchResults();
            closeAddEditDialog();
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} result:`, error);
            setSnackbarMessage(`Failed to ${isEditMode ? 'update' : 'add'} result: ${error.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteResult = async () => {
        if (!selectedResultId) return;
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/result/delete/${selectedResultId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || "Failed to delete result");
            }

            console.log("✅ Result deleted:", selectedResultId);
            setSnackbarMessage('Result deleted successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            fetchResults(); // Refresh results after deletion
        } catch (error) {
            console.error("❌ Error deleting result:", error);
            setSnackbarMessage(`Error deleting result: ${error.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            closeDeleteDialog();
            setLoading(false);
        }
    };

    const filteredResults = results.filter((result) =>
        (result.student_id?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4, backgroundColor: '#eef2f6', minHeight: '100vh' }}>
            <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: '#333' }}>
                Results Management
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <TextField
                    size="small"
                    placeholder="Search results by student name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{ startAdornment: <Search color="action" /> }}
                    sx={{ backgroundColor: '#fff', borderRadius: 1 }}
                />
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAddResult}
                    sx={{ backgroundColor: '#4a90e2', color: '#fff', '&:hover': { backgroundColor: '#357ab7' } }}
                >
                    Add Result
                </Button>
            </Box>

            <Grid container spacing={3}>
                {filteredResults.length > 0 ? (
                    filteredResults.map((result) => (
                        <Grid item xs={12} sm={6} md={4} key={result._id}>
                            <motion.div whileHover={{ scale: 1.05 }}>
                                <Card sx={{ borderRadius: 3, boxShadow: 3, transition: 'all 0.3s ease-in-out' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: '#4a90e2' }}>
                                                <School sx={{ color: '#fff' }} />
                                            </Avatar>
                                            <Typography variant="h6" fontWeight={600}>
                                                {result.student_id?.name || "Unknown Student"}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                                            Exam: {result.exam_id?.course_id?.name || "N/A"}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                                            Marks: {result.marks_obtained}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                                            Grade: {result.grade}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                            <IconButton onClick={() => handleEditResult(result._id)}>
                                                <Edit color="primary" />
                                            </IconButton>
                                            <IconButton onClick={() => openDeleteDialog(result._id)}>
                                                <Delete color="error" />
                                            </IconButton>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, boxShadow: 3 }}>
                            <Typography variant="h6" color="textSecondary">No results found</Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>

            {/* Add/Edit Result Dialog */}
            <Dialog open={isAddEditDialogOpen} onClose={closeAddEditDialog}>
                <DialogTitle>{isEditMode ? 'Edit Result' : 'Add New Result'}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense" error={!!formErrors.student_id}>
                        <InputLabel id="student-label">Student</InputLabel>
                        <Select
                            labelId="student-label"
                            id="student_id"
                            name="student_id"
                            value={currentResult.student_id}
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
                        {formErrors.student_id && <Typography variant="caption" color="error">{formErrors.student_id}</Typography>}
                    </FormControl>
                    <FormControl fullWidth margin="dense" error={!!formErrors.exam_id}>
                        <InputLabel id="exam-label">Exam</InputLabel>
                        <Select
                            labelId="exam-label"
                            id="exam_id"
                            name="exam_id"
                            value={currentResult.exam_id}
                            label="Exam"
                            onChange={handleInputChange}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {exams.map((exam) => (
                                <MenuItem key={exam._id} value={exam._id}>
                                    {exam.course_id?.name} (Exam ID: {exam.exam_id})
                                </MenuItem>
                            ))}
                        </Select>
                        {formErrors.exam_id && <Typography variant="caption" color="error">{formErrors.exam_id}</Typography>}
                    </FormControl>
                    <TextField
                        margin="dense"
                        id="marks_obtained"
                        name="marks_obtained"
                        label="Marks Obtained"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={currentResult.marks_obtained}
                        onChange={handleInputChange}
                        error={!!formErrors.marks_obtained}
                        helperText={formErrors.marks_obtained}
                    />
                    <TextField
                        margin="dense"
                        id="grade"
                        name="grade"
                        label="Grade"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentResult.grade}
                        onChange={handleInputChange}
                        error={!!formErrors.grade}
                        helperText={formErrors.grade}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeAddEditDialog}>Cancel</Button>
                    <Button onClick={handleSaveResult} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Update' : 'Add')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDelete} onClose={closeDeleteDialog}>
                <DialogTitle>Are you sure you want to delete this result?</DialogTitle>
                <DialogActions>
                    <Button onClick={closeDeleteDialog}>Cancel</Button>
                    <Button onClick={handleDeleteResult} color="error" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Delete'}
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

export default Results;