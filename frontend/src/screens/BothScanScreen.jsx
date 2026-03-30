import { useState } from "react";
import ImagePickerSlot from "../components/ImagePickerSlot";
import { extractBothSides } from "../services/api";
import { useNavigate } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import "./BothScanScreen.css";

export default function BothScanScreen() {
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nav = useNavigate();

  const handleExtract = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await extractBothSides(front, back, note);
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
        <div className="both-scan-container">
          <div className="glass-panel both-scan-card">
            <div className="scan-header">
              <h2>Both Sides Scan</h2>
              <p>Upload the front and back of the business card for best results</p>
            </div>

            {error && <div className="scan-error">{error}</div>}

            <div className="scan-form">
              <div className="slots-wrapper">
                <ImagePickerSlot label="FRONT SIDE" onImageSelected={setFront} />
                <ImagePickerSlot label="BACK SIDE" onImageSelected={setBack} />
              </div>
              
              <input 
                className="note-input"
                placeholder="Optional note (e.g. met at conference)" 
                value={note}
                onChange={(e) => setNote(e.target.value)} 
              />

              <button 
                className="extract-btn"
                disabled={!front || !back || loading} 
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