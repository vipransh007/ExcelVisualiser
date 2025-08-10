import React, { useState, useRef, useEffect } from 'react';
// The useNavigate hook was removed as it was causing an error.
// import { useNavigate } from 'react-router-dom';

function SignUp() {
  // State to hold the preview URLs for the images
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  
  // Ref for the video background
  const videoRef = useRef(null);
  // const navigate = useNavigate(); // This line was causing the error.

  // Handler for when a file is selected for the avatar
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Handler for when a file is selected for the cover image
  const handleCoverImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCoverImagePreview(URL.createObjectURL(file));
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
    <div className="relative flex items-center justify-center min-h-screen py-10 overflow-hidden">
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

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center rounded-3xl bg-[#154a6fa1] p-8">
        <div className="flex flex-col w-full max-w-md gap-6">
          <div className="flex flex-col justify-center text-center text-white">
            <h1 className="text-5xl font-bold tracking-tight">
              Sign Up
            </h1>
            <p className="mt-2 text-lg text-gray-100">
              Welcome! Create an account to continue.
            </p>
          </div>

          {/* --- Sign Up Form --- */}
          <div className="flex flex-col justify-center">
            <form className="space-y-4">
              {/* Username Input */}
              <div>
                <label htmlFor="username" className="sr-only">Username</label>
                <input 
                  type="text" 
                  id="username"
                  placeholder="Username" 
                  className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <input 
                  type="email" 
                  id="email"
                  placeholder="Email" 
                  className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              
              {/* Password Input */}
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input 
                  type="password" 
                  id="password"
                  placeholder="Password" 
                  className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              {/* Avatar Upload */}
              <div className="flex items-center space-x-4">
                {avatarPreview && (
                  <img src={avatarPreview} alt="Avatar Preview" className="w-16 h-16 rounded-full object-cover" />
                )}
                <label htmlFor="avatar" className="cursor-pointer w-full mx-auto text-center py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-all">
                  Upload Avatar Image
                </label>
                <input 
                  type="file" 
                  id="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden" 
                />
              </div>

              {/* Cover Image Upload */}
              <div className="flex flex-col items-center space-y-2">
                <label htmlFor="coverImage" className="cursor-pointer w-full text-center py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-all">
                  Upload Cover Image
                </label>
                <input 
                  type="file" 
                  id="coverImage"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden" 
                />
                {coverImagePreview && (
                  <img src={coverImagePreview} alt="Cover Preview" className="w-full h-32 rounded-lg object-cover mt-2" />
                )}
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                Sign Up
              </button>

              {/* Link to Login */}
              <div className="text-center">
                <p className="text-lg text-white">
                  Already have an account? 
                  {/* This was changed to a standard link to fix the error */}
                  <a href="/login" className="text-blue-900 hover:underline ml-1">Log In</a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
