"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      // Redirect to signup if not authenticated
      window.location.href = '/auth/signup';
    } else {
      // Handle search for authenticated users
      window.location.href = `/dashboard?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-500 rounded-full animate-spin animate-reverse"></div>
          <div className="absolute inset-2 w-12 h-12 border-2 border-purple-300 border-b-purple-500 rounded-full animate-spin duration-1000"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"
          style={{
            left: mousePosition.x * 0.05,
            top: mousePosition.y * 0.05,
            transition: 'all 0.6s ease-out'
          }}
        />
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-bounce duration-8000" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse duration-6000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-pink-400/10 to-violet-400/10 rounded-full blur-2xl animate-spin duration-20000" />
      </div>

      {/* Enhanced Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/30 shadow-2xl shadow-purple-500/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
              InterviewAI
            </Link>
            <div className="flex items-center space-x-6">
              {session ? (
                <>
                  <span className="text-gray-700 hidden sm:block font-medium px-3 py-1 bg-white/50 rounded-full">
                    Hello, {session.user.username} 👋
                  </span>
                  <Link
                    href="/dashboard"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-purple-500/25"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-gray-600 hover:text-purple-600 transition-colors duration-300 px-3 py-1 rounded-full hover:bg-white/50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium px-4 py-2 rounded-full hover:bg-white/50"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-purple-500/25"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section className="pt-32 pb-16 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
                Practice. Improve.
              </span>
              <br />
              <span className="text-gray-800 drop-shadow-sm">Get Hired.</span>
            </h1>
          </div>
          <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
              Job interviews can be tough — but practice makes perfect. With our <span className="font-semibold text-purple-600 px-1 py-0.5 bg-purple-50 rounded">AI-powered interview simulator</span>, you can rehearse real questions, get <span className="font-semibold text-blue-600 px-1 py-0.5 bg-blue-50 rounded">instant feedback</span>, and track your progress over time.
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced Search Bar Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <form onSubmit={handleSearchSubmit} className="relative group">
              <div className="relative animate-float">
                {/* Levitation shadow */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-4/5 h-6 bg-purple-300/40 rounded-full blur-2xl animate-pulse"></div>
                
                {/* Floating glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-r from-purple-500/40 via-blue-500/40 to-indigo-500/40 rounded-4xl transition-all duration-500 blur-2xl ${searchFocused ? 'scale-115 opacity-70' : 'scale-100 opacity-40'}`}></div>
                
                {/* Main search container */}
                <div className={`relative bg-white/95 backdrop-blur-xl rounded-4xl border-3 transition-all duration-500 shadow-3xl hover:shadow-purple-500/30 ${searchFocused ? 'border-purple-400 shadow-purple-500/50 scale-105' : 'border-purple-200 hover:border-purple-300'}`}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder={session ? "Search interview topics, questions, or skills..." : "Try 'software engineer interview' or 'behavioral questions'"}
                    className="w-full px-12 py-10 pl-20 pr-52 text-2xl rounded-4xl bg-transparent focus:outline-none transition-all duration-300 placeholder-gray-500 font-medium"
                  />
                  <div className="absolute left-8 top-1/2 transform -translate-y-1/2">
                    <svg className={`w-12 h-12 transition-all duration-300 ${searchFocused ? 'text-purple-600 scale-110' : 'text-purple-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <button
                    type="submit"
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-12 py-6 rounded-3xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl font-bold text-xl"
                  >
                    {session ? "Search" : "Start"} ✨
                  </button>
                </div>
              </div>
              
              {!session && (
                <div className="text-center mt-10 p-8 bg-white/70 backdrop-blur-sm rounded-3xl border border-white/40 shadow-xl animate-bounce-subtle">
                  <p className="text-gray-600 text-xl">
                    <Link href="/auth/signup" className="text-purple-600 hover:text-purple-700 font-bold transition-colors duration-300 hover:underline text-2xl">Sign up free</Link> to start practicing with AI-powered interviews 🚀
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🤖",
                title: "AI-Powered",
                description: "Smart questions that adapt to your responses and industry",
                gradient: "from-purple-500 to-pink-500",
                hoverGradient: "from-purple-600 to-pink-600"
              },
              {
                icon: "⚡",
                title: "Instant Feedback",
                description: "Real-time analysis of your answers with actionable insights",
                gradient: "from-blue-500 to-cyan-500",
                hoverGradient: "from-blue-600 to-cyan-600"
              },
              {
                icon: "🎯",
                title: "Targeted Practice",
                description: "Industry-specific scenarios tailored to your career goals",
                gradient: "from-indigo-500 to-purple-500",
                hoverGradient: "from-indigo-600 to-purple-600"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white/70 backdrop-blur-lg p-8 rounded-3xl border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:bg-white/80 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} group-hover:bg-gradient-to-br group-hover:${feature.hoverGradient} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-2xl`}>
                    <span className="text-3xl filter drop-shadow-sm">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-purple-700 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-3xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="py-16 px-6 bg-white/40 backdrop-blur-lg border-t border-white/30 mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 hover:scale-105 transition-transform duration-300 inline-block">
              InterviewAI
            </div>
            <p className="text-gray-600 mb-8">
              © 2024 InterviewAI. Built for your success. ✨
            </p>
            <div className="flex justify-center space-x-8 text-sm text-gray-500">
              <a href="#" className="hover:text-purple-600 transition-colors duration-300 hover:underline">Privacy</a>
              <a href="#" className="hover:text-purple-600 transition-colors duration-300 hover:underline">Terms</a>
              <a href="#" className="hover:text-purple-600 transition-colors duration-300 hover:underline">Support</a>
              <a href="#" className="hover:text-purple-600 transition-colors duration-300 hover:underline">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
