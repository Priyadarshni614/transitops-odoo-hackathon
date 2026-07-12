import { useEffect, useState } from "react";
import {
  getData,
  postData,
  updateData,
} from "../../services/api";
import "./Operations.css";

function getTodayDate() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

const initialForm = {
  vehicle: "",
  serviceType: "Oil Change",
  description: "",
  cost: "",
  startDate: getTodayDate(),
};

function MaintenancePage() {
  const [vehicles, setVehicles] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [vehicleResult, maintenanceResult] =
        await Promise.all([
          getData("/vehicles"),
          getData("/maintenance"),
        ]);

      setVehicles(vehicleResult.data || []);
      setRecords(maintenanceResult.data || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await postData("/maintenance", {
        ...form,
        cost: Number(form.cost || 0),
      });

      setForm(initialForm);
      setMessage("Vehicle moved to In Shop.");
      setError("");
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function completeMaintenance(id) {
    try {
      await updateData(`/maintenance/${id}/complete`, {});
      setMessage("Maintenance completed.");
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function cancelMaintenance(id) {
    try {
      await updateData(`/maintenance/${id}/cancel`, {});
      setMessage("Maintenance cancelled.");
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "Available",
  );

  return (
    <section>
      <div className="operations-heading">
        <h1>Maintenance</h1>
        <p>Manage vehicle servicing and repair records.</p>
      </div>

      <div className="operations-layout">
        <form className="operations-form" onSubmit={handleSubmit}>
          <h2>New Maintenance</h2>

          <label>Vehicle</label>
          <select
            name="vehicle"
            value={form.vehicle}
            onChange={handleChange}
            required
          >
            <option value="">Select vehicle</option>

            {availableVehicles.map((vehicle) => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.registrationNumber} — {vehicle.model}
              </option>
            ))}
          </select>

          <label>Service type</label>
          <select
            name="serviceType"
            value={form.serviceType}
            onChange={handleChange}
          >
            <option>Oil Change</option>
            <option>Engine Repair</option>
            <option>Tyre Service</option>
            <option>Inspection</option>
            <option>Brake Service</option>
            <option>Other</option>
          </select>

          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />

          <label>Cost (₹)</label>
          <input
            name="cost"
            type="number"
            min="0"
            value={form.cost}
            onChange={handleChange}
          />

          <label>Start date</label>
          <input
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
          />

          {error && <div className="operation-error">{error}</div>}
          {message && (
            <div className="operation-success">{message}</div>
          )}

          <button className="operation-primary" type="submit">
            Start Maintenance
          </button>
        </form>

        <div className="operations-table-card">
          <h2>Maintenance Records</h2>

          <div className="operations-table-wrapper">
            <table className="operations-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Service</th>
                  <th>Cost</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td>
                      {record.vehicle?.registrationNumber || "—"}
                    </td>
                    <td>{record.serviceType}</td>
                    <td>₹{record.cost}</td>
                    <td>
                      {new Date(
                        record.startDate,
                      ).toLocaleDateString()}
                    </td>
                    <td>{record.status}</td>

                    <td>
                      {record.status === "Active" && (
                        <div className="operation-actions">
                          <button
                            onClick={() =>
                              completeMaintenance(record._id)
                            }
                          >
                            Complete
                          </button>

                          <button
                            className="operation-danger"
                            onClick={() =>
                              cancelMaintenance(record._id)
                            }
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MaintenancePage;