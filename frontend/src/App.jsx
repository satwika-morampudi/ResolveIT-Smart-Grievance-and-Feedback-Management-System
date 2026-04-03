import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import Unauthorized from "./pages/Unauthorized";
import SubmitComplaint from "./pages/SubmitComplaint";
import MyComplaints from "./pages/MyComplaints";
import AdminComplaints from "./pages/AdminComplaints";
import Escalations from "./pages/Escalations";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/user" element={
            <PrivateRoute roles={["USER"]}><UserDashboard /></PrivateRoute>
          } />
          <Route path="/staff" element={
            <PrivateRoute roles={["STAFF"]}><StaffDashboard /></PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute roles={["ADMIN"]}><AdminDashboard /></PrivateRoute>
          } />
          <Route path="/super-admin" element={
            <PrivateRoute roles={["SUPER_ADMIN"]}><SuperAdminDashboard /></PrivateRoute>
          } />
          <Route path="/submit-complaint" element={
            <PrivateRoute roles={["USER","STAFF","ADMIN","SUPER_ADMIN"]}>
              <SubmitComplaint />
            </PrivateRoute>
          } />
          <Route path="/my-complaints" element={
            <PrivateRoute roles={["USER","STAFF","ADMIN","SUPER_ADMIN"]}>
              <MyComplaints />
            </PrivateRoute>
          } />
          <Route path="/admin/complaints" element={
  <PrivateRoute roles={["ADMIN","STAFF","SUPER_ADMIN"]}>
    <AdminComplaints />
  </PrivateRoute>
} />
<Route path="/escalations" element={
  <PrivateRoute roles={["ADMIN","STAFF","SUPER_ADMIN"]}>
    <Escalations />
  </PrivateRoute>
} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}