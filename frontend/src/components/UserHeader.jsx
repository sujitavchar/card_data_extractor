import { useAuth } from "../contexts/AuthContext";
import "./UserHeader.css";

export default function UserHeader() {
  const { user, loading, logout } = useAuth();

  if (loading || !user) return null; 

  // Safely extract the nested user object from the state
  const User = user?.user || user;

  console.log(User)

  const initial = User?.name ? User.name.charAt(0).toUpperCase() : "?";

  return (
    <div className="user-header-wrapper">
      <div className="user-header">
        <div className="user-greeting">
          <div className="avatar-circle">{initial}</div>
          <span className="user-name">Hi {User?.name || "..."}</span>
        </div>
        <button className="logout-btn" onClick={logout}>Sign Out</button>
      </div>
    </div>
  );
}