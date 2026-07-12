import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

import Login from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";
import AppLayout from "./components/common/AppLayout";
import Dashboard from "./dashboard/Dashboard";
import PlaceholderPage from "./pages/PlaceholderPage";
import SettingsPage from "./pages/SettingsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import DriverPage from "./pages/DriverPage";
import VehiclePage from "./modules/Vehicles/VehiclePage";

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
            <ProtectedRoute
              allowedRoles={["Fleet Manager", "Dispatcher", "Financial Analyst"]}
            >
              <VehiclePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/drivers"
          element={
            <ProtectedRoute
              allowedRoles={["Safety Officer", "Fleet Manager"]}
            >
              <DriverPage />
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
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;