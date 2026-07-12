import { useEffect, useMemo, useState } from "react";
import { getData, postData } from "../../services/api";
import "./Operations.css";

const fuelInitial = {
  vehicle: "",
  trip: "",
  liters: "",
  cost: "",
  odometer: "",
  date: "",
};

const expenseInitial = {
  vehicle: "",
  trip: "",
  type: "Toll",
  amount: "",
  description: "",
  date: "",
};

function ExpensePage() {
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [fuelForm, setFuelForm] = useState(fuelInitial);
  const [expenseForm, setExpenseForm] =
    useState(expenseInitial);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [vehicleResult, tripResult, fuelResult, expenseResult] =
        await Promise.all([
          getData("/vehicles"),
          getData("/trips"),
          getData("/expenses/fuel"),
          getData("/expenses"),
        ]);

      setVehicles(vehicleResult.data || []);
      setTrips(tripResult.data || []);
      setFuelLogs(fuelResult.data || []);
      setExpenses(expenseResult.data || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function submitFuel(event) {
    event.preventDefault();

    try {
      await postData("/expenses/fuel", {
        ...fuelForm,
        trip: fuelForm.trip || null,
        liters: Number(fuelForm.liters),
        cost: Number(fuelForm.cost),
        odometer: Number(fuelForm.odometer || 0),
      });

      setFuelForm(fuelInitial);
      setMessage("Fuel log recorded.");
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function submitExpense(event) {
    event.preventDefault();

    try {
      await postData("/expenses", {
        ...expenseForm,
        trip: expenseForm.trip || null,
        amount: Number(expenseForm.amount),
      });

      setExpenseForm(expenseInitial);
      setMessage("Expense recorded.");
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const totals = useMemo(() => {
    const fuelCost = fuelLogs.reduce(
      (sum, log) => sum + Number(log.cost || 0),
      0,
    );

    const otherCost = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0,
    );

    return {
      fuelCost,
      otherCost,
      total: fuelCost + otherCost,
    };
  }, [fuelLogs, expenses]);

  return (
    <section>
      <div className="operations-heading">
        <h1>Fuel & Expenses</h1>
        <p>Track fleet operating costs.</p>
      </div>

      <div className="operations-summary">
        <article>
          <p>Fuel Cost</p>
          <h3>₹{totals.fuelCost.toFixed(2)}</h3>
        </article>

        <article>
          <p>Other Expenses</p>
          <h3>₹{totals.otherCost.toFixed(2)}</h3>
        </article>

        <article>
          <p>Total Operational Cost</p>
          <h3>₹{totals.total.toFixed(2)}</h3>
        </article>
      </div>

      {error && <div className="operation-error">{error}</div>}
      {message && (
        <div className="operation-success">{message}</div>
      )}

      <div className="expense-forms">
        <form className="operations-form" onSubmit={submitFuel}>
          <h2>Add Fuel Log</h2>

          <select
            value={fuelForm.vehicle}
            onChange={(event) =>
              setFuelForm({
                ...fuelForm,
                vehicle: event.target.value,
              })
            }
            required
          >
            <option value="">Select vehicle</option>

            {vehicles.map((vehicle) => (
              <option value={vehicle._id} key={vehicle._id}>
                {vehicle.registrationNumber}
              </option>
            ))}
          </select>

          <select
            value={fuelForm.trip}
            onChange={(event) =>
              setFuelForm({
                ...fuelForm,
                trip: event.target.value,
              })
            }
          >
            <option value="">No linked trip</option>

            {trips.map((trip) => (
              <option value={trip._id} key={trip._id}>
                {trip.source} → {trip.destination}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="0.1"
            step="0.1"
            placeholder="Litres"
            value={fuelForm.liters}
            onChange={(event) =>
              setFuelForm({
                ...fuelForm,
                liters: event.target.value,
              })
            }
            required
          />

          <input
            type="number"
            min="0"
            placeholder="Fuel cost"
            value={fuelForm.cost}
            onChange={(event) =>
              setFuelForm({
                ...fuelForm,
                cost: event.target.value,
              })
            }
            required
          />

          <input
            type="number"
            min="0"
            placeholder="Odometer"
            value={fuelForm.odometer}
            onChange={(event) =>
              setFuelForm({
                ...fuelForm,
                odometer: event.target.value,
              })
            }
          />

          <input
            type="date"
            value={fuelForm.date}
            onChange={(event) =>
              setFuelForm({
                ...fuelForm,
                date: event.target.value,
              })
            }
          />

          <button className="operation-primary" type="submit">
            Add Fuel Log
          </button>
        </form>

        <form className="operations-form" onSubmit={submitExpense}>
          <h2>Add Expense</h2>

          <select
            value={expenseForm.vehicle}
            onChange={(event) =>
              setExpenseForm({
                ...expenseForm,
                vehicle: event.target.value,
              })
            }
            required
          >
            <option value="">Select vehicle</option>

            {vehicles.map((vehicle) => (
              <option value={vehicle._id} key={vehicle._id}>
                {vehicle.registrationNumber}
              </option>
            ))}
          </select>

          <select
            value={expenseForm.type}
            onChange={(event) =>
              setExpenseForm({
                ...expenseForm,
                type: event.target.value,
              })
            }
          >
            <option>Toll</option>
            <option>Maintenance</option>
            <option>Parking</option>
            <option>Other</option>
          </select>

          <input
            type="number"
            min="0"
            placeholder="Amount"
            value={expenseForm.amount}
            onChange={(event) =>
              setExpenseForm({
                ...expenseForm,
                amount: event.target.value,
              })
            }
            required
          />

          <textarea
            placeholder="Description"
            value={expenseForm.description}
            onChange={(event) =>
              setExpenseForm({
                ...expenseForm,
                description: event.target.value,
              })
            }
          />

          <input
            type="date"
            value={expenseForm.date}
            onChange={(event) =>
              setExpenseForm({
                ...expenseForm,
                date: event.target.value,
              })
            }
          />

          <button className="operation-primary" type="submit">
            Add Expense
          </button>
        </form>
      </div>
    </section>
  );
}

export default ExpensePage;