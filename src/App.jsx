import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

import Login from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";
import AppLayout from "./components/common/AppLayout";
import Dashboard from "./dashboard/Dashboard";
import PlaceholderPage from "./pages/PlaceholderPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/fleet"
          element={
            <PlaceholderPage
              title="Fleet Management"
              description="Register, update and monitor fleet vehicles."
            />
          }
        />

        <Route
          path="/drivers"
          element={
            <ProtectedRoute allowedRoles={["Safety Officer"]}>
              <PlaceholderPage
                title="Drivers & Safety Profiles"
                description="Manage drivers, licences and safety scores."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trips"
          element={
            <ProtectedRoute allowedRoles={["Dispatcher", "Safety Officer"]}>
              <PlaceholderPage
                title="Trip Dispatcher"
                description="Create, dispatch and monitor transport trips."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/maintenance"
          element={
            <ProtectedRoute allowedRoles={["Fleet Manager"]}>
              <PlaceholderPage
                title="Maintenance"
                description="Create and monitor vehicle service records."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses"
          element={
            <ProtectedRoute allowedRoles={["Financial Analyst"]}>
              <PlaceholderPage
                title="Fuel & Expenses"
                description="Track fuel consumption and operational expenses."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute
              allowedRoles={["Fleet Manager", "Financial Analyst"]}
            >
              <PlaceholderPage
                title="Reports & Analytics"
                description="Review fuel efficiency, utilization and vehicle ROI."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["Fleet Manager"]}>
              <PlaceholderPage
                title="Settings & RBAC"
                description="Configure depot settings and role permissions."
              />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;