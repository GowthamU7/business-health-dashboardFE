function InputPanel({
  inputMode,
  setInputMode,
  rawText,
  setRawText,
  selectedFile,
  setSelectedFile,
  onAnalyze,
  onLoadSample,
  loading,
}) {
  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  return (
    <div className="card">
      <div className="tabs">
        <button
          className={`tab-btn ${inputMode === "text" ? "active" : ""}`}
          onClick={() => setInputMode("text")}
          type="button"
        >
          Paste Text
        </button>

        <button
          className={`tab-btn ${inputMode === "csv" ? "active" : ""}`}
          onClick={() => setInputMode("csv")}
          type="button"
        >
          Upload CSV
        </button>

        <button
          className={`tab-btn ${inputMode === "pdf" ? "active" : ""}`}
          onClick={() => setInputMode("pdf")}
          type="button"
        >
          Upload PDF
        </button>
      </div>

      <h2>Financial Input</h2>
      <p className="card-subtext">
        Paste a P&amp;L summary, upload a CSV, or upload a PDF to generate a live business health dashboard.
      </p>

      {inputMode === "text" ? (
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste financial data here..."
        />
      ) : (
        <div className="upload-box">
          <input
            type="file"
            accept={inputMode === "csv" ? ".csv" : ".pdf"}
            onChange={handleFileChange}
          />

          <div className="file-meta">
            {selectedFile ? (
              <>
                <div className="file-name">{selectedFile.name}</div>
                <div className="file-size">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </div>
              </>
            ) : (
              <div className="file-placeholder">
                No file selected yet.
              </div>
            )}
          </div>
        </div>
      )}

      <div className="input-actions">
        <button className="secondary-btn" onClick={onLoadSample} type="button">
          Load Sample Input
        </button>

        <button className="primary-btn" onClick={onAnalyze} disabled={loading} type="button">
          {loading ? "Analyzing..." : "Analyze Business"}
        </button>
      </div>
    </div>
  );
}

export default InputPanel;