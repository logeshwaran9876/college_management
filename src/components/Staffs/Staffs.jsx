import React, { useState, useEffect } from "react";
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
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { Add, Edit, Delete, Search, Work } from "@mui/icons-material";
import { motion } from "framer-motion";

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [openStaffDialog, setOpenStaffDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStaff, setCurrentStaff] = useState({
    faculty_id: "",
    name: "",
    email: "",
    phone: "",
    role: "Teacher",
    specialization: "",
    department_id: "",
    assigned_courses: [],
  });

  useEffect(() => {
    fetchStaffs();
    fetchDepartments();
    fetchCourses();
  }, []);

  const fetchStaffs = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/staff/get");
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      setStaff(data || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
      setStaff([]);
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
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/course/get");
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const handleOpenAddDialog = () => {
    setCurrentStaff({
      faculty_id: "",
      name: "",
      email: "",
      phone: "",
      role: "Teacher",
      specialization: "",
      department_id: "",
      assigned_courses: [],
    });
    setIsEditing(false);
    setOpenStaffDialog(true);
  };

  const handleOpenEditDialog = (staffMember) => {
    setCurrentStaff({
      ...staffMember,
      department_id: staffMember.department_id?._id || "",
      assigned_courses: staffMember.assigned_courses?.map((c) => c._id) || [],
    });
    setIsEditing(true);
    setOpenStaffDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenStaffDialog(false);
  };

  const handleStaffSubmit = async () => {
    const requiredFields = [
      currentStaff.faculty_id,
      currentStaff.name,
      currentStaff.email,
      currentStaff.phone,
      currentStaff.specialization,
      currentStaff.department_id,
      currentStaff.assigned_courses
    ];

    if (requiredFields.some((field) => !field)) {
      alert("Please fill all required fields!");
      return;
    }

    try {
      const url = isEditing
        ? `http://localhost:5000/api/staff/update/${currentStaff._id}`

        : "http://localhost:5000/api/staff/create";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentStaff),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save staff");
      }

      handleCloseDialog();
      fetchStaffs();
    } catch (error) {
      console.error("Error saving staff:", error);
      alert(error.message);
    }
  };

  const handleDeleteStaff = async () => {
    if (!selectedStaffId) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/staff/delete/${selectedStaffId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete staff");

      setStaff((prevStaff) =>
        prevStaff.filter((staff) => staff._id !== selectedStaffId)
      );
    } catch (error) {
      console.error("Error deleting staff:", error);
    } finally {
      setConfirmDelete(false);
      setSelectedStaffId(null);
    }
  };

  const openDeleteDialog = (staffId) => {
    setSelectedStaffId(staffId);
    setConfirmDelete(true);
  };

  const closeDeleteDialog = () => {
    setConfirmDelete(false);
    setSelectedStaffId(null);
  };

  const filteredStaff = staff.filter(
    (staffMember) =>
      staffMember.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staffMember.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staffMember.phone.includes(searchQuery)
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
        Staff Management
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search staff..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ backgroundColor: "#fff", borderRadius: 1 }}
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenAddDialog}
          sx={{
            backgroundColor: "#4a90e2",
            color: "#fff",
            "&:hover": { backgroundColor: "#357ab7" },
          }}
        >
          Add Staff
        </Button>
      </Box>

      <Grid container spacing={3}>
        {filteredStaff.length > 0 ? (
          filteredStaff.map((staffMember) => (
            <Grid item xs={12} sm={6} md={4} key={staffMember._id}>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ bgcolor: "#4a90e2" }}>
                        <Work sx={{ color: "#fff" }} />
                      </Avatar>
                      <Typography variant="h6" fontWeight={600}>
                        {staffMember.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
                      {staffMember.email}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
                      Phone: {staffMember.phone}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
                      Role: {staffMember.role}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
                      Dept: {staffMember.department_id?.name || "N/A"}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
                      Courses:{" "}
                      {staffMember.assigned_courses?.map((c) => c.name).join(", ") ||
                        "N/A"}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                      <IconButton onClick={() => handleOpenEditDialog(staffMember)}>
                        <Edit color="primary" />
                      </IconButton>
                      <IconButton onClick={() => openDeleteDialog(staffMember._id)}>
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
                {searchQuery
                  ? "No matching staff found"
                  : "No staff members available"}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onClose={closeDeleteDialog}>
        <DialogTitle>
          Are you sure you want to delete this staff member?
        </DialogTitle>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteStaff} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Staff Dialog */}
      <Dialog open={openStaffDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? "Edit Staff Member" : "Add New Staff Member"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Staff ID"
                value={currentStaff.faculty_id}
                onChange={(e) =>
                  setCurrentStaff({ ...currentStaff, faculty_id: e.target.value })
                }
                margin="normal"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={currentStaff.name}
                onChange={(e) =>
                  setCurrentStaff({ ...currentStaff, name: e.target.value })
                }
                margin="normal"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={currentStaff.email}
                onChange={(e) =>
                  setCurrentStaff({ ...currentStaff, email: e.target.value })
                }
                margin="normal"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={currentStaff.phone}
                onChange={(e) =>
                  setCurrentStaff({ ...currentStaff, phone: e.target.value })
                }
                margin="normal"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Specialization</InputLabel>
                <Select
                  label="Specialization"
                  value={currentStaff.specialization}
                  onChange={(e) =>
                    setCurrentStaff({
                      ...currentStaff,
                      specialization: e.target.value,
                    })
                  }
                >
                  <MenuItem value="Artificial Intelligence">Artificial Intelligence</MenuItem>
                  <MenuItem value="Computer Science">Computer Science</MenuItem>
                  <MenuItem value="Engineering">Engineering</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Department</InputLabel>
                <Select
                  label="Department"
                  value={currentStaff.department_id}
                  onChange={(e) =>
                    setCurrentStaff({
                      ...currentStaff,
                      department_id: e.target.value,
                    })
                  }
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Assigned Courses</InputLabel>
                <Select
                  multiple
                  value={currentStaff.assigned_courses}
                  onChange={(e) =>
                    setCurrentStaff({
                      ...currentStaff,
                      assigned_courses: e.target.value,
                    })
                  }
                  renderValue={(selected) =>
                    courses
                      .filter((c) => selected.includes(c._id))
                      .map((c) => c.name)
                      .join(", ")
                  }
                >
                  {courses.map((course) => (
                    <MenuItem key={course._id} value={course._id}>
                      <Checkbox
                        checked={currentStaff.assigned_courses.includes(course._id)}
                      />
                      <ListItemText primary={course.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleStaffSubmit} variant="contained">
            {isEditing ? "Update Staff" : "Add Staff"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Staff;
