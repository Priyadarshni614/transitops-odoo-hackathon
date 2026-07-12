const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    model: {
      type: String,
      required: [true, "Vehicle model is required"],
      trim: true,
    },

    type: {
      type: String,
      required: [true, "Vehicle type is required"],
      trim: true,
    },

    maxCapacity: {
      type: Number,
      required: [true, "Maximum capacity is required"],
      min: [1, "Capacity must be greater than zero"],
    },

    odometer: {
      type: Number,
      default: 0,
      min: [0, "Odometer cannot be negative"],
    },

    acquisitionCost: {
      type: Number,
      default: 0,
      min: [0, "Acquisition cost cannot be negative"],
    },

    region: {
      type: String,
      required: [true, "Region is required"],
      trim: true,
    },

    status: {
      type: String,
      enum: ["Available", "On Trip", "In Shop", "Retired"],
      default: "Available",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Vehicle", vehicleSchema);