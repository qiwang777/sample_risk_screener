import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { SecuritiesCrudForm } from "./components/SecuritiesCrud";
import { MetricsCrudForm } from "./components/MetricsCrud";

import "./index.css";

function App() {
  const [rowData, setRowData] = useState<any[]>([]);
  const [metricsData, setMetricsData] = useState<any[]>([]);
  const [date, setDate] = useState<string>("");

  // State for Securities
  const [newSecurity, setNewSecurity] = useState<any>({});
  const [deleteSecurityId, setDeleteSecurityId] = useState<string | null>(null);
  const [deleteAsOfDate, setDeleteAsOfDate] = useState<string | null>(null);

  // State for Metrics
  const [newMetric, setNewMetric] = useState<any>({});
  const [deleteMetricName, setDeleteMetricName] = useState<string | null>(null);
  const [deleteSecurityIdMetric, setDeleteSecurityIdMetric] = useState<
    string | null
  >(null);

  // Generic Fetch Function
  const fetchData = async (
    url: string,
    setData: (data: any[]) => void,
    selectedDate?: string
  ) => {
    if (selectedDate) {
      url += `?date=${encodeURIComponent(selectedDate)}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    setData(data);
  };

  // Generic CRUD Handler
  const handleCrudOperation = async (
    url: string,
    method: "POST" | "DELETE",
    body?: any,
    callback?: () => void
  ) => {
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (callback) callback();
  };

  // Fetch Securities and Metrics
  const fetchSecurities = (selectedDate?: string) =>
    fetchData("http://localhost:5000/securities", setRowData, selectedDate);
  const fetchMetrics = (selectedDate?: string) =>
    fetchData("http://localhost:5000/metrics", setMetricsData, selectedDate);

  // CRUD Handlers for Securities
  const handleCreateSecurity = () => {
    const requiredFields = [
      "AsOfDate",
      "SecurityId",
      "Description",
      "Sector",
      "Subsector",
      "Currency",
    ];
    const missingFields = requiredFields.filter((field) => !newSecurity[field]);

    if (missingFields.length > 0) {
      alert(`The following fields are required: ${missingFields.join(", ")}`);
      return;
    }

    handleCrudOperation(
      "http://localhost:5000/securities/addSecurity",
      "POST",
      newSecurity,
      () => {
        setNewSecurity({});
        fetchSecurities(date);
      }
    );
  };

  const handleDeleteSecurity = (securityId: string, asOfDate: string) => {
    if (!securityId || !asOfDate) {
      alert("Both Security ID and Date are required to delete a security.");
      return;
    }
    handleCrudOperation(
      `http://localhost:5000/securities/${securityId}?date=${encodeURIComponent(asOfDate)}`,
      "DELETE",
      undefined,
      () => {
        setDeleteSecurityId(null);
        fetchSecurities(asOfDate);
      }
    );
  };

  // CRUD Handlers for Metrics
  const handleCreateMetric = () => {
    const requiredFields = [
      "AsOfDateTime",
      "SecurityId",
      "MetricName",
      "MetricValue",
    ];
    const missingFields = requiredFields.filter((field) => !newMetric[field]);

    if (missingFields.length > 0) {
      alert(`The following fields are required: ${missingFields.join(", ")}`);
      return;
    }

    handleCrudOperation(
      "http://localhost:5000/metrics",
      "POST",
      newMetric,
      () => {
        setNewMetric({});
        fetchMetrics(date);
      }
    );
  };

  const handleDeleteMetric = () => {
    if (!deleteMetricName || !deleteSecurityIdMetric) {
      alert(
        "Both Metric Name and Security ID are required to delete a metric."
      );
      return;
    }

    handleCrudOperation(
      "http://localhost:5000/metrics",
      "DELETE",
      { MetricName: deleteMetricName, SecurityId: deleteSecurityIdMetric },
      () => {
        setDeleteMetricName(null);
        setDeleteSecurityIdMetric(null);
        fetchMetrics(date);
      }
    );
  };

  useEffect(() => {
    fetchSecurities();
    fetchMetrics();
  }, []);

  // Dynamically generate columns from data
  const generateColumnDefs = (data: any[]) =>
    data.length > 0
      ? Object.keys(data[0]).map((key) => ({
          field: key,
          sortable: true,
          filter: true,
        }))
      : [];

  return (
    <div className="container">
      <div className="form-container">
        <input
          type="date"
          placeholder="YYYY-MM-DD"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input"
        />
        <button
          className="button purple-button"
          onClick={() => {
            fetchSecurities(date);
            fetchMetrics(date);
          }}
        >
          Fetch Securities and Metrics by Date
        </button>
        <h1>Securities Data</h1>
        <SecuritiesCrudForm
          newSecurity={newSecurity}
          setNewSecurity={setNewSecurity}
          handleCreateSecurity={handleCreateSecurity}
          deleteSecurityId={deleteSecurityId}
          setDeleteSecurityId={setDeleteSecurityId}
          handleDeleteSecurity={handleDeleteSecurity}
          setDeleteAsOfDate={setDeleteAsOfDate}
          deleteAsOfDate={deleteAsOfDate}
        />
      </div>
      <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={generateColumnDefs(rowData)}
        />
      </div>
      <h2>Metrics (Most Recent Version for Each Security)</h2>
      <MetricsCrudForm
        newMetric={newMetric}
        setNewMetric={setNewMetric}
        handleCreateMetric={handleCreateMetric}
        deleteMetricName={deleteMetricName}
        setDeleteMetricName={setDeleteMetricName}
        handleDeleteMetric={handleDeleteMetric}
        setDeleteSecurityId={setDeleteSecurityIdMetric}
        deleteSecurityId={deleteSecurityIdMetric}
      />
      <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
        <AgGridReact
          rowData={metricsData}
          columnDefs={generateColumnDefs(metricsData)}
        />
      </div>
    </div>
  );
}

export default App;
