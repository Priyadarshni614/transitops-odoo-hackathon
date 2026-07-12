import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getData } from "../services/api";
import "./Dashboard.css";

const emptyDashboardData = {
  vehicles: [],
  drivers: [],
  trips: [],
  maintenance: [],
};

function getResultData(result) {
  if (result.status !== "fulfilled") {
    return [];
  }

  return result.value?.data || [];
}

async function fetchDashboardResources() {
  const results = await Promise.allSettled([
    getData("/vehicles"),
    getData("/drivers"),
    getData("/trips"),
    getData("/maintenance"),
  ]);

  const [vehicleResult, driverResult, tripResult, maintenanceResult] =
    results;

  const labels = ["Vehicle", "Driver", "Trip", "Maintenance"];

  const failedResources = results
    .map((result, index) =>
      result.status === "rejected" ? labels[index] : null,
    )
    .filter(Boolean);

  return {
    dashboardData: {
      vehicles: getResultData(vehicleResult),
      drivers: getResultData(driverResult),
      trips: getResultData(tripResult),
      maintenance: getResultData(maintenanceResult),
    },
    failedResources,
  };
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function createClassName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function DashboardMetric({
  title,
  value,
  description,
  icon,
  onClick,
}) {
  return (
    <article
      className={`dynamic-dashboard-metric ${
        onClick ? "clickable" : ""
      }`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (
          onClick &&
          (event.key === "Enter" || event.key === " ")
        ) {
          onClick();
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="dynamic-dashboard-metric-top">
        <span className="dynamic-dashboard-metric-icon">
          {icon}
        </span>
        <span>{title}</span>
      </div>

      <h2>{value}</h2>
      <p>{description}</p>
    </article>
  );
}

function Dashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(
    emptyDashboardData,
  );
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialDashboard() {
      try {
        const result = await fetchDashboardResources();

        if (cancelled) {
          return;
        }

        setDashboardData(result.dashboardData);

        setWarning(
          result.failedResources.length > 0
            ? `${result.failedResources.join(
                ", ",
              )} data could not be loaded.`
            : "",
        );

        setLastUpdated(new Date());
      } catch (requestError) {
        if (!cancelled) {
          setWarning(
            requestError.message ||
              "Unable to load dashboard information.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  async function refreshDashboard() {
    try {
      setLoading(true);
      setWarning("");

      const result = await fetchDashboardResources();

      setDashboardData(result.dashboardData);

      setWarning(
        result.failedResources.length > 0
          ? `${result.failedResources.join(
              ", ",
            )} data could not be loaded.`
          : "",
      );

      setLastUpdated(new Date());
    } catch (requestError) {
      setWarning(
        requestError.message ||
          "Unable to refresh dashboard information.",
      );
    } finally {
      setLoading(false);
    }
  }

  const dashboard = useMemo(() => {
    const {
      vehicles,
      drivers,
      trips,
      maintenance,
    } = dashboardData;

    const availableVehicles = vehicles.filter(
      (vehicle) => vehicle.status === "Available",
    );

    const onTripVehicles = vehicles.filter(
      (vehicle) => vehicle.status === "On Trip",
    );

    const inShopVehicles = vehicles.filter(
      (vehicle) => vehicle.status === "In Shop",
    );

    const retiredVehicles = vehicles.filter(
      (vehicle) => vehicle.status === "Retired",
    );

    const activeVehicles = vehicles.filter(
      (vehicle) => vehicle.status !== "Retired",
    );

    const availableDrivers = drivers.filter(
      (driver) => driver.status === "Available",
    );

    const onTripDrivers = drivers.filter(
      (driver) => driver.status === "On Trip",
    );

    const suspendedDrivers = drivers.filter(
      (driver) => driver.status === "Suspended",
    );

    const draftTrips = trips.filter(
      (trip) => trip.status === "Draft",
    );

    const dispatchedTrips = trips.filter(
      (trip) => trip.status === "Dispatched",
    );

    const completedTrips = trips.filter(
      (trip) => trip.status === "Completed",
    );

    const activeMaintenance = maintenance.filter(
      (record) => record.status === "Active",
    );

    const fleetUtilisation =
      activeVehicles.length > 0
        ? Math.round(
            (onTripVehicles.length /
              activeVehicles.length) *
              100,
          )
        : 0;

    const recentTrips = [...trips]
      .sort(
        (first, second) =>
          new Date(second.createdAt || 0).getTime() -
          new Date(first.createdAt || 0).getTime(),
      )
      .slice(0, 6);

    return {
      totalVehicles: vehicles.length,
      activeVehicles: activeVehicles.length,
      availableVehicles: availableVehicles.length,
      onTripVehicles: onTripVehicles.length,
      inShopVehicles: inShopVehicles.length,
      retiredVehicles: retiredVehicles.length,

      totalDrivers: drivers.length,
      availableDrivers: availableDrivers.length,
      onTripDrivers: onTripDrivers.length,
      suspendedDrivers: suspendedDrivers.length,

      totalTrips: trips.length,
      draftTrips: draftTrips.length,
      dispatchedTrips: dispatchedTrips.length,
      completedTrips: completedTrips.length,

      activeMaintenance: activeMaintenance.length,
      fleetUtilisation,
      recentTrips,
    };
  }, [dashboardData]);

  if (loading) {
    return (
      <section className="dynamic-dashboard-page">
        <div className="dynamic-dashboard-loading">
          <div className="dynamic-dashboard-spinner" />
          <p>Loading TransitOps dashboard...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="dynamic-dashboard-page">
      <div className="dynamic-dashboard-heading">
        <div>
          <h1>Fleet Operations Dashboard</h1>
          <p>
            Monitor vehicles, drivers, trips and maintenance
            activity.
          </p>

          {lastUpdated && (
            <small>
              Last updated: {" "}
              {lastUpdated.toLocaleTimeString("en-IN")}
            </small>
          )}
        </div>

        <button
          type="button"
          className="dynamic-dashboard-refresh"
          onClick={refreshDashboard}
        >
          Refresh
        </button>
      </div>

      {warning && (
        <div className="dynamic-dashboard-warning">
          {warning}
        </div>
      )}

      <div className="dynamic-dashboard-metric-grid">
        <DashboardMetric
          title="Active Fleet"
          value={dashboard.activeVehicles}
          description={`${dashboard.totalVehicles} total vehicles`}
          icon="▣"
          onClick={() => navigate("/fleet")}
        />

        <DashboardMetric
          title="Available Vehicles"
          value={dashboard.availableVehicles}
          description={`${dashboard.onTripVehicles} currently on trip`}
          icon="✓"
          onClick={() => navigate("/fleet")}
        />

        <DashboardMetric
          title="Active Trips"
          value={dashboard.dispatchedTrips}
          description={`${dashboard.draftTrips} draft trips`}
          icon="→"
          onClick={() => navigate("/trips")}
        />

        <DashboardMetric
          title="Available Drivers"
          value={dashboard.availableDrivers}
          description={`${dashboard.totalDrivers} total drivers`}
          icon="♙"
          onClick={() => navigate("/drivers")}
        />

        <DashboardMetric
          title="In Maintenance"
          value={dashboard.inShopVehicles}
          description={`${dashboard.activeMaintenance} active service records`}
          icon="⚙"
          onClick={() => navigate("/maintenance")}
        />

        <DashboardMetric
          title="Fleet Utilisation"
          value={`${dashboard.fleetUtilisation}%`}
          description={`${dashboard.completedTrips} completed trips`}
          icon="%"
          onClick={() => navigate("/analytics")}
        />
      </div>

      <div className="dynamic-dashboard-content-grid">
        <article className="dynamic-dashboard-card">
          <div className="dynamic-dashboard-card-heading">
            <div>
              <h2>Recent Trips</h2>
              <p>Latest transport operations.</p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/trips")}
            >
              View all
            </button>
          </div>

          {dashboard.recentTrips.length === 0 ? (
            <div className="dynamic-dashboard-empty">
              <h3>No trips recorded</h3>
              <p>Create your first trip from Trip Dispatcher.</p>
            </div>
          ) : (
            <div className="dynamic-dashboard-table-wrapper">
              <table className="dynamic-dashboard-table">
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {dashboard.recentTrips.map((trip) => (
                    <tr key={trip._id}>
                      <td>
                        <strong>{trip.source || "—"}</strong>
                        <small>
                          to {trip.destination || "—"}
                        </small>
                      </td>

                      <td>
                        {trip.vehicle?.registrationNumber ||
                          "Unassigned"}
                      </td>

                      <td>
                        {trip.driver?.name || "Unassigned"}
                      </td>

                      <td>{formatDate(trip.createdAt)}</td>

                      <td>
                        <span
                          className={`dynamic-dashboard-status ${createClassName(
                            trip.status,
                          )}`}
                        >
                          {trip.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="dynamic-dashboard-card">
          <div className="dynamic-dashboard-card-heading">
            <div>
              <h2>Vehicle Status</h2>
              <p>Current fleet availability.</p>
            </div>
          </div>

          <div className="dynamic-dashboard-status-list">
            <div className="dynamic-dashboard-status-row">
              <span>
                <i className="status-dot available" />
                Available
              </span>
              <strong>{dashboard.availableVehicles}</strong>
            </div>

            <div className="dynamic-dashboard-status-row">
              <span>
                <i className="status-dot on-trip" />
                On Trip
              </span>
              <strong>{dashboard.onTripVehicles}</strong>
            </div>

            <div className="dynamic-dashboard-status-row">
              <span>
                <i className="status-dot in-shop" />
                In Shop
              </span>
              <strong>{dashboard.inShopVehicles}</strong>
            </div>

            <div className="dynamic-dashboard-status-row">
              <span>
                <i className="status-dot retired" />
                Retired
              </span>
              <strong>{dashboard.retiredVehicles}</strong>
            </div>
          </div>

          <div className="dynamic-dashboard-utilisation">
            <div>
              <span>Fleet utilisation</span>
              <strong>{dashboard.fleetUtilisation}%</strong>
            </div>

            <div className="dynamic-dashboard-progress">
              <div
                style={{
                  width: `${Math.min(
                    dashboard.fleetUtilisation,
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="dynamic-dashboard-driver-summary">
            <h3>Driver Summary</h3>

            <p>
              <span>On Trip</span>
              <strong>{dashboard.onTripDrivers}</strong>
            </p>

            <p>
              <span>Suspended</span>
              <strong>{dashboard.suspendedDrivers}</strong>
            </p>
          </div>
        </article>
      </div>

      <article className="dynamic-dashboard-card">
        <div className="dynamic-dashboard-card-heading">
          <div>
            <h2>Quick Actions</h2>
            <p>Open commonly used TransitOps modules.</p>
          </div>
        </div>

        <div className="dynamic-dashboard-actions">
          <button type="button" onClick={() => navigate("/fleet")}>
            Add Vehicle
          </button>

          <button type="button" onClick={() => navigate("/drivers")}>
            Add Driver
          </button>

          <button type="button" onClick={() => navigate("/trips")}>
            Create Trip
          </button>

          <button type="button" onClick={() => navigate("/maintenance")}>
            Start Maintenance
          </button>

          <button type="button" onClick={() => navigate("/expenses")}>
            Add Expense
          </button>
        </div>
      </article>
    </section>
  );
}

export default Dashboard;