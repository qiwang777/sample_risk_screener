type MetricsCrudFormProps = {
  newMetric: any;
  setNewMetric: (v: any) => void;
  handleCreateMetric: () => void;
  deleteMetricName: null | string;
  setDeleteMetricName: (v: string) => void;
  handleDeleteMetric: () => void;
  deleteSecurityId: null | string;
  setDeleteSecurityId: (v: string) => void;
};

const fields = [
  { name: "AsOfDateTime", placeholder: "AsOfDateTime" },
  { name: "SecurityId", placeholder: "SecurityId" },
  { name: "MetricName", placeholder: "MetricName" },
  { name: "MetricValue", placeholder: "MetricValue" },
];

export function MetricsCrudForm({
  newMetric,
  setNewMetric,
  handleCreateMetric,
}: MetricsCrudFormProps) {
  return (
    <div className="form-container">

      <div className="form-row">
        {fields.map((f) => (
          <input
            key={f.name}
            type={f.name === "AsOfDateTime" ? "datetime-local" : "text"}
            placeholder={f.placeholder}
            value={newMetric[f.name] || ""}
            onChange={(e) => setNewMetric({ ...newMetric, [f.name]: e.target.value })}
            className="input"
          />
        ))}
        <button onClick={handleCreateMetric} className="button create-button">
          Create
        </button>
      </div>
    </div>
  );
}