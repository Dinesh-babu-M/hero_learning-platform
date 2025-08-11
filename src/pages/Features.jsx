import React, { useEffect, useState } from "react";
import { FaChalkboardTeacher, FaUserGraduate, FaCertificate } from "react-icons/fa";

const features = [
  { 
    title: 'Interactive Courses', 
    description: 'Learn AI with hands-on projects and quizzes.',
    icon: <FaChalkboardTeacher className="text-3xl text-white mb-4" />
  },
  { 
    title: 'Expert Mentors', 
    description: 'Get guidance from industry experts in AI & ML.',
    icon: <FaUserGraduate className="text-3xl text-white mb-4" />
  },
  { 
    title: 'Certifications', 
    description: 'Earn certificates to showcase your skills.',
    icon: <FaCertificate className="text-3xl text-white mb-4" />
  },
]

export default function Features() {
  const [inView, setInView] = useState([false, false, false]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setInView((prev) => {
              const newInView = [...prev];
              newInView[index] = true;
              return newInView;
            });
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of the element is in the viewport
    );

    const elements = document.querySelectorAll(".feature");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect(); // Clean up observer
  }, []);

  return (
    <section className="py-20 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-yellow-400">Why Choose Us?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className={`feature p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ${inView[i] ? (i % 2 === 0 ? "animate-slide-left" : "animate-slide-right") : ""}`}
            >
              <div className="flex justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-yellow-400">{f.title}</h3>
              <p className="text-gray-300">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
