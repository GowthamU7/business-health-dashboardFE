import { useEffect, useRef, useState } from "react";
import { analyzeBusiness, analyzeBusinessFile } from "./api";
import InputPanel from "./components/InputPanel";
import Dashboard from "./components/Dashboard";
import AssumptionsPanel from "./components/AssumptionsPanel";
import "./index.css";

const SAMPLE_INPUT = `Business: Riverside Landscaping LLC · FY 2023
Revenue: $1,840,000
COGS (labor + materials): $1,102,000
Gross Profit: $738,000 (40.1%)
Operating Expenses: $312,000
— Owner salary: $120,000
— Rent: $36,000
— Marketing: $28,000
— Misc: $128,000
EBITDA: $426,000
Owner SDE: ~$546,000
YoY Revenue Growth: +14%
Employees: 11 FT, 4 seasonal
Notes: Lost one major HOA contract in Q4. New equipment lease starts Jan 2024.`;

function App() {
  const [inputMode, setInputMode] = useState("text");
  const [rawText, setRawText] = useState(SAMPLE_INPUT);
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [assumptions, setAssumptions] = useState({
    growth_rate_adjustment: 0,
    owner_salary_adjustment: 0,
    cost_structure_adjustment: 0,
  });

  // Prevent debounce refresh from firing before first real analysis
  const hasAnalyzedRef = useRef(false);

  const runAnalysis = async (currentAssumptions, showMainLoading = false) => {
    try {
      if (showMainLoading) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      let data;

      if (inputMode === "text") {
        if (!rawText.trim()) return;
        data = await analyzeBusiness({
          raw_text: rawText,
          assumptions: currentAssumptions,
        });
      } else {
        if (!selectedFile) return;
        data = await analyzeBusinessFile({
          file: selectedFile,
          assumptions: currentAssumptions,
        });
      }

      setResult(data);
    } catch (error) {
      console.error("Analysis failed:", error);

      if (showMainLoading) {
        const message =
          error?.response?.data?.detail || "Failed to analyze business data.";
        alert(message);
      }
    } finally {
      if (showMainLoading) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  const handleAnalyze = async () => {
    if (inputMode !== "text" && !selectedFile) {
      alert("Please upload a file first.");
      return;
    }

    hasAnalyzedRef.current = true;
    await runAnalysis(assumptions, true);
  };

  const handleAssumptionChange = (updatedAssumptions) => {
    setAssumptions(updatedAssumptions);
  };

  const handleLoadSample = () => {
    setInputMode("text");
    setSelectedFile(null);
    setRawText(SAMPLE_INPUT);
  };

  useEffect(() => {
    if (!hasAnalyzedRef.current) return;

    const timer = setTimeout(() => {
      runAnalysis(assumptions, false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [assumptions, inputMode, rawText, selectedFile]);

  return (
    <div className="app-shell">
      <div className="hero">
        <h1>Business Health Dashboard</h1>
        <p>Upload or paste financials and get a live business health score in seconds.</p>
      </div>

      <div className="grid-layout">
        <div>
          <InputPanel
            inputMode={inputMode}
            setInputMode={setInputMode}
            rawText={rawText}
            setRawText={setRawText}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            onAnalyze={handleAnalyze}
            onLoadSample={handleLoadSample}
            loading={loading}
          />
        </div>

        <div>
          <AssumptionsPanel
            assumptions={assumptions}
            onChange={handleAssumptionChange}
            result={result}
            isRefreshing={isRefreshing}
          />
        </div>
      </div>

      {result ? (
        <>
          {isRefreshing && (
            <div className="loading-banner">
              Updating analysis...
            </div>
          )}

          <div className={isRefreshing ? "dashboard dim" : "dashboard"}>
            <Dashboard result={result} />
          </div>
        </>
      ) : (
        <div className="empty-state">
          Your dashboard will appear here after analysis.
        </div>
      )}
    </div>
  );
}

export default App;