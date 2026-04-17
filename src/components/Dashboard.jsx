import { useState } from "react";

function formatCurrency(value) {
  if (!value) return "$0";
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}k`;
  return `$${Math.round(value)}`;
}

function ScoreGauge({ score }) {
  const radius = 52;
  const cx = 70;
  const cy = 70;
  const startAngle = 210;
  const sweep = 300;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const arcPath = (start, end) => {
    const s = toRad(start);
    const e = toRad(end);
    const x1 = cx + radius * Math.cos(s);
    const y1 = cy + radius * Math.sin(s);
    const x2 = cx + radius * Math.cos(e);
    const y2 = cy + radius * Math.sin(e);
    const large = end - start > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  };

  const scoreSweep = (score / 100) * sweep;
  const scoreEnd = startAngle + scoreSweep;
  const scoreColor = score >= 80 ? "#1D9E75" : score >= 65 ? "#EF9F27" : "#E24B4A";

  return (
    <svg width="140" height="100" viewBox="0 0 140 100">
      <path d={arcPath(startAngle, startAngle + sweep)} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="9" strokeLinecap="round" />
      <path d={arcPath(startAngle, scoreEnd)} fill="none" stroke={scoreColor} strokeWidth="9" strokeLinecap="round" />
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize="26" fontWeight="600" fill="#f9fafb">{score}</text>
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize="11" fill="#9ca3af">/ 100</text>
    </svg>
  );
}

// Tooltip component — shows plain label + technical term + explanation
function MetricCard({ plainLabel, techLabel, techExplain, value, highlight }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ background: "rgba(2,6,23,0.5)", border: "1px solid rgba(148,163,184,0.12)", borderRadius: 14, padding: "14px 16px", position: "relative", cursor: "default" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
        <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {plainLabel}
        </div>
        <div style={{ width: 14, height: 14, borderRadius: "50%", border: "1px solid rgba(148,163,184,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#6b7280", flexShrink: 0, lineHeight: 1 }}>
          ?
        </div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 600, color: highlight || "#f8fafc", wordBreak: "break-word" }}>
        {value}
      </div>

      {/* Tooltip */}
      {hovered && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#0f172a",
          border: "1px solid rgba(148,163,184,0.2)",
          borderRadius: 10,
          padding: "10px 13px",
          width: 210,
          zIndex: 100,
          pointerEvents: "none",
        }}>
          <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {techLabel}
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.55 }}>
            {techExplain}
          </div>
          {/* arrow */}
          <div style={{ position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%) rotate(45deg)", width: 8, height: 8, background: "#0f172a", borderRight: "1px solid rgba(148,163,184,0.2)", borderBottom: "1px solid rgba(148,163,184,0.2)" }} />
        </div>
      )}
    </div>
  );
}

function InsightItem({ text, type }) {
  const colors = {
    good: { bg: "rgba(29,158,117,0.1)", dot: "#1D9E75" },
    risk: { bg: "rgba(239,159,39,0.1)", dot: "#EF9F27" },
    fix: { bg: "rgba(55,138,221,0.1)", dot: "#378ADD" },
  };
  const c = colors[type];
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", borderRadius: 10, background: c.bg, fontSize: 13, lineHeight: 1.55, color: "#e5e7eb", marginBottom: 8 }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot, flexShrink: 0, marginTop: 5 }} />
      {text}
    </div>
  );
}

const CHART_COLORS = ["#378ADD", "#1D9E75", "#7F77DD"];

// Plain label → { techLabel, techExplain, chartLabel }
const METRIC_META = {
  revenue:      { plain: "Total sales",        tech: "Revenue",       explain: "All money coming into the business before any costs are taken out." },
  gross_margin: { plain: "Profit per dollar",  tech: "Gross Margin",  explain: "How many cents you keep from each $1 of sales after paying direct costs like labor and materials." },
  yoy_growth:   { plain: "Growth this year",   tech: "YoY Growth",    explain: "How much your sales grew compared to the same period last year." },
  ebitda:       { plain: "Business profit",    tech: "EBITDA",        explain: "Earnings Before Interest, Taxes, Depreciation & Amortization — what the business makes before accounting adjustments. Used by brokers to value your business." },
  ebitda_margin:{ plain: "Profit margin",      tech: "EBITDA Margin", explain: "What percentage of your total sales turns into business profit." },
  owner_sde:    { plain: "Your take-home",     tech: "Owner SDE",     explain: "Seller's Discretionary Earnings — the total financial benefit you personally get from owning this business, including your salary." },
};

function Dashboard({ result }) {
  const { score, grade, rationale, metrics, parsed_data, ai_insights } = result;
  const status = score >= 85 ? "Strong" : score >= 70 ? "Stable" : score >= 55 ? "Watchlist" : "At Risk";
  const scoreColor = score >= 80 ? "#1D9E75" : score >= 65 ? "#EF9F27" : "#E24B4A";
  const scoreBg = score >= 80 ? "rgba(29,158,117,0.12)" : score >= 65 ? "rgba(239,159,39,0.12)" : "rgba(226,74,74,0.12)";
  const ebitdaMargin = metrics.revenue > 0 ? ((metrics.ebitda / metrics.revenue) * 100).toFixed(1) : "—";

  const chartData = [
    { name: "Total sales",     plainName: "Total sales",    value: metrics.revenue },
    { name: "Business profit", plainName: "Business profit",value: metrics.ebitda },
    { name: "Your take-home",  plainName: "Your take-home", value: metrics.owner_sde },
  ];
  const maxVal = Math.max(metrics.revenue, metrics.ebitda, metrics.owner_sde, 1);

  return (
    <div style={{ marginTop: 22 }}>
      {/* Score Row */}
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 24, padding: "22px 28px", flexWrap: "wrap" }}>
        <ScoreGauge score={score} />
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: scoreBg, color: scoreColor, fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, marginBottom: 10 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: scoreColor }} />
            {status} · Grade {grade}
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#9ca3af", lineHeight: 1.65, maxWidth: 520 }}>{rationale}</p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Business health score</div>
          <div style={{ fontSize: 34, fontWeight: 600, color: "#f9fafb", lineHeight: 1 }}>
            {score}<span style={{ fontSize: 16, color: "#9ca3af", fontWeight: 400 }}>/100</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid — 3 columns with tooltips */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12, marginTop: 16 }} className="metrics-grid-3">
        <MetricCard
          plainLabel={METRIC_META.revenue.plain}
          techLabel={METRIC_META.revenue.tech}
          techExplain={METRIC_META.revenue.explain}
          value={formatCurrency(metrics.revenue)}
        />
        <MetricCard
          plainLabel={METRIC_META.gross_margin.plain}
          techLabel={METRIC_META.gross_margin.tech}
          techExplain={METRIC_META.gross_margin.explain}
          value={`${metrics.gross_margin}%`}
        />
        <MetricCard
          plainLabel={METRIC_META.yoy_growth.plain}
          techLabel={METRIC_META.yoy_growth.tech}
          techExplain={METRIC_META.yoy_growth.explain}
          value={`${metrics.yoy_growth > 0 ? "+" : ""}${metrics.yoy_growth}%`}
          highlight={metrics.yoy_growth > 0 ? "#1D9E75" : metrics.yoy_growth < 0 ? "#E24B4A" : null}
        />
        <MetricCard
          plainLabel={METRIC_META.ebitda.plain}
          techLabel={METRIC_META.ebitda.tech}
          techExplain={METRIC_META.ebitda.explain}
          value={formatCurrency(metrics.ebitda)}
        />
        <MetricCard
          plainLabel={METRIC_META.ebitda_margin.plain}
          techLabel={METRIC_META.ebitda_margin.tech}
          techExplain={METRIC_META.ebitda_margin.explain}
          value={`${ebitdaMargin}%`}
        />
        <MetricCard
          plainLabel={METRIC_META.owner_sde.plain}
          techLabel={METRIC_META.owner_sde.tech}
          techExplain={METRIC_META.owner_sde.explain}
          value={formatCurrency(metrics.owner_sde)}
        />
      </div>

      {/* Insights + Chart two-column */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16, marginTop: 16 }} className="two-col-insights">
        {/* Insights */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div className="insights-section-label">What's working</div>
          {ai_insights?.strengths?.map((item, i) => <InsightItem key={i} text={item} type="good" />)}
          <div className="insights-section-label" style={{ marginTop: 14 }}>What's risky</div>
          {ai_insights?.risks?.map((item, i) => <InsightItem key={i} text={item} type="risk" />)}
          <div className="insights-section-label" style={{ marginTop: 14 }}>What to fix first</div>
          {ai_insights?.fix_first?.map((item, i) => <InsightItem key={i} text={item} type="fix" />)}
        </div>

        {/* Chart */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16, fontWeight: 500 }}>
            Where your money goes
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {chartData.map((item, i) => {
              const pct = Math.round((item.value / maxVal) * 90);
              return (
                <div key={item.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>
                    <span>{item.plainName}</span>
                    <span style={{ color: "#f8fafc", fontWeight: 500 }}>{formatCurrency(item.value)}</span>
                  </div>
                  <div style={{ background: "rgba(2,6,23,0.5)", borderRadius: 6, height: 28, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 6, background: CHART_COLORS[i], transition: "width 0.4s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
            {chartData.map((item, i) => (
              <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9ca3af" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: CHART_COLORS[i] }} />
                {item.plainName}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(148,163,184,0.1)", fontSize: 12, color: "#9ca3af" }}>
            Business
            <div style={{ fontSize: 15, fontWeight: 600, color: "#f8fafc", marginTop: 4 }}>{parsed_data.business_name}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
