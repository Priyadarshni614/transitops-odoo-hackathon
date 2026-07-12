import { useEffect, useState } from "react";
import DriverForm from "../components/DriverForm";
import DriverList from "../components/DriverList";
import {
  getDrivers,
  addDriver,
  deleteDriver,
} from "../services/driverService";

function DriverPage() {
  const [drivers, setDrivers] = useState([]);

  // Fetch all drivers
  const fetchDrivers = async () => {
    try {
      const res = await getDrivers();

      // Backend returns:
      // {
      //   success: true,
      //   count: ...,
      //   data: [...]
      // }

      setDrivers(res.data.data);
    } catch (err) {
      console.error("Error fetching drivers:", err);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // Add Driver
  const handleAdd = async (driver) => {
    try {
      const res = await addDriver(driver);

      alert(res.data.message);

      fetchDrivers();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Unable to add driver"
      );
    }
  };

  // Delete Driver
  const handleDelete = async (id) => {
    try {
      const res = await deleteDriver(id);

      alert(res.data.message);

      fetchDrivers();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Unable to delete driver"
      );
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Driver Management</h1>

      <DriverForm onAdd={handleAdd} />

      <hr />

      <DriverList
        drivers={drivers}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default DriverPage;