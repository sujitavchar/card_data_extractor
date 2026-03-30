import { useNavigate } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import "./ExtractScreen.css";

export default function ExtractScreen() {
  const nav = useNavigate();

  return (
    <>
      <UserHeader />

      <div className="app-container">
        <div className="extract-container">
          <div className="cards-wrapper">
            <div className="glass-panel action-card" onClick={() => nav("/single")}>
              <div className="icon-wrapper">
                📄
              </div>
              <h3>Single Side</h3>
              <p>Scan a single-sided business card front to extract details.</p>
            </div>

            <div className="glass-panel action-card" onClick={() => nav("/both")}>
              <div className="icon-wrapper">
                📑
              </div>
              <h3>Both Sides</h3>
              <p>Scan both front and back of a business card for comprehensive details.</p>
            </div>
          </div>

          <div className="glass-panel view-cards-banner" onClick={() => nav("/cards")}>
            <div className="banner-content">
              <h3>My Scanned Cards</h3>
              <p>View your history of previously scanned and extracted business cards.</p>
            </div>
            <div className="arrow-icon">→</div>
          </div>
        </div>
      </div>
    </>
  );
}