import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./component/ProtectedRoute";
import AdminLayout from "./component/AdminLayout";
import UserLayout from "./component/UserLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminStores from "./pages/admin/Stores";
import AdminAddAccount from "./pages/admin/AddAccount";
import AdminProfile from "./pages/admin/Profile";

import UserDashboard from "./pages/user/Dashboard";
import UserStores from "./pages/user/Stores";
import UserProfile from "./pages/user/Profile";

import OwnerDashboard from "./pages/owner/Dashboard";

import Unauthorized from "./pages/Unauthorized";

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="stores" element={<AdminStores />} />
            <Route path="add-account" element={<AdminAddAccount />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
          <Route
            path="/user"
            element={
              <ProtectedRoute allowedRoles={['normal']}>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="stores" element={<UserStores />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>
          <Route
            path="/stores"
            element={
              <ProtectedRoute allowedRoles={['normal']}>
                <Navigate to="/user/stores" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute allowedRoles={['store_owner']}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;