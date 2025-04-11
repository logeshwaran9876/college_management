import React, { useState, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, TextField, Button, IconButton, Box, Typography, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel, Checkbox, ListItemText, Grid, Snackbar, Alert
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [editing, setEditing] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [searchQuery, setSearchQuery] = useState("");

    const [newStudent, setNewStudent] = useState({
        student_id: "",
        name: "",
        email: "",
        phone: "",
        dob: "",
        gender: "Male",
        address: "",
        department_id: "",
        course_ids: [],
    });

    const [editStudent, setEditStudent] = useState({
        _id: "",
        student_id: "",
        name: "",
        email: "",
        phone: "",
        dob: "",
        gender: "Male",
        address: "",
        department_id: "",
        course_ids: [],
    });

    useEffect(() => {
        fetchStudents();
        fetchDepartments();
        fetchCourses();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/student/get");
            const data = await response.json();
            setStudents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching students:", error);
            setSnackbarMessage("Failed to fetch students.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/department/get");
            const data = await response.json();
            setDepartments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching departments:", error);
            setSnackbarMessage("Failed to fetch departments.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/course/get");
            const data = await res.json();
            setCourses(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching courses:", err);
            setSnackbarMessage("Failed to fetch courses.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    const handleOpenAddDialog = () => setOpenAddDialog(true);
    const handleCloseAddDialog = () => setOpenAddDialog(false);
    const handleOpenEditDialog = (student) => {
        setEditStudent({ ...student, dob: student.dob ? student.dob.split('T')[0] : '' });
        setOpenEditDialog(true);
        setSelectedStudentId(student._id);
    };
    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setSelectedStudentId(null);
    };

    const handleAddStudent = async () => {
        const {
            student_id, name, email, phone, dob, gender, address, department_id, course_ids } = newStudent;

        if (!student_id || !name || !email || !phone || !dob || !gender || !address || !department_id || course_ids.length === 0) {
            setSnackbarMessage("All fields are required!");
            setSnackbarSeverity("warning");
            setSnackbarOpen(true);
            return;
        }

        try {
            setAdding(true);
            const response = await fetch("http://localhost:5000/api/student/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newStudent),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || "Failed to add student");
            }

            setNewStudent({
                student_id: "",
                name: "",
                email: "",
                phone: "",
                dob: "",
                gender: "Male",
                address: "",
                department_id: "",
                course_ids: [],
            });

            handleCloseAddDialog();
            fetchStudents();
            setSnackbarMessage("Student added successfully!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Error adding student:", error);
            setSnackbarMessage(`Error adding student: ${error.message}`);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setAdding(false);
        }
    };

    const handleUpdateStudent = async () => {
        const { _id, student_id, name, email, phone, dob, gender, address, department_id, course_ids } = editStudent;

        if (!_id || !student_id || !name || !email || !phone || !dob || !gender || !address || !department_id || course_ids.length === 0) {
            setSnackbarMessage("All fields are required for update!");
            setSnackbarSeverity("warning");
            setSnackbarOpen(true);
            return;
        }

        try {
            setEditing(true);
            const response = await fetch(`http://localhost:5000/api/student/update/${_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editStudent),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || "Failed to update student");
            }

            handleCloseEditDialog();
            fetchStudents();
            setSnackbarMessage("Student updated successfully!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Error updating student:", error);
            setSnackbarMessage(`Error updating student: ${error.message}`);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setEditing(false);
        }
    };

    const handleDeleteStudent = async (id) => {
        if (!window.confirm("Are you sure you want to delete this student?")) {
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/student/delete/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || "Failed to delete student");
            }

            fetchStudents();
            setSnackbarMessage("Student deleted successfully!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Error deleting student:", error);
            setSnackbarMessage(`Error deleting student: ${error.message}`);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    const handleInputChange = (event, setter, isCheckbox = false) => {
        const { name, value, checked } = event.target;
        setter(prev => ({
            ...prev,
            [name]: isCheckbox ? (prev[name].includes(value) ? prev[name].filter(v => v !== value) : [...prev[name], value]) : value,
        }));
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box sx={{ p: 4, backgroundColor: "#eef2f6", minHeight: "100vh" }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
                Student Management
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Button variant="contained" startIcon={<Add />} onClick={handleOpenAddDialog}>
                    Add Student
                </Button>
                <TextField
                    label="Search Students"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                />
            </Box>

            {loading ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper} sx={{ mt: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Student ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>DOB</TableCell>
                                <TableCell>Gender</TableCell>
                                <TableCell>Department</TableCell>
                                <TableCell>Courses</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredStudents.map((student) => (
                                <TableRow key={student._id}>
                                    <TableCell>{student.student_id}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.email}</TableCell>
                                    <TableCell>{student.phone}</TableCell>
                                    <TableCell>{student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell>{student.gender}</TableCell>
                                    <TableCell>{student.department_id?.name || "N/A"}</TableCell>
                                    <TableCell>
                                        {(student.course_ids || []).map((c) => c.name).join(", ")}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpenEditDialog(student)}>
                                            <Edit color="primary" />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteStudent(student._id)}>
                                            <Delete color="error" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredStudents.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">No students found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Add Student Dialog */}
            <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
                <DialogTitle>Add Student</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Student ID" name="student_id" value={newStudent.student_id} onChange={(e) => handleInputChange(e, setNewStudent)} margin="dense" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Name" name="name" value={newStudent.name} onChange={(e) => handleInputChange(e, setNewStudent)} margin="dense" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Email" type="email" name="email" value={newStudent.email} onChange={(e) => handleInputChange(e, setNewStudent)} margin="dense" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Phone" name="phone" value={newStudent.phone} onChange={(e) => handleInputChange(e, setNewStudent)} margin="dense" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="DOB" type="date" name="dob" value={newStudent.dob} onChange={(e) => handleInputChange(e, setNewStudent)} margin="dense" InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Gender</InputLabel>
                                <Select name="gender" value={newStudent.gender} onChange={(e) => handleInputChange(e, setNewStudent)} label="Gender">
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Address" name="address" value={newStudent.address} onChange={(e) => handleInputChange(e, setNewStudent)} margin="dense" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Department</InputLabel>
                                <Select name="department_id" value={newStudent.department_id} onChange={(e) => handleInputChange(e, setNewStudent)} label="Department">
                                    {departments.map((dept) => (
                                        <MenuItem key={dept._id} value={dept._id}>{dept.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Courses</InputLabel>
                                <Select
                                    multiple
                                    name="course_ids"
                                    value={newStudent.course_ids}
                                    onChange={(e) => handleInputChange(e, setNewStudent)}
                                    renderValue={(selected) =>
                                        courses.filter((c) => selected.includes(c._id)).map((c) => c.name).join(", ")
                                    }
                                >
                                    {courses.map((course) => (
                                        <MenuItem key={course._id} value={course._id}>
                                            <Checkbox checked={newStudent.course_ids.includes(course._id)} />
                                            <ListItemText primary={course.name} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddDialog}>Cancel</Button>
                    <Button onClick={handleAddStudent} variant="contained" disabled={adding}>
                        {adding ? <CircularProgress size={24} /> : "Add Student"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Student Dialog */}
            <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
                <DialogTitle>Edit Student</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Student ID" name="student_id" value={editStudent.student_id} onChange={(e) => handleInputChange(e, setEditStudent)} margin="dense" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Name" name="name" value={editStudent.name} onChange={(e) => handleInputChange(e, setEditStudent)} margin="dense" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Email" type="email" name="email" value={editStudent.email} onChange={(e) => handleInputChange(e, setEditStudent)} margin="dense" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Phone" name="phone" value={editStudent.phone} onChange={(e) => handleInputChange(e, setEditStudent)} margin="dense" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="DOB" type="date" name="dob" value={editStudent.dob} onChange={(e) => handleInputChange(e, setEditStudent)} margin="dense" InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Gender</InputLabel>
                                <Select name="gender" value={editStudent.gender} onChange={(e) => handleInputChange(e, setEditStudent)} label="Gender">
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Address" name="address" value={editStudent.address} onChange={(e) => handleInputChange(e, setEditStudent)} margin="dense" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Department</InputLabel>
                                <Select name="department_id" value={editStudent.department_id} onChange={(e) => handleInputChange(e, setEditStudent)} label="Department">
                                    {departments.map((dept) => (
                                        <MenuItem key={dept._id} value={dept._id}>{dept.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Courses</InputLabel>
                                <Select
                                    multiple
                                    name="course_ids"
                                    value={editStudent.course_ids}
                                    onChange={(e) => handleInputChange(e, setEditStudent)}
                                    renderValue={(selected) =>
                                        courses.filter((c) => selected.includes(c._id)).map((c) => c.name).join(", ")
                                    }
                                >
                                    {courses.map((course) => (
                                        <MenuItem key={course._id} value={course._id}>
                                            <Checkbox checked={editStudent.course_ids.includes(course._id)} />
                                            <ListItemText primary={course.name} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog}>Cancel</Button>
                    <Button onClick={handleUpdateStudent} variant="contained" disabled={editing}>
                        {editing ? <CircularProgress size={24} /> : "Update Student"}
                    </Button>
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

export default StudentManagement;