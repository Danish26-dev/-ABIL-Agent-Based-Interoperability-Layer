import React, { useEffect, useRef } from 'react';
import { useWorkspace } from './WorkspaceContext';

/**
 * Pseudo-3D operational command-center rendered to canvas.
 * Depicts the ABIL orchestration core surrounded by 6 agent workstations
 * with floating infrastructure panels and live data flows.
 */
const COLORS = {
  bg: '#0B1220',
  grid: 'rgba(37,99,235,0.06)',
  primary: '#2563EB',
  sync: '#14B8A6',
  warning: '#F59E0B',
  error: '#EF4444',
  text: '#E5E7EB',
  muted: '#9CA3AF',
};

const Operational3D = ({ onAgentClick }) => {
  const canvasRef = useRef(null);
  const stateRef = useRef({});
  const { agents } = useWorkspace();
  const agentsRef = useRef(agents);
  agentsRef.current = agents;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;
    let mouse = { x: -1, y: -1 };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = -1;
      mouse.y = -1;
    };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    const onClick = (e) => {
      const r = canvas.getBoundingClientRect();
      const cx = e.clientX - r.left;
      const cy = e.clientY - r.top;
      const stations = stateRef.current.stations || [];
      for (const s of stations) {
        const dx = cx - s.x;
        const dy = cy - s.y;
        if (dx * dx + dy * dy < 60 * 60) {
          onAgentClick && onAgentClick(s.id);
          return;
        }
      }
    };
    canvas.addEventListener('click', onClick);

    // Particles flowing from each station to core and back
    const particles = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        s: Math.floor(Math.random() * 6),
        p: Math.random(),
        speed: 0.003 + Math.random() * 0.005,
        dir: Math.random() > 0.5 ? 1 : -1,
        col: Math.random() > 0.5 ? COLORS.sync : COLORS.primary,
      });
    }

    // Floating infrastructure panels (background depth)
    const panels = [
      { x: 0.1, y: 0.18, w: 130, h: 70, label: 'EVENT BUS', value: 'streaming', col: COLORS.primary },
      { x: 0.86, y: 0.2, w: 140, h: 70, label: 'STATE DELTA', value: '+ 12 ops/s', col: COLORS.sync },
      { x: 0.08, y: 0.78, w: 150, h: 70, label: 'SYNC QUEUE', value: '0 pending', col: COLORS.sync },
      { x: 0.88, y: 0.78, w: 130, h: 70, label: 'AUDIT LOG', value: '#48291', col: COLORS.primary },
    ];

    const drawGrid = (w, h) => {
      // Perspective floor grid
      ctx.save();
      const horizon = h * 0.55;
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 1;
      for (let i = 0; i < 18; i++) {
        const yy = horizon + (i * i) * 1.6;
        if (yy > h) break;
        ctx.globalAlpha = 1 - i / 22;
        ctx.beginPath();
        ctx.moveTo(0, yy);
        ctx.lineTo(w, yy);
        ctx.stroke();
      }
      // Vertical perspective lines
      const cx = w / 2;
      for (let i = -10; i <= 10; i++) {
        ctx.globalAlpha = 0.08;
        ctx.beginPath();
        ctx.moveTo(cx + i * 60, horizon);
        ctx.lineTo(cx + i * 240, h);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawCore = (cx, cy, t) => {
      // Outer pulse rings
      for (let i = 0; i < 3; i++) {
        const r = 60 + i * 25 + Math.sin(t * 1.5 + i) * 4;
        ctx.strokeStyle = `rgba(37,99,235,${0.18 - i * 0.05})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 110);
      glow.addColorStop(0, 'rgba(37,99,235,0.55)');
      glow.addColorStop(0.5, 'rgba(20,184,166,0.18)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, 110, 0, Math.PI * 2);
      ctx.fill();

      // Hex core
      const sides = 6;
      const rot = t * 0.3;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      const grad = ctx.createLinearGradient(-50, -50, 50, 50);
      grad.addColorStop(0, '#1d4ed8');
      grad.addColorStop(1, '#0f766e');
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2;
        const x = Math.cos(a) * 42;
        const y = Math.sin(a) * 42;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner cross-hair
      ctx.strokeStyle = 'rgba(229,231,235,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(20, 0);
      ctx.moveTo(0, -20);
      ctx.lineTo(0, 20);
      ctx.stroke();
      ctx.restore();

      // Label
      ctx.fillStyle = COLORS.text;
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ABIL CORE', cx, cy + 78);
      ctx.fillStyle = COLORS.sync;
      ctx.font = '500 9px "JetBrains Mono", monospace';
      ctx.fillText('● ORCHESTRATING', cx, cy + 92);
    };

    const drawStation = (s, t, mouseX, mouseY) => {
      const status = s.agent.status;
      const accent =
        status === 'active'
          ? COLORS.sync
          : status === 'processing' || status === 'running'
          ? COLORS.primary
          : status === 'warning'
          ? COLORS.warning
          : COLORS.muted;

      // Hover state
      const dx = mouseX - s.x;
      const dy = mouseY - s.y;
      const hover = dx * dx + dy * dy < 60 * 60;

      // Connection beam to core
      const dist = Math.hypot(s.cx - s.x, s.cy - s.y);
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(Math.atan2(s.cy - s.y, s.cx - s.x));
      const beamGrad = ctx.createLinearGradient(0, 0, dist, 0);
      beamGrad.addColorStop(0, accent + 'cc');
      beamGrad.addColorStop(1, 'rgba(37,99,235,0.0)');
      ctx.strokeStyle = beamGrad;
      ctx.lineWidth = status === 'idle' ? 1 : 2;
      ctx.setLineDash([4, 6]);
      ctx.lineDashOffset = -t * 30;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(dist, 0);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Workstation base shadow
      ctx.save();
      ctx.translate(s.x, s.y);
      const baseGrad = ctx.createRadialGradient(0, 22, 0, 0, 22, 50);
      baseGrad.addColorStop(0, accent + '55');
      baseGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.ellipse(0, 22, 46, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Station body (pseudo-3D rectangular console)
      const bw = hover ? 86 : 78;
      const bh = hover ? 56 : 50;
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = accent;
      ctx.lineWidth = hover ? 2 : 1.2;
      ctx.beginPath();
      ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 8);
      ctx.fill();
      ctx.stroke();

      // Glow when active
      if (status !== 'idle') {
        ctx.shadowColor = accent;
        ctx.shadowBlur = 16 + Math.sin(t * 4) * 4;
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 8);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Screen content (simulated)
      ctx.fillStyle = '#0B1220';
      ctx.beginPath();
      ctx.roundRect(-bw / 2 + 6, -bh / 2 + 6, bw - 12, bh - 22, 4);
      ctx.fill();

      // Activity bars
      ctx.fillStyle = accent;
      const barCount = 5;
      for (let i = 0; i < barCount; i++) {
        const h = 4 + Math.abs(Math.sin(t * 2 + i + s.idx)) * (status === 'idle' ? 4 : 14);
        ctx.globalAlpha = status === 'idle' ? 0.35 : 0.85;
        ctx.fillRect(-bw / 2 + 12 + i * 10, bh / 2 - 18 - h, 6, h);
      }
      ctx.globalAlpha = 1;

      // Status dot
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(-bw / 2 + 10, -bh / 2 + 12, 3, 0, Math.PI * 2);
      ctx.fill();
      if (status !== 'idle') {
        ctx.strokeStyle = accent;
        ctx.globalAlpha = 0.4 + Math.sin(t * 5) * 0.3;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(-bw / 2 + 10, -bh / 2 + 12, 6 + Math.sin(t * 5) * 1.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      ctx.restore();

      // Label below
      ctx.fillStyle = COLORS.text;
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(s.label.toUpperCase(), s.x, s.y + 44);
      ctx.fillStyle = accent;
      ctx.font = '500 9px "JetBrains Mono", monospace';
      ctx.fillText(`● ${status.toUpperCase()}`, s.x, s.y + 56);
    };

    const drawPanel = (p, w, h, t) => {
      const x = w * p.x - p.w / 2;
      const y = h * p.y - p.h / 2 + Math.sin(t + p.x * 4) * 4;
      ctx.save();
      ctx.fillStyle = 'rgba(17,24,39,0.7)';
      ctx.strokeStyle = p.col + '66';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, p.w, p.h, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = COLORS.muted;
      ctx.font = '600 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(p.label, x + 10, y + 18);

      ctx.fillStyle = p.col;
      ctx.font = '600 14px Inter, sans-serif';
      ctx.fillText(p.value, x + 10, y + 40);

      // Mini sparkline
      ctx.strokeStyle = p.col + 'aa';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < 18; i++) {
        const px = x + 10 + i * 6;
        const py = y + p.h - 14 - Math.sin(t * 2 + i + p.x * 10) * 4;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
    };

    const drawParticle = (p, stations, t) => {
      const s = stations[p.s];
      if (!s) return;
      const tt = p.dir > 0 ? p.p : 1 - p.p;
      const x = s.x + (s.cx - s.x) * tt;
      const y = s.y + (s.cy - s.y) * tt;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 8);
      glow.addColorStop(0, p.col);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = p.col;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    };

    const tick = () => {
      t += 0.016;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      ctx.clearRect(0, 0, w, h);

      // Background tint vignette
      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
      bg.addColorStop(0, 'rgba(17,24,39,0.6)');
      bg.addColorStop(1, 'rgba(11,18,32,1)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      drawGrid(w, h);

      // Build stations geometry around core
      const cx = w / 2;
      const cy = h / 2 + 10;
      const ringRx = Math.min(w * 0.34, 320);
      const ringRy = Math.min(h * 0.32, 180);
      const liveAgents = agentsRef.current;
      const stations = liveAgents.map((agent, i) => {
        const a = (i / liveAgents.length) * Math.PI * 2 - Math.PI / 2 + t * 0.05;
        return {
          id: agent.id,
          idx: i,
          label: agent.name.replace(' Agent', ''),
          agent,
          x: cx + Math.cos(a) * ringRx,
          y: cy + Math.sin(a) * ringRy,
          cx,
          cy,
        };
      });
      stateRef.current.stations = stations;

      // Background panels
      panels.forEach((p) => drawPanel(p, w, h, t));

      // Particles flowing along beams
      particles.forEach((p) => {
        const liveStation = stations[p.s];
        const ag = liveStation?.agent;
        if (ag && ag.status !== 'idle') p.speed = 0.008 + Math.random() * 0.004;
        else p.speed = 0.0025 + Math.random() * 0.002;
        p.p += p.speed;
        if (p.p > 1) {
          p.p = 0;
          p.s = Math.floor(Math.random() * stations.length);
          p.dir = Math.random() > 0.5 ? 1 : -1;
        }
        drawParticle(p, stations, t);
      });

      // Stations
      stations.forEach((s) => drawStation(s, t, mouse.x, mouse.y));

      // Core (drawn after stations so it sits on top)
      drawCore(cx, cy, t);

      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('click', onClick);
    };
  }, [onAgentClick]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="operational-3d-canvas"
      className="w-full h-full cursor-pointer"
      style={{ display: 'block' }}
    />
  );
};

export default Operational3D;
