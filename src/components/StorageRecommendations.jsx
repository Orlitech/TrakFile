import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Swal from "sweetalert2";

const StorageRecommendations = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(() => {
    // Default to the current week's Monday in YYYY-MM-DD format
    const today = new Date();
    const currentWeekMonday = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    return currentWeekMonday.toISOString().split("T")[0];
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data for week:", selectedWeek);
        const response = await fetch(`http://localhost:5000/weekly-trend?week=${selectedWeek}`);
        if (!response.ok) {
          throw new Error("Failed to fetch weekly trend data");
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error.message);
        Swal.fire("Error", "Failed to fetch weekly trend data. Please try again later.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedWeek]);

  const handleWeekChange = (event) => {
    const weekValue = event.target.value; // Format: YYYY-Www (e.g., 2025-W10)
    const [year, week] = weekValue.split("-W");

    // Calculate the Monday of the selected week
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = (week - 1) * 7;
    const selectedMonday = new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() + daysOffset));

    // Ensure it's set to **Monday** correctly
    selectedMonday.setDate(selectedMonday.getDate() - selectedMonday.getDay() + 1);

    // Get today's date (for comparison)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedMonday > today) {
      Swal.fire("Ooops!", "You selected a future week!", "warning");
      return;
    }

    // Convert to YYYY-MM-DD format
    const formattedDate = selectedMonday.toISOString().split("T")[0];
    setSelectedWeek(formattedDate);
  };

  if (loading) {
    return <div>Loading weekly trend data...</div>;
  }

  if (error) {
    return <div className="text-danger">Error: {error}</div>;
  }

  return (
    <div className="col-md-12 mb-4" style={{marginTop:'20px'}}>
      <h4 className="text-center">Weekly Trend of File Movements</h4>
      <div className="text-center mb-3">
        <label htmlFor="week-selector" className="me-2">Select Week:</label>
        <input
          type="week"
          id="week-selector"
          value={`${new Date(selectedWeek).getFullYear()}-W${String(Math.ceil((((new Date(selectedWeek) - new Date(new Date(selectedWeek).getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000)) + 1))).padStart(2, "0")}`}
          onChange={handleWeekChange}
          className="form-control d-inline-block w-auto"
        />
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="files_moved" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StorageRecommendations;
