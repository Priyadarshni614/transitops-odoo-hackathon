import { useEffect, useMemo, useState } from "react";
import {
  getData,
  postData,
  updateData,
} from "../../services/api";
import "./Operations.css";

const initialForm = {
  source: "",
  destination: "",
  vehicle: "",
  driver: "",
  cargoWeight: "",
  plannedDistance: "",
  revenue: "",
  notes: "",
};

function isExpired(date) {
  if (!date) return true;

  const expiry = new Date(date);
  expiry.setHours(23, 59, 59, 999);

  return expiry < new Date();
}

function TripPage() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [statusFilter, setStatusFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setError("");

      const [tripResult, vehicleResult, driverResult] =
        await Promise.all([
          getData("/trips"),
          getData("/vehicles"),
          getData("/drivers"),
        ]);

      setTrips(tripResult.data || []);
      setVehicles(vehicleResult.data || []);
      setDrivers(driverResult.data || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "Available",
  );

  const availableDrivers = drivers.filter(
    (driver) =>
      driver.status === "Available" &&
      !isExpired(driver.licenseExpiry),
  );

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError("");
      setMessage("");

      await postData("/trips", {
        ...form,
        cargoWeight: Number(form.cargoWeight),
        plannedDistance: Number(form.plannedDistance),
        revenue: Number(form.revenue || 0),
      });

      setForm(initialForm);
      setMessage("Draft trip created successfully.");
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function dispatchTrip(id) {
    try {
      await updateData(`/trips/${id}/dispatch`, {});
      setMessage("Trip dispatched successfully.");
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function completeTrip(trip) {
    const actualDistance = window.prompt(
      "Enter actual distance travelled (km):",
      trip.plannedDistance,
    );

    if (actualDistance === null) return;

    const finalOdometer = window.prompt(
      "Enter final odometer:",
      trip.vehicle?.odometer || 0,
    );

    if (finalOdometer === null) return;

    const fuelConsumed = window.prompt(
      "Enter fuel consumed (litres):",
      "0",
    );

    if (fuelConsumed === null) return;

    try {
      await updateData(`/trips/${trip._id}/complete`, {
        actualDistance: Number(actualDistance),
        finalOdometer: Number(finalOdometer),
        fuelConsumed: Number(fuelConsumed),
      });

      setMessage("Trip completed successfully.");
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function cancelTrip(id) {
    if (!window.confirm("Cancel this trip?")) return;

    try {
      await updateData(`/trips/${id}/cancel`, {});
      setMessage("Trip cancelled successfully.");
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const filteredTrips = useMemo(() => {
    if (statusFilter === "All") return trips;

    return trips.filter((trip) => trip.status === statusFilter);
  }, [trips, statusFilter]);

  return (
    <section>
      <div className="operations-heading">
        <h1>Trip Dispatcher</h1>
        <p>Create, dispatch, complete and cancel trips.</p>
      </div>

      <div className="operations-layout">
        <form className="operations-form" onSubmit={handleSubmit}>
          <h2>Create Trip</h2>

          <label>Source</label>
          <input
            name="source"
            value={form.source}
            onChange={handleChange}
            required
          />

          <label>Destination</label>
          <input
            name="destination"
            value={form.destination}
            onChange={handleChange}
            required
          />

          <label>Available vehicle</label>
          <select
            name="vehicle"
            value={form.vehicle}
            onChange={handleChange}
            required
          >
            <option value="">Select vehicle</option>

            {availableVehicles.map((vehicle) => (
              <option value={vehicle._id} key={vehicle._id}>
                {vehicle.registrationNumber} — {vehicle.model} —
                {vehicle.maxCapacity} kg
              </option>
            ))}
          </select>

          <label>Available driver</label>
          <select
            name="driver"
            value={form.driver}
            onChange={handleChange}
            required
          >
            <option value="">Select driver</option>

            {availableDrivers.map((driver) => (
              <option value={driver._id} key={driver._id}>
                {driver.name} — {driver.licenseNumber}
              </option>
            ))}
          </select>

          <label>Cargo weight (kg)</label>
          <input
            name="cargoWeight"
            type="number"
            min="1"
            value={form.cargoWeight}
            onChange={handleChange}
            required
          />

          <label>Planned distance (km)</label>
          <input
            name="plannedDistance"
            type="number"
            min="1"
            value={form.plannedDistance}
            onChange={handleChange}
            required
          />

          <label>Expected revenue (₹)</label>
          <input
            name="revenue"
            type="number"
            min="0"
            value={form.revenue}
            onChange={handleChange}
          />

          <label>Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
          />

          {error && <div className="operation-error">{error}</div>}
          {message && (
            <div className="operation-success">{message}</div>
          )}

          <button className="operation-primary" type="submit">
            Create Draft
          </button>
        </form>

        <div className="operations-table-card">
          <div className="operations-toolbar">
            <h2>Trips</h2>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="All">All statuses</option>
              <option value="Draft">Draft</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="operations-table-wrapper">
            <table className="operations-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Cargo</th>
                  <th>Distance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredTrips.map((trip) => (
                  <tr key={trip._id}>
                    <td>
                      {trip.source} → {trip.destination}
                    </td>

                    <td>
                      {trip.vehicle?.registrationNumber || "—"}
                    </td>

                    <td>{trip.driver?.name || "—"}</td>
                    <td>{trip.cargoWeight} kg</td>
                    <td>{trip.plannedDistance} km</td>

                    <td>
                      <span
                        className={`operation-status ${trip.status.toLowerCase()}`}
                      >
                        {trip.status}
                      </span>
                    </td>

                    <td>
                      <div className="operation-actions">
                        {trip.status === "Draft" && (
                          <button
                            type="button"
                            onClick={() =>
                              dispatchTrip(trip._id)
                            }
                          >
                            Dispatch
                          </button>
                        )}

                        {trip.status === "Dispatched" && (
                          <button
                            type="button"
                            onClick={() => completeTrip(trip)}
                          >
                            Complete
                          </button>
                        )}

                        {(trip.status === "Draft" ||
                          trip.status === "Dispatched") && (
                          <button
                            type="button"
                            className="operation-danger"
                            onClick={() =>
                              cancelTrip(trip._id)
                            }
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTrips.length === 0 && (
              <p className="operation-empty">
                No trips are available.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default TripPage;