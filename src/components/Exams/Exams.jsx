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
import { Add, Edit, Delete, Search, Event } from '@mui/icons-material';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const Exams = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [selectedExamId, setSelectedExamId] = useState(null);
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentExam, setCurrentExam] = useState({
        exam_id: '',
        course_id: '',
        date: dayjs(),
        total_marks: '',
    });
    const [courses, setCourses] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [formErrors, setFormErrors] = useState({});

    const fetchExams = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5000/api/exam/get");
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            setExams(data);
        } catch (error) {
            console.error('Error fetching exams:', error);
            setSnackbarMessage('Failed to fetch exams.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/course/get");
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setSnackbarMessage('Failed to fetch courses for the form.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    useEffect(() => {
        fetchExams();
        fetchCourses();
    }, []);

    const handleAddExam = () => {
        setIsEditMode(false);
        setCurrentExam({ exam_id: '', course_id: '', date: dayjs(), total_marks: '' });
        setFormErrors({});
        setIsAddEditDialogOpen(true);
    };

    const handleEditExam = (exam) => {
        setIsEditMode(true);
        setCurrentExam({
            _id: exam._id,
            exam_id: exam.exam_id,
            course_id: exam.course_id._id,
            date: dayjs(exam.date),
            total_marks: exam.total_marks,
        });
        setFormErrors({});
        setIsAddEditDialogOpen(true);
    };

    const closeAddEditDialog = () => {
        setIsAddEditDialogOpen(false);
    };

    const openDeleteDialog = (examId) => {
        setSelectedExamId(examId);
        setConfirmDelete(true);
    };

    const closeDeleteDialog = () => {
        setSelectedExamId(null);
        setConfirmDelete(false);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setCurrentExam(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleDateChange = (date) => {
        setCurrentExam(prevState => ({
            ...prevState,
            date: date,
        }));
    };

    const validateForm = () => {
        let errors = {};
        if (!currentExam.exam_id) errors.exam_id = 'Exam ID is required';
        if (!currentExam.course_id) errors.course_id = 'Course is required';
        if (!currentExam.date) errors.date = 'Date is required';
        if (!currentExam.total_marks) {
            errors.total_marks = 'Total Marks is required';
        } else if (isNaN(Number(currentExam.total_marks)) || Number(currentExam.total_marks) <= 0) {
            errors.total_marks = 'Total Marks must be a positive number';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveExam = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const apiUrl = isEditMode
                ? `http://localhost:5000/api/exam/update/${currentExam._id}`
                : "http://localhost:5000/api/exam/create";
            const method = isEditMode ? "PUT" : "POST";

            const response = await fetch(apiUrl, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    exam_id: currentExam.exam_id,
                    course_id: currentExam.course_id,
                    date: currentExam.date.toISOString(),
                    total_marks: currentExam.total_marks,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || `Failed to ${isEditMode ? 'update' : 'add'} exam`);
            }

            setSnackbarMessage(`Exam ${isEditMode ? 'updated' : 'added'} successfully!`);
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            fetchExams();
            closeAddEditDialog();
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} exam:`, error);
            setSnackbarMessage(`Failed to ${isEditMode ? 'update' : 'add'} exam: ${error.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExam = async () => {
        if (!selectedExamId) return;
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/exam/delete/${selectedExamId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || "Failed to delete exam");
            }

            console.log("✅ Exam deleted:", selectedExamId);
            setSnackbarMessage('Exam deleted successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            fetchExams(); // Re-fetch exams after deletion
        } catch (error) {
            console.error("❌ Error deleting exam:", error);
            setSnackbarMessage(`Error deleting exam: ${error.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            closeDeleteDialog();
            setLoading(false);
        }
    };

    const filteredExams = exams.filter((exam) =>
        (exam.course_id?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exam.exam_id || "").toLowerCase().includes(searchQuery.toLowerCase())
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
                Exam Management
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <TextField
                    size="small"
                    placeholder="Search exams by course or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{ startAdornment: <Search color="action" /> }}
                    sx={{ backgroundColor: '#fff', borderRadius: 1 }}
                />
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAddExam}
                    sx={{ backgroundColor: '#4a90e2', color: '#fff', '&:hover': { backgroundColor: '#357ab7' } }}
                >
                    Add Exam
                </Button>
            </Box>

            <Grid container spacing={3}>
                {filteredExams.length > 0 ? (
                    filteredExams.map((exam) => (
                        <Grid item xs={12} sm={6} md={4} key={exam._id}>
                            <motion.div whileHover={{ scale: 1.05 }}>
                                <Card sx={{ borderRadius: 3, boxShadow: 3, transition: 'all 0.3s ease-in-out' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: '#4a90e2' }}>
                                                <Event sx={{ color: '#fff' }} />
                                            </Avatar>
                                            <Typography variant="h6" fontWeight={600}>
                                                {exam.course_id?.name || "Unknown Course"}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                                            Exam ID: {exam.exam_id}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                                            Course: {exam.course_id?.name || "N/A"}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                                            Date: {dayjs(exam.date).format('DD-MM-YYYY')}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                                            Total Marks: {exam.total_marks}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                            <IconButton onClick={() => handleEditExam(exam)}>
                                                <Edit color="primary" />
                                            </IconButton>
                                            <IconButton onClick={() => openDeleteDialog(exam._id)}>
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
                            <Typography variant="h6" color="textSecondary">
                                No exams found
                            </Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>

            {/* Add/Edit Exam Dialog */}
            <Dialog open={isAddEditDialogOpen} onClose={closeAddEditDialog}>
                <DialogTitle>{isEditMode ? 'Edit Exam' : 'Add New Exam'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="exam_id"
                        name="exam_id"
                        label="Exam ID"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentExam.exam_id}
                        onChange={handleInputChange}
                        error={!!formErrors.exam_id}
                        helperText={formErrors.exam_id}
                        disabled={isEditMode}
                    />
                    <FormControl fullWidth margin="dense" error={!!formErrors.course_id}>
                        <InputLabel id="course-label">Course</InputLabel>
                        <Select
                            labelId="course-label"
                            id="course_id"
                            name="course_id"
                            value={currentExam.course_id}
                            label="Course"
                            onChange={handleInputChange}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {courses.map((course) => (
                                <MenuItem key={course._id} value={course._id}>
                                    {course.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {formErrors.course_id && <Typography variant="caption" color="error">{formErrors.course_id}</Typography>}
                    </FormControl>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Date"
                            value={currentExam.date}
                            onChange={handleDateChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    margin="dense"
                                    fullWidth
                                    variant="outlined"
                                    error={!!formErrors.date}
                                    helperText={formErrors.date}
                                />
                            )}
                        />
                    </LocalizationProvider>
                    <TextField
                        margin="dense"
                        id="total_marks"
                        name="total_marks"
                        label="Total Marks"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={currentExam.total_marks}
                        onChange={handleInputChange}
                        error={!!formErrors.total_marks}
                        helperText={formErrors.total_marks}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeAddEditDialog}>Cancel</Button>
                    <Button onClick={handleSaveExam} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Update' : 'Add')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDelete} onClose={closeDeleteDialog}>
                <DialogTitle>Are you sure you want to delete this exam?</DialogTitle>
                <DialogActions>
                    <Button onClick={closeDeleteDialog}>Cancel</Button>
                    <Button onClick={handleDeleteExam} color="error" disabled={loading}>
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

export default Exams;