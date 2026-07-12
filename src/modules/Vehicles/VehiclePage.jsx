import { useEffect, useState } from "react";
import {
  deleteData,
  getData,
  postData,
  updateData,
} from "../../services/api";
import "./VehiclePage.css";

const initialForm = {
  registrationNumber: "",
  model: "",
  type: "",
  maxCapacity: "",
  odometer: "",
  acquisitionCost: "",
  region: "",
  status: "Available",
};

export default function VehiclePage() {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadInitialVehicles() {
      try {
        const result = await getData("/vehicles");

        if (!cancelled) {
          setVehicles(result.data || []);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialVehicles();

    return () => {
      cancelled = true;
    };
  }, []);

  async function refreshVehicles() {
    const result = await getData("/vehicles");
    setVehicles(result.data || []);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
    setError("");
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      ...form,
      maxCapacity: Number(form.maxCapacity),
      odometer: Number(form.odometer || 0),
      acquisitionCost: Number(form.acquisitionCost || 0),
    };

    try {
      setError("");
      setMessage("");

      if (editingId) {
        await updateData(`/vehicles/${editingId}`, payload);
        setMessage("Vehicle updated successfully.");
      } else {
        await postData("/vehicles", payload);
        setMessage("Vehicle added successfully.");
      }

      resetForm();
      await refreshVehicles();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function handleEdit(vehicle) {
    setEditingId(vehicle._id);

    setForm({
      registrationNumber: vehicle.registrationNumber || "",
      model: vehicle.model || "",
      type: vehicle.type || "",
      maxCapacity: vehicle.maxCapacity || "",
      odometer: vehicle.odometer || "",
      acquisitionCost: vehicle.acquisitionCost || "",
      region: vehicle.region || "",
      status: vehicle.status || "Available",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(vehicle) {
    const confirmed = window.confirm(
      `Delete ${vehicle.registrationNumber}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteData(`/vehicles/${vehicle._id}`);
      setMessage("Vehicle deleted successfully.");
      setError("");
      await refreshVehicles();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="vehicle-container">
      <h2>Fleet Vehicle Management</h2>

      <form onSubmit={handleSubmit}>
        <label>Registration number</label>
        <input
          name="registrationNumber"
          placeholder="TN-01-AB-1234"
          value={form.registrationNumber}
          onChange={handleChange}
          required
        />

        <label>Vehicle model</label>
        <input
          name="model"
          placeholder="Tata Ace"
          value={form.model}
          onChange={handleChange}
          required
        />

        <label>Vehicle type</label>
        <input
          name="type"
          placeholder="Mini Truck"
          value={form.type}
          onChange={handleChange}
          required
        />

        <label>Maximum capacity in kg</label>
        <input
          name="maxCapacity"
          type="number"
          min="1"
          placeholder="500"
          value={form.maxCapacity}
          onChange={handleChange}
          required
        />

        <label>Current odometer in km</label>
        <input
          name="odometer"
          type="number"
          min="0"
          placeholder="25000"
          value={form.odometer}
          onChange={handleChange}
        />

        <label>Acquisition cost</label>
        <input
          name="acquisitionCost"
          type="number"
          min="0"
          placeholder="650000"
          value={form.acquisitionCost}
          onChange={handleChange}
        />

        <label>Region</label>
        <input
          name="region"
          placeholder="Chennai"
          value={form.region}
          onChange={handleChange}
          required
        />

        <label>Status</label>
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="In Shop">In Shop</option>
          <option value="Retired">Retired</option>
        </select>

        {error && <p className="vehicle-error">{error}</p>}
        {message && <p className="vehicle-success">{message}</p>}

        <button type="submit">
          {editingId ? "Update Vehicle" : "Add Vehicle"}
        </button>

        {editingId && (
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <p>Loading vehicles...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Registration</th>
              <th>Model</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Odometer</th>
              <th>Region</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle._id}>
                <td>{vehicle.registrationNumber}</td>
                <td>{vehicle.model}</td>
                <td>{vehicle.type}</td>
                <td>{vehicle.maxCapacity} kg</td>
                <td>{vehicle.odometer} km</td>
                <td>{vehicle.region}</td>
                <td>{vehicle.status}</td>
                <td>
                  <button type="button" onClick={() => handleEdit(vehicle)}>
                    Edit
                  </button>

                  <button type="button" onClick={() => handleDelete(vehicle)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}