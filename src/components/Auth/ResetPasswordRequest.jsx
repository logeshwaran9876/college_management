import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Alert,
    Snackbar,
} from '@mui/material';

const ResetPasswordRequest = () => {
    const [email, setEmail] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const navigate = useNavigate();
    const [requestSent, setRequestSent] = useState(false);

    const handleResetRequest = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/user/reset-pass', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Reset request failed');
            }

            setSnackbarMessage(data.message || 'Password reset email sent successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setRequestSent(true);
        } catch (error) {
            console.error('Reset request error:', error);
            setSnackbarMessage(error.message);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            setRequestSent(false);
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
                {!requestSent ? (
                    <>
                        <Typography variant="body1" align="center" gutterBottom>
                            Enter your email to reset your password.
                        </Typography>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={handleResetRequest}
                            sx={{ marginTop: 2 }}
                        >
                            Send Reset Link
                        </Button>
                    </>
                ) : (
                    <Box mt={3} textAlign="center">
                        <Typography variant="h6" color="success" gutterBottom>
                            Email Sent!
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Please check your inbox (and spam folder) for a password reset link. Click the link to continue the reset process.
                        </Typography>
                        <Button
                            fullWidth
                            color="secondary"
                            onClick={() => navigate('/login')}
                            sx={{ marginTop: 2 }}
                        >
                            Back to Login
                        </Button>
                    </Box>
                )}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={5000}
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

export default ResetPasswordRequest;