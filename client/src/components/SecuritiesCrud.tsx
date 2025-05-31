type SecuritiesCrudFormProps = {
  newSecurity: Record<string, string>;
  setNewSecurity: (v: Record<string, string>) => void;
  handleCreateSecurity: () => void;
  deleteSecurityId: string | null;
  setDeleteSecurityId: (v: string) => void;
  deleteAsOfDate: string | null;
  setDeleteAsOfDate: (v: string) => void;
  handleDeleteSecurity: (securityId: string, date: string) => void;
};

const fields = [
  { name: "SecurityId", placeholder: "SecurityId" },
  { name: "AsOfDate", placeholder: "AsOfDate" },
  { name: "Description", placeholder: "Description" },
  { name: "Sector", placeholder: "Sector" },
  { name: "Subsector", placeholder: "Subsector" },
  { name: "Currency", placeholder: "Currency" },
];

export function SecuritiesCrudForm({
  newSecurity,
  setNewSecurity,
  handleCreateSecurity,
}: SecuritiesCrudFormProps) {
  return (
    <div className="form-container">
      <div className="form-row">
        {fields.map((f) => (
          <input
            key={f.name}
            type={f.name === "AsOfDate" ? "date" : "text"}
            placeholder={f.placeholder}
            value={newSecurity[f.name] || ""}
            onChange={(e) =>
              setNewSecurity({ ...newSecurity, [f.name]: e.target.value })
            }
            className="input"
          />
        ))}
        <button onClick={handleCreateSecurity} className="button create-button">
          Create
        </button>
      </div>
    </div>
  );
}
