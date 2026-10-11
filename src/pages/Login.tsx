
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Mail, ArrowLeft, Shield, UserPlus, LogIn, User, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { validateHitamEmail } from "@/utils/emailValidator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, verifyOtp, signup } = useAuth();
  
  const [authType, setAuthType] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState<"student" | "host">("student");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your college email address",
        variant: "destructive",
      });
      return;
    }
    
    // Validate college email domain
    if (!validateHitamEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "You must use a valid @hitam.org email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (authType === "login") {
        // Send OTP to email for login
        await login(email);
        // Store role for login flow
        localStorage.setItem("temp-role", role);
      } else {
        // Send OTP to email for signup
        await signup(email, role);
      }
      setStep("otp");
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: "Unable to send verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      toast({
        title: "OTP Required",
        description: "Please enter the verification code sent to your email",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await verifyOtp(email, otp, role);
      
      if (success) {
        toast({
          title: authType === "login" ? "Login Successful" : "Account Created",
          description: authType === "login" 
            ? `You have been logged in successfully as ${role}` 
            : `Your ${role} account has been created successfully`,
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Invalid OTP",
          description: "The verification code is incorrect. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: "Unable to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-hitam-primary to-hitam-secondary flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step === "email" ? (
          <Card>
            <CardHeader>
              <div className="flex items-center mb-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate("/")}
                  className="mr-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle>HITAM Meet Smart</CardTitle>
              </div>
              <CardDescription>
                Try the browser-only sign-in demo for HITAM Meet Smart
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={authType} onValueChange={(value) => setAuthType(value as "login" | "signup")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login" className="flex items-center gap-1">
                    <LogIn className="h-4 w-4" />
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="flex items-center gap-1">
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                
                <form onSubmit={handleSubmitEmail}>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="email"
                          placeholder="your.name@hitam.org"
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="pl-9"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Only @hitam.org email addresses are allowed
                      </p>
                    </div>
                    
                    {/* Always show account type selection for both login and signup */}
                    <div className="flex flex-col space-y-1.5">
                      <Label>Account Type</Label>
                      <RadioGroup 
                        value={role} 
                        onValueChange={(value) => setRole(value as "student" | "host")}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 cursor-pointer">
                          <RadioGroupItem value="student" id="student" />
                          <Label htmlFor="student" className="cursor-pointer flex-1">
                            <div className="font-medium flex items-center">
                              <GraduationCap className="h-4 w-4 mr-2" />
                              Student
                            </div>
                            <div className="text-xs text-muted-foreground">Join meetings and participate in classes</div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 cursor-pointer">
                          <RadioGroupItem value="host" id="host" />
                          <Label htmlFor="host" className="cursor-pointer flex-1">
                            <div className="font-medium flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              Host
                            </div>
                            <div className="text-xs text-muted-foreground">Create and manage meetings for your classes</div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button variant="ghost" onClick={() => navigate("/")} type="button">
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-hitam-success hover:bg-green-600 text-white"
                    >
                      {isLoading ? "Sending..." : authType === "login" ? "Continue" : "Create Account"}
                    </Button>
                  </div>
                </form>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center mb-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setStep("email")}
                  className="mr-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle>Verify your identity</CardTitle>
              </div>
              <CardDescription>
                Enter the verification code sent to {email}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleVerifyOtp}>
              <CardContent>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="otp">Verification Code</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="otp"
                        placeholder="123456"
                        type="text"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <Shield className="h-3 w-3 mr-1" />
                      <span>For demo purposes, the OTP is: 123456</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep("email")}
                  type="button"
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-hitam-success hover:bg-green-600 text-white"
                >
                  {isLoading ? "Verifying..." : authType === "login" ? "Sign in" : "Create Account"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Login;
