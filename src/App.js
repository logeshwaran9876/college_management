import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import Users from './components/Users/Users';
import Students from './components/Students/Students';
import Staff from './components/Staffs/Staffs';
import Courses from './components/Courses/Courses';
import Departments from './components/Departments/Departments';
import Attendance from './components/Attendance/Attendance';
import Exams from './components/Exams/Exams';
import Results from './components/Results/Results';
import Fees from './components/Fees/Fees';
import Notices from './components/Notices/Notices';
import Notfound from "./components/notfound"
import VerifyResetToken from  "./components/Auth/VerifyResetToken";


import Login from './components/Auth/Login';

import Register from './components/Auth/Register';

import ResetPasswordRequest from './components/Auth/ResetPasswordRequest';


import ResetPassword from './components/Auth/ResetPassword';

const App = () => {
    const isAuthenticated = () => {
   
        return !!localStorage.getItem('token');
    };

    const ProtectedRoute = ({ children }) => {
        return isAuthenticated() ? (
            <div style={{ display: 'flex' }}>
                <Sidebar />
                <div style={{ flex: 1, padding: '20px' }}>
                    {children}
                </div>
            </div>
        ) : (
            <Navigate to="/login" replace />
        );
    };

    return (            
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password-request" element={<ResetPasswordRequest />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
               
                <Route path="/verify-reset-token/:token" element={<VerifyResetToken />} />
                <Route
                    path="/"
                    element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
                />
                <Route
                    path="/dashboard"
                    element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
                />
                <Route
                    path="/users"
                    element={<ProtectedRoute><Users /></ProtectedRoute>}
                />
                <Route
                    path="/students"
                    element={<ProtectedRoute><Students /></ProtectedRoute>}
                />
                <Route
                    path="/staff"
                    element={<ProtectedRoute><Staff /></ProtectedRoute>}
                />
                <Route
                    path="/courses"
                    element={<ProtectedRoute><Courses /></ProtectedRoute>}
                />
                <Route
                    path="/departments"
                    element={<ProtectedRoute><Departments /></ProtectedRoute>}
                />
                <Route
                    path="/attendance"
                    element={<ProtectedRoute><Attendance /></ProtectedRoute>}
                />
                <Route
                    path="/exams"
                    element={<ProtectedRoute><Exams /></ProtectedRoute>}
                />
                <Route
                    path="/results"
                    element={<ProtectedRoute><Results /></ProtectedRoute>}
                />
                <Route
                    path="/fees"
                    element={<ProtectedRoute><Fees /></ProtectedRoute>}
                />
                <Route
                    path="/notices"
                    element={<ProtectedRoute><Notices /></ProtectedRoute>}
                />
                <Route
                    path="*"
                    element={<Notfound/>}
                />
            </Routes>
        </Router>
    );
};

export default App;