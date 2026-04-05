/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { 
  Monitor, 
  Smartphone, 
  Wifi, 
  Zap, 
  QrCode, 
  Layers, 
  ShieldCheck, 
  Gamepad2, 
  Presentation, 
  GraduationCap, 
  Cpu, 
  Globe,
  ArrowRight,
  CheckCircle2,
  Activity
} from "lucide-react";

const Section = ({ children, className = "", id = "" }: { children: React.ReactNode, className?: string, id?: string }) => (
  <section id={id} className={`py-20 px-6 md:px-12 lg:px-24 ${className}`}>
    <div className="max-w-7xl mx-auto">
      {children}
    </div>
  </section>
);

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all duration-300 backdrop-blur-sm"
  >
    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </motion.div>
);

const TechBadge = ({ name }: { name: string }) => (
  <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-blue-300">
    {name}
  </span>
);

export default function App() {
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [cameraStream, setCameraStream] = React.useState<MediaStream | null>(null);
  const [isARMode, setIsARMode] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const cameraVideoRef = React.useRef<HTMLVideoElement>(null);
  const [error, setError] = React.useState<string | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      // Use ideal to fallback gracefully on devices with only one camera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: "environment" } } 
      });
      setCameraStream(stream);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Camera access failed. Please ensure you are using a device with a camera and have granted permission.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  React.useEffect(() => {
    if (cameraVideoRef.current && cameraStream) {
      cameraVideoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, isARMode]);

  React.useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isARMode]);

  const [isCalibrating, setIsCalibrating] = React.useState(false);
  const [projectionScale, setProjectionScale] = React.useState(0.75);

  const [useSampleVideo, setUseSampleVideo] = React.useState(false);
  const [showDisclaimer, setShowDisclaimer] = React.useState(true);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const playVideo = () => {
    if (videoRef.current) videoRef.current.play().catch(e => console.log("Play blocked:", e));
    if (cameraVideoRef.current) cameraVideoRef.current.play().catch(e => console.log("Camera play blocked:", e));
  };

  const [isTorchOn, setIsTorchOn] = React.useState(false);

  const toggleFlashlight = async () => {
    if (cameraStream) {
      try {
        const track = cameraStream.getVideoTracks()[0];
        const capabilities = (track as any).getCapabilities?.() || {};
        if (capabilities.torch) {
          await (track as any).applyConstraints({
            advanced: [{ torch: !isTorchOn }]
          });
          setIsTorchOn(!isTorchOn);
        } else {
          setError("Your device hardware doesn't support flashlight control from the browser.");
        }
      } catch (err) {
        console.error("Flashlight error:", err);
      }
    }
  };

  const [projectionBrightness, setProjectionBrightness] = React.useState(1.2);
  const [projectionContrast, setProjectionContrast] = React.useState(1.1);

  const toggleARMode = () => {
    if (!isARMode) {
      startCamera();
      setIsCalibrating(true);
      setTimeout(() => setIsCalibrating(false), 3000);
    } else {
      stopCamera();
    }
    setIsARMode(!isARMode);
  };

  const startCapture = async () => {
    try {
      setError(null);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        setError("Your browser does not support screen mirroring. Please try a modern browser like Chrome or Edge.");
        return;
      }

      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor",
        },
        audio: false,
      });

      setStream(mediaStream);
      
      // Use a timeout to ensure the video element is rendered before setting srcObject
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
      
      mediaStream.getVideoTracks()[0].onended = () => {
        stopCapture();
      };
    } catch (err: any) {
      console.error("Error capturing screen:", err);
      
      if (err.name === 'NotAllowedError') {
        setError("Permission denied. Please allow screen capture when prompted.");
      } else if (err.name === 'SecurityError') {
        setError("Mirroring is blocked in this view. Try opening the app in a new tab using the button below.");
      } else {
        setError(`Error: ${err.message || "Failed to start mirroring."}`);
      }
    }
  };

  const stopCapture = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-gray-200 font-sans selection:bg-blue-500/30">
      {/* Hardware Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-[#121214] border border-white/10 rounded-3xl p-8 text-center shadow-2xl"
          >
            <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Zap className="text-blue-500" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Project Presentation Mode</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              This application is a <span className="text-blue-400 font-bold">Technical Prototype</span>. 
              Standard smartphones do not have built-in laser projectors. 
              <br /><br />
              Use the <span className="text-white font-bold">Virtual Wall Demo</span> to simulate how the system projects onto a wall using AR technology.
            </p>
            <button 
              onClick={() => setShowDisclaimer(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              I Understand, Start Presentation
            </button>
          </motion.div>
        </div>
      )}

      {/* Hardware Limitation Notice */}
      <div className="bg-amber-500/10 border-y border-amber-500/20 py-3 px-6 text-center">
        <p className="text-amber-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <Zap size={14} /> Hardware Note: This app simulates projection. Physical wall projection requires an external laser module.
        </p>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Monitor size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">WallBeam</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#overview" className="hover:text-blue-400 transition-colors">Overview</a>
            <a href="#process" className="hover:text-blue-400 transition-colors">Process</a>
            <a href="#tech" className="hover:text-blue-400 transition-colors">Tech</a>
            <a href="#hardware" className="hover:text-blue-400 transition-colors">Hardware</a>
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleARMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${isARMode ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}
            >
              {isARMode ? <ShieldCheck size={16} /> : <Zap size={16} />}
              {isARMode ? 'Exit Wall Demo' : 'Virtual Wall Demo'}
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-lg shadow-blue-600/20">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Project Overview */}
      <Section id="overview" className="pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Zap size={14} /> Innovative Tech Project
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Mobile-to-Wall <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Projection System</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              A revolutionary system that mirrors your smartphone screen and projects it directly onto any wall using integrated mini-projector hardware.
            </p>
            <div className="flex flex-wrap gap-4">
              {!stream ? (
                <button 
                  onClick={startCapture}
                  className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30"
                >
                  Start Mirroring <ArrowRight size={18} />
                </button>
              ) : (
                <button 
                  onClick={stopCapture}
                  className="flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/30"
                >
                  Stop Mirroring <Activity size={18} />
                </button>
              )}
              <button className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all">
                Technical Docs
              </button>
            </div>
            {error && (
              <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm font-medium flex items-center gap-2 mb-3">
                  <ShieldCheck size={16} /> {error}
                </p>
                <button 
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold transition-all"
                >
                  Open in New Tab
                </button>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className={`relative z-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-500/10 bg-black aspect-video flex items-center justify-center ${isARMode ? 'ring-4 ring-blue-500/50' : ''}`}>
              {isARMode ? (
                <div className="relative w-full h-full overflow-hidden bg-black">
                  {/* Camera Background or Mock Wall */}
                  {cameraStream ? (
                    <video 
                      ref={cameraVideoRef} 
                      autoPlay 
                      playsInline 
                      muted
                      className="absolute inset-0 w-full h-full object-cover opacity-70 grayscale-[0.2] contrast-[1.1]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#1a1a1e] flex items-center justify-center">
                      <div className="text-center opacity-20">
                        <Monitor size={120} className="mx-auto mb-4" />
                        <p className="text-xl font-bold uppercase tracking-[0.3em]">Virtual Presentation Wall</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Surface Grid Simulation */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none" 
                       style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                  {/* Projected Content Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div 
                      animate={{ 
                        scale: [projectionScale, projectionScale * 1.01, projectionScale],
                        rotateX: [2, 3, 2],
                        rotateY: [-2, -1, -2],
                        filter: ["brightness(1) blur(0px)", "brightness(1.1) blur(0.5px)", "brightness(1) blur(0px)"]
                      }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="relative w-full aspect-video bg-blue-500/5 border border-blue-400/30 rounded-sm shadow-[0_0_80px_rgba(59,130,246,0.4)] overflow-hidden backdrop-blur-[1px]"
                      style={{ perspective: '1000px' }}
                    >
                      {stream || useSampleVideo ? (
                        <video 
                          ref={videoRef} 
                          src={useSampleVideo ? "https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-background-with-blue-lines-23530-large.mp4" : undefined}
                          autoPlay 
                          playsInline 
                          muted
                          loop={useSampleVideo}
                          className="w-full h-full object-contain mix-blend-screen"
                          style={{ 
                            filter: `brightness(${projectionBrightness}) contrast(${projectionContrast})`,
                            transform: `scale(${projectionScale})`
                          }}
                          onLoadedMetadata={() => console.log("AR Video Stream Loaded")}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-blue-400/50 bg-blue-900/10">
                          <Smartphone size={48} className="mb-2 animate-pulse" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting Mobile Signal...</p>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setUseSampleVideo(true); }}
                            className="mt-4 text-[8px] bg-blue-500/20 hover:bg-blue-500/40 px-3 py-1 rounded-full border border-blue-400/30 text-blue-300 transition-all"
                          >
                            Use Sample Video for Demo
                          </button>
                        </div>
                      )}
                      
                      {/* Realistic Projector Artifacts */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
                      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] pointer-events-none" />
                    </motion.div>
                  </div>

                  {/* Projector Light Beam (Volumetric Simulation) */}
                  <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[150%] h-[120%] bg-gradient-to-t from-blue-500/20 via-blue-400/5 to-transparent pointer-events-none opacity-40" 
                       style={{ clipPath: 'polygon(50% 100%, 15% 0%, 85% 0%)' }} />
                  
                  {/* AR UI Elements */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Wall Projection Active</span>
                      </div>
                      <span className="text-[8px] text-gray-400 uppercase tracking-tighter">Hardware Emulation v2.4</span>
                    </div>
                  </div>

                  {isCalibrating && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-blue-600/20 backdrop-blur-sm z-20"
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-white font-bold uppercase tracking-[0.2em]">Calibrating Wall Surface...</p>
                      </div>
                    </motion.div>
                  )}

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-4 items-center">
                    <div className="flex items-center gap-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] text-gray-400">BRIGHTNESS</span>
                        <input 
                          type="range" min="0.5" max="2" step="0.1" 
                          value={projectionBrightness} 
                          onChange={(e) => setProjectionBrightness(parseFloat(e.target.value))}
                          className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>
                      <div className="w-px h-4 bg-white/10" />
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] text-gray-400">SIZE</span>
                        <button onClick={() => setProjectionScale(s => Math.max(0.4, s - 0.05))} className="text-white hover:text-blue-400"><Smartphone size={12} /></button>
                        <button onClick={() => setProjectionScale(s => Math.min(1, s + 0.05))} className="text-white hover:text-blue-400"><Monitor size={12} /></button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                      <button onClick={playVideo} className="bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 transition-all"><Activity size={12} /></button>
                      <div className="w-px h-4 bg-white/10 mx-1" />
                      <button 
                        onClick={toggleFlashlight}
                        className={`p-1.5 rounded-full transition-all ${isTorchOn ? 'bg-amber-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                      >
                        <Zap size={12} />
                      </button>
                      <div className="w-px h-4 bg-white/10 mx-1" />
                      <button 
                        onClick={() => setUseSampleVideo(!useSampleVideo)}
                        className={`text-[8px] font-bold px-2 py-1 rounded ${useSampleVideo ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400'}`}
                      >
                        {useSampleVideo ? 'STOP SAMPLE' : 'USE SAMPLE'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {stream ? (
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <Monitor size={64} className="mx-auto text-blue-500/30 mb-4" />
                      <p className="text-gray-500 font-medium">Click "Start Mirroring" to begin projection</p>
                    </div>
                  )}
                </>
              )}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0a0a0c]/40 via-transparent to-transparent" />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </Section>

      {/* Working Process */}
      <Section id="process" className="bg-white/[0.02]">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A sophisticated pipeline designed to capture, encode, and transmit your screen data with minimal overhead.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-500/50 via-cyan-500/50 to-blue-500/50 z-0" />
          
          {[
            {
              step: "01",
              title: "Capture",
              desc: "The mobile app uses native APIs to capture the screen buffer in real-time at 60 FPS.",
              icon: Smartphone
            },
            {
              step: "02",
              title: "Transmit",
              desc: "Data is compressed using H.264/H.265 and sent via WebSockets over WiFi or Internet.",
              icon: Wifi
            },
            {
              step: "03",
              title: "Project",
              desc: "The mini-projector module (DLP/LCoS) receives the data and projects it onto the wall.",
              icon: Monitor
            }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform">
                <item.icon size={32} />
              </div>
              <div className="text-blue-500 font-mono text-sm font-bold mb-2">STEP {item.step}</div>
              <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
              <p className="text-gray-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Technologies Used */}
      <Section id="tech">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Cutting-Edge Stack</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Our system leverages modern frameworks and protocols to ensure stability and cross-platform performance.
            </p>
            
            <div className="space-y-8">
              <div>
                <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">Frontend & Mobile</h4>
                <div className="flex flex-wrap gap-3">
                  <TechBadge name="Flutter" />
                  <TechBadge name="React" />
                  <TechBadge name="Tailwind CSS" />
                  <TechBadge name="TypeScript" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">Projection Hardware</h4>
                <div className="flex flex-wrap gap-3">
                  <TechBadge name="DLP Module" />
                  <TechBadge name="LCoS Engine" />
                  <TechBadge name="Laser Diode" />
                  <TechBadge name="Auto-Focus" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-3xl p-8 border border-white/5">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                <Cpu size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">System Architecture</h3>
                <p className="text-sm text-gray-500">High-level data flow diagram</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-blue-500 flex items-center justify-center text-blue-500 font-bold">1</div>
                <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-white font-semibold">Mobile Client</span>
                  <p className="text-xs text-gray-500">Screen Capture + Encoder</p>
                </div>
              </div>
              <div className="ml-6 w-0.5 h-6 bg-blue-500/30" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-cyan-500 flex items-center justify-center text-cyan-500 font-bold">2</div>
                <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-white font-semibold">Relay Server</span>
                  <p className="text-xs text-gray-500">WebSocket Hub + Auth</p>
                </div>
              </div>
              <div className="ml-6 w-0.5 h-6 bg-cyan-500/30" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-blue-500 flex items-center justify-center text-blue-500 font-bold">3</div>
                <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-white font-semibold">Display Receiver</span>
                  <p className="text-xs text-gray-500">Decoder + Renderer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Hardware Integration Section */}
      <Section id="hardware" className="bg-blue-600/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Hardware Integration</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            While the software handles the data, physical wall projection requires integration with specialized light engines.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Cpu className="text-blue-400" /> MEMS Laser Module
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                The system is designed to interface with Micro-Electro-Mechanical Systems (MEMS) laser scanners. These modules can be embedded in smartphones or connected via USB-C to project high-contrast images on any surface without manual focusing.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Wifi className="text-blue-400" /> Smart Projector Sync
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                For existing hardware, the app uses the <strong>DIAL Protocol</strong> (Discovery and Launch) to detect Smart TVs and Projectors on the same network, enabling one-tap wireless casting.
              </p>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-square md:aspect-auto">
            <img 
              src="https://picsum.photos/seed/hardware/800/800" 
              alt="Hardware Module" 
              className="w-full h-full object-cover opacity-50"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <ShieldCheck size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Technical Specification</span>
              </div>
              <h4 className="text-2xl font-bold text-white mb-2">ProjectorX Core Engine</h4>
              <p className="text-gray-400 text-sm">Supports 1080p output, 500 Lumens brightness, and auto-keystone correction logic.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Key Features */}
      <Section id="features" className="bg-white/[0.02]">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Key Features</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Everything you need for a professional projection experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={Activity} 
            title="Real-time Projection" 
            description="Ultra-smooth mirroring with frame rates up to 60 FPS for fluid motion on the wall."
          />
          <FeatureCard 
            icon={Zap} 
            title="Low Latency Display" 
            description="Proprietary encoding algorithms ensure sub-100ms delay for instant feedback."
          />
          <FeatureCard 
            icon={Wifi} 
            title="Wireless Connection" 
            description="Connect via WiFi or high-speed USB-C cable for stable data transmission."
          />
          <FeatureCard 
            icon={Layers} 
            title="Adjustable Size" 
            description="Easily adjust the projection size from 20 to 100 inches by moving the device."
          />
          <FeatureCard 
            icon={Smartphone} 
            title="Screen Control" 
            description="Full control of the projected content directly from your smartphone screen."
          />
          <FeatureCard 
            icon={ShieldCheck} 
            title="Secure Stream" 
            description="End-to-end encryption ensures your screen data remains private and secure."
          />
        </div>
      </Section>

      {/* Applications */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-blue-600/10 border border-blue-500/20">
                  <GraduationCap className="text-blue-400 mb-4" size={32} />
                  <h4 className="text-white font-bold mb-2">Education</h4>
                  <p className="text-sm text-gray-400">Interactive teaching and digital whiteboarding.</p>
                </div>
                <div className="p-6 rounded-2xl bg-cyan-600/10 border border-cyan-500/20">
                  <Gamepad2 className="text-cyan-400 mb-4" size={32} />
                  <h4 className="text-white font-bold mb-2">Gaming</h4>
                  <p className="text-sm text-gray-400">Stream mobile games to large screens for audiences.</p>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="p-6 rounded-2xl bg-purple-600/10 border border-purple-500/20">
                  <Presentation className="text-purple-400 mb-4" size={32} />
                  <h4 className="text-white font-bold mb-2">Business</h4>
                  <p className="text-sm text-gray-400">Professional presentations without cables.</p>
                </div>
                <div className="p-6 rounded-2xl bg-green-600/10 border border-green-500/20">
                  <Smartphone className="text-green-400 mb-4" size={32} />
                  <h4 className="text-white font-bold mb-2">Demos</h4>
                  <p className="text-sm text-gray-400">Remote app demonstrations and troubleshooting.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Versatile Applications</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              From classrooms to boardrooms, ProjectorX adapts to your environment, providing a powerful tool for visual communication.
            </p>
            <ul className="space-y-4">
              {[
                "Interactive learning environments",
                "High-stakes business presentations",
                "Esports and mobile gaming streams",
                "Technical support and remote training"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 size={20} className="text-blue-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Advantages */}
      <Section className="bg-gradient-to-b from-transparent to-blue-900/10">
        <div className="bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Advantages</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-4xl font-bold text-white mb-2">100%</h4>
                <p className="text-blue-100 font-medium">Portable System</p>
              </div>
              <div>
                <h4 className="text-4xl font-bold text-white mb-2">Easy</h4>
                <p className="text-blue-100 font-medium">One-Tap Setup</p>
              </div>
              <div>
                <h4 className="text-4xl font-bold text-white mb-2">Low</h4>
                <p className="text-blue-100 font-medium">Cost Effective</p>
              </div>
            </div>
            <p className="mt-12 text-blue-100 text-lg leading-relaxed">
              A portable, software-defined alternative to expensive traditional projection systems. 
              No bulky hardware, no complex wiring, just pure wall projection.
            </p>
          </div>
        </div>
      </Section>

      {/* Presentation Guide */}
      <Section id="guide" className="bg-black border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-blue-500" size={20} />
            </div>
            <h2 className="text-2xl font-bold text-white">Presentation Guide for Judges</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-blue-400 font-bold uppercase tracking-widest text-xs">How to Explain the Tech</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                "Our system uses <strong>WebRTC</strong> for sub-100ms latency. The mobile app captures the screen buffer, encodes it using <strong>H.264</strong>, and transmits it via <strong>WebSockets</strong> to the projection hardware."
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                "The <strong>Virtual Wall Demo</strong> you see here is an AR prototype. It demonstrates how our software tracks surfaces to align the projection correctly."
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-blue-400 font-bold uppercase tracking-widest text-xs">Hardware Integration</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                "In a production environment, this app interfaces with a <strong>MEMS Laser Engine</strong>. This allows for focus-free projection on any surface, as simulated in our AR view."
              </p>
              <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
                <li>Supports 500 Lumens brightness</li>
                <li>Auto-Keystone Correction logic</li>
                <li>Battery-efficient DLP processing</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* Hardware Connection Guide */}
      <Section id="hardware-guide" className="bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Physical Hardware Setup</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              To project on a real wall, you must connect your mobile device to one of these hardware modules.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all group">
              <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">DLP Pico Module</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                A compact digital light processing module that connects via USB-C. Ideal for DIY mobile projection projects.
              </p>
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Recommended for Competition</div>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all group">
              <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wifi className="text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Wireless HDMI</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Use a Miracast or AirPlay dongle connected to a standard projector to mirror your screen wirelessly.
              </p>
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Best for Classrooms</div>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all group">
              <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layers className="text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">LCoS Engine</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Liquid Crystal on Silicon technology for high-resolution projection in a small form factor.
              </p>
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Advanced Integration</div>
            </div>
          </div>
        </div>
      </Section>
      <footer className="py-12 border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Monitor size={14} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">WallBeam</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 Mobile-to-Wall Projection System. Built for Technical Excellence.
          </p>
        </div>
      </footer>
    </div>
  );
}
