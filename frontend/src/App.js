import React, { useEffect, useRef, useState, Suspense, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Workspace from './workspace/Workspace';
import { 
  ArrowRight, 
  Activity, 
  Shield, 
  RefreshCw, 
  Database, 
  GitBranch, 
  AlertTriangle,
  CheckCircle,
  Zap,
  Server,
  Network,
  Eye,
  FileText,
  Clock,
  Layers,
  ChevronDown,
  ExternalLink,
  Send,
  Loader2
} from 'lucide-react';
import './App.css';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_simple-hello-1724/artifacts/10czdmkl_abil%20logo.png';

// ==================== CANVAS 3D VISUALIZATION ====================
const Hero3DVisualization = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;
    
    // Set up canvas size
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    const width = canvas.getBoundingClientRect().width;
    const height = canvas.getBoundingClientRect().height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // System nodes
    const nodes = [
      { angle: 0, label: 'SWS', distance: 180 },
      { angle: Math.PI / 3, label: 'BESCOM', distance: 180 },
      { angle: (2 * Math.PI) / 3, label: 'KSPCB', distance: 180 },
      { angle: Math.PI, label: 'Labour', distance: 180 },
      { angle: (4 * Math.PI) / 3, label: 'Factory', distance: 180 },
      { angle: (5 * Math.PI) / 3, label: 'Revenue', distance: 180 },
    ];
    
    // Data particles
    const particles = [];
    for (let i = 0; i < 30; i++) {
      particles.push({
        nodeIndex: Math.floor(Math.random() * nodes.length),
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.004,
        direction: Math.random() > 0.5 ? 1 : -1,
        color: Math.random() > 0.5 ? '#14B8A6' : '#2563EB'
      });
    }
    
    const drawCore = (t) => {
      // Outer glow
      const glowGradient = ctx.createRadialGradient(centerX, centerY, 40, centerX, centerY, 100);
      glowGradient.addColorStop(0, 'rgba(37, 99, 235, 0.3)');
      glowGradient.addColorStop(0.5, 'rgba(20, 184, 166, 0.15)');
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
      ctx.fill();
      
      // Orbiting rings
      ctx.save();
      ctx.translate(centerX, centerY);
      
      // Ring 1
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 70, 25, t * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      
      // Ring 2
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 85, 30, -t * 0.3, 0, Math.PI * 2);
      ctx.stroke();
      
      // Ring 3
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, 100, 35, t * 0.4, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.restore();
      
      // Main core sphere
      const coreGradient = ctx.createRadialGradient(centerX - 15, centerY - 15, 0, centerX, centerY, 55);
      coreGradient.addColorStop(0, '#3B82F6');
      coreGradient.addColorStop(0.5, '#2563EB');
      coreGradient.addColorStop(1, '#1E40AF');
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 50 + Math.sin(t * 2) * 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner highlight
      const innerGradient = ctx.createRadialGradient(centerX - 10, centerY - 10, 0, centerX, centerY, 35);
      innerGradient.addColorStop(0, 'rgba(20, 184, 166, 0.4)');
      innerGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = innerGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
      ctx.fill();
      
      // ABIL text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ABIL', centerX, centerY);
    };
    
    const drawNode = (x, y, label, t, index) => {
      // Node glow
      const nodeGlow = ctx.createRadialGradient(x, y, 15, x, y, 40);
      nodeGlow.addColorStop(0, 'rgba(20, 184, 166, 0.2)');
      nodeGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = nodeGlow;
      ctx.beginPath();
      ctx.arc(x, y, 40, 0, Math.PI * 2);
      ctx.fill();
      
      // Node box
      const size = 28 + Math.sin(t * 2 + index) * 2;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t * 0.5 + index * 0.5);
      
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = '#14B8A6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(-size/2, -size/2, size, size);
      ctx.fill();
      ctx.stroke();
      
      ctx.restore();
      
      // Label
      ctx.fillStyle = '#E5E7EB';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y + 45);
    };
    
    const drawConnection = (nodeX, nodeY, t) => {
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.lineDashOffset = -t * 20;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(nodeX, nodeY);
      ctx.stroke();
      ctx.setLineDash([]);
    };
    
    const drawParticle = (p, t, nodes) => {
      const node = nodes[p.nodeIndex];
      const nodeX = centerX + Math.cos(node.angle + t * 0.1) * node.distance;
      const nodeY = centerY + Math.sin(node.angle + t * 0.1) * node.distance;
      
      const startX = p.direction === 1 ? centerX : nodeX;
      const startY = p.direction === 1 ? centerY : nodeY;
      const endX = p.direction === 1 ? nodeX : centerX;
      const endY = p.direction === 1 ? nodeY : centerY;
      
      const x = startX + (endX - startX) * p.progress;
      const y = startY + (endY - startY) * p.progress;
      
      // Particle glow
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 8);
      glow.addColorStop(0, p.color);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Particle core
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    };
    
    const animate = () => {
      time += 0.016;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw grid background
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }
      
      // Draw connections
      nodes.forEach(node => {
        const x = centerX + Math.cos(node.angle + time * 0.1) * node.distance;
        const y = centerY + Math.sin(node.angle + time * 0.1) * node.distance;
        drawConnection(x, y, time);
      });
      
      // Draw core
      drawCore(time);
      
      // Draw nodes
      nodes.forEach((node, i) => {
        const x = centerX + Math.cos(node.angle + time * 0.1) * node.distance;
        const y = centerY + Math.sin(node.angle + time * 0.1) * node.distance;
        drawNode(x, y, node.label, time, i);
      });
      
      // Update and draw particles
      particles.forEach(p => {
        p.progress += p.speed;
        if (p.progress > 1) {
          p.progress = 0;
          p.nodeIndex = Math.floor(Math.random() * nodes.length);
          p.direction = Math.random() > 0.5 ? 1 : -1;
        }
        drawParticle(p, time, nodes);
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ background: 'transparent' }}
    />
  );
};

// ==================== NAVIGATION ====================
const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass py-3' : 'py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="ABIL" className="w-10 h-10 rounded-lg" />
          <span className="text-xl font-semibold text-white">ABIL</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#architecture" className="text-[#9CA3AF] hover:text-white transition-colors text-sm" data-testid="nav-architecture">Architecture</a>
          <a href="#agents" className="text-[#9CA3AF] hover:text-white transition-colors text-sm" data-testid="nav-agents">Agents</a>
          <a href="#features" className="text-[#9CA3AF] hover:text-white transition-colors text-sm" data-testid="nav-features">Features</a>
          <a href="#tech" className="text-[#9CA3AF] hover:text-white transition-colors text-sm" data-testid="nav-tech">Tech Stack</a>
          <a href="#contact" className="text-[#9CA3AF] hover:text-white transition-colors text-sm" data-testid="nav-contact">Contact</a>
          <Link to="/app" className="text-[#14B8A6] hover:text-white transition-colors text-sm flex items-center gap-1.5" data-testid="nav-workspace">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse" />
            Workspace
          </Link>
        </div>
        <Link
          to="/app"
          className="px-5 py-2.5 bg-[#2563EB] text-white rounded-lg font-medium text-sm hover:bg-[#1d4ed8] transition-all glow-primary"
          data-testid="launch-workspace-btn"
        >
          Launch Workspace
        </Link>
      </div>
    </motion.nav>
  );
};

// ==================== HERO SECTION ====================
const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" data-testid="hero-section">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[#0B1220]" />
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0B1220]" />

      {/* Main Content - Two Column Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-[#14B8A6] rounded-full animate-pulse" />
              <span className="text-[#14B8A6] text-sm font-medium mono">SYSTEM OPERATIONAL</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Synchronizing Government Systems Through{' '}
              <span className="text-[#2563EB] text-glow-primary">Intelligent Middleware</span>
            </h1>
            
            <p className="text-lg text-[#9CA3AF] mb-10 leading-relaxed">
              ABIL enables reliable, bidirectional synchronization and state reconciliation 
              across fragmented government platforms without modifying existing infrastructure.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#architecture"
                className="group px-8 py-4 bg-[#2563EB] text-white rounded-lg font-semibold hover:bg-[#1d4ed8] transition-all flex items-center justify-center gap-2 glow-primary"
                data-testid="view-architecture-btn"
              >
                View Architecture
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link
                to="/app"
                className="px-8 py-4 glass text-white rounded-lg font-semibold hover:bg-[#111827] transition-all flex items-center justify-center gap-2"
                data-testid="launch-workspace-hero-btn"
              >
                <Activity className="w-5 h-5" />
                Launch Workspace
              </Link>
            </div>
          </motion.div>

          {/* Right Column - 3D Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2 relative h-[400px] md:h-[500px] lg:h-[600px]"
          >
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <Hero3DVisualization />
            </div>
            {/* Subtle glow effect behind visualization */}
            <div className="absolute inset-0 bg-gradient-radial from-[#2563EB]/10 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[#9CA3AF] text-xs">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-5 h-5 text-[#2563EB]" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// ==================== PROBLEM SECTION ====================
const ProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const problems = [
    { icon: Database, title: 'Inconsistent Records', desc: 'Conflicting data across departments' },
    { icon: GitBranch, title: 'Duplicate Data', desc: 'Redundant information in multiple systems' },
    { icon: AlertTriangle, title: 'Fragmented Workflows', desc: 'Disconnected business processes' },
    { icon: RefreshCw, title: 'No Synchronization', desc: 'Updates not propagated across systems' },
  ];

  return (
    <section ref={ref} className="py-32 relative" data-testid="problem-section">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-[#F59E0B] text-sm font-semibold mono mb-4 block">THE CHALLENGE</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Government Systems Operating in Silos
          </h2>
          <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto">
            Karnataka's government platforms manage business data independently, 
            creating critical interoperability challenges.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="glass p-6 rounded-xl hover:border-[#F59E0B]/50 transition-all group"
            >
              <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <problem.icon className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <h3 className="text-white font-semibold mb-2">{problem.title}</h3>
              <p className="text-[#9CA3AF] text-sm">{problem.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==================== SOLUTION SECTION ====================
const SolutionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="architecture" className="py-32 relative overflow-hidden" data-testid="solution-section">
      {/* Background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1220] via-[#111827]/50 to-[#0B1220]" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-[#14B8A6] text-sm font-semibold mono mb-4 block">THE SOLUTION</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ABIL: State Reconciliation Engine
          </h2>
          <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto">
            A middleware intelligence layer that orchestrates communication between 
            systems without modifying existing infrastructure.
          </p>
        </motion.div>

        {/* Architecture Diagram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass p-8 rounded-2xl"
        >
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            {/* Left Systems */}
            <div className="flex flex-col gap-4">
              {['SWS', 'BESCOM', 'KSPCB'].map((system, idx) => (
                <motion.div
                  key={system}
                  initial={{ x: -50, opacity: 0 }}
                  animate={isInView ? { x: 0, opacity: 1 } : {}}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="px-6 py-4 bg-[#111827] border border-[#2563EB]/30 rounded-lg text-center min-w-[120px]"
                >
                  <Server className="w-6 h-6 text-[#2563EB] mx-auto mb-2" />
                  <span className="text-white font-medium">{system}</span>
                </motion.div>
              ))}
            </div>

            {/* Connection Lines */}
            <div className="hidden lg:flex items-center">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="w-20 h-0.5 bg-gradient-to-r from-[#2563EB] to-[#14B8A6]"
              />
            </div>

            {/* ABIL Core */}
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ delay: 0.6, type: "spring" }}
              className="relative"
            >
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#2563EB] to-[#14B8A6] p-1 animate-pulse-slow">
                <div className="w-full h-full rounded-full bg-[#111827] flex flex-col items-center justify-center">
                  <img src={LOGO_URL} alt="ABIL" className="w-16 h-16 mb-2" />
                  <span className="text-white font-bold text-lg">ABIL</span>
                  <span className="text-[#9CA3AF] text-xs">CORE</span>
                </div>
              </div>
              {/* Orbiting dots */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <div className="absolute -top-2 left-1/2 w-3 h-3 bg-[#14B8A6] rounded-full" />
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <div className="absolute top-1/2 -right-2 w-2 h-2 bg-[#2563EB] rounded-full" />
              </motion.div>
            </motion.div>

            {/* Connection Lines */}
            <div className="hidden lg:flex items-center">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="w-20 h-0.5 bg-gradient-to-r from-[#14B8A6] to-[#2563EB]"
              />
            </div>

            {/* Right Systems */}
            <div className="flex flex-col gap-4">
              {['Labour', 'Factory', 'Revenue'].map((system, idx) => (
                <motion.div
                  key={system}
                  initial={{ x: 50, opacity: 0 }}
                  animate={isInView ? { x: 0, opacity: 1 } : {}}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="px-6 py-4 bg-[#111827] border border-[#14B8A6]/30 rounded-lg text-center min-w-[120px]"
                >
                  <Server className="w-6 h-6 text-[#14B8A6] mx-auto mb-2" />
                  <span className="text-white font-medium">{system}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Status indicators */}
          <div className="mt-8 flex justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#14B8A6] rounded-full animate-pulse" />
              <span className="text-[#9CA3AF] text-sm">Active Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#F59E0B] rounded-full" />
              <span className="text-[#9CA3AF] text-sm">Conflict Detected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#2563EB] rounded-full" />
              <span className="text-[#9CA3AF] text-sm">Processing</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ==================== AGENT WORKSPACE SECTION ====================
const AgentWorkspaceSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeAgent, setActiveAgent] = useState(0);

  const agents = [
    { 
      name: 'Listener Agent', 
      icon: Eye, 
      color: '#2563EB',
      status: 'active',
      desc: 'Monitors system events and change detection',
      events: ['Business registration detected', 'License update captured', 'Status change monitored']
    },
    { 
      name: 'Decision Agent', 
      icon: GitBranch, 
      color: '#8B5CF6',
      status: 'active',
      desc: 'Analyzes event priority and routing',
      events: ['Priority: HIGH - License sync', 'Routing to BESCOM', 'Conflict resolution queued']
    },
    { 
      name: 'Translation Agent', 
      icon: RefreshCw, 
      color: '#14B8A6',
      status: 'processing',
      desc: 'Schema mapping and data transformation',
      events: ['Schema mapping: SWS → KSPCB', 'Field transformation complete', 'Validation passed']
    },
    { 
      name: 'Sync Agent', 
      icon: Zap, 
      color: '#F59E0B',
      status: 'active',
      desc: 'Bidirectional synchronization execution',
      events: ['Syncing to BESCOM...', 'Syncing to Labour...', 'Confirmation received']
    },
    { 
      name: 'Conflict Agent', 
      icon: Shield, 
      color: '#EF4444',
      status: 'idle',
      desc: 'Conflict detection and resolution',
      events: ['No conflicts detected', 'Resolution queue empty', 'System stable']
    },
    { 
      name: 'Audit Agent', 
      icon: FileText, 
      color: '#10B981',
      status: 'active',
      desc: 'Audit trail and compliance logging',
      events: ['Event logged: #48291', 'Compliance check passed', 'Trail updated']
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % agents.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={ref} id="agents" className="py-32 relative" data-testid="agent-workspace-section">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#2563EB] text-sm font-semibold mono mb-4 block">LIVE WORKSPACE</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Agent Orchestration Console
          </h2>
          <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto">
            Real-time visibility into the intelligent agents coordinating 
            synchronization across government systems.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Agent Grid */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {agents.map((agent, idx) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setActiveAgent(idx)}
                className={`glass p-5 rounded-xl cursor-pointer transition-all ${
                  activeAgent === idx ? 'border-[' + agent.color + ']/50 glow-sync' : ''
                }`}
                style={{ 
                  borderColor: activeAgent === idx ? agent.color : 'transparent',
                  borderWidth: activeAgent === idx ? '1px' : '1px'
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: agent.color + '20' }}
                  >
                    <agent.icon className="w-5 h-5" style={{ color: agent.color }} />
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    agent.status === 'active' ? 'bg-[#14B8A6]/20 text-[#14B8A6]' :
                    agent.status === 'processing' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' :
                    'bg-[#9CA3AF]/20 text-[#9CA3AF]'
                  }`}>
                    {agent.status}
                  </div>
                </div>
                <h3 className="text-white font-semibold mb-1">{agent.name}</h3>
                <p className="text-[#9CA3AF] text-xs">{agent.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Event Stream */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="glass p-6 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-[#14B8A6]" />
              <span className="text-white font-semibold">Event Stream</span>
              <div className="ml-auto w-2 h-2 bg-[#14B8A6] rounded-full animate-pulse" />
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
              <AnimatePresence mode="popLayout">
                {agents[activeAgent].events.map((event, idx) => (
                  <motion.div
                    key={event + idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-[#0B1220] rounded-lg"
                  >
                    <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: agents[activeAgent].color }} />
                    <div>
                      <p className="text-[#E5E7EB] text-sm">{event}</p>
                      <p className="text-[#9CA3AF] text-xs mt-1 mono">
                        {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-4 pt-4 border-t border-[#1f2937]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9CA3AF]">Active Agent</span>
                <span className="text-white font-medium">{agents[activeAgent].name}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ==================== HOW IT WORKS SECTION ====================
const HowItWorksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    { icon: Eye, title: 'Detect Changes', desc: 'Monitor system events and capture state changes in real-time' },
    { icon: GitBranch, title: 'Analyze Priority', desc: 'Evaluate event importance and determine routing strategy' },
    { icon: RefreshCw, title: 'Translate Schemas', desc: 'Map data structures between heterogeneous systems' },
    { icon: Zap, title: 'Synchronize', desc: 'Execute bidirectional updates across all connected systems' },
    { icon: Shield, title: 'Resolve Conflicts', desc: 'Detect and resolve data conflicts using intelligent rules' },
    { icon: FileText, title: 'Audit Trail', desc: 'Maintain comprehensive logs for compliance and traceability' },
  ];

  return (
    <section ref={ref} id="workflow" className="py-32 relative" data-testid="workflow-section">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#14B8A6] text-sm font-semibold mono mb-4 block">WORKFLOW</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How ABIL Works
          </h2>
          <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto">
            A systematic approach to distributed system coordination and state reconciliation.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-[60px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-[#2563EB]/30 to-transparent" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative"
              >
                {/* Step number */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold text-lg relative z-10">
                    {idx + 1}
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#2563EB]/50 to-transparent lg:hidden" />
                </div>

                <div className="glass p-6 rounded-xl hover:border-[#2563EB]/30 transition-all">
                  <step.icon className="w-8 h-8 text-[#2563EB] mb-4" />
                  <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-[#9CA3AF] text-sm">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ==================== FEATURES SECTION ====================
const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    { icon: RefreshCw, title: 'Bidirectional Synchronization', desc: 'Real-time two-way data sync between all connected government systems' },
    { icon: Network, title: 'Agent-Based Coordination', desc: 'Intelligent autonomous agents orchestrating complex workflows' },
    { icon: Clock, title: 'Event Lifecycle Tracking', desc: 'Complete visibility into every event from detection to completion' },
    { icon: Shield, title: 'Conflict Resolution Engine', desc: 'Automated detection and resolution of data conflicts across systems' },
    { icon: Database, title: 'Canonical Data Mapping', desc: 'Unified schema translation between heterogeneous data models' },
    { icon: FileText, title: 'Audit & Traceability', desc: 'Comprehensive audit trails for compliance and governance' },
    { icon: Layers, title: 'Distributed Architecture', desc: 'Scalable middleware designed for enterprise-grade reliability' },
    { icon: Zap, title: 'Fault-Tolerant Sync', desc: 'Resilient synchronization with automatic retry and recovery' },
  ];

  return (
    <section ref={ref} id="features" className="py-32 relative" data-testid="features-section">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1220] via-[#111827]/30 to-[#0B1220]" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#2563EB] text-sm font-semibold mono mb-4 block">CAPABILITIES</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Enterprise-Grade Features
          </h2>
          <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto">
            Built for government-scale interoperability with reliability, 
            security, and performance at its core.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="group glass p-6 rounded-xl hover:bg-[#111827]/80 transition-all hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-lg bg-[#2563EB]/10 flex items-center justify-center mb-4 group-hover:bg-[#2563EB]/20 transition-colors">
                <feature.icon className="w-6 h-6 text-[#2563EB]" />
              </div>
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-[#9CA3AF] text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==================== TECH STACK SECTION ====================
const TechStackSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const technologies = [
    { name: 'Node.js', category: 'Runtime', color: '#68A063' },
    { name: 'AWS Bedrock', category: 'AI/ML', color: '#FF9900' },
    { name: 'Amazon Nova Pro', category: 'LLM', color: '#FF9900' },
    { name: 'Kafka', category: 'Messaging', color: '#231F20' },
    { name: 'MongoDB', category: 'Database', color: '#47A248' },
    { name: 'Strands ADK', category: 'Agent Framework', color: '#2563EB' },
  ];

  return (
    <section ref={ref} id="tech" className="py-32 relative" data-testid="tech-section">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#14B8A6] text-sm font-semibold mono mb-4 block">INFRASTRUCTURE</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Built on Modern Tech Stack
          </h2>
          <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto">
            Enterprise-grade technologies powering intelligent middleware orchestration.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technologies.map((tech, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass p-6 rounded-xl hover:border-[#2563EB]/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: tech.color + '20', color: tech.color }}
                >
                  {tech.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{tech.name}</h3>
                  <p className="text-[#9CA3AF] text-sm">{tech.category}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Event-Driven Architecture Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 glass p-8 rounded-xl text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Network className="w-6 h-6 text-[#2563EB]" />
            <h3 className="text-white font-semibold text-xl">Event-Driven Architecture</h3>
          </div>
          <p className="text-[#9CA3AF] max-w-2xl mx-auto">
            ABIL leverages event-driven patterns for loose coupling, scalability, 
            and real-time responsiveness across distributed government systems.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// ==================== CTA SECTION ====================
const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [formData, setFormData] = useState({ name: '', email: '', organization: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section ref={ref} id="contact" className="py-32 relative overflow-hidden" data-testid="cta-section">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#111827]/50 to-[#0B1220]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#2563EB]/10 rounded-full blur-[100px]" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Building the Synchronization Layer<br />
            Government Systems Are Missing
          </h2>
          <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto mb-10">
            ABIL brings consistency, coordination, and reliability 
            to distributed government infrastructure.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/app"
              className="group px-8 py-4 bg-[#2563EB] text-white rounded-lg font-semibold hover:bg-[#1d4ed8] transition-all flex items-center justify-center gap-2 glow-primary"
              data-testid="enter-workspace-btn"
            >
              Enter ABIL Workspace
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#architecture"
              className="px-8 py-4 glass text-white rounded-lg font-semibold hover:bg-[#111827] transition-all flex items-center justify-center gap-2"
              data-testid="view-system-architecture-btn"
            >
              <Layers className="w-5 h-5" />
              View System Architecture
            </a>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="glass p-8 rounded-2xl">
            <h3 className="text-white font-semibold text-xl mb-6 text-center">Request a Demo</h3>
            
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <CheckCircle className="w-16 h-16 text-[#14B8A6] mx-auto mb-4" />
                <h4 className="text-white font-semibold text-lg mb-2">Thank You!</h4>
                <p className="text-[#9CA3AF]">We'll be in touch shortly.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0B1220] border border-[#1f2937] rounded-lg text-white placeholder-[#9CA3AF] focus:border-[#2563EB] focus:outline-none transition-colors"
                    data-testid="contact-name-input"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0B1220] border border-[#1f2937] rounded-lg text-white placeholder-[#9CA3AF] focus:border-[#2563EB] focus:outline-none transition-colors"
                    data-testid="contact-email-input"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Organization"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0B1220] border border-[#1f2937] rounded-lg text-white placeholder-[#9CA3AF] focus:border-[#2563EB] focus:outline-none transition-colors"
                  data-testid="contact-organization-input"
                />
                <textarea
                  placeholder="Message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0B1220] border border-[#1f2937] rounded-lg text-white placeholder-[#9CA3AF] focus:border-[#2563EB] focus:outline-none transition-colors resize-none"
                  data-testid="contact-message-input"
                />
                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-[#2563EB] text-white rounded-lg font-semibold hover:bg-[#1d4ed8] transition-all flex items-center justify-center gap-2"
                  data-testid="contact-submit-btn"
                >
                  <Send className="w-5 h-5" />
                  Send Request
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ==================== FOOTER ====================
const Footer = () => {
  return (
    <footer className="py-12 border-t border-[#1f2937]" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="ABIL" className="w-8 h-8 rounded-lg" />
            <span className="text-white font-semibold">ABIL</span>
            <span className="text-[#9CA3AF] text-sm">Agent Based Interoperability Layer</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <a href="#architecture" className="text-[#9CA3AF] hover:text-white transition-colors">Architecture</a>
            <a href="#features" className="text-[#9CA3AF] hover:text-white transition-colors">Features</a>
            <a href="#tech" className="text-[#9CA3AF] hover:text-white transition-colors">Tech Stack</a>
            <a href="#contact" className="text-[#9CA3AF] hover:text-white transition-colors">Contact</a>
          </div>
          
          <p className="text-[#9CA3AF] text-sm">
            © 2025 ABIL. Karnataka Government Systems Integration.
          </p>
        </div>
      </div>
    </footer>
  );
};

// ==================== MAIN APP ====================
function Landing() {
  return (
    <div className="bg-[#0B1220] min-h-screen">
      <Navigation />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <AgentWorkspaceSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TechStackSection />
      <CTASection />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app/*" element={<Workspace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
