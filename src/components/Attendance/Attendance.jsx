import React, { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, Button, IconButton, Box, Typography, CircularProgress,
  Tooltip, Select, MenuItem, FormControl, InputLabel, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert
} from "@mui/material";
import { Add, Edit, Delete, Search, Close, Check } from "@mui/icons-material";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState({
    attendance_id: "",
    student_id: "",
    course_id: "",
    status: "Present",
    date: new Date().toISOString().split('T')[0]
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    fetchAttendance();
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/attenence/get"); // Corrected spelling
      if (!response.ok) throw new Error("Failed to fetch attendance");
      const data = await response.json();
      setAttendance(data);
    } catch (error) {
      showSnackbar(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/student/get");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      showSnackbar("Failed to fetch students", "error");
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/course/get");
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      showSnackbar("Failed to fetch courses", "error");
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenAddDialog = () => {
    setCurrentAttendance({
      attendance_id: "",
      student_id: "",
      course_id: "",
      status: "Present",
      date: new Date().toISOString().split('T')[0]
    });
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (record) => {
    setCurrentAttendance({
      _id: record._id,
      attendance_id: record.attendance_id,
      student_id: record.student_id?._id,
      course_id: record.course_id?._id,
      status: record.status,
      date: new Date(record.date).toISOString().split('T')[0]
    });
    setOpenEditDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
  };

  const handleSubmit = async (isEdit = false) => {
    const { attendance_id, student_id, course_id, status, date } = currentAttendance;

    if (!attendance_id || !student_id || !course_id || !status || !date) {
      showSnackbar("Please fill all required fields", "error");
      return;
    }

    try {
      const url = isEdit 
        ? `http://localhost:5000/api/attenence/update/${currentAttendance._id}`
        : "http://localhost:5000/api/attenence/create";
      
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendance_id,
          student_id,
          course_id,
          status,
          date
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to save attendance");
      }

      showSnackbar(
        isEdit ? "Attendance updated successfully" : "Attendance created successfully"
      );
      handleCloseDialog();
      fetchAttendance();
    } catch (error) {
      showSnackbar(error.message || "Failed to save attendance", "error");
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedId) return;

    try {
      const response = await fetch(`http://localhost:5000/api/attenence/delete/${selectedId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete attendance record");

      showSnackbar("Attendance record deleted successfully");
      setAttendance(attendance.filter((record) => record._id !== selectedId));
    } catch (error) {
      showSnackbar(error.message || "Failed to delete attendance", "error");
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const filteredAttendance = attendance.filter((record) => {
    const matchesStatus = filter === "all" || record.status === filter;
    const matchesSearch = searchQuery === "" || 
      (record.student_id?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (record.course_id?.name?.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: "1200px", margin: "auto" }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", textAlign: "center", mb: 3 }}>
        Attendance Management
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search by student or course..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: 1, minWidth: "250px", maxWidth: "600px" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" sx={{ mr: 1 }} />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filter} label="Status" onChange={(e) => setFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="Present">Present</MenuItem>
            <MenuItem value="Absent">Absent</MenuItem>
            <MenuItem value="Late">Late</MenuItem>
          </Select>
        </FormControl>

        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={handleOpenAddDialog}
          sx={{ bgcolor: "primary.main", color: "white", px: 3, minWidth: "150px" }}
        >
          Add Attendance
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, overflow: "hidden", boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>ID</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Student</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Course</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Date</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAttendance.map((record) => (
              <TableRow key={record._id} hover>
                <TableCell>{record.attendance_id}</TableCell>
                <TableCell>{record.student_id?.name || "N/A"}</TableCell>
                <TableCell>{record.course_id?.name || "N/A"}</TableCell>
                <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  {record.status === "Present" && <Check color="success" />}
                  {record.status === "Absent" && <Close color="error" />}
                  {record.status === "Late" && <span style={{ color: "orange" }}>Late</span>}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Tooltip title="Edit Attendance">
                    <IconButton onClick={() => handleOpenEditDialog(record)}>
                      <Edit color="primary" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Attendance">
                    <IconButton onClick={() => handleDeleteClick(record._id)}>
                      <Delete color="error" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Are you sure you want to delete this attendance record?</DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Add Attendance Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Attendance Record</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Attendance ID"
              value={currentAttendance.attendance_id}
              onChange={(e) => setCurrentAttendance({...currentAttendance, attendance_id: e.target.value})}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Student</InputLabel>
              <Select
                value={currentAttendance.student_id}
                onChange={(e) => setCurrentAttendance({...currentAttendance, student_id: e.target.value})}
                label="Student"
              >
                {students.map((student) => (
                  <MenuItem key={student._id} value={student._id}>
                    {student.name} ({student.student_id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Course</InputLabel>
              <Select
                value={currentAttendance.course_id}
                onChange={(e) => setCurrentAttendance({...currentAttendance, course_id: e.target.value})}
                label="Course"
              >
                {courses.map((course) => (
                  <MenuItem key={course._id} value={course._id}>
                    {course.name} ({course.course_id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Date"
              type="date"
              value={currentAttendance.date}
              onChange={(e) => setCurrentAttendance({...currentAttendance, date: e.target.value})}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                value={currentAttendance.status}
                onChange={(e) => setCurrentAttendance({...currentAttendance, status: e.target.value})}
                label="Status"
              >
                <MenuItem value="Present">Present</MenuItem>
                <MenuItem value="Absent">Absent</MenuItem>
                <MenuItem value="Late">Late</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={() => handleSubmit(false)} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Attendance Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Attendance Record</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Attendance ID"
              value={currentAttendance.attendance_id}
              onChange={(e) => setCurrentAttendance({...currentAttendance, attendance_id: e.target.value})}
              fullWidth
              required
              disabled
            />
            <FormControl fullWidth required>
              <InputLabel>Student</InputLabel>
              <Select
                value={currentAttendance.student_id}
                onChange={(e) => setCurrentAttendance({...currentAttendance, student_id: e.target.value})}
                label="Student"
                disabled
              >
                {students.map((student) => (
                  <MenuItem key={student._id} value={student._id}>
                    {student.name} ({student.student_id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Course</InputLabel>
              <Select
                value={currentAttendance.course_id}
                onChange={(e) => setCurrentAttendance({...currentAttendance, course_id: e.target.value})}
                label="Course"
                disabled
              >
                {courses.map((course) => (
                  <MenuItem key={course._id} value={course._id}>
                    {course.name} ({course.course_id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Date"
              type="date"
              value={currentAttendance.date}
              onChange={(e) => setCurrentAttendance({...currentAttendance, date: e.target.value})}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                value={currentAttendance.status}
                onChange={(e) => setCurrentAttendance({...currentAttendance, status: e.target.value})}
                label="Status"
              >
                <MenuItem value="Present">Present</MenuItem>
                <MenuItem value="Absent">Absent</MenuItem>
                <MenuItem value="Late">Late</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={() => handleSubmit(true)} variant="contained" color="primary">
            Update
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

export default Attendance;