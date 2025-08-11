import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/login.css';
import { registerUser } from '../utils/googleSheet';

const Register = () => {
  const navigate = useNavigate();

  
  useEffect(() => {
    document.title = "Hero - Register";
    const user = localStorage.getItem("currentUser");
    if (user) {
      navigate("/dashboard"); 
    }
  }, [navigate]);

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    city: '', state: '', country: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(form).some(field => field.trim() === '')) {
      setError('All fields are required');
      setSuccess('');
      return;
    }

    setLoading(true);
    const result = await registerUser(form);
    setLoading(false);

    if (result.status === "success") {
      setSuccess(result.message);
      setError('');
      setForm({
        name: '', email: '', password: '', phone: '',
        city: '', state: '', country: ''
      });
      setTimeout(() => navigate('/login'), 1500);
    } else {
      setError(result.message);
      setSuccess('');
    }
  };

  return (
    
    <motion.div className="login-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        
      
        <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />

        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <span onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <input type="text" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />
        <input type="text" name="city" placeholder="City" value={form.city} onChange={handleChange} required />
        <input type="text" name="state" placeholder="State" value={form.state} onChange={handleChange} required />
        <input type="text" name="country" placeholder="Country" value={form.country} onChange={handleChange} required />

        {error && <p className="status-message error">{error}</p>}
        {success && <p className="status-message success">{success}</p>}

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? <div className="spinner"></div> : "Register"}
        </button>

        <button type="button" className="register-btn" onClick={() => navigate('/login')} disabled={loading}>
          Back to Login
        </button>
      </form>
      

      {/* Inline Spinner Styles */}
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

        button[disabled] {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .status-message.success {
          color: green;
        }

        .status-message.error {
          color: red;
        }
      `}</style>
    </motion.div>
  );
};

export default Register;
