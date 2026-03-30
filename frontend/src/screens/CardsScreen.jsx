import { useEffect, useState } from "react";
import { getAllCards } from "../services/api";
import { useNavigate } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import "./CardsScreen.css";

export default function CardsScreen() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await getAllCards();
        if (res && res.success) {
          setCards(res.data);
        } else {
          setError("Failed to load cards.");
        }
      } catch (e) {
        setError(e.toString());
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  const handleCardClick = (cardData) => {
    // We can pass the raw DB card back to ResultScreen.
    // Ensure we parse complex fields if ResultScreen expects it, 
    // but passing 'cardData' directly is a good start as known fields match.
    nav("/result", { state: cardData });
  };

  return (
    <>
      <UserHeader />
      <div className="app-container">
        <div className="cards-header">
          <h2>My Scanned Cards</h2>
          <button className="back-btn" onClick={() => nav("/extract")}>
            Back to Scan
          </button>
        </div>

        {error && <span className="error-text" style={{textAlign: 'center', fontSize: '1rem'}}>{error}</span>}

        {loading ? (
          <div className="loader-container">
             <div className="spinner" />
          </div>
        ) : (
          <div className="cards-container">
            {cards.length === 0 && !error ? (
              <div className="glass-panel empty-state">
                You haven't scanned any cards yet.
              </div>
            ) : (
              <div className="cards-grid">
                {cards.map((card) => (
                  <div 
                    key={card.id} 
                    className="glass-panel card-item"
                    onClick={() => handleCardClick(card)}
                  >
                    <div className="card-header-row">
                      <div>
                        <div className="card-name">{card.name || "Unknown"}</div>
                        <div className="card-company">{card.company || card.designation || ""}</div>
                      </div>
                      <div className="card-date">
                        {new Date(card.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {card.email && (
                      <div className="card-detail">
                        <span>Email</span>
                        <span>{card.email}</span>
                      </div>
                    )}
                    {card.phone_no && (
                      <div className="card-detail">
                        <span>Phone</span>
                        <span>{card.phone_no}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
