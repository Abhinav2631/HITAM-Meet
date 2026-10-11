
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "host";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string, role: "student" | "host") => Promise<boolean>;
  signup: (email: string, role: "student" | "host") => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isHost: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check localStorage for user data
    const storedUser = localStorage.getItem("hitam-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const signup = async (email: string, role: "student" | "host"): Promise<void> => {
    // In a real app, this would create a new account and send OTP
    console.log(`Creating new ${role} account for ${email}`);
    toast({
      title: "Account Setup",
      description: `A verification code has been sent to ${email}`,
    });
    // Store email and role temporarily
    localStorage.setItem("temp-email", email);
    localStorage.setItem("temp-role", role);
    // Let's pretend the OTP is 123456 for demo purposes
    localStorage.setItem("temp-otp", "123456");
  };

  const login = async (email: string): Promise<void> => {
    // In a real app, this would call an API to send OTP
    console.log(`Sending OTP to ${email}`);
    toast({
      title: "OTP Sent",
      description: `A verification code has been sent to ${email}`,
    });
    // In reality, we would store a temporary session and send an actual email
    localStorage.setItem("temp-email", email);
    // Let's pretend the OTP is 123456 for demo purposes
    localStorage.setItem("temp-otp", "123456");
  };

  const verifyOtp = async (email: string, otp: string, role: "student" | "host"): Promise<boolean> => {
    // In a real app, this would validate with an API
    const tempOtp = localStorage.getItem("temp-otp");
    
    if (otp === tempOtp) {
      // Use stored role for login flow or the passed role for signup flow
      const userRole = localStorage.getItem("temp-role") || role;
      
      // Simulate successful authentication
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 15),
        email,
        name: email.split("@")[0],
        role: userRole as "student" | "host",
      };
      
      setUser(newUser);
      localStorage.setItem("hitam-user", JSON.stringify(newUser));
      localStorage.removeItem("temp-email");
      localStorage.removeItem("temp-otp");
      localStorage.removeItem("temp-role");
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("hitam-user");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        verifyOtp,
        logout,
        isAuthenticated: !!user,
        isHost: user?.role === "host",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
