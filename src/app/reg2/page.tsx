'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<{city: string; count: number} | null>(null);

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
    
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate a 3-second process (without saving to database)
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // For testing: Skip the API call and use mock data
      setSubmitted(true);
      setUserData({
        city: 'your city', // Mock city for testing
        count: Math.floor(Math.random() * 5) + 6 // Random between 6-10
      });
      
      // COMMENTED OUT: The actual API call to save email
      /*
      const response = await fetch('/api/submit-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSubmitted(true);
        setUserData({
          city: data.city || 'Your City',
          count: data.count || Math.floor(Math.random() * 5) + 6
        });
      } else {
        setError('Failed to submit. Please try again.');
      }
      */
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={`min-h-screen flex flex-col bg-gradient-to-b from-purple-700 to-blue-500 ${isMobile ? 'backdrop-blur-sm' : ''}`}>
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
        <div className="absolute inset-0 bg-opacity-40"></div>
        
        <div className="container mx-auto flex justify-start md:justify-center relative z-10">
          <div className="bg-blue-500/30 rounded-lg shadow-xl p-6 md:p-8 max-w-md w-full md:ml-16 lg:ml-24 xl:ml-32 backdrop-blur-sm">
          {/* Logo Section - Centered at the top */}
            <div className="flex justify-center mb-6">
              {isMobile ? (
                <Image 
                  src="/logo-mob.png" 
                  alt="Logo" 
                  width={220} 
                  height={60} 
                  className="object-contain"
                />
              ) : (
                <Image 
                  src="/logo-desk.png" 
                  alt="Logo" 
                  width={550} 
                  height={105} 
                  className="object-contain"
                />
              )}
            </div>
            {isLoading ? (
              // Loading animation
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white">Locating Online Users Near You</p>
                <p className="text-sm text-white mt-2">This may take a few seconds</p>
              </div>
            ) : submitted && userData ? (
              // Success screen
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-6">CONGRATULATIONS!</h2>
                
                <div className="space-y-3 text-left mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-white">Your email is eligible for a free account.</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-white">Your location is confirmed.</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-white">We found {userData.count} users online near {userData.city} available.</span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    // Redirect to Google.com for testing
                    window.location.href = 'https://google.com';
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105"
                >
                  Continue
                </button>
              </div>
            ) : (
              // Initial form
              <>
                <h1 className="text-white text-2xl md:text-3xl font-bold text-center md:text-left mb-4 md:mb-6">
                  Hook Up with Playful, Wild Singles Close to Home!
                </h1>
                <h2 className="text-white text-2xl md:text-xl text-center md:text-left mb-4 md:mb-6">
                  Join thousands connecting with wild, playful women in their area. Enjoy private chats, easy meetups, and zero drama.
                </h2>
                <p className="text-white text-center md:text-left mb-4 md:mb-6">
                  
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="text-white w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      required
                      disabled={isLoading}
                    />
                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-b from-yellow-300 to-yellow-600 text-black font-bold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : 'GET STARTED'}
                  </button>
                </form>
              </>
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