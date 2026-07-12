const express = require("express");
const Trip = require("../models/Trip");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");

const router = express.Router();

function isLicenseExpired(expiryDate) {
  if (!expiryDate) {
    return true;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  return expiry < today;
}

async function validateAssignment({
  vehicleId,
  driverId,
  cargoWeight,
}) {
  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    throw new Error("Selected vehicle was not found");
  }

  const driver = await Driver.findById(driverId);

  if (!driver) {
    throw new Error("Selected driver was not found");
  }

  if (vehicle.status !== "Available") {
    throw new Error(
      `Vehicle cannot be assigned because it is ${vehicle.status}`,
    );
  }

  if (driver.status !== "Available") {
    throw new Error(
      `Driver cannot be assigned because the driver is ${driver.status}`,
    );
  }

  if (isLicenseExpired(driver.licenseExpiry)) {
    throw new Error("Driver licence has expired");
  }

  if (cargoWeight > vehicle.maxCapacity) {
    throw new Error(
      `Cargo exceeds vehicle capacity of ${vehicle.maxCapacity} kg`,
    );
  }

  return { vehicle, driver };
}

// Get all trips
router.get("/", async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("vehicle")
      .populate("driver")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: trips.length,
      data: trips,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve trips",
      error: error.message,
    });
  }
});

// Create a draft trip
router.post("/", async (req, res) => {
  try {
    const {
      source,
      destination,
      vehicle,
      driver,
      cargoWeight,
      plannedDistance,
      revenue,
      notes,
    } = req.body;

    await validateAssignment({
      vehicleId: vehicle,
      driverId: driver,
      cargoWeight: Number(cargoWeight),
    });

    const trip = await Trip.create({
      source,
      destination,
      vehicle,
      driver,
      cargoWeight,
      plannedDistance,
      revenue: revenue || 0,
      notes: notes || "",
      status: "Draft",
    });

    const populatedTrip = await Trip.findById(trip._id)
      .populate("vehicle")
      .populate("driver");

    return res.status(201).json({
      success: true,
      message: "Draft trip created successfully",
      data: populatedTrip,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to create trip",
    });
  }
});

// Dispatch a trip
router.put("/:id/dispatch", async (req, res) => {
  let reservedVehicle = null;

  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    if (trip.status !== "Draft") {
      return res.status(400).json({
        success: false,
        message: "Only Draft trips can be dispatched",
      });
    }

    await validateAssignment({
      vehicleId: trip.vehicle,
      driverId: trip.driver,
      cargoWeight: trip.cargoWeight,
    });

    reservedVehicle = await Vehicle.findOneAndUpdate(
      {
        _id: trip.vehicle,
        status: "Available",
      },
      {
        status: "On Trip",
      },
      {
        new: true,
      },
    );

    if (!reservedVehicle) {
      return res.status(409).json({
        success: false,
        message: "Vehicle is no longer available",
      });
    }

    const reservedDriver = await Driver.findOneAndUpdate(
      {
        _id: trip.driver,
        status: "Available",
      },
      {
        status: "On Trip",
      },
      {
        new: true,
      },
    );

    if (!reservedDriver) {
      await Vehicle.findByIdAndUpdate(trip.vehicle, {
        status: "Available",
      });

      return res.status(409).json({
        success: false,
        message: "Driver is no longer available",
      });
    }

    trip.status = "Dispatched";
    trip.dispatchedAt = new Date();

    await trip.save();

    const populatedTrip = await Trip.findById(trip._id)
      .populate("vehicle")
      .populate("driver");

    return res.status(200).json({
      success: true,
      message: "Trip dispatched successfully",
      data: populatedTrip,
    });
  } catch (error) {
    if (reservedVehicle) {
      await Vehicle.findByIdAndUpdate(reservedVehicle._id, {
        status: "Available",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to dispatch trip",
    });
  }
});

// Complete a trip
router.put("/:id/complete", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    if (trip.status !== "Dispatched") {
      return res.status(400).json({
        success: false,
        message: "Only Dispatched trips can be completed",
      });
    }

    const vehicle = await Vehicle.findById(trip.vehicle);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Assigned vehicle was not found",
      });
    }

    const {
      actualDistance,
      finalOdometer,
      fuelConsumed,
    } = req.body;

    if (
      finalOdometer &&
      Number(finalOdometer) < Number(vehicle.odometer)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Final odometer cannot be less than the current odometer",
      });
    }

    trip.status = "Completed";
    trip.completedAt = new Date();
    trip.actualDistance = Number(actualDistance || 0);
    trip.finalOdometer = Number(finalOdometer || 0);
    trip.fuelConsumed = Number(fuelConsumed || 0);

    await trip.save();

    const vehicleUpdate = {
      status: "Available",
    };

    if (finalOdometer) {
      vehicleUpdate.odometer = Number(finalOdometer);
    }

    await Vehicle.findByIdAndUpdate(trip.vehicle, vehicleUpdate);

    await Driver.findByIdAndUpdate(trip.driver, {
      status: "Available",
      $inc: {
        tripsCompleted: 1,
      },
    });

    const populatedTrip = await Trip.findById(trip._id)
      .populate("vehicle")
      .populate("driver");

    return res.status(200).json({
      success: true,
      message: "Trip completed successfully",
      data: populatedTrip,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to complete trip",
    });
  }
});

// Cancel a trip
router.put("/:id/cancel", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    if (
      trip.status !== "Draft" &&
      trip.status !== "Dispatched"
    ) {
      return res.status(400).json({
        success: false,
        message: "This trip cannot be cancelled",
      });
    }

    if (trip.status === "Dispatched") {
      await Vehicle.findByIdAndUpdate(trip.vehicle, {
        status: "Available",
      });

      await Driver.findByIdAndUpdate(trip.driver, {
        status: "Available",
      });
    }

    trip.status = "Cancelled";
    trip.cancelledAt = new Date();

    await trip.save();

    return res.status(200).json({
      success: true,
      message: "Trip cancelled successfully",
      data: trip,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to cancel trip",
    });
  }
});

module.exports = router;