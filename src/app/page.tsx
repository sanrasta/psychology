"use client";

import { useState, useEffect, useRef, ReactNode, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { motion, AnimatePresence, useAnimation, useInView } from "framer-motion";
import Loading from "@/components/Loading";

// Simple static logo component instead of animated version
function Logo() {
  return (
    <div className="flex flex-col items-center space-y-3 mt-24 sm:mt-0">
      <div className="flex items-center space-x-1">
        <div className="w-5 h-5 bg-red-500 rounded-sm"></div>
        <div className="w-5 h-5 bg-blue-500 rounded-sm"></div>
        <div className="w-5 h-5 bg-green-500 rounded-sm"></div>
        <div className="w-5 h-5 bg-yellow-500 rounded-sm"></div>
      </div>
    </div>
  );
}

// Simplified static text component to reduce animation overhead
function AnimatedText() {
  return (
    <div className="relative h-20 overflow-hidden">
      <h1 className="text-center text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-white to-red-500 tracking-tight">
        TRANSFORM YOUR FITNESS
      </h1>
    </div>
  );
}

// Scroll-triggered animation section - optimized for performance with reduced scroll impact
function AnimatedSection({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: true, 
    amount: 0.1 // Reduce the visible amount needed to trigger
  });
  const controls = useAnimation();
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      className={className}
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 15 }, // Reduced distance to improve performance
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ 
        duration: 0.4, // Faster animations
        delay, 
        ease: "easeOut" 
      }}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const { isSignedIn, isLoaded } = useUser();
  const heroRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // Only redirect on initial sign in
  useEffect(() => {
    if (isLoaded && isSignedIn && window.location.pathname === '/') {
      const hasVisitedHome = sessionStorage.getItem('hasVisitedHome');
      if (!hasVisitedHome) {
        sessionStorage.setItem('hasVisitedHome', 'true');
        setIsLoading(true);
        router.push("/events");
      }
    }
  }, [isSignedIn, isLoaded, router]);

  // For navigation to events page
  const navigateToEvents = useCallback(() => {
    setIsLoading(true);
    router.push("/events");
  }, [router]);

  // Use useCallback for the scroll handler with debounce technique
  const handleScroll = useCallback(() => {
    // Use requestAnimationFrame to optimize scroll performance
    window.requestAnimationFrame(() => {
      setScrolled(window.scrollY > 100);
    });
  }, []);

  // Update scroll effect with useCallback, passive event listener and throttling
  useEffect(() => {
    let isScrolling = false;
    
    const throttledScrollHandler = () => {
      if (!isScrolling) {
        isScrolling = true;
        
        // Use requestAnimationFrame to align with browser refresh cycle
        window.requestAnimationFrame(() => {
          handleScroll();
          isScrolling = false;
        });
      }
    };
    
    window.addEventListener("scroll", throttledScrollHandler, { passive: true });
    return () => window.removeEventListener("scroll", throttledScrollHandler);
  }, [handleScroll]);

  // Use useCallback for toggle function
  const toggleMobileMenu = useCallback(() => 
    setMobileMenuOpen(prev => !prev), []);
    
  // Use useCallback for scroll function
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    if (window.location.hash) {
      history.pushState('', document.title, window.location.pathname + window.location.search);
    }
  }, []);

  return (
    <>
      {isLoading && <Loading />}
      <div className="bg-black overflow-auto">
        {/* Navbar */}
        <motion.header
          className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
            scrolled ? "bg-gray-800/90 backdrop-blur-sm" : "bg-black/50"
          }`}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            {/* Left Side: Show UserButton if signed in, otherwise show Logo */}
            <motion.div 
              className="flex items-center space-x-2 cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onClick={scrollToTop}
            >
              {isSignedIn ? <UserButton /> : <Image src="/rio.png" alt="Logo" width={50} height={50} className="rounded-full" />}
              <span className="text-2xl font-bold">
                Your <span className="text-red-500">Coaching</span>
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.nav 
              className="hidden md:flex space-x-6 text-lg items-center text-gray-200"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {["Services", "Testimonials", "Contact"].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="hover:text-red-500 relative group font-medium"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                >
                  {item}
                  <motion.span 
                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300"
                    initial={{ width: "0%" }}
                    whileHover={{ width: "100%" }}
                  />
                </motion.a>
              ))}
              
              {isSignedIn ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <button 
                    onClick={navigateToEvents}
                    className="hover:text-red-500 relative group font-medium"
                  >
                    Events
                    <motion.span 
                      className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300"
                      initial={{ width: "0%" }}
                      whileHover={{ width: "100%" }}
                    />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <SignInButton>
                    <button className="hover:text-red-500 relative group font-medium">
                      Bookings
                      <motion.span 
                        className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300"
                        initial={{ width: "0%" }}
                        whileHover={{ width: "100%" }}
                      />
                    </button>
                  </SignInButton>
                </motion.div>
              )}
              <button 
                className="hover:text-red-500 relative group font-medium"
                onClick={scrollToTop}
              >
                Home
                <motion.span 
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300"
                  initial={{ width: "0%" }}
                  whileHover={{ width: "100%" }}
                />
              </button>
            </motion.nav>

            {/* Mobile Hamburger */}
            <motion.div 
              className="md:hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <button onClick={toggleMobileMenu} className="focus:outline-none text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </motion.div>
          </div>
        </motion.header>

        {/* Fullscreen Mobile Menu with Smooth Transition */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center z-50"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {/* Close Button */}
              <motion.button 
                onClick={toggleMobileMenu} 
                className="absolute top-5 right-5 text-3xl text-white"
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                ✕
              </motion.button>

              {/* Navigation Links */}
              <nav className="flex flex-col space-y-6 text-3xl">
                <motion.button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    scrollToTop();
                  }}
                  className="hover:text-red-500 transition-all duration-300 text-3xl font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0, duration: 0.4 }}
                  whileHover={{ scale: 1.1, x: 10 }}
                >
                  Home
                </motion.button>
                
                {["Services", "Testimonials", "Contact"].map((item, index) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="hover:text-red-500 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.1, x: 10 }}
                  >
                    {item}
                  </motion.a>
                ))}
                
                {isSignedIn ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  >
                    <button 
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigateToEvents();
                      }}
                      className="hover:text-red-500 transition-all duration-300"
                    >
                      Events
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  >
                    <SignInButton>
                      <button 
                        className="hover:text-red-500 transition-all duration-300" 
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Bookings
                      </button>
                    </SignInButton>
                  </motion.div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section: Fullscreen background with animated text and particles */}
        <section id="hero" ref={heroRef} className="relative h-screen flex flex-col items-center justify-between py-24 overflow-hidden">
          {/* Background elements remain the same */}
          <div className="absolute inset-0 bg-gradient-radial from-gray-800/20 to-black/50 z-0"></div>
          
          <Image
            src="/rio.png"
            alt="Hero Background"
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            quality={75}
            style={{ objectFit: "cover" }}
            className="grayscale opacity-100"
            loading="eager"
            fetchPriority="high"
          />
          
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black"></div>

          {/* Content restructured for better positioning */}
          <div className="relative z-10 flex flex-col items-center justify-between h-full w-full px-4 max-w-5xl mx-auto">
            {/* Empty space at top to push logo to center */}
            <div className="flex-grow"></div>
            
            {/* Logo in center of screen */}
            <div className="mb-12">
              <Logo />
            </div>
            
            {/* Lower text section */}
            <div className="flex flex-col items-center mb-16">
              <div className="mb-8">
                <AnimatedText />
              </div>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl text-center">
                Elite coaching that transforms your fitness journey through personalized training and proven results.
              </p>

              <div
                className="hover:scale-105 transition-transform duration-300"
              >
                <SignInButton>
                  <Button className="bg-red-500 hover:bg-red-700 text-white text-lg md:text-2xl px-8 md:px-10 py-6 md:py-7 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.5)] font-bold transition-all duration-300 ease-in-out w-full md:w-auto">
                    <span className="relative">
                      Sign In & Book NOW!
                    </span>
                  </Button>
                </SignInButton>
              </div>
            </div>
          </div>
          
          {/* Scroll indicator at the very bottom */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
            <a
              href="#conversion"
              className="text-white flex flex-col items-center animate-bounce"
            >
              <span className="mb-2 text-sm uppercase tracking-widest">Discover More</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </section>

        {/* Conversion Section with animations - optimized for performance */}
        <section id="conversion" className="py-28 relative overflow-hidden">
          <div 
            className="absolute -top-20 -left-20 w-80 h-80 bg-red-500/10 rounded-full blur-3xl"
          />
          <div
            className="absolute -bottom-40 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          />
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <AnimatedSection>
              <h2 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight text-white">
                Transform Your <span className="text-red-500 relative">Body & Life
                  <span 
                    className="absolute -bottom-2 left-0 w-full h-1 bg-red-500/50"
                  />
                </span>
              </h2>
            </AnimatedSection>
            
            <AnimatedSection delay={0.2}>
              <p className="max-w-2xl mx-auto text-gray-300 text-xl mb-12 leading-relaxed">
                Discover the proven fitness strategies that turn hard work into rapid results.
                Our personalized coaching system is designed to help you achieve peak performance
                and unlock your ultimate potential.
              </p>
            </AnimatedSection>
            
            <AnimatedSection delay={0.4}>
              <div className="hover:scale-105 hover:-translate-y-1 transition-all duration-200">
                <Link href="#contact">
                  <Button className="bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-6 px-4 md:px-10 rounded-full text-base md:text-xl font-semibold shadow-lg transition-all duration-300 w-full md:w-auto">
                    <span className="block px-2 md:px-0">
                      <span className="hidden md:inline">Book Your Free Consultation Now</span>
                      <span className="md:hidden">Book Free Consultation</span>
                    </span>
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Services Section with animations */}
        <section id="services" className="py-28 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="text-center mb-16">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <h2 className="text-4xl md:text-6xl font-bold relative inline-block text-white">
                    Our <span className="text-red-500">Services</span>
                    <motion.div 
                      className="absolute -bottom-3 left-0 h-1 bg-red-500/30"
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </h2>
                </motion.div>
                <p className="text-gray-300 text-xl mt-6">
                  Elevate your training with personalized programs designed for{" "}
                  <span className="font-semibold text-red-500">optimal results</span>.
                </p>
              </div>
            </AnimatedSection>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Personal Training",
                  description: "Customized one-on-one sessions focused on your unique fitness goals.",
                  color: "red",
                  rgbColor: "239, 68, 68"
                },
                {
                  title: "Group Classes",
                  description: "High-energy group workouts that keep you motivated and accountable.",
                  color: "blue",
                  rgbColor: "59, 130, 246"
                },
                {
                  title: "Nutrition Coaching",
                  description: "Expert nutritional advice tailored to fuel your workouts and accelerate recovery.",
                  color: "green",
                  rgbColor: "34, 197, 94"
                }
              ].map((service, index) => (
                <AnimatedSection key={service.title} delay={0.2 * index}>
                  <motion.div 
                    className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl h-full group cursor-pointer"
                    whileHover={{ 
                      y: -10,
                      boxShadow: `0 10px 30px -5px rgba(${service.rgbColor},0.5)`
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                      "--glow-color": `rgba(${service.rgbColor}, 0.7)`,
                      "--glow-color-light": `rgba(${service.rgbColor}, 0.4)`
                    } as React.CSSProperties}
                  >
                    <motion.div 
                      className={`w-16 h-16 rounded-xl mb-6 flex items-center justify-center bg-${service.color}-500/20`}
                      animate={{ rotate: [0, 10, 0, -10, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className={`w-8 h-8 bg-${service.color}-500 rounded-lg`}></div>
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold mb-4">
                      <span className={`inline-block transition-all duration-300 group-hover:text-${service.color}-500 first-word`}>
                        {service.title.split(" ")[0]}
                      </span>{" "}
                      <span className={`text-${service.color}-500`}>
                        {service.title.split(" ").slice(1).join(" ")}
                      </span>
                    </h3>
                    <p className="text-gray-400 text-lg">
                      {service.description}
                    </p>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section - Professional Design */}
        <section id="testimonials" className="py-28 relative overflow-hidden">
          {/* Subtle background element */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 to-black/90 z-0"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-500/20 to-transparent"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <div className="flex flex-col items-center mb-16">
                <div className="inline-block mb-3">
                  <div className="w-10 h-1 bg-red-500 mx-auto"></div>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white">
                  Client <span className="text-red-500">Testimonials</span>
                </h2>
                <p className="text-gray-300 text-lg mt-4 max-w-2xl text-center">
                  Discover what our clients have to say about their transformative experiences with our premium coaching services.
                </p>
              </div>
            </AnimatedSection>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatedSection delay={0.1}>
                <motion.div 
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 relative overflow-hidden border border-gray-700/20 shadow-xl"
                  whileHover={{ y: -5, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.5)" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute top-0 right-0 w-40 h-40 -m-16 opacity-10">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-red-500">
                      <path d="M9 7.5l-4.5 4.5h3l-6 9h7.5l6-9h-3l4.5-4.5h-7.5z" fill="currentColor"/>
                    </svg>
                  </div>
                  
                  <div className="text-xl text-gray-200 font-light italic leading-relaxed mb-8">
                    "<span className="text-white font-medium">The personalized approach</span> at <span className="text-red-400">Your Coaching</span> helped me break through my plateau and achieve the body I've always wanted. The attention to detail in their programs is unmatched in the industry."
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-red-500/20 flex-shrink-0">
                      <Image
                        src="/rio.png"
                        alt="Client 1"
                        width={56}
                        height={56}
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-white text-lg">John Doe</p>
                      <div className="flex items-center">
                        <p className="text-gray-400 text-sm">Executive • Fitness Enthusiast</p>
                        <div className="flex ml-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
              
              <AnimatedSection delay={0.3}>
                <motion.div 
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 relative overflow-hidden border border-gray-700/20 shadow-xl"
                  whileHover={{ y: -5, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.5)" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute top-0 right-0 w-40 h-40 -m-16 opacity-10">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-red-500">
                      <path d="M9 7.5l-4.5 4.5h3l-6 9h7.5l6-9h-3l4.5-4.5h-7.5z" fill="currentColor"/>
                    </svg>
                  </div>
                  
                  <div className="text-xl text-gray-200 font-light italic leading-relaxed mb-8">
                    "Their coaching transformed <span className="text-white font-medium">not just my physique, but my mindset</span>. I now believe in achieving the impossible. The level of expertise and dedication from their team is exceptional."
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-red-500/20 flex-shrink-0">
                      <Image
                        src="/rio.png"
                        alt="Client 2"
                        width={56}
                        height={56}
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-white text-lg">Jane Smith</p>
                      <div className="flex items-center">
                        <p className="text-gray-400 text-sm">Professional Athlete • Marathon Runner</p>
                        <div className="flex ml-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Contact Section - Premium Design */}
        <section id="contact" className="py-32 relative overflow-hidden">
          {/* Premium background elements */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black/95 z-0"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-500/20 to-transparent"></div>
          
          {/* Animated accent elements - optimized for scroll performance */}
          <motion.div 
            className="absolute -top-40 right-0 w-96 h-96 rounded-full bg-red-500/5 blur-3xl"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          />
          <motion.div 
            className="absolute bottom-0 -left-40 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          />
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <div className="flex flex-col items-center mb-16">
                <div className="inline-block mb-3">
                  <div className="w-10 h-1 bg-red-500 mx-auto"></div>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white">
                  Premium <span className="text-red-500">Consultation</span>
                </h2>
                <p className="text-gray-300 text-lg mt-4 max-w-2xl text-center">
                  Elevate your fitness journey with a personalized consultation from our expert coaching team.
                </p>
              </div>
            </AnimatedSection>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 max-w-6xl mx-auto">
              {/* Left side info panel */}
              <AnimatedSection delay={0.1} className="md:col-span-2">
                <motion.div 
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/20 h-full shadow-xl"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2 flex items-center">
                        <motion.div 
                          initial={{ rotateY: 0 }}
                          animate={{ rotateY: 360 }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          className="mr-3 text-red-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </motion.div>
                        Why Choose Us
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        Our elite coaching team brings over 20 years of experience with a personalized approach that guarantees results.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2 flex items-center">
                        <motion.div 
                          animate={{ rotate: [0, 5, -5, 5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                          className="mr-3 text-red-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </motion.div>
                        Get in Touch
                      </h3>
                      <div className="space-y-3 pl-9">
                        <p className="text-white">contact@yourcoaching.com</p>
                        <p className="text-white">+1 (555) 123-4567</p>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                        <motion.div 
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="mr-3 text-red-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </motion.div>
                        Response Time
                      </h3>
                      <div className="flex items-center gap-2 pl-9">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <motion.div 
                            className="bg-gradient-to-r from-red-500 to-red-700 h-2 rounded-full"
                            initial={{ width: "0%" }}
                            whileInView={{ width: "90%" }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                        </div>
                        <span className="text-white font-medium">24h</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
              
              {/* Right side form */}
              <AnimatedSection delay={0.3} className="md:col-span-3">
                <motion.form 
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/20 shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="space-y-6">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                        Full Name
                      </label>
                      <motion.div 
                        whileHover={{ scale: 1.01 }} 
                        whileTap={{ scale: 0.99 }}
                        className="relative"
                      >
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <input
                          type="text"
                          id="name"
                          placeholder="Your Name"
                          className="pl-10 block w-full rounded-md border-gray-600 bg-gray-700/50 px-4 py-3 text-white placeholder-gray-400 focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all duration-200"
                        />
                      </motion.div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                        Email Address
                      </label>
                      <motion.div 
                        whileHover={{ scale: 1.01 }} 
                        whileTap={{ scale: 0.99 }}
                        className="relative"
                      >
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </span>
                        <input
                          type="email"
                          id="email"
                          placeholder="you@example.com"
                          className="pl-10 block w-full rounded-md border-gray-600 bg-gray-700/50 px-4 py-3 text-white placeholder-gray-400 focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all duration-200"
                        />
                      </motion.div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <label htmlFor="goal" className="block text-sm font-medium text-white mb-1">
                        Your Fitness Goal
                      </label>
                      <motion.div 
                        whileHover={{ scale: 1.01 }} 
                        whileTap={{ scale: 0.99 }}
                        className="relative"
                      >
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <select
                          id="goal"
                          className="pl-10 block w-full rounded-md border-gray-600 bg-gray-700/50 px-4 py-3 text-white placeholder-gray-400 focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all duration-200"
                          defaultValue=""
                        >
                          <option value="" disabled>Select your primary goal</option>
                          <option value="weight-loss">Weight Loss</option>
                          <option value="muscle-gain">Muscle Gain</option>
                          <option value="endurance">Endurance Training</option>
                          <option value="sport">Sport-Specific Training</option>
                        </select>
                      </motion.div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <label htmlFor="message" className="block text-sm font-medium text-white mb-1">
                        Message
                      </label>
                      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <textarea
                          id="message"
                          rows={4}
                          placeholder="Tell us about your fitness journey and goals"
                          className="block w-full rounded-md border-gray-600 bg-gray-700/50 px-4 py-3 text-white placeholder-gray-400 focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all duration-200"
                        ></textarea>
                      </motion.div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="pt-4"
                    >
                      <motion.button
                        type="submit"
                        whileHover={{ 
                          scale: 1.03, 
                          boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.4)" 
                        }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 relative overflow-hidden group"
                      >
                        <motion.span
                          className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                        <motion.span 
                          className="relative flex items-center justify-center"
                        >
                          Submit Request
                          <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </motion.span>
                      </motion.button>
                      
                      <p className="text-center text-sm text-gray-400 mt-4">
                        We'll respond to your inquiry within 24 hours
                      </p>
                    </motion.div>
                  </div>
                </motion.form>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              About <span className="text-red-500">Us</span>
            </h2>
            <p className="max-w-2xl mx-auto text-gray-300 text-lg">
              At <span className="font-semibold text-red-500">Your Coaching</span>, we blend expert fitness training with a passion for health.
              Our mission is to empower you to reach new heights, both physically and mentally.
              Experience a revolutionary approach to fitness that drives real, measurable results.
            </p>
          </div>
        </section>

         {/* Footer */}
         <footer className="py-8 bg-black">
          <div className="container mx-auto px-4 text-center text-gray-500">
            &copy; {new Date().getFullYear()} Your Coaching. All rights reserved.
          </div>
        </footer>
              
      </div>
    </>
  );
}