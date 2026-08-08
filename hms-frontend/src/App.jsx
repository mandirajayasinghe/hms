import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import AppShell from "./components/layout/AppShell";

import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Login from "./pages/public/Login";

import Dashboard from "./pages/Dashboard";
import PatientList from "./pages/patients/PatientList";
import PatientDetail from "./pages/patients/PatientDetail";
import DoctorList from "./pages/doctors/DoctorList";
import AppointmentList from "./pages/appointments/AppointmentList";
import AdmissionList from "./pages/admissions/AdmissionList";
import LabRequests from "./pages/laboratory/LabRequests";
import Medicines from "./pages/pharmacy/Medicines";
import InvoiceList from "./pages/billing/InvoiceList";
import InvoiceDetail from "./pages/billing/InvoiceDetail";
import StaffList from "./pages/employees/StaffList";
import Reports from "./pages/reports/Reports";
import DepartmentList from "./pages/departments/DepartmentList";
import UserList from "./pages/users/UserList";

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />

      {/* Authenticated app */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<PatientList />} />
          <Route path="patients/:id" element={<PatientDetail />} />
          <Route path="doctors" element={<DoctorList />} />
          <Route path="departments" element={<DepartmentList />} />
          <Route path="appointments" element={<AppointmentList />} />
          <Route path="admissions" element={<AdmissionList />} />
          <Route path="laboratory" element={<LabRequests />} />
          <Route path="pharmacy" element={<Medicines />} />
          <Route path="billing" element={<InvoiceList />} />
          <Route path="billing/:id" element={<InvoiceDetail />} />
          <Route path="staff" element={<StaffList />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<UserList />} />
        </Route>
      </Route>
    </Routes>
  );
}