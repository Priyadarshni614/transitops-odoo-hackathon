import axios from "axios";

const API = "http://localhost:5000/api/drivers";

export const getDrivers = () => axios.get(API);

export const addDriver = (driver) => axios.post(API, driver);

export const updateDriver = (id, driver) =>
  axios.put(`${API}/${id}`, driver);

export const deleteDriver = (id) =>
  axios.delete(`${API}/${id}`);