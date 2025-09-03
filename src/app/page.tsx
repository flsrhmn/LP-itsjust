'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
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
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <main className={`min-h-screen flex flex-col bg-gradient-to-b from-pink-500 to-red-700 ${isMobile ? 'backdrop-blur-sm' : ''}`}>
      {/* Main content area */}
      <div className="flex-1 flex items-center p-4 md:p-8">
        <div className="container mx-auto flex justify-start md:justify-center">
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
      <footer className="bg-black text-white p-4 md:p-6 text-xs">
        <div className="max-w-4xl mx-auto">
          <p className="mb-4">
            ItsJustSex.org is where millennials come to trade naked photos and hookup online. 
            We are a private community established for those how enjoy connecting with other locals 
            to exchange sext messages. ItsJustSex.org IS NOT FOR Pornstars, Escorts, or internet 
            scammers who try to exploit the sexual desires of others. ItsJustSex is for ordinary 
            everyday people who want to explore their sexuality. Whether you are looking to exchange 
            sext messages with an older woman, or just want to meet locals for hookups, ItsJustSex 
            makes it happen! put your email above to see if you qualify to join. Once qualified, will 
            be given a free membership to one of the best sexting and hookup sites that has been hand 
            picked for its quality and high success rate.
          </p>
          
          <p className="mb-4">
            © 2025 ItsJustSex.org, All rights reserved. Disclaimer: This website contains adult material. 
            All members and persons appearing on this site have contractually represented to us that they 
            are 18 years of age or older. 18 U.S.C. 2257 Record Keeping Requirements Compliance Statement.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <a href="https://www.datinghelp.net/" className="hover:underline">Site Issue</a>
            <a href="https://www.datinghelp.net/" className="hover:underline">Contact</a>
            <a href="https://www.datinghelp.net/" className="hover:underline">Billing</a>
            <a href="https://www.datinghelp.net/" className="hover:underline">Report Abuse</a>
          </div>
        </div>
      </footer>
    </main>
  );
}