import React, { useEffect, useState } from "react";

const testimonials = [
  { 
    name: 'Dinesh.', 
    quote: 'AI Learning helped me improve my English quickly, and the lessons were easy to follow!' 
  },
  { 
    name: 'Logesh.', 
    quote: 'I learned English with real-world scenarios and it helped me land a job in tech. Great platform!' 
  },
]

export default function Testimonials() {
  const [inView, setInView] = useState([false, false]);

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

    const elements = document.querySelectorAll(".testimonial");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect(); // Clean up observer
  }, []);

  return (
    <section className="py-20 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10 text-yellow-400">What Our Learners Say</h2>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`testimonial bg-gray-900 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ${
                inView[i] ? (i % 2 === 0 ? "animate-slide-left" : "animate-slide-right") : ""
              }`}
            >
              <p className="italic mb-4 text-gray-300">"{t.quote}"</p>
              <h4 className="font-semibold text-yellow-400">- {t.name}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
