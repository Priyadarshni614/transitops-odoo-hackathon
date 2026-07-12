const express = require("express");

const router = express.Router();

const {
  getVehicles,
  addVehicle,
  deleteVehicle,
} = require("../controllers/vehicleController");

router.get("/", getVehicles);

router.post("/", addVehicle);

router.delete("/:id", deleteVehicle);

module.exports = router;