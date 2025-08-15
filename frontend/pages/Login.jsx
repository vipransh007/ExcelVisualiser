import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/context/AuthContext.jsx';

function Login() {
  // State for form data
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Ref for the video background
  const videoRef = useRef(null);
  
  // Initialize useNavigate and useAuth
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // Handle form submission
  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // Include cookies for session management
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login Successful:', data); // Log the response data
        console.log('User Data:', data.user); // Log the user data being set
        
        // Update the AuthContext with user data
        setUser(data.user);
        
        // Navigate to home page after successful login
        navigate('/');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error occurred');
    }
  };
  
  // Effect to ensure the background video plays
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Video autoplay was prevented:", error);
      });
    }
  }, []);

  return (
    <div className="relative flex items-center justify-center min-h-screen py-4 overflow-hidden">
      {/* Background Video */}
      <video
        ref={videoRef} 
        autoPlay
        loop
        muted
        playsInline 
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/websiteVideo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="flex items-center opacity-100 justify-center rounded-3xl bg-[#154a6fa1]">
        <div className="relative opacity-100 z-10 flex flex-col w-full max-w-md gap-8 p-8">
          <div className="flex flex-col justify-center text-center text-white">
            <h1 className="text-5xl font-bold tracking-tight">
              Login!
            </h1>
            <p className="mt-2 text-lg text-gray-100">
              Welcome! Please log in to continue.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500 text-white p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* --- Login Form --- */}
          <div className="flex flex-col justify-center">
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label htmlFor="username" className="sr-only">Username</label>
                <input 
                  type="text" 
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username" 
                  className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input 
                  type="password" 
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password" 
                  className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                Login
              </button>
              <div className="text-center">
                <p className="text-lg text-white">
                  Don't have an account? 
                  <a href="/signup" className="text-blue-600 hover:underline"> Sign Up</a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;