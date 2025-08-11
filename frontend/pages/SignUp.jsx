import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SignUp() {
  // --- STATE AND HOOKS (Must be at the top level) ---
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const videoRef = useRef(null);
  const navigate = useNavigate();

  // --- EVENT HANDLERS ---
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSignup = async (event) => { 
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!username.trim() || !email.trim() || !password.trim() || !avatar) {
      setError('Username, Email, Password, and Avatar are required.');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('username', username.trim());
    formData.append('email', email.trim());
    formData.append('password', password);
    formData.append('avatar', avatar);
    if (coverImage) {
      formData.append('coverImage', coverImage);
    } 

    try {
      // The vite proxy will forward this request to http://localhost:5000/api/v1/users/register
      const response = await fetch('/api/v1/users/register', {
        method: 'POST',
        body: formData,
        // Do not set Content-Type header manually for multipart/form-data with fetch.
        // The browser will set it automatically with the correct boundary.
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Signup Successful:', data);
        navigate('/login'); 
      } else {
        // Use the error message from the backend response
        setError(data.message || 'Signup failed. Please try again.');
      }
      
    } catch (error) {
      console.error('Signup error:', error);
      setError('Cannot connect to the backend. Please ensure the server is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Effect to play the background video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Video autoplay was prevented:", error);
      });
    }
  }, []);

  // --- RENDER ---
  return (
    <div className="relative flex items-center justify-center min-h-screen py-10 overflow-hidden">
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

      <div className="relative z-10 flex items-center justify-center rounded-3xl bg-[#154a6fa1] p-8">
        <div className="flex flex-col w-full max-w-md gap-6">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold tracking-tight">Sign Up</h1>
            <p className="mt-2 text-lg text-gray-100">Welcome! Create an account to continue.</p>
          </div>

          {error && (
            <div className="bg-red-500 text-white p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSignup}>
            <div>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username" 
                className="w-full px-4 py-3 text-gray-700 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email" 
                className="w-full px-4 py-3 text-gray-700 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" 
                className="w-full px-4 py-3 text-gray-700 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center space-x-4">
              {avatarPreview && (
                <img src={avatarPreview} alt="Avatar Preview" className="w-16 h-16 rounded-full object-cover" />
              )}
              <label htmlFor="avatar" className="cursor-pointer w-full text-center py-3 font-semibold text-white bg-gray-500 rounded-lg hover:bg-gray-600">
                {avatar ? 'Avatar Selected ✓' : 'Upload Avatar *'}
              </label>
              <input 
                type="file" 
                id="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden" 
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col items-center space-y-2">
              <label htmlFor="coverImage" className="cursor-pointer w-full text-center py-3 font-semibold text-white bg-gray-500 rounded-lg hover:bg-gray-600">
                {coverImage ? 'Cover Image Selected ✓' : 'Upload Cover Image'}
              </label>
              <input 
                type="file" 
                id="coverImage"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="hidden" 
                disabled={isSubmitting}
              />
              {coverImagePreview && (
                <img src={coverImagePreview} alt="Cover Preview" className="w-full h-32 rounded-lg object-cover mt-2" />
              )}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing Up...' : 'Sign Up'}
            </button>

            <div className="text-center">
              <p className="text-lg text-white">
                Already have an account? 
                <a href="/login" className="text-blue-300 hover:underline ml-1">Log In</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
