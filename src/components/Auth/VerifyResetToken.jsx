import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    Button,
} from '@mui/material';

const VerifyResetToken = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isValidToken, setIsValidToken] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [userEmail, setUserEmail] = useState(''); // State to store the user's email

    useEffect(() => {
        const verifyToken = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `http://localhost:5000/api/user/verify-reset-token/${token}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );

                const data = await response.json();

                if (response.ok) {
                    setIsValidToken(true);
                    setUserEmail(data.email); // Assuming your backend returns the email in the response
                } else {
                    setIsValidToken(false);
                    setErrorMessage(data.message || 'Invalid or expired reset token.');
                }
            } catch (error) {
                console.error('Error verifying token:', error);
                setIsValidToken(false);
                setErrorMessage('An error occurred while verifying the token.');
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [token]);

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="80vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    if (isValidToken === true) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="80vh"
            >
                <Paper elevation={3} sx={{ padding: 4, maxWidth: 400, width: '100%' }}>
                    <Typography variant="h6" align="center" gutterBottom color="success">
                        Token Verified!
                    </Typography>
                    <Typography variant="body1" align="center" gutterBottom>
                        Your email address is: <strong>{userEmail}</strong>
                    </Typography>
                    <Typography variant="body2" align="center" color="textSecondary" gutterBottom>
                        You can now reset your password. Click the button below to continue.
                    </Typography>
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={() => navigate(`/reset-password/${token}`)}
                        sx={{ mt: 2 }}
                    >
                        Reset Your Password
                    </Button>
                </Paper>
            </Box>
        );
    }

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="80vh"
        >
            <Paper elevation={3} sx={{ padding: 4, maxWidth: 400, width: '100%' }}>
                <Typography variant="h4" align="center" gutterBottom color="error">
                    Invalid Reset Token
                </Typography>
                {errorMessage && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errorMessage}
                    </Alert>
                )}
                <Typography variant="body2" align="center" color="textSecondary" gutterBottom>
                    The password reset link you followed is either invalid or has expired.
                </Typography>
                <Button
                    fullWidth
                    color="primary"
                    onClick={() => navigate('/reset-password-request')}
                    sx={{ mt: 2 }}
                >
                    Request a New Password Reset
                </Button>
                <Button
                    fullWidth
                    color="secondary"
                    onClick={() => navigate('/login')}
                    sx={{ mt: 1 }}
                >
                    Back to Login
                </Button>
            </Paper>
        </Box>
    );
};

export default VerifyResetToken;