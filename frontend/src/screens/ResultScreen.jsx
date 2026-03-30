import { useLocation, useNavigate } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import "./ResultScreen.css";

const knownOrder = [
  "name",
  "designation",
  "company",
  "email",
  "phone",
  "phone_no",
  "website",
  "address",
];

const ignoredFields = ["id", "created_at", "user_id", "scanned_by"];

export default function ResultScreen() {
  const { state } = useLocation();
  const nav = useNavigate();

  if (!state) {
    return (
      <>
        <UserHeader />
        <div className="app-container">
          <div className="glass-panel" style={{padding: 40, textAlign: 'center'}}>
            <h2 style={{marginBottom: 16}}>No Data Available</h2>
            <button className="primary" onClick={() => nav("/extract")}>Go to Scanner</button>
          </div>
        </div>
      </>
    );
  }

  const openLink = (key, value) => {
    if (!value || typeof value !== 'string') return;

    const lowerKey = key.toLowerCase();
    if (lowerKey === "email") window.location.href = `mailto:${value}`;
    if (lowerKey === "phone" || lowerKey === "phone_no") window.location.href = `tel:${value}`;
    if (lowerKey === "website") {
      const url = value.startsWith('http') ? value : `https://${value}`;
      window.open(url, '_blank');
    }
  };

  const isClickable = (key) => {
    const lowerKey = key.toLowerCase();
    return ["email", "phone", "phone_no", "website"].includes(lowerKey);
  };

  const formatKeyName = (key) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const renderValue = (value) => {
    if (value === null || value === undefined) return "N/A";
    
    if (typeof value === "object") {
      if (Object.keys(value).length === 0) return "Empty";
      
      return (
        <div className="nested-value">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="nested-item">
              <span>{formatKeyName(k)}</span>
              <span>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
            </div>
          ))}
        </div>
      );
    }
    return String(value);
  };

  // Combine and sort data
  const orderedKeys = [];
  const otherKeys = [];

  Object.keys(state).forEach(key => {
    if (ignoredFields.includes(key.toLowerCase())) return;
    const val = state[key];
    if (!val || val === "NA") return; // skip empty
    
    // Sort logic
    if (knownOrder.includes(key.toLowerCase())) {
      orderedKeys.push(key);
    } else {
      otherKeys.push(key);
    }
  });

  // Sort orderedKeys based on knownOrder index
  orderedKeys.sort((a, b) => knownOrder.indexOf(a.toLowerCase()) - knownOrder.indexOf(b.toLowerCase()));

  const allKeysToRender = [...orderedKeys, ...otherKeys];

  return (
    <>
      <UserHeader />

      <div className="app-container">
        <div className="result-container">
          
          <div className="result-header">
            <h2>Extracted Details</h2>
            <div className="result-actions">
              <button className="action-btn primary" onClick={() => nav("/extract")}>
                New Scan
              </button>
              <button className="action-btn" onClick={() => nav("/cards")}>
                View Cards
              </button>
            </div>
          </div>

          <div className="grid-section">
            <div className="fields-grid">
              {allKeysToRender.map((key) => {
                const val = state[key];
                const clickableClass = isClickable(key) ? "clickable" : "";

                return (
                  <div
                    key={key}
                    className={`glass-panel result-field-card ${clickableClass}`}
                    onClick={() => openLink(key, val)}
                  >
                    <div className="field-label">{formatKeyName(key)}</div>
                    <div className="field-value">{renderValue(val)}</div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}