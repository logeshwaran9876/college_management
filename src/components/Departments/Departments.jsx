import React, { useState, useEffect } from "react";
import {
  Grid, Card, CardContent, Typography, Avatar, IconButton,
  Box, TextField, Button, CircularProgress, Paper, Dialog,
  DialogTitle, DialogContent, DialogActions, MenuItem,
  Select, FormControl, InputLabel, Snackbar, Alert
} from "@mui/material";
import { Add, Edit, Delete, Search, Business } from "@mui/icons-material";
import { motion } from "framer-motion";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState({
    department_id: "",
    name: "",
    hod: ""
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    fetchDepartments();
    fetchStaffMembers();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/department/get");
      if (!response.ok) throw new Error("Failed to fetch departments");
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      showSnackbar(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffMembers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/staff/get");
      const data = await response.json();
      setStaffMembers(data);
    } catch (error) {
      showSnackbar("Failed to fetch staff members", "error");
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenAddDialog = () => {
    setCurrentDepartment({
      department_id: "",
      name: "",
      hod: ""
    });
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (department) => {
    setCurrentDepartment({
      _id: department._id,
      department_id: department.department_id,
      name: department.name,
      hod: department.hod?._id || ""
    });
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    const { department_id, name, hod } = currentDepartment;

    if (!department_id || !name || !hod) {
      showSnackbar("Please fill all required fields", "error");
      return;
    }

    try {
      const url = isEditing 
        ? `http://localhost:5000/api/department/update/${currentDepartment._id}`
        : "http://localhost:5000/api/department/create";
      
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department_id, name, hod }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to save department");
      }

      showSnackbar(
        isEditing ? "Department updated successfully" : "Department created successfully"
      );
      handleCloseDialog();
      fetchDepartments();
    } catch (error) {
      showSnackbar(error.message || "Failed to save department", "error");
    }
  };

  const handleDeleteDepartment = async () => {
    if (!selectedDepartmentId) return;

    try {
      const response = await fetch(`http://localhost:5000/api/department/delete/${selectedDepartmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete department");

      showSnackbar("Department deleted successfully");
      setDepartments(departments.filter((dept) => dept._id !== selectedDepartmentId));
    } catch (error) {
      showSnackbar(error.message || "Failed to delete department", "error");
    } finally {
      setConfirmDelete(false);
      setSelectedDepartmentId(null);
    }
  };

  const openDeleteDialog = (departmentId) => {
    setSelectedDepartmentId(departmentId);
    setConfirmDelete(true);
  };

  const closeDeleteDialog = () => {
    setConfirmDelete(false);
    setSelectedDepartmentId(null);
  };

  const filteredDepartments = departments.filter((department) =>
    (department.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (department.department_id || "").toLowerCase().includes(searchQuery.toLowerCase())
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
        Department Management
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search departments..."
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
          Add Department
        </Button>
      </Box>

      <Grid container spacing={3}>
        {filteredDepartments.length > 0 ? (
          filteredDepartments.map((department) => (
            <Grid item xs={12} sm={6} md={4} key={department._id}>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Card sx={{ borderRadius: 3, boxShadow: 3, transition: "all 0.3s ease-in-out" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ bgcolor: "#4a90e2" }}>
                        <Business sx={{ color: "#fff" }} />
                      </Avatar>
                      <Typography variant="h6" fontWeight={600}>
                        {department.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
                      <strong>ID:</strong> {department.department_id}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
                      <strong>HOD:</strong> {department.hod?.name || "N/A"}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                      <IconButton onClick={() => handleOpenEditDialog(department)}>
                        <Edit color="primary" />
                      </IconButton>
                      <IconButton onClick={() => openDeleteDialog(department._id)}>
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
                {searchQuery ? "No matching departments found" : "No departments available"}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onClose={closeDeleteDialog}>
        <DialogTitle>Are you sure you want to delete this department?</DialogTitle>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteDepartment} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Department Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? "Edit Department" : "Add Department"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Department ID *"
                value={currentDepartment.department_id}
                onChange={(e) => setCurrentDepartment({...currentDepartment, department_id: e.target.value})}
                margin="normal"
                disabled={isEditing}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Department Name *"
                value={currentDepartment.name}
                onChange={(e) => setCurrentDepartment({...currentDepartment, name: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Head of Department *</InputLabel>
                <Select
                  value={currentDepartment.hod}
                  onChange={(e) => setCurrentDepartment({...currentDepartment, hod: e.target.value})}
                  label="Head of Department"
                >
                  {staffMembers.map((staff) => (
                    <MenuItem key={staff._id} value={staff._id}>
                      {staff.name}
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
            {isEditing ? "Update" : "Add"}
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

export default Departments;