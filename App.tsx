import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateHabit from './pages/CreateHabit';
import HabitDetails from './pages/HabitDetails';
import EditHabit from './pages/EditHabit';
import Profile from './pages/Profile';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes (Logic handled inside pages/layouts due to lack of real router middleware in simulated env) */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<CreateHabit />} />
        <Route path="/habit/:id" element={<HabitDetails />} />
        <Route path="/edit/:id" element={<EditHabit />} />
        <Route path="/profile" element={<Profile />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;