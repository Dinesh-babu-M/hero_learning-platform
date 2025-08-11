import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';  
import '../styles/homepage.css';  

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();  

  const handleScroll = () => {
    const hero = document.querySelector('.hero');
    const rect = hero.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom >= 0) {
      setIsVisible(true);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    console.log('isVisible:', isVisible); 
  }, [isVisible]);

  const handleGetStarted = () => {
    navigate('/login'); 
  };

  const handleLogin = () => {
    navigate('/login');  
  };

  return (
    <section className="min-h-screen bg-gradient-to-r from-gray-800 via-gray-900 to-black flex items-center justify-center text-center py-24 md:py-32 px-6 md:px-12 hero">
      <div className="text-white max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-8 animate-text">
          Unlock the Power of 
           <span className={`highlight ${isVisible ? 'animate-shakes' : ''} text-yellow-400`}> AI</span>
          <span className={`highlight ${isVisible ? 'animate-shake' : ''}`}> English Learning</span>

          {/* <span className={`highlight ${isVisible ? 'animate-shake' : ''} animate-plink text-yellow-400`}>
            AI
          </span> & 
          <span className={`highlight ${isVisible ? 'animate-shake' : ''}`}>
            English Learning
          </span> */}
          
        </h1>

        <p className="text-xl md:text-2xl mb-8 animate-text-delay">
          Transform your learning experience with AI-powered lessons. Learn English in your native language, anytime, anywhere!
        </p>

        <div className="flex justify-center gap-6">
          <button
            className="animate-text-delay bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gradient-to-r hover:from-yellow-400 hover:to-yellow-500 transition ease-in-out duration-300"
            onClick={handleGetStarted}  
          >
            Try now
          </button>
          <button
            className="animate-text-delay bg-transparent text-white px-8 py-4 rounded-full border-2 border-white text-lg font-semibold hover:bg-white hover:text-black transition ease-in-out duration-300"
            onClick={handleLogin}  
          >
            Login
          </button>
        </div>
      </div>
    </section>
  );
}
