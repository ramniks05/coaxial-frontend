import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import AdminDashboard from './components/AdminDashboard';
import HomePage from './components/HomePage';
import InstructorDashboard from './components/InstructorDashboard';
import Layout from './components/Layout';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import PublicCoursesPage from './components/PublicCoursesPage';
import RegisterPage from './components/RegisterPage';
import StudentDashboard from './components/StudentDashboard';
import SubjectFilter from './components/SubjectFilter';
import SubjectFilterChat from './components/SubjectFilterChat';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
        <Router>
          <div className="App">
            <Routes>
            <Route 
              path="/" 
              element={
                <Layout showHeader={true} showFooter={true}>
                  <HomePage />
                </Layout>
              } 
            />
            <Route 
              path="/courses" 
              element={
                <Layout showHeader={true} showFooter={true}>
                  <PublicCoursesPage />
                </Layout>
              } 
            />
            <Route 
              path="/login" 
              element={
                <Layout showHeader={true} showFooter={false}>
                  <LoginPage />
                </Layout>
              } 
            />
            <Route 
              path="/register" 
              element={
                <Layout showHeader={true} showFooter={false}>
                  <RegisterPage />
                </Layout>
              } 
            />
            <Route 
              path="/dashboard/student" 
              element={
                <ProtectedRoute requiredRole="STUDENT">
                  <Layout showHeader={true} showFooter={true} showSidebar={true}>
                    <StudentDashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/instructor" 
              element={
                <ProtectedRoute requiredRole="INSTRUCTOR">
                  <Layout showHeader={true} showFooter={true} showSidebar={true}>
                    <InstructorDashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin" 
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Layout showHeader={true} showFooter={true} showSidebar={true}>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/subject-filter"
              element={
                <Layout showHeader={true} showFooter={true}>
                  <SubjectFilter />
                </Layout>
              } 
            />
            <Route 
              path="/subject-filter-chat"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <SubjectFilterChat />
                </ProtectedRoute>
              } 
            />
            </Routes>
          </div>
      </Router>
    </AppProvider>
  );
}

export default App;
