const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Driver name is required"],
      trim: true,
    },

    licenseNumber: {
      type: String,
      required: [true, "Licence number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    licenseCategory: {
      type: String,
      required: [true, "Licence category is required"],
      enum: ["LMV", "HMV", "MCWG", "Transport"],
    },

    licenseExpiry: {
      type: Date,
      required: [true, "Licence expiry date is required"],
    },

    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
    },

    safetyScore: {
      type: Number,
      default: 100,
      min: [0, "Safety score cannot be negative"],
      max: [100, "Safety score cannot exceed 100"],
    },

    tripsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Available", "On Trip", "Off Duty", "Suspended"],
      default: "Available",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Driver", driverSchema);