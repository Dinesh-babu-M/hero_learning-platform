import React, { useEffect, useState } from "react";

export default function About() {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = () => {
    const aboutSection = document.querySelector('.about');
    const rect = aboutSection.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom >= 0) {
      setIsVisible(true);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-r from-gray-800 to-gray-900 text-white about">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center">
        
        {/* Left Side Content */}
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h2 className="text-3xl font-bold text-center md:text-left mb-8 text-yellow-400">
            About Us
          </h2>

          <ul className="text-lg text-center md:text-left text-gray-300 leading-relaxed space-y-4">
            <li className={`animate-text ${isVisible ? 'animate-slide-left' : ''}`}>
              Empowering the next generation of innovators through accessible and engaging AI education.
            </li>
            <li className={`animate-text ${isVisible ? 'animate-slide-left' : ''}`}>
              Interactive courses, mentorship, and a supportive community to guide your learning journey.
            </li>
            <li className={`animate-text ${isVisible ? 'animate-slide-left' : ''}`}>
              Develop the skills to apply AI techniques to real-world problems, advancing your career.
            </li>
            <li className={`animate-text ${isVisible ? 'animate-slide-left' : ''}`}>
              Transform your future with our dynamic, AI-powered platform tailored to your needs.
            </li>
          </ul>
        </div>

        {/* Right Side Image */}
        <div className="md:w-1/2">
          <div className="relative">
            <img 
              src="/image/about.jpeg" 
              alt="AI Learning Platform" 
              className="w-full h-auto rounded-full shadow-xl transform transition-all duration-500 hover:scale-105 hover:shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
