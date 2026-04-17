import { useState } from "react";

function SliderRow({ label, techLabel, techExplain, field, min, max, step, display, value, onChange }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: 5, position: "relative", cursor: "default" }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <span style={{ fontSize: 13, color: "#e5e7eb" }}>{label}</span>
          <div style={{ width: 14, height: 14, borderRadius: "50%", border: "1px solid rgba(148,163,184,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#6b7280", flexShrink: 0, lineHeight: 1 }}>
            ?
          </div>

          {hovered && (
            <div style={{
              position: "absolute",
              bottom: "calc(100% + 8px)",
              left: 0,
              background: "#0f172a",
              border: "1px solid rgba(148,163,184,0.2)",
              borderRadius: 10,
              padding: "10px 13px",
              width: 220,
              zIndex: 100,
              pointerEvents: "none",
            }}>
              <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {techLabel}
              </div>
              <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.55 }}>
                {techExplain}
              </div>
              <div style={{ position: "absolute", bottom: -5, left: 16, transform: "rotate(45deg)", width: 8, height: 8, background: "#0f172a", borderRight: "1px solid rgba(148,163,184,0.2)", borderBottom: "1px solid rgba(148,163,184,0.2)" }} />
            </div>
          )}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#93c5fd", minWidth: 70, textAlign: "right" }}>{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        style={{ width: "100%", accentColor: "#3b82f6" }}
      />
    </div>
  );
}

function AssumptionsPanel({ assumptions, onChange, result, isRefreshing }) {
  const updateField = (field, value) => {
    onChange({ ...assumptions, [field]: Number(value) });
  };

  const baseScore = result?.score || 0;
  const g = assumptions.growth_rate_adjustment;
  const s = assumptions.owner_salary_adjustment;
  const c = assumptions.cost_structure_adjustment;
  const delta = Math.round(g * 0.15 + (-s / 10000) * 0.5 + (-c) * 0.2);
  const adjScore = Math.min(100, Math.max(0, baseScore + delta));
  const diff = adjScore - baseScore;
  const barColor = adjScore >= 80 ? "#1D9E75" : adjScore >= 65 ? "#EF9F27" : "#E24B4A";

  return (
    <div className="card">
      <h2 style={{ margin: "0 0 6px", fontSize: "1.1rem", color: "#f9fafb" }}>Adjust your assumptions</h2>
      <p className="card-subtext">Tweak these inputs to see how changes affect your score.</p>

      <div style={{ marginTop: 18 }}>
        <SliderRow
          label="If my sales grow by..."
          techLabel="Growth Rate Adjustment"
          techExplain="How much you expect revenue to increase or decrease. Affects your projected score."
          field="growth_rate_adjustment"
          min={-20} max={20} step={1}
          display={`${g > 0 ? "+" : ""}${g}%`}
          value={g}
          onChange={updateField}
        />
        <SliderRow
          label="If I pay myself..."
          techLabel="Owner Salary Adjustment"
          techExplain="Changing your owner salary affects your take-home (SDE) and overall business health score."
          field="owner_salary_adjustment"
          min={-50000} max={50000} step={5000}
          display={s === 0 ? "No change" : `${s > 0 ? "+" : "-"}$${Math.abs(s).toLocaleString()}`}
          value={s}
          onChange={updateField}
        />
        <SliderRow
          label="If my costs change by..."
          techLabel="Cost Structure Adjustment"
          techExplain="Simulates cutting or adding to your operating expenses — like hiring, rent changes, or new equipment."
          field="cost_structure_adjustment"
          min={-20} max={20} step={1}
          display={`${c > 0 ? "+" : ""}${c}%`}
          value={c}
          onChange={updateField}
        />
      </div>

      {baseScore > 0 && (
        <div style={{ marginTop: 4, paddingTop: 16, borderTop: "1px solid rgba(148,163,184,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Adjusted health score
            </div>
            {isRefreshing && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#60a5fa" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" style={{ animation: "spin 1s linear infinite" }}>
                  <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20" strokeDashoffset="8" strokeLinecap="round" />
                </svg>
                Recalculating...
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{
              fontSize: 28,
              fontWeight: 600,
              color: isRefreshing ? "#4b5563" : "#f9fafb",
              lineHeight: 1,
              transition: "color 0.2s ease",
            }}>
              {adjScore}
            </div>
            {!isRefreshing && diff !== 0 && (
              <div style={{ fontSize: 12, color: diff > 0 ? "#1D9E75" : "#EF9F27", fontWeight: 500 }}>
                {diff > 0 ? "▲ +" : "▼ "}{Math.abs(diff)} pts
              </div>
            )}
          </div>
          <div style={{ height: 6, background: "rgba(2,6,23,0.5)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              width: `${adjScore}%`,
              height: "100%",
              background: isRefreshing ? "#374151" : barColor,
              borderRadius: 4,
              transition: "width 0.3s ease, background 0.3s ease",
              opacity: isRefreshing ? 0.5 : 1,
            }} />
          </div>
          {isRefreshing && (
            <div style={{ fontSize: 11, color: "#4b5563", marginTop: 8, fontStyle: "italic" }}>
              Updating score and insights...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AssumptionsPanel;
