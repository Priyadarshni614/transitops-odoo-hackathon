import { useEffect, useMemo, useState } from "react";
import { getData } from "../services/api";
import "./AnalyticsPage.css";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function getReferenceId(reference) {
  if (!reference) {
    return "";
  }

  if (typeof reference === "string") {
    return reference;
  }

  return reference._id || "";
}

function calculatePercentage(value, total) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function MetricCard({ title, value, description, icon }) {
  return (
    <article className="analytics-metric-card">
      <div className="analytics-metric-top">
        <span className="analytics-metric-icon">{icon}</span>
        <span className="analytics-metric-label">{title}</span>
      </div>

      <h2>{value}</h2>
      <p>{description}</p>
    </article>
  );
}

function AnalyticsPage() {
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");

      const [
        vehicleResult,
        tripResult,
        fuelResult,
        expenseResult,
        maintenanceResult,
      ] = await Promise.all([
        getData("/vehicles"),
        getData("/trips"),
        getData("/expenses/fuel"),
        getData("/expenses"),
        getData("/maintenance"),
      ]);

      setVehicles(vehicleResult.data || []);
      setTrips(tripResult.data || []);
      setFuelLogs(fuelResult.data || []);
      setExpenses(expenseResult.data || []);
      setMaintenanceRecords(maintenanceResult.data || []);
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to load analytics information.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const analytics = useMemo(() => {
    const completedTrips = trips.filter(
      (trip) => trip.status === "Completed",
    );

    const dispatchedTrips = trips.filter(
      (trip) => trip.status === "Dispatched",
    );

    const activeVehicles = vehicles.filter(
      (vehicle) => vehicle.status !== "Retired",
    );

    const vehiclesOnTrip = vehicles.filter(
      (vehicle) => vehicle.status === "On Trip",
    );

    const totalRevenue = completedTrips.reduce(
      (sum, trip) => sum + toNumber(trip.revenue),
      0,
    );

    const totalFuelCost = fuelLogs.reduce(
      (sum, log) => sum + toNumber(log.cost),
      0,
    );

    const totalOtherExpenses = expenses.reduce(
      (sum, expense) => sum + toNumber(expense.amount),
      0,
    );

    const totalMaintenanceCost = maintenanceRecords
      .filter((record) => record.status !== "Cancelled")
      .reduce(
        (sum, record) => sum + toNumber(record.cost),
        0,
      );

    const operationalCost =
      totalFuelCost +
      totalOtherExpenses +
      totalMaintenanceCost;

    const operatingProfit = totalRevenue - operationalCost;

    const totalAcquisitionCost = vehicles.reduce(
      (sum, vehicle) =>
        sum + toNumber(vehicle.acquisitionCost),
      0,
    );

    const fleetRoi =
      totalAcquisitionCost > 0
        ? (operatingProfit / totalAcquisitionCost) * 100
        : 0;

    const fleetUtilisation =
      activeVehicles.length > 0
        ? (vehiclesOnTrip.length / activeVehicles.length) * 100
        : 0;

    const completedDistance = completedTrips.reduce(
      (sum, trip) =>
        sum +
        toNumber(
          trip.actualDistance || trip.plannedDistance,
        ),
      0,
    );

    const tripFuelConsumed = completedTrips.reduce(
      (sum, trip) => sum + toNumber(trip.fuelConsumed),
      0,
    );

    const fuelLogLitres = fuelLogs.reduce(
      (sum, log) => sum + toNumber(log.liters),
      0,
    );

    const litresForEfficiency =
      tripFuelConsumed > 0
        ? tripFuelConsumed
        : fuelLogLitres;

    const averageFuelEfficiency =
      litresForEfficiency > 0
        ? completedDistance / litresForEfficiency
        : 0;

    const vehiclePerformance = vehicles
      .map((vehicle) => {
        const vehicleId = vehicle._id;

        const vehicleTrips = completedTrips.filter(
          (trip) =>
            getReferenceId(trip.vehicle) === vehicleId,
        );

        const vehicleFuelLogs = fuelLogs.filter(
          (log) =>
            getReferenceId(log.vehicle) === vehicleId,
        );

        const vehicleExpenses = expenses.filter(
          (expense) =>
            getReferenceId(expense.vehicle) === vehicleId,
        );

        const vehicleMaintenance =
          maintenanceRecords.filter(
            (record) =>
              getReferenceId(record.vehicle) === vehicleId &&
              record.status !== "Cancelled",
          );

        const revenue = vehicleTrips.reduce(
          (sum, trip) => sum + toNumber(trip.revenue),
          0,
        );

        const fuelCost = vehicleFuelLogs.reduce(
          (sum, log) => sum + toNumber(log.cost),
          0,
        );

        const otherCost = vehicleExpenses.reduce(
          (sum, expense) =>
            sum + toNumber(expense.amount),
          0,
        );

        const maintenanceCost = vehicleMaintenance.reduce(
          (sum, record) => sum + toNumber(record.cost),
          0,
        );

        const totalCost =
          fuelCost + otherCost + maintenanceCost;

        const profit = revenue - totalCost;

        const acquisitionCost = toNumber(
          vehicle.acquisitionCost,
        );

        const roi =
          acquisitionCost > 0
            ? (profit / acquisitionCost) * 100
            : 0;

        const distance = vehicleTrips.reduce(
          (sum, trip) =>
            sum +
            toNumber(
              trip.actualDistance || trip.plannedDistance,
            ),
          0,
        );

        const tripFuel = vehicleTrips.reduce(
          (sum, trip) =>
            sum + toNumber(trip.fuelConsumed),
          0,
        );

        const loggedFuel = vehicleFuelLogs.reduce(
          (sum, log) => sum + toNumber(log.liters),
          0,
        );

        const litres =
          tripFuel > 0 ? tripFuel : loggedFuel;

        const efficiency =
          litres > 0 ? distance / litres : 0;

        return {
          id: vehicleId,
          registrationNumber:
            vehicle.registrationNumber || "Unknown",
          model: vehicle.model || "Unknown",
          status: vehicle.status || "Unknown",
          completedTrips: vehicleTrips.length,
          revenue,
          totalCost,
          profit,
          roi,
          efficiency,
        };
      })
      .sort((first, second) => second.revenue - first.revenue);

    return {
      totalRevenue,
      totalFuelCost,
      totalOtherExpenses,
      totalMaintenanceCost,
      operationalCost,
      operatingProfit,
      fleetRoi,
      fleetUtilisation,
      averageFuelEfficiency,
      completedTrips: completedTrips.length,
      activeTrips: dispatchedTrips.length,
      activeVehicles: activeVehicles.length,
      totalVehicles: vehicles.length,
      vehiclePerformance,
    };
  }, [
    vehicles,
    trips,
    fuelLogs,
    expenses,
    maintenanceRecords,
  ]);

  const expenseBreakdown = useMemo(() => {
    const items = [
      {
        label: "Fuel",
        amount: analytics.totalFuelCost,
      },
      {
        label: "Maintenance",
        amount: analytics.totalMaintenanceCost,
      },
      {
        label: "Other Expenses",
        amount: analytics.totalOtherExpenses,
      },
    ];

    const highestAmount = Math.max(
      ...items.map((item) => item.amount),
      1,
    );

    return items.map((item) => ({
      ...item,
      width: calculatePercentage(
        item.amount,
        highestAmount,
      ),
    }));
  }, [analytics]);

  if (loading) {
    return (
      <section className="analytics-page">
        <div className="analytics-loading">
          <div className="analytics-spinner" />
          <p>Loading fleet analytics...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="analytics-page">
      <div className="analytics-heading">
        <div>
          <h1>Reports & Analytics</h1>
          <p>
            Review fleet performance, operational costs,
            utilisation and profitability.
          </p>
        </div>

        <button
          type="button"
          className="analytics-refresh-button"
          onClick={loadAnalytics}
        >
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="analytics-error">
          <strong>Unable to load analytics.</strong>
          <span>{error}</span>
        </div>
      )}

      <div className="analytics-metric-grid">
        <MetricCard
          title="Total Revenue"
          value={currencyFormatter.format(
            analytics.totalRevenue,
          )}
          description={`${analytics.completedTrips} completed trips`}
          icon="₹"
        />

        <MetricCard
          title="Operational Cost"
          value={currencyFormatter.format(
            analytics.operationalCost,
          )}
          description="Fuel, maintenance and other expenses"
          icon="↘"
        />

        <MetricCard
          title="Operating Profit"
          value={currencyFormatter.format(
            analytics.operatingProfit,
          )}
          description="Revenue minus operational cost"
          icon="↗"
        />

        <MetricCard
          title="Fleet ROI"
          value={`${analytics.fleetRoi.toFixed(1)}%`}
          description="Return against acquisition cost"
          icon="%"
        />

        <MetricCard
          title="Fleet Utilisation"
          value={`${analytics.fleetUtilisation.toFixed(1)}%`}
          description={`${analytics.activeTrips} currently dispatched trips`}
          icon="▣"
        />

        <MetricCard
          title="Fuel Efficiency"
          value={`${analytics.averageFuelEfficiency.toFixed(
            2,
          )} km/L`}
          description="Average across completed trips"
          icon="⛽"
        />
      </div>

      <div className="analytics-content-grid">
        <article className="analytics-card">
          <div className="analytics-card-heading">
            <div>
              <h2>Expense Breakdown</h2>
              <p>
                Distribution of fleet operational costs.
              </p>
            </div>

            <strong>
              {currencyFormatter.format(
                analytics.operationalCost,
              )}
            </strong>
          </div>

          <div className="analytics-breakdown-list">
            {expenseBreakdown.map((item) => (
              <div
                className="analytics-breakdown-item"
                key={item.label}
              >
                <div className="analytics-breakdown-header">
                  <span>{item.label}</span>
                  <strong>
                    {currencyFormatter.format(item.amount)}
                  </strong>
                </div>

                <div className="analytics-progress-track">
                  <div
                    className="analytics-progress-value"
                    style={{
                      width: `${item.width}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="analytics-card">
          <div className="analytics-card-heading">
            <div>
              <h2>Fleet Overview</h2>
              <p>Current operational fleet status.</p>
            </div>
          </div>

          <div className="analytics-overview-list">
            <div className="analytics-overview-row">
              <span>Total Vehicles</span>
              <strong>{analytics.totalVehicles}</strong>
            </div>

            <div className="analytics-overview-row">
              <span>Active Vehicles</span>
              <strong>{analytics.activeVehicles}</strong>
            </div>

            <div className="analytics-overview-row">
              <span>Active Trips</span>
              <strong>{analytics.activeTrips}</strong>
            </div>

            <div className="analytics-overview-row">
              <span>Completed Trips</span>
              <strong>{analytics.completedTrips}</strong>
            </div>

            <div className="analytics-utilisation-box">
              <div>
                <span>Current utilisation</span>
                <strong>
                  {analytics.fleetUtilisation.toFixed(1)}%
                </strong>
              </div>

              <div className="analytics-progress-track">
                <div
                  className="analytics-progress-value"
                  style={{
                    width: `${Math.min(
                      analytics.fleetUtilisation,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </article>
      </div>

      <article className="analytics-card analytics-table-card">
        <div className="analytics-card-heading">
          <div>
            <h2>Vehicle Performance</h2>
            <p>
              Revenue, cost, efficiency and return by vehicle.
            </p>
          </div>
        </div>

        {analytics.vehiclePerformance.length === 0 ? (
          <div className="analytics-empty-state">
            <h3>No vehicle information available</h3>
            <p>
              Add vehicles and complete trips to generate
              performance reports.
            </p>
          </div>
        ) : (
          <div className="analytics-table-wrapper">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>Completed Trips</th>
                  <th>Revenue</th>
                  <th>Operating Cost</th>
                  <th>Profit</th>
                  <th>Efficiency</th>
                  <th>ROI</th>
                </tr>
              </thead>

              <tbody>
                {analytics.vehiclePerformance.map(
                  (vehicle) => (
                    <tr key={vehicle.id}>
                      <td>
                        <strong>
                          {vehicle.registrationNumber}
                        </strong>
                        <small>{vehicle.model}</small>
                      </td>

                      <td>
                        <span
                          className={`analytics-status ${vehicle.status
                            .toLowerCase()
                            .replaceAll(" ", "-")}`}
                        >
                          {vehicle.status}
                        </span>
                      </td>

                      <td>{vehicle.completedTrips}</td>

                      <td>
                        {currencyFormatter.format(
                          vehicle.revenue,
                        )}
                      </td>

                      <td>
                        {currencyFormatter.format(
                          vehicle.totalCost,
                        )}
                      </td>

                      <td
                        className={
                          vehicle.profit < 0
                            ? "analytics-negative-value"
                            : "analytics-positive-value"
                        }
                      >
                        {currencyFormatter.format(
                          vehicle.profit,
                        )}
                      </td>

                      <td>
                        {vehicle.efficiency.toFixed(2)} km/L
                      </td>

                      <td
                        className={
                          vehicle.roi < 0
                            ? "analytics-negative-value"
                            : "analytics-positive-value"
                        }
                      >
                        {vehicle.roi.toFixed(1)}%
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  );
}

export default AnalyticsPage;