'use client';

import { useState, useEffect } from 'react';


export default function Home() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');

  // Check if device is mobile and set appropriate background
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Set background image based on device type
      if (mobile) {
        // Randomly select between img-its1.jpg to img-its4.jpg for mobile
        const randomNum = Math.floor(Math.random() * 4) + 1;
        setBackgroundImage(`/img-its${randomNum}.jpg`);
      } else {
        // Use img-desk.jpg for desktop
        setBackgroundImage('/img-desk.jpg');
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      const response = await fetch('/api/submit-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setSubmitted(true);
        setError('');
      } else {
        setError('Failed to submit. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <main className={`min-h-screen flex flex-col bg-gradient-to-b from-red-700 to-pink-500 ${isMobile ? 'backdrop-blur-sm' : ''}`}>
      {/* Main content area with conditional background image */}
      <div 
        className="flex-1 flex items-center p-4 md:p-8 relative"
        style={{
          backgroundImage: backgroundImage ? `url('${backgroundImage}')` : 'none',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        {/* Overlay for better text readability */}
        {/* <div className="absolute inset-0 bg-black bg-opacity-40"></div> */}
        
        <div className="container mx-auto flex justify-start md:justify-center relative z-10">
          <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-md w-full md:ml-16 lg:ml-24 xl:ml-32">
            <h1 className="text-2xl md:text-3xl font-bold text-center md:text-left text-gray-800 mb-4 md:mb-6">
              Meet divorcees, single moms, and sexy cougars looking for a young stud!
            </h1>
            <p className="text-gray-600 text-center md:text-left mb-4 md:mb-6">
              Enter your email below to create your free, private account.
            </p>
            
            {submitted ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                Thank you! Check your email to complete registration.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                  {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105"
                >
                  Get Started
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="text-white p-4 md:p-6 text-xs">
        <div className="max-w-4xl mx-auto">
          <p className="mb-4">
            Its Just Sex is a private portal for real people who want exactly that no drama, no games, just honest connections, sexting, and casual fun 
            with locals who are on the same page. There are no pornstars, escorts, or scammers allowed only everyday people looking to explore their sexuality in a safe, 
            discreet, and exciting space. Drop your email above to see if you qualify for free membership and get instant access to one of the most trusted hookup communities online.
          </p>
          
          <p className="mb-4">
            © 2025 ItsJustSex.org, All rights reserved. Disclaimer: This website contains adult material. 
            All members and persons appearing on this site have contractually represented to us that they 
            are 18 years of age or older. 18 U.S.C. 2257 Record Keeping Requirements Compliance Statement.
          </p>
        </div>
      </footer>
    </main>
  );
}