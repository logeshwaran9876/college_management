import React, { useState, useEffect } from "react";
import {
  Grid, Card, CardContent, Typography, Avatar, IconButton,
  Box, TextField, Button, CircularProgress, Paper, Dialog,
  DialogTitle, DialogContent, DialogActions, MenuItem,
  Select, FormControl, InputLabel, Snackbar, Alert
} from "@mui/material";
import { Add, Edit, Delete, Search, School } from "@mui/icons-material";
import { motion } from "framer-motion";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCourse, setCurrentCourse] = useState({
    course_id: "",
    name: "",
    description: "",
    credits: 3,
    semester: 1,
    department_id: "",
    faculty_id: ""
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
    fetchFaculties();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/course/get");
      if (!response.ok) throw new Error("Failed to fetch courses");
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      showSnackbar(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/department/get");
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      showSnackbar("Failed to fetch departments", "error");
    }
  };

  const fetchFaculties = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/staff/get");
      const data = await response.json();
      setFaculties(data);
    } catch (error) {
      showSnackbar("Failed to fetch faculties", "error");
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenAddDialog = () => {
    setCurrentCourse({
      course_id: "",
      name: "",
      description: "",
      credits: 3,
      semester: 1,
      department_id: "",
      faculty_id: ""
    });
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (course) => {
    setCurrentCourse({
      _id: course._id,
      course_id: course.course_id,
      name: course.name,
      description: course.description,
      credits: course.credits,
      semester: course.semester,
      department_id: course.department_id?._id,
      faculty_id: course.faculty_id?._id
    });
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    const { course_id, name, description, credits, semester, department_id, faculty_id } = currentCourse;

    if (!course_id || !name || !description || !credits || !semester || !department_id || !faculty_id) {
      showSnackbar("Please fill all required fields", "error");
      return;
    }

    try {
      const url = isEditing 
        ? `http://localhost:5000/api/course/update/${currentCourse._id}`
        : "http://localhost:5000/api/course/create";
      
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id,
          name,
          description,
          credits,
          semester,
          department_id,
          faculty_id
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to save course");
      }

      showSnackbar(
        isEditing ? "Course updated successfully" : "Course created successfully"
      );
      handleCloseDialog();
      fetchCourses();
    } catch (error) {
      showSnackbar(error.message || "Failed to save course", "error");
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourseId) return;

    try {
      const response = await fetch(`http://localhost:5000/api/course/delete/${selectedCourseId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete course");

      showSnackbar("Course deleted successfully");
      setCourses(courses.filter((course) => course._id !== selectedCourseId));
    } catch (error) {
      showSnackbar(error.message || "Failed to delete course", "error");
    } finally {
      setConfirmDelete(false);
      setSelectedCourseId(null);
    }
  };

  const openDeleteDialog = (courseId) => {
    setSelectedCourseId(courseId);
    setConfirmDelete(true);
  };

  const closeDeleteDialog = () => {
    setConfirmDelete(false);
    setSelectedCourseId(null);
  };

  const filteredCourses = courses.filter((course) =>
    (course.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.course_id || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, backgroundColor: "#eef2f6", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: "#333" }}>
        📚 Course Management
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <TextField
          size="small"
          placeholder="🔍 Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{ startAdornment: <Search color="action" /> }}
          sx={{ backgroundColor: "#fff", borderRadius: 1, width: "100%", maxWidth: 400 }}
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenAddDialog}
          sx={{ backgroundColor: "#4a90e2", color: "#fff", "&:hover": { backgroundColor: "#357ab7" } }}
        >
          Add Course
        </Button>
      </Box>

      <Grid container spacing={3} justifyContent="center">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={course._id} sx={{ display: "flex" }}>
              <motion.div whileHover={{ scale: 1.05 }} style={{ width: "100%" }}>
                <Card sx={{ borderRadius: 3, boxShadow: 3, transition: "all 0.3s ease-in-out", width: "100%" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ bgcolor: "#4a90e2" }}>
                        <School sx={{ color: "#fff" }} />
                      </Avatar>
                      <Typography variant="h6" fontWeight={600}>
                        {course.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
                      <strong>ID:</strong> {course.course_id}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
                      <strong>Description:</strong> {course.description}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
                      <strong>Department:</strong> {course.department_id?.name || "N/A"}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
                      <strong>Faculty:</strong> {course.faculty_id?.name || "N/A"}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
                      <strong>Credits:</strong> {course.credits}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
                      <strong>Semester:</strong> {course.semester}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                      <IconButton onClick={() => handleOpenEditDialog(course)}>
                        <Edit color="primary" />
                      </IconButton>
                      <IconButton onClick={() => openDeleteDialog(course._id)}>
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
            <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3, boxShadow: 3 }}>
              <Typography variant="h6" color="textSecondary">
                {searchQuery ? "No matching courses found" : "No courses available"}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onClose={closeDeleteDialog}>
        <DialogTitle>⚠️ Are you sure you want to delete this course?</DialogTitle>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteCourse} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Course Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? "✏️ Edit Course" : "➕ Add New Course"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Course ID *"
                value={currentCourse.course_id}
                onChange={(e) => setCurrentCourse({...currentCourse, course_id: e.target.value})}
                margin="normal"
                disabled={isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Course Name *"
                value={currentCourse.name}
                onChange={(e) => setCurrentCourse({...currentCourse, name: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description *"
                multiline
                rows={3}
                value={currentCourse.description}
                onChange={(e) => setCurrentCourse({...currentCourse, description: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                label="Credits *"
                type="number"
                value={currentCourse.credits}
                onChange={(e) => setCurrentCourse({...currentCourse, credits: parseInt(e.target.value) || 0})}
                margin="normal"
                inputProps={{ min: 1, max: 6 }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                label="Semester *"
                type="number"
                value={currentCourse.semester}
                onChange={(e) => setCurrentCourse({...currentCourse, semester: parseInt(e.target.value) || 1})}
                margin="normal"
                inputProps={{ min: 1, max: 8 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Department *</InputLabel>
                <Select
                  value={currentCourse.department_id}
                  onChange={(e) => setCurrentCourse({...currentCourse, department_id: e.target.value})}
                  label="Department"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Faculty *</InputLabel>
                <Select
                  value={currentCourse.faculty_id}
                  onChange={(e) => setCurrentCourse({...currentCourse, faculty_id: e.target.value})}
                  label="Faculty"
                >
                  {faculties.map((faculty) => (
                    <MenuItem key={faculty._id} value={faculty._id}>
                      {faculty.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {isEditing ? "Update Course" : "Add Course"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({...snackbar, open: false})}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Courses;