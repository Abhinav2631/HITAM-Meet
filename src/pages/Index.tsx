
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { VideoIcon, UserCircle, ShieldCheck, FileCheck, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-hitam-secondary/20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <header className="flex justify-between items-center mb-12 md:mb-16 animate-fade-in">
          <div className="flex items-center">
            <VideoIcon size={32} className="text-hitam-primary mr-2 animate-pop" />
            <h1 className="text-2xl font-bold text-hitam-primary">HITAM Meet Smart</h1>
          </div>
          
          <div>
            {isAuthenticated ? (
              <Button 
                className="bg-hitam-primary text-white hover:bg-hitam-tertiary transition-all duration-300 flex items-center gap-2"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
                <ArrowRight size={16} />
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="border-hitam-primary text-hitam-primary hover:bg-hitam-primary hover:text-white transition-all duration-300"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            )}
          </div>
        </header>

        <main>
          <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
            <div className="animate-slide-right">
              <h2 className="text-4xl md:text-5xl font-bold text-hitam-primary mb-6 leading-tight">
                A Meeting Platform Demo for HITAM College
              </h2>
              
              <p className="text-hitam-dark text-lg mb-8 leading-relaxed">
                Explore a browser-only meeting interface with local media previews, demo sign-in, 
                and academic workflow mockups. No accounts or meetings are connected to a server.
              </p>
              
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="w-full md:w-auto bg-hitam-primary text-white hover:bg-hitam-tertiary transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                  onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
                >
                  {isAuthenticated ? "Join a Meeting" : "Get Started"}
                  <ArrowRight size={18} />
                </Button>
              </div>
            </div>
            
            <div className="glassmorphism p-6 animate-float">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-hitam-primary/10 to-hitam-secondary/50 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                <VideoIcon size={64} className="text-hitam-primary" />
              </div>
            </div>
          </div>

          <div className="py-12">
            <h2 className="text-2xl md:text-3xl font-bold text-hitam-primary mb-12 text-center">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <UserCircle size={48} className="text-hitam-primary mb-4" />,
                  title: "Demo Sign-In",
                  description: "Try a browser-only sign-in flow. Email ownership and account roles are not verified."
                },
                {
                  icon: <ShieldCheck size={48} className="text-hitam-primary mb-4" />,
                  title: "Local Meeting Controls",
                  description: "Preview browser media and fullscreen controls. Audio and video are not shared remotely."
                },
                {
                  icon: <FileCheck size={48} className="text-hitam-primary mb-4" />,
                  title: "Academic Workflow Previews",
                  description: "Try local assignment and attendance interfaces. Email, submissions, and persistence are not connected."
                }
              ].map((feature, index) => (
                <div 
                  key={index} 
                  className="card hover:shadow-lg transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex flex-col items-center text-center">
                    {feature.icon}
                    <h3 className="text-xl font-bold text-hitam-primary mb-2">{feature.title}</h3>
                    <p className="text-hitam-dark/90 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="mt-16 text-center text-hitam-dark/70 text-sm pb-8 animate-fade-in">
          <p>© 2025 HITAM Meet Smart. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
