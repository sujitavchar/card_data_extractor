import { useState } from "react";
import ImagePickerSlot from "../components/ImagePickerSlot";
import { extractSingle } from "../services/api";
import { useNavigate } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import "./SingleScanScreen.css";

export default function SingleScanScreen() {
  const [file, setFile] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nav = useNavigate();

  const handleExtract = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await extractSingle(file, note);
      if (res) {
        nav("/result", { state: res });
      } else {
        setError("Failed to extract data. Please try again.");
      }
    } catch (e) {
      setError(e.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <UserHeader />

      <div className="app-container">
        <div className="scan-container">
          <div className="glass-panel scan-card">
            <div className="scan-header">
              <h2>Single Side Scan</h2>
              <p>Upload the front of the business card for extraction</p>
            </div>

            {error && <div className="scan-error">{error}</div>}

            <div className="scan-form">
              <ImagePickerSlot label="CARD IMAGE" onImageSelected={setFile} />
              
              <input 
                className="note-input"
                placeholder="Optional note (e.g. met at conference)" 
                value={note}
                onChange={(e) => setNote(e.target.value)} 
              />

              <button 
                className="extract-btn"
                disabled={!file || loading} 
                onClick={handleExtract}
              >
                {loading ? "Extracting Details..." : "Extract Data🚀"}
              </button>
            </div>

            <div className="back-link" onClick={() => nav("/extract")}>
              ← Back to options
            </div>
          </div>
        </div>
      </div>
    </>
  );
}