import React, { useEffect, useRef, useState, useMemo, memo } from "react";
import { SniperPosition, HotVaultState, TradeReceipt } from "./types.js";
import { useSafeTelemetry } from "./hooks/useSafeTelemetry.js";
import { 
  Zap, 
  ShieldCheck, 
  Layers, 
  CircleDollarSign, 
  Activity, 
  Building2, 
  CloudRain, 
  Sun, 
  Radio, 
  Compass, 
  TrendingUp, 
  Volume2, 
  VolumeX,
  Music,
  CheckCircle2,
  Plus,
  Minus,
  Camera,
  Palette,
  RotateCw,
  X,
  Hammer,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  RefreshCw,
  TrendingDown,
  Info,
  Droplets
} from "lucide-react";

interface Building {
  id: string;
  gridX: number;
  gridY: number;
  height: number;
  type: "skyscraper" | "commercial" | "residential" | "industrial" | "bridge" | "park" | "water" | "road";
  name: string;
  color: string;
  roofColor: string;
  glowColor: string;
  landValue: string;
  integrity: string;
  pollution: string;
  elevation: string;
  foundation: string;
  power: "CONNECTED" | "NONE";
  water: "CONNECTED" | "NONE";
}

interface AgentVehicle {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  speed: number;
}

export function App() {
  const [vault, setVault] = useState<HotVaultState | null>(null);
  const [positions, setPositions] = useState<SniperPosition[]>([]);
  const [receipts, setReceipts] = useState<TradeReceipt[]>([]);
  
  // Game HUD state
  const [zoom, setZoom] = useState<number>(0.85);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 30 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [weather, setWeather] = useState<"thunderstorm" | "clear" | "neon_night">("thunderstorm");
  const [sfxVolume, setSfxVolume] = useState<number>(60);
  const [jazzPlaying, setJazzPlaying] = useState<boolean>(false);
  const [isDevPortalOpen, setIsDevPortalOpen] = useState<boolean>(false);
  const [activeInspectorTab, setActiveInspectorTab] = useState<"STATUS" | "BLUEPRINT" | "TERRAIN">("STATUS");
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [timeSpeed, setTimeSpeed] = useState<"1X" | "2X" | "5X">("1X");
  const [coordinates, setCoordinates] = useState({ x: 438.5, y: 829.2, z: 0.40, rotation: 0, population: 90 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const zoomRef = useRef<number>(0.85);
  const panOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 30 });
  const weatherRef = useRef<"thunderstorm" | "clear" | "neon_night">("thunderstorm");
  const selectedBuildingRef = useRef<Building | null>(null);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

  useEffect(() => {
    weatherRef.current = weather;
  }, [weather]);

  useEffect(() => {
    selectedBuildingRef.current = selectedBuilding;
  }, [selectedBuilding]);

  // Generate the Master Isometric Metropolis Map (32x32 Grid)
  const mapData = useMemo(() => {
    const size = 32;
    const items: Building[] = [];
    const colorPalette = [
      { main: "#0ea5e9", roof: "#0284c7", glow: "#38bdf8" }, // Sky cyan
      { main: "#6366f1", roof: "#4f46e5", glow: "#818cf8" }, // Indigo
      { main: "#a855f7", roof: "#9333ea", glow: "#c084fc" }, // Purple
      { main: "#10b981", roof: "#059669", glow: "#34d399" }, // Emerald
      { main: "#f43f5e", roof: "#e11d48", glow: "#fb7185" }, // Rose
      { main: "#3b82f6", roof: "#2563eb", glow: "#60a5fa" }, // Blue
      { main: "#64748b", roof: "#475569", glow: "#94a3b8" }, // Slate
    ];

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        // Water Canal in lower quadrant
        if (x === 18 || x === 19) {
          if (y >= 14 && y <= 20) {
            // Road Bridge across canal!
            items.push({
              id: `bridge-${x}-${y}`,
              gridX: x,
              gridY: y,
              height: 14,
              type: "bridge",
              name: "ROAD BRIDGE",
              color: "#334155",
              roofColor: "#1e293b",
              glowColor: "#38bdf8",
              landValue: "$50/sq ft",
              integrity: "90%",
              pollution: "0%",
              elevation: "Grade Level (0m)",
              foundation: "4000-PSI POURED",
              power: "NONE",
              water: "NONE"
            });
            continue;
          } else {
            items.push({
              id: `water-${x}-${y}`,
              gridX: x,
              gridY: y,
              height: 2,
              type: "water",
              name: "METRO AQUEDUCT",
              color: "#0369a1",
              roofColor: "#0284c7",
              glowColor: "#38bdf8",
              landValue: "$120/sq ft",
              integrity: "100%",
              pollution: "0%",
              elevation: "-2m",
              foundation: "REINFORCED EMBANKMENT",
              power: "CONNECTED",
              water: "CONNECTED"
            });
            continue;
          }
        }

        // Road Grid
        const isRoad = (x % 5 === 0) || (y % 5 === 0);
        if (isRoad) {
          items.push({
            id: `road-${x}-${y}`,
            gridX: x,
            gridY: y,
            height: 3,
            type: "road",
            name: "URBAN ARTERY",
            color: "#1e293b",
            roofColor: "#0f172a",
            glowColor: "#facc15",
            landValue: "$85/sq ft",
            integrity: "95%",
            pollution: "1%",
            elevation: "0m",
            foundation: "ASPHALT REINFORCED",
            power: "CONNECTED",
            water: "CONNECTED"
          });
          continue;
        }

        // Dense Downtown Skyscraper Core (Center of City)
        const distFromCenter = Math.hypot(x - size / 2, y - size / 2);
        if (distFromCenter < 11 && Math.random() > 0.18) {
          const isHighRise = distFromCenter < 6 && Math.random() > 0.35;
          const h = isHighRise ? Math.floor(Math.random() * 80 + 55) : Math.floor(Math.random() * 45 + 20);
          const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
          const names = isHighRise 
            ? ["METROPOLIS PLAZA", "CYBER TOWER", "SOLANA VAULT HQ", "SOVEREIGN APEX", "NEXUS ARBITER TOWER", "HORIZON LABS"]
            : ["CIVIC CONDOS", "CITIZEN COMMERCE", "QUANTUM LOFTS", "DECENTRAL TOWER", "SOLAR ARTERY", "DATA HUB"];
          const selectedName = names[Math.floor(Math.random() * names.length)];

          items.push({
            id: `bld-${x}-${y}`,
            gridX: x,
            gridY: y,
            height: h,
            type: isHighRise ? "skyscraper" : "commercial",
            name: selectedName,
            color: col.main,
            roofColor: col.roof,
            glowColor: col.glow,
            landValue: `$${Math.floor(Math.random() * 250 + 150)}/sq ft`,
            integrity: `${Math.floor(Math.random() * 15 + 85)}%`,
            pollution: `${Math.floor(Math.random() * 4)}%`,
            elevation: `+${h}m`,
            foundation: "STEEL CAISSON + PIERS",
            power: "CONNECTED",
            water: "CONNECTED"
          });
        } else if (Math.random() > 0.55) {
          // Parks & Suburbs
          items.push({
            id: `park-${x}-${y}`,
            gridX: x,
            gridY: y,
            height: 4,
            type: "park",
            name: "CITIZEN BOTANICAL PARK",
            color: "#15803d",
            roofColor: "#166534",
            glowColor: "#4ade80",
            landValue: "$180/sq ft",
            integrity: "100%",
            pollution: "0%",
            elevation: "0m",
            foundation: "BIODIVERSE TOPSOIL",
            power: "CONNECTED",
            water: "CONNECTED"
          });
        }
      }
    }
    return items;
  }, []);

  // Set default selected building to ROAD BRIDGE initially
  useEffect(() => {
    const bridge = mapData.find(b => b.type === "bridge") || mapData[0];
    if (bridge) setSelectedBuilding(bridge);
  }, [mapData]);

  // Bulletproof safe telemetry hook
  const safeTelemetry = useSafeTelemetry();

  useEffect(() => {
    if (safeTelemetry && safeTelemetry.success) {
      if (safeTelemetry.vault) setVault(safeTelemetry.vault);
      if (Array.isArray(safeTelemetry.positions)) setPositions(safeTelemetry.positions);
      if (Array.isArray(safeTelemetry.receipts)) setReceipts(safeTelemetry.receipts);
    }
  }, [safeTelemetry]);

  // Main 3D Isometric Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Rain particles
    const rainDrops: { x: number; y: number; length: number; speed: number }[] = [];
    for (let i = 0; i < 220; i++) {
      rainDrops.push({
        x: Math.random() * window.innerWidth * 1.5 - 200,
        y: Math.random() * window.innerHeight,
        length: 18 + Math.random() * 25,
        speed: 16 + Math.random() * 10
      });
    }

    // Agent vehicle pods
    const vehicles: AgentVehicle[] = [
      { id: "v1", x: 10, y: 0, targetX: 10, targetY: 30, color: "#38bdf8", speed: 0.08 },
      { id: "v2", x: 0, y: 15, targetX: 30, targetY: 15, color: "#facc15", speed: 0.07 },
      { id: "v3", x: 20, y: 30, targetX: 20, targetY: 0, color: "#f43f5e", speed: 0.09 },
      { id: "v4", x: 30, y: 25, targetX: 0, targetY: 25, color: "#4ade80", speed: 0.06 },
    ];

    const sorted = [...mapData].sort((a, b) => (a.gridX + a.gridY) - (b.gridX + b.gridY));
    let tick = 0;

    const render = () => {
      tick++;
      const currentZoom = zoomRef.current;
      const currentPan = panOffsetRef.current;
      const currentWeather = weatherRef.current;
      const currentSelected = selectedBuildingRef.current;

      const tileWidth = 42 * currentZoom;
      const tileHeight = 21 * currentZoom;
      const originX = canvas.width / 2 + currentPan.x;
      const originY = canvas.height / 2 - 120 + currentPan.y;

      const toScreen = (gx: number, gy: number) => {
        const sx = originX + (gx - gy) * (tileWidth / 2);
        const sy = originY + (gx + gy) * (tileHeight / 2);
        return { x: sx, y: sy };
      };

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Deep Space Atmosphere Background
      ctx.fillStyle = "#1a2232";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle atmospheric grid glow
      const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 50, canvas.width / 2, canvas.height / 2, canvas.width * 0.7);
      grad.addColorStop(0, "rgba(30, 48, 77, 0.5)");
      grad.addColorStop(1, "rgba(20, 28, 42, 0.95)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw Isometric Terrain Base Plane
      const gridSize = 32;
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          const { x: sx, y: sy } = toScreen(x, y);

          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + tileWidth / 2, sy + tileHeight / 2);
          ctx.lineTo(sx, sy + tileHeight);
          ctx.lineTo(sx - tileWidth / 2, sy + tileHeight / 2);
          ctx.closePath();

          ctx.fillStyle = (x + y) % 2 === 0 ? "#121b2a" : "#182438";
          ctx.fill();
          ctx.strokeStyle = "rgba(45, 62, 90, 0.4)";
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // 3. Render 3D Buildings & Infrastructure with Isometric Depth Sorting
      for (const b of sorted) {
        const { x: sx, y: sy } = toScreen(b.gridX, b.gridY);
        const bh = b.height * currentZoom;
        const isSelected = currentSelected?.id === b.id;

        if (b.type === "water") {
          // Water tile
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + tileWidth / 2, sy + tileHeight / 2);
          ctx.lineTo(sx, sy + tileHeight);
          ctx.lineTo(sx - tileWidth / 2, sy + tileHeight / 2);
          ctx.closePath();
          ctx.fillStyle = "#0284c7";
          ctx.fill();
          ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
          ctx.stroke();
          continue;
        }

        if (b.type === "road" || b.type === "bridge") {
          // Road / Bridge Deck
          ctx.beginPath();
          ctx.moveTo(sx, sy - bh);
          ctx.lineTo(sx + tileWidth / 2, sy + tileHeight / 2 - bh);
          ctx.lineTo(sx, sy + tileHeight - bh);
          ctx.lineTo(sx - tileWidth / 2, sy + tileHeight / 2 - bh);
          ctx.closePath();
          ctx.fillStyle = b.type === "bridge" ? "#334155" : "#1e293b";
          ctx.fill();
          ctx.strokeStyle = isSelected ? "#38bdf8" : "rgba(100, 116, 139, 0.5)";
          ctx.lineWidth = isSelected ? 2 : 1;
          ctx.stroke();

          // Yellow Lane Markings
          ctx.beginPath();
          ctx.moveTo(sx - 3, sy + tileHeight / 2 - bh);
          ctx.lineTo(sx + 3, sy + tileHeight / 2 - bh);
          ctx.strokeStyle = "#facc15";
          ctx.lineWidth = 1;
          ctx.stroke();
          continue;
        }

        if (b.type === "park") {
          // Tree foliage voxel
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + tileWidth / 2, sy + tileHeight / 2);
          ctx.lineTo(sx, sy + tileHeight);
          ctx.lineTo(sx - tileWidth / 2, sy + tileHeight / 2);
          ctx.closePath();
          ctx.fillStyle = "#166534";
          ctx.fill();

          // Tree trunk & leafy canopy
          ctx.beginPath();
          ctx.arc(sx, sy + 6, 6 * currentZoom, 0, Math.PI * 2);
          ctx.fillStyle = "#22c55e";
          ctx.fill();
          continue;
        }

        // --- Standard 3D High-Rise Skyscraper / Commercial Box ---

        // Left Extruded Face (Shadow side)
        ctx.beginPath();
        ctx.moveTo(sx - tileWidth / 2, sy + tileHeight / 2);
        ctx.lineTo(sx, sy + tileHeight);
        ctx.lineTo(sx, sy + tileHeight - bh);
        ctx.lineTo(sx - tileWidth / 2, sy + tileHeight / 2 - bh);
        ctx.closePath();
        ctx.fillStyle = "rgba(18, 28, 44, 0.96)";
        ctx.fill();
        ctx.strokeStyle = isSelected ? "#38bdf8" : "rgba(40, 60, 90, 0.6)";
        ctx.lineWidth = isSelected ? 1.8 : 0.8;
        ctx.stroke();

        // Right Extruded Face (Direct Light side)
        ctx.beginPath();
        ctx.moveTo(sx, sy + tileHeight);
        ctx.lineTo(sx + tileWidth / 2, sy + tileHeight / 2);
        ctx.lineTo(sx + tileWidth / 2, sy + tileHeight / 2 - bh);
        ctx.lineTo(sx, sy + tileHeight - bh);
        ctx.closePath();
        ctx.fillStyle = "rgba(28, 44, 70, 0.96)";
        ctx.fill();
        ctx.strokeStyle = isSelected ? "#38bdf8" : "rgba(50, 75, 110, 0.6)";
        ctx.lineWidth = isSelected ? 1.8 : 0.8;
        ctx.stroke();

        // Roof Top Face
        ctx.beginPath();
        ctx.moveTo(sx, sy - bh);
        ctx.lineTo(sx + tileWidth / 2, sy + tileHeight / 2 - bh);
        ctx.lineTo(sx, sy + tileHeight - bh);
        ctx.lineTo(sx - tileWidth / 2, sy + tileHeight / 2 - bh);
        ctx.closePath();
        ctx.fillStyle = isSelected ? "#38bdf8" : b.roofColor;
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Window Neon Grids
        if (b.height > 30) {
          const windowCount = Math.floor(bh / 14);
          ctx.fillStyle = b.glowColor;
          for (let w = 1; w <= windowCount; w++) {
            const wy = sy + tileHeight - (w * 12 * currentZoom);
            if ((w + tick) % 5 !== 0) {
              ctx.fillRect(sx - 7 * currentZoom, wy, 2 * currentZoom, 2 * currentZoom);
              ctx.fillRect(sx - 2 * currentZoom, wy + 2 * currentZoom, 2 * currentZoom, 2 * currentZoom);
              ctx.fillRect(sx + 4 * currentZoom, wy + 1 * currentZoom, 2 * currentZoom, 2 * currentZoom);
            }
          }
        }

        // Helipad or Antenna on Mega Towers
        if (b.height > 65) {
          ctx.beginPath();
          ctx.moveTo(sx, sy - bh);
          ctx.lineTo(sx, sy - bh - 16 * currentZoom);
          ctx.strokeStyle = "#f43f5e";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Blinking Beacon
          if (tick % 30 < 15) {
            ctx.beginPath();
            ctx.arc(sx, sy - bh - 16 * currentZoom, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = "#f43f5e";
            ctx.fill();
          }
        }
      }

      // 4. Render Moving Autonomous Agent Vehicles
      for (const v of vehicles) {
        v.y += v.speed;
        if (v.y > 31) v.y = 0;
        const { x: vx, y: vy } = toScreen(v.x, v.y);
        ctx.beginPath();
        ctx.arc(vx, vy + 4, 3.5 * currentZoom, 0, Math.PI * 2);
        ctx.fillStyle = v.color;
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 5. Thunderstorm Rain Particle Effect
      if (currentWeather === "thunderstorm") {
        ctx.strokeStyle = "rgba(170, 200, 235, 0.35)";
        ctx.lineWidth = 1.2;
        for (const drop of rainDrops) {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 6, drop.y + drop.length);
          ctx.stroke();

          drop.y += drop.speed;
          drop.x -= 3;
          if (drop.y > canvas.height) {
            drop.y = -30;
            drop.x = Math.random() * (canvas.width + 300);
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [mapData]);

  // Handle Canvas Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
    setCoordinates(prev => ({
      ...prev,
      x: Number((prev.x + (e.movementX * 0.1)).toFixed(1)),
      y: Number((prev.y + (e.movementY * 0.1)).toFixed(1))
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  // Canvas Click to Select Building
  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const tileWidth = 42 * zoom;
    const tileHeight = 21 * zoom;
    const originX = canvas.width / 2 + panOffset.x;
    const originY = canvas.height / 2 - 120 + panOffset.y;

    // Pick closest building
    let closest: Building | null = null;
    let minDist = 40;

    for (const b of mapData) {
      const sx = originX + (b.gridX - b.gridY) * (tileWidth / 2);
      const sy = originY + (b.gridX + b.gridY) * (tileHeight / 2) - (b.height * zoom) / 2;
      const d = Math.hypot(clickX - sx, clickY - sy);
      if (d < minDist) {
        minDist = d;
        closest = b;
      }
    }

    if (closest) setSelectedBuilding(closest);
  };

  return (
    <div 
      className="relative w-screen h-screen bg-[#1a2232] text-slate-100 font-sans select-none overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleCanvasClick}
    >
      {/* 3D Isometric Game Engine Canvas */}
      <canvas 
        ref={canvasRef} 
        className={`absolute inset-0 w-full h-full ${isDragging ? "cursor-grabbing" : "cursor-grab"}`} 
      />

      {/* TOP MASTER NAV BAR (Exact match to Screenshot 1) */}
      <header className="absolute top-0 left-0 right-0 h-11 bg-[#101826]/90 backdrop-blur-md border-b border-slate-800/80 px-3 flex items-center justify-between z-30 text-xs font-mono">
        {/* Left: Brand & Pacing Pill */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-bold text-white tracking-wider">
            <span className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs">
              M
            </span>
            <span className="text-white font-bold">METRO AGENTS</span>
            <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded text-[9px] font-semibold">
              NEW METROPOLIS
            </span>
          </div>

          <div className="flex items-center gap-2 bg-[#182334] border border-slate-700/60 rounded px-2 py-0.5 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-amber-300 font-bold">ECONOMIC PACING</span>
            <span className="px-1 bg-amber-500/20 text-amber-400 rounded text-[9px] font-bold">⚠️ 2% Occ</span>
            <span className="text-slate-400 text-[10px]">Day: 0:42 • Payroll: 30:38 • Mo: 12:38</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-bold">CAP $1,023,982 (+16790/h)</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">POP 90</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400">APR 100% ▾</span>
          </div>
        </div>

        {/* Center: Clock, Weather & Sinking Fund */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#182334] border border-slate-700/60 rounded px-2 py-0.5 text-slate-300">
            <div className="w-3 h-3 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
            <span className="text-emerald-400 font-bold">00:20 :32s</span>
            <span className="px-1 bg-slate-800 text-slate-300 rounded text-[9px] font-bold">1X</span>
            <span className="text-slate-400 text-[10px]">Day 30 - AUG 2026</span>
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              setWeather(w => w === "thunderstorm" ? "clear" : w === "clear" ? "neon_night" : "thunderstorm");
            }}
            className="flex items-center gap-1.5 bg-[#182334] hover:bg-[#202e44] border border-slate-700/60 rounded px-2 py-0.5 text-slate-300 transition"
          >
            <CloudRain className="w-3.5 h-3.5 text-sky-400" />
            <span className="capitalize font-semibold text-sky-300">THUNDERSTORM (Day) ▾</span>
          </button>

          <div className="flex items-center gap-2 bg-[#182334] border border-slate-700/60 rounded px-2 py-0.5 text-[11px]">
            <span className="text-amber-400 font-bold">TOTAL BURNED 42,500 $OTC</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">CIRC SUPPLY 999.96M $OTC</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-bold">BUYBACK SWEEP 94% $1.85 / $1.96</span>
          </div>
        </div>

        {/* Right Nav Menu Buttons */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsDevPortalOpen(true); }}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>DEV PORTAL</span>
          </button>

          <div className="flex items-center gap-1 bg-[#182334] border border-slate-700/60 rounded px-2 py-0.5 text-slate-300">
            <span className="text-emerald-400 font-bold">CRYPTO $0.00005 ▾</span>
          </div>

          <button className="px-2 py-0.5 bg-[#182334] hover:bg-[#202e44] border border-slate-700/60 rounded text-slate-300">
            CIVIC ▾
          </button>
          <button className="px-2 py-0.5 bg-[#182334] hover:bg-[#202e44] border border-slate-700/60 rounded text-slate-300">
            VIEW ▾
          </button>
        </div>
      </header>

      {/* TOP RIGHT AUDIO BAR */}
      <div className="absolute top-14 right-4 z-20 flex items-center gap-2 bg-[#121c2c]/90 backdrop-blur border border-slate-800 rounded-lg px-3 py-1 text-xs font-mono shadow-xl">
        <button 
          onClick={(e) => { e.stopPropagation(); setSfxVolume(v => v === 0 ? 60 : 0); }}
          className="flex items-center gap-1 text-slate-300 hover:text-white"
        >
          {sfxVolume > 0 ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          <span>CITY SFX</span>
          <span className="text-emerald-400 font-bold">{sfxVolume}%</span>
        </button>
        <span className="text-slate-700">|</span>
        <button 
          onClick={(e) => { e.stopPropagation(); setJazzPlaying(!jazzPlaying); }}
          className="flex items-center gap-1 text-slate-300 hover:text-white"
        >
          <Music className="w-3.5 h-3.5 text-indigo-400" />
          <span>JAZZ</span>
          <span className={jazzPlaying ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
            {jazzPlaying ? "ON" : "OFF"}
          </span>
        </button>
      </div>

      {/* LEFT CAMERA / ZOOM CONTROL PALETTE */}
      <div className="absolute top-20 left-4 z-20 flex flex-col gap-1 bg-[#121c2c]/90 backdrop-blur border border-slate-800 rounded-lg p-1 shadow-2xl">
        <button 
          onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(1.6, z + 0.15)); }}
          className="w-8 h-8 rounded bg-[#182438] hover:bg-[#23334d] flex items-center justify-center text-slate-200 transition"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(0.4, z - 0.15)); }}
          className="w-8 h-8 rounded bg-[#182438] hover:bg-[#23334d] flex items-center justify-center text-slate-200 transition"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="h-px bg-slate-800 my-0.5" />
        <button 
          onClick={(e) => { e.stopPropagation(); setPanOffset({ x: 0, y: 30 }); setZoom(0.85); }}
          className="w-8 h-8 rounded bg-[#182438] hover:bg-[#23334d] flex items-center justify-center text-slate-200 transition"
          title="Reset Camera Center"
        >
          <Camera className="w-4 h-4 text-sky-400" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); }}
          className="w-8 h-8 rounded bg-[#182438] hover:bg-[#23334d] flex items-center justify-center text-slate-200 transition"
          title="Map Layer Filter"
        >
          <Palette className="w-4 h-4 text-purple-400" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setCoordinates(c => ({ ...c, rotation: (c.rotation + 90) % 360 })); }}
          className="w-8 h-8 rounded bg-[#182438] hover:bg-[#23334d] flex items-center justify-center text-slate-200 transition"
          title="Rotate 90deg"
        >
          <RotateCw className="w-4 h-4 text-emerald-400" />
        </button>
      </div>

      {/* RIGHT SIDE INSPECTION CARD (Exact match to ROAD BRIDGE from Screenshot 1) */}
      {selectedBuilding && (
        <aside 
          onClick={(e) => e.stopPropagation()}
          className="absolute top-24 right-4 w-80 bg-[#101826]/95 backdrop-blur-md border border-slate-800/90 rounded-xl p-4 z-20 flex flex-col gap-3 text-xs shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">{selectedBuilding.name}</h3>
              <span className="text-[10px] text-slate-400 font-mono">
                LOC: ({selectedBuilding.gridX}, {selectedBuilding.gridY}) • ELEVATION: 0 • LVL 1
              </span>
            </div>
            <button 
              onClick={() => setSelectedBuilding(null)}
              className="text-slate-500 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub Tabs */}
          <div className="flex bg-[#182438] p-0.5 rounded border border-slate-800 text-[11px] font-mono font-semibold">
            {(["STATUS", "BLUEPRINT", "TERRAIN"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveInspectorTab(tab)}
                className={`flex-1 py-1 rounded transition ${
                  activeInspectorTab === tab ? "bg-[#2563eb] text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Infrastructure status badges */}
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400">
              ⚡ POWER: {selectedBuilding.power}
            </span>
            <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400">
              💧 WATER: {selectedBuilding.water}
            </span>
          </div>

          {/* Green Foundation Slab Pill */}
          <div className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-500/40 rounded flex items-center gap-1.5 text-[11px] text-emerald-300 font-mono font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>FOUNDATION SLAB: {selectedBuilding.foundation}</span>
          </div>

          {/* Metrics Grid */}
          <div className="flex flex-col gap-1 text-[11px] text-slate-300 font-mono">
            <div className="flex justify-between py-0.5 border-b border-slate-800/60">
              <span className="text-slate-500">LAND VALUE:</span>
              <span className="text-white font-bold">{selectedBuilding.landValue}</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-800/60">
              <span className="text-slate-500">STRUCTURAL INTEGRITY:</span>
              <span className="text-emerald-400 font-bold">{selectedBuilding.integrity}</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-800/60">
              <span className="text-slate-500">POLLUTION:</span>
              <span className="text-white font-bold">{selectedBuilding.pollution}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">ELEVATION FOOTING:</span>
              <span className="text-sky-300 font-bold">{selectedBuilding.elevation}</span>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="pt-2 border-t border-slate-800 flex gap-2 font-mono font-bold">
            <button className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded flex items-center justify-center gap-1 transition shadow">
              <span>★ UPGRADE ($100)</span>
            </button>
            <button className="px-3 py-2 bg-rose-950/60 border border-rose-800/80 hover:bg-rose-900/60 text-rose-300 rounded transition">
              <span>🗑️ DECONSTRUCT</span>
            </button>
          </div>
        </aside>
      )}

      {/* BOTTOM LEFT: CITY CROWDED (70%) PROMPT */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-6 left-4 bg-[#101826]/95 backdrop-blur border border-amber-500/40 rounded-xl p-3 z-20 flex items-center gap-3 shadow-2xl font-mono"
      >
        <div className="flex flex-col">
          <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
            ⚠️ CITY CROWDED (70%)
          </span>
          <span className="text-xs text-white font-semibold">Form Pioneer Expedition?</span>
        </div>
        <button className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded transition shadow">
          Launch &gt;
        </button>
      </div>

      {/* BOTTOM CENTER: BUILD MENU PILL */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <button 
          onClick={(e) => { e.stopPropagation(); }}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-[#121c2c]/95 backdrop-blur hover:bg-[#1c2c44] border border-slate-700/80 rounded-full text-xs font-mono font-bold text-slate-200 shadow-2xl transition"
        >
          <Hammer className="w-3.5 h-3.5 text-emerald-400" />
          <span>BUILD MENU ^</span>
        </button>
      </div>

      {/* BOTTOM RIGHT: LIVE SATELLITE RADAR MINI MAP */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-6 right-4 w-44 h-36 bg-[#101826]/95 backdrop-blur border border-slate-800 rounded-xl p-2 z-20 flex flex-col justify-between shadow-2xl font-mono"
      >
        <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <Radio className="w-3 h-3 animate-pulse" /> SATELLITE RADAR
          </span>
          <span className="text-emerald-400 font-bold">LIVE ▾</span>
        </div>

        <div className="flex-1 my-1 bg-[#182334] rounded border border-slate-800/80 relative overflow-hidden flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border border-emerald-500/30 animate-ping absolute" />
          <div className="grid grid-cols-6 gap-1 opacity-70">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i % 3 === 0 ? "bg-emerald-400" : i % 5 === 0 ? "bg-sky-400" : "bg-slate-600"}`} />
            ))}
          </div>
        </div>

        <div className="text-[9px] text-slate-400 text-center truncate">
          COORDINATES: X={coordinates.x} Y={coordinates.y}
        </div>
      </div>

      {/* BOTTOM FOOTER STATUS BAR (Exact match to Screenshot 1) */}
      <footer className="absolute bottom-0 left-0 right-0 h-5 bg-[#0b1019] border-t border-slate-900 px-3 flex items-center justify-between z-20 text-[9px] font-mono text-slate-500">
        <div className="flex items-center gap-4">
          <span className="text-emerald-400">COORDINATES: X={coordinates.x} Y={coordinates.y} Z={coordinates.z} ROTATION: {coordinates.rotation}° POPULATION: {coordinates.population}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>METRO_ENGINE: AUTONOMOUS_AGENTS_v0.84</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> STATUS: OPERATIONAL
          </span>
        </div>
      </footer>

      {/* FLOATING DEV PORTAL MODAL (Autonomous Sniper & Sovereign Wealth Engine) */}
      {isDevPortalOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-12 inset-y-12 bg-[#0d1422]/98 backdrop-blur-2xl border border-slate-700/80 rounded-2xl z-40 p-6 flex flex-col shadow-2xl overflow-hidden font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  AUTONOMOUS SNIPER ENGINE <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">PUBLIC_INVESTOR_SHOWCASE</span>
                </h2>
                <p className="text-xs text-slate-400">Read-Only Telemetry Mirror • Upstream Authority: Local Daemon Feed</p>
              </div>
            </div>

            <button 
              onClick={() => setIsDevPortalOpen(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-200 font-semibold transition"
            >
              Close [ESC]
            </button>
          </div>

          {/* Metrics summary banner */}
          <div className="grid grid-cols-5 gap-3 py-4 border-b border-slate-800">
            <div className="bg-[#121c2e] p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Slot Allocation</span>
              <span className="text-lg font-bold font-mono text-white">
                {positions.length} / {vault?.maxSlots || 12} <span className="text-xs text-emerald-400 font-normal">({Math.max(0, (vault?.maxSlots || 12) - positions.length)} Avail)</span>
              </span>
            </div>
            <div className="bg-[#121c2e] p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Hot Vault (Public)</span>
              <span className="text-lg font-bold font-mono text-emerald-400">${vault?.usdcBalance?.toFixed(2) || "0.00"} USDC</span>
            </div>
            <div className="bg-[#121c2e] p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Free Liquidity</span>
              <span className="text-lg font-bold font-mono text-white">${vault?.freeLiquidityUsdc?.toFixed(2) || "0.00"} USDC</span>
            </div>
            <div className="bg-[#121c2e] p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Sinking Fund OTC</span>
              <span className="text-lg font-bold font-mono text-indigo-400">40% Share</span>
            </div>
            <div className="bg-[#121c2e] p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">SOL Reserve Health</span>
              <span className="text-lg font-bold font-mono text-emerald-300">OPTIMAL</span>
            </div>
          </div>

          {/* Active Slots Grid */}
          <div className="flex-1 py-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Runner Slots Matrix (Max: {vault?.maxSlots || 12} • Filled: {positions.length} • Available: {Math.max(0, (vault?.maxSlots || 12) - positions.length)})
              </h3>
              <span className="text-xs text-emerald-400 font-mono">Live Telemetry Feed</span>
            </div>

            {positions.length > 0 ? (
              <div className="grid grid-cols-3 gap-3.5">
                {positions.map((pos, idx) => (
                  <div key={pos.id} className="bg-[#121c2e] border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        SLOT #{idx + 1}
                      </span>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        pos.currentPnlPercent >= 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                      }`}>
                        {pos.currentPnlPercent >= 0 ? "+" : ""}{pos.currentPnlPercent.toFixed(1)}%
                      </span>
                    </div>

                    <div className="py-3">
                      <h4 className="text-lg font-bold text-white font-mono">${pos.tokenSymbol}</h4>
                      <span className="text-xs text-slate-400 font-mono">${pos.allocatedUsdc.toFixed(2)} USDC Allocated</span>
                    </div>

                    <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex justify-between font-mono">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Activity className="w-3 h-3 animate-spin" /> Trailing Ratchet
                      </span>
                      <span>Peak: +{pos.highestPnlSeen.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: vault?.maxSlots || 12 }).map((_, idx) => (
                  <div key={idx} className="bg-[#121c2e]/60 border border-dashed border-slate-800 rounded-xl p-4 flex flex-col justify-between items-center text-center">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-500">
                      SLOT #{idx + 1}
                    </span>
                    <div className="py-4">
                      <span className="text-xs font-mono font-bold text-emerald-400 block">AVAILABLE</span>
                      <span className="text-[10px] text-slate-500 font-mono">Ready for Local Stream</span>
                    </div>
                    <span className="text-[10px] text-slate-600 font-mono">Unallocated</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
