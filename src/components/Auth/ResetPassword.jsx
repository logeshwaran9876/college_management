import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Alert,
    Snackbar,
} from '@mui/material';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const navigate = useNavigate();
    const { token } = useParams();

    useEffect(() => {
        // Optional: You could add client-side token validation here if needed.
        // For example, checking the token format or making a lightweight API call.
    }, [token]);

    const handleResetPassword = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/user/reset-pass/${token}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Password reset failed');
            }

            setSnackbarMessage(data.message || 'Password reset successful!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);

            // Optionally navigate to the login page after successful reset
            setTimeout(() => {
                navigate('/login');
            }, 1500); // Small delay to show the success message
        } catch (error) {
            console.error('Password reset error:', error);
            setSnackbarMessage(error.message);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="80vh"
        >
            <Paper elevation={3} sx={{ padding: 4, maxWidth: 400, width: '100%' }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Reset Password
                </Typography>
                <TextField
                    fullWidth
                    label="New Password"
                    type="password"
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleResetPassword}
                    sx={{ marginTop: 2 }}
                >
                    Reset Password
                </Button>
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={3000}
                    onClose={() => setSnackbarOpen(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={() => setSnackbarOpen(false)}
                        severity={snackbarSeverity}
                        sx={{ width: '100%' }}
                    >
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Paper>
        </Box>
    );
};

export default ResetPassword;