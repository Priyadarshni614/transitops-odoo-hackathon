const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle is required"],
    },

    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      default: null,
    },

    type: {
      type: String,
      enum: ["Toll", "Maintenance", "Parking", "Other"],
      required: [true, "Expense type is required"],
    },

    amount: {
      type: Number,
      required: [true, "Expense amount is required"],
      min: 0,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Expense", expenseSchema);