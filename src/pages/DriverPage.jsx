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

  const fetchDrivers = async () => {
    try {
      const res = await getDrivers();
      setDrivers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleAdd = async (driver) => {
    await addDriver(driver);
    fetchDrivers();
  };

  const handleDelete = async (id) => {
    await deleteDriver(id);
    fetchDrivers();
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