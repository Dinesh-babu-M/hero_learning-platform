import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../utils/googleSheet";
import "../styles/login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


 useEffect(() => {
    document.title = "Hero - Login";
    const user = localStorage.getItem("currentUser");
    if (!user) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage("");

    try {
      const result = await loginUser({ email, password });

      if (result.status === "success") {
        setStatusType("success");
        setStatusMessage(result.message || "Login successful!");
        localStorage.setItem("currentUser", JSON.stringify(result.user));
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        setStatusType("error");
        setStatusMessage(result.message || "Login failed.");
      }
    } catch (error) {
      setStatusType("error");
      setStatusMessage("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>welcome Hero!</h2>
          <h4>Login</h4>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {statusMessage && (
            <p className={`status-message ${statusType}`}>{statusMessage}</p>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <div className="spinner" /> : "Login"}
          </button>

          <button
            type="button"
            className="register-btn"
            onClick={() => navigate("/register")}
            disabled={loading}
          >
            Register
          </button>
        </form>
      </div>

      <div className="login-footer">
        <p>
          📘 Practice English from beginner to advanced level — learn through
          AI-powered games and tools!
        </p>
      </div>

      <style>{`
        .spinner {
          width: 18px;
          height: 18px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .status-message.success {
          color: green;
        }

        .status-message.error {
          color: red;
        }

        button[disabled] {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
};

export default Login;
