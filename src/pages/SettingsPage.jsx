import { useState } from "react";
import "./SettingsPage.css";

const defaultSettings = {
  depotName: "TransitOps Chennai Depot",
  currency: "INR",
  distanceUnit: "Kilometres",
};

const rolePermissions = [
  {
    role: "Fleet Manager",
    dashboard: true,
    vehicles: true,
    drivers: true,
    trips: true,
    maintenance: true,
    expenses: true,
    analytics: true,
    settings: true,
  },
  {
    role: "Dispatcher",
    dashboard: true,
    vehicles: true,
    drivers: true,
    trips: true,
    maintenance: false,
    expenses: false,
    analytics: false,
    settings: false,
  },
  {
    role: "Safety Officer",
    dashboard: true,
    vehicles: false,
    drivers: true,
    trips: false,
    maintenance: true,
    expenses: false,
    analytics: true,
    settings: false,
  },
  {
    role: "Financial Analyst",
    dashboard: true,
    vehicles: false,
    drivers: false,
    trips: false,
    maintenance: false,
    expenses: true,
    analytics: true,
    settings: false,
  },
];

function loadSavedSettings() {
  try {
    const savedSettings = localStorage.getItem(
      "transitopsSettings",
    );

    return savedSettings
      ? JSON.parse(savedSettings)
      : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

function PermissionIcon({ allowed }) {
  return (
    <span
      className={
        allowed
          ? "permission-icon allowed"
          : "permission-icon denied"
      }
    >
      {allowed ? "✓" : "—"}
    </span>
  );
}

function SettingsPage() {
  const [settings, setSettings] = useState(loadSavedSettings);
  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setSettings((currentSettings) => ({
      ...currentSettings,
      [name]: value,
    }));

    setMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    localStorage.setItem(
      "transitopsSettings",
      JSON.stringify(settings),
    );

    setMessage("Settings saved successfully.");
  }

  function resetSettings() {
    setSettings(defaultSettings);

    localStorage.setItem(
      "transitopsSettings",
      JSON.stringify(defaultSettings),
    );

    setMessage("Settings restored to default values.");
  }

  return (
    <section className="settings-page">
      <div className="settings-heading">
        <h1>Settings & Role Access</h1>
        <p>
          Configure depot preferences and view role permissions.
        </p>
      </div>

      <div className="settings-grid">
        <form
          className="settings-card"
          onSubmit={handleSubmit}
        >
          <h2>General Settings</h2>

          <label htmlFor="depotName">Depot name</label>
          <input
            id="depotName"
            name="depotName"
            value={settings.depotName}
            onChange={handleChange}
            required
          />

          <label htmlFor="currency">Currency</label>
          <select
            id="currency"
            name="currency"
            value={settings.currency}
            onChange={handleChange}
          >
            <option value="INR">Indian Rupee — ₹</option>
            <option value="USD">US Dollar — $</option>
            <option value="EUR">Euro — €</option>
          </select>

          <label htmlFor="distanceUnit">Distance unit</label>
          <select
            id="distanceUnit"
            name="distanceUnit"
            value={settings.distanceUnit}
            onChange={handleChange}
          >
            <option value="Kilometres">Kilometres</option>
            <option value="Miles">Miles</option>
          </select>

          {message && (
            <div className="settings-success">{message}</div>
          )}

          <div className="settings-actions">
            <button
              type="submit"
              className="settings-save-button"
            >
              Save Settings
            </button>

            <button
              type="button"
              className="settings-reset-button"
              onClick={resetSettings}
            >
              Reset
            </button>
          </div>
        </form>

        <div className="settings-card settings-summary">
          <h2>Current Configuration</h2>

          <div className="configuration-row">
            <span>Depot</span>
            <strong>{settings.depotName}</strong>
          </div>

          <div className="configuration-row">
            <span>Currency</span>
            <strong>{settings.currency}</strong>
          </div>

          <div className="configuration-row">
            <span>Distance</span>
            <strong>{settings.distanceUnit}</strong>
          </div>

          <p className="settings-note">
            These settings are stored in this browser using
            localStorage.
          </p>
        </div>
      </div>

      <div className="permission-card">
        <div className="permission-heading">
          <h2>Role-Based Access Control</h2>
          <p>Permissions assigned to each TransitOps role.</p>
        </div>

        <div className="permission-table-wrapper">
          <table className="permission-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Dashboard</th>
                <th>Vehicles</th>
                <th>Drivers</th>
                <th>Trips</th>
                <th>Maintenance</th>
                <th>Expenses</th>
                <th>Analytics</th>
                <th>Settings</th>
              </tr>
            </thead>

            <tbody>
              {rolePermissions.map((permission) => (
                <tr key={permission.role}>
                  <td>
                    <strong>{permission.role}</strong>
                  </td>

                  <td>
                    <PermissionIcon
                      allowed={permission.dashboard}
                    />
                  </td>
                  <td>
                    <PermissionIcon
                      allowed={permission.vehicles}
                    />
                  </td>
                  <td>
                    <PermissionIcon
                      allowed={permission.drivers}
                    />
                  </td>
                  <td>
                    <PermissionIcon
                      allowed={permission.trips}
                    />
                  </td>
                  <td>
                    <PermissionIcon
                      allowed={permission.maintenance}
                    />
                  </td>
                  <td>
                    <PermissionIcon
                      allowed={permission.expenses}
                    />
                  </td>
                  <td>
                    <PermissionIcon
                      allowed={permission.analytics}
                    />
                  </td>
                  <td>
                    <PermissionIcon
                      allowed={permission.settings}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default SettingsPage;