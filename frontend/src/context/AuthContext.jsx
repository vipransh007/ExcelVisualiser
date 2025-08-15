import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create a custom hook to easily use the context
export const useAuth = () => {
    return useContext(AuthContext);
};

// 3. Create the Provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // To know when the initial check is complete

    // This effect runs when the app starts to check if a user is already logged in
    useEffect(() => {
        const verifyUser = async () => {
            try {
                console.log('Verifying user on app load...');
                // The browser automatically sends the cookies with this request
                const response = await axios.get('/api/v1/users/current-user');
                // console.log('Current user response:', response.data);
                if (response.data && response.data.user) {
                    // console.log('Setting user from response:', response.data.user);
                    setUser(response.data.user); // Set user data if the token is valid
                }
            } catch (error) {
                console.log("User not authenticated or session expired:", error);
                setUser(null); // No user is logged in
            } finally {
                setLoading(false); // Finished the initial check
            }
        };

        verifyUser();
    }, []); // The empty array ensures this runs only once on app load

    // Function to handle user logout
    const logout = async () => {
        try {
            await axios.post('/api/v1/users/logout');
            setUser(null); // Clear user state on the frontend
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const value = {
        user,
        isAuthenticated: !!user, // A boolean to easily check if logged in
        loading,
        logout,
        setUser: (newUser) => {
            console.log('setUser called with:', newUser);
            setUser(newUser);
        }, // Add setUser to allow components to update user state
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
