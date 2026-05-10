import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
    token: string | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/admin/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('admin_token', data.token);
                setToken(data.token);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};