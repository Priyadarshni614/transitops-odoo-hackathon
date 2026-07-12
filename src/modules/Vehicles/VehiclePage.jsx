import { useState } from "react";
import "./VehiclePage.css";

export default function VehiclePage() {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({
    vehicleNumber: "",
    vehicleType: "",
    capacity: "",
    status: "Available",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const addVehicle = () => {
    if (!form.vehicleNumber || !form.vehicleType || !form.capacity) {
      alert("Fill all fields");
      return;
    }

    setVehicles([...vehicles, form]);

    setForm({
      vehicleNumber: "",
      vehicleType: "",
      capacity: "",
      status: "Available",
    });
  };

  return (
    <div className="vehicle-container">
      <h2>Fleet Vehicle Management</h2>

      <input
        name="vehicleNumber"
        placeholder="Vehicle Number"
        value={form.vehicleNumber}
        onChange={handleChange}
      />

      <input
        name="vehicleType"
        placeholder="Vehicle Type"
        value={form.vehicleType}
        onChange={handleChange}
      />

      <input
        name="capacity"
        placeholder="Capacity"
        value={form.capacity}
        onChange={handleChange}
      />

      <select
        name="status"
        value={form.status}
        onChange={handleChange}
      >
        <option>Available</option>
        <option>On Trip</option>
        <option>Maintenance</option>
      </select>

      <button onClick={addVehicle}>Add Vehicle</button>

      <table>
        <thead>
          <tr>
            <th>Vehicle No</th>
            <th>Type</th>
            <th>Capacity</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {vehicles.map((v, index) => (
            <tr key={index}>
              <td>{v.vehicleNumber}</td>
              <td>{v.vehicleType}</td>
              <td>{v.capacity}</td>
              <td>{v.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}