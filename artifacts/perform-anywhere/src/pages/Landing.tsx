import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  ArrowRight, Settings2, Image as ImageIcon, 
  Video, Box, Layers, Clapperboard
} from "lucide-react";
import React from "react";

// Explicit asset imports as instructed
import stoneleapImg from "@assets/IMG_2247_1788231391518.jpeg";
import appUiImg from "@assets/IMG_2688_1788237857554.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-aurora-pink/30">
      <Header />
      <main>
        <Hero />
        <FeaturesBento />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-background/50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 font-display text-xl tracking-tight font-medium hover:opacity-80 transition-opacity">
          <img src="/aurora-logo.png" alt="Aurora Logo" className="h-7 w-auto" />
          <span>Aurora</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <a href="#pipeline" className="hidden px-2 py-1 text-muted-foreground hover:text-foreground transition sm:inline">
            Pipeline
          </a>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2 font-semibold hover:bg-white/90 transition shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            Open Studio <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-aurora-purple/20 blur-[120px] mix-blend-screen animate-float" />
        <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-aurora-pink/10 blur-[120px] mix-blend-screen animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 aurora-grid opacity-20 [mask-image:linear-gradient(to_bottom,black_20%,transparent_100%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 text-center z-10 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-aurora-purple/30 bg-aurora-purple/10 px-4 py-1.5 text-xs font-mono text-aurora-purple tracking-widest uppercase mb-8"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-aurora-purple animate-pulse" />
          Synthetic Intelligence Studio
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display text-[clamp(3.5rem,8vw,7rem)] leading-[0.9] tracking-tight font-semibold mb-6 max-w-4xl"
        >
          Direct yourself <br />
          <span className="text-gradient">in any world.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10"
        >
          Upload a performance. Lock your identity. Restage in entirely new cinematic worlds powered by synthetic intelligence.
        </motion.p>
        
        <HeroStudio />
      </div>
    </section>
  )
}

function HeroStudio() {
  return (
    <motion.div 
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="w-full max-w-5xl mx-auto rounded-2xl border border-white/10 bg-[#0A0510]/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row h-auto md:h-[500px] mt-8 relative text-left"
    >
      {/* Glow behind the studio panel */}
      <div className="absolute -inset-1 bg-gradient-to-r from-aurora-purple/20 via-transparent to-aurora-pink/20 blur-xl -z-10" />

      {/* Left panel - Config */}
      <div className="hidden md:flex w-[280px] border-r border-white/5 flex-col bg-black/40 z-10 shrink-0">
        <div className="p-5 border-b border-white/5 font-mono text-[10px] text-white/40 uppercase tracking-widest flex items-center justify-between">
          <span>Project Inputs</span>
          <Settings2 className="w-3 h-3" />
        </div>
        <div className="p-5 flex flex-col gap-4">
          {/* Input block 1 */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 flex gap-4 items-center hover:bg-white/[0.04] transition-colors">
             <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
               <Video className="w-4 h-4 text-white/60" />
             </div>
             <div className="flex flex-col justify-center overflow-hidden">
               <span className="text-sm font-medium truncate text-white">Performance</span>
               <span className="text-[11px] text-white/40 font-mono truncate">take_04_raw.mp4</span>
             </div>
          </div>
          {/* Input block 2 */}
          <div className="rounded-xl border border-aurora-cyan/20 bg-aurora-cyan/5 p-3 flex gap-4 items-center ring-1 ring-inset ring-aurora-cyan/10">
             <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center overflow-hidden relative shrink-0">
               <img src={appUiImg} className="absolute inset-0 w-[400%] h-[400%] max-w-none object-cover object-[75%_50%] opacity-90" alt="Identity" />
             </div>
             <div className="flex flex-col justify-center overflow-hidden">
               <span className="text-sm font-medium text-aurora-cyan truncate">Identity</span>
               <span className="text-[11px] text-aurora-cyan/60 font-mono truncate">Locked • 99% Match</span>
             </div>
          </div>
          {/* Input block 3 */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 flex gap-4 items-center hover:bg-white/[0.04] transition-colors">
             <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
               <Layers className="w-4 h-4 text-white/60" />
             </div>
             <div className="flex flex-col justify-center overflow-hidden">
               <span className="text-sm font-medium truncate text-white">Environment</span>
               <span className="text-[11px] text-white/40 font-mono truncate">Floating islands...</span>
             </div>
          </div>
        </div>
        <div className="mt-auto p-5">
          <Link href="/projects" className="block w-full py-3 text-center bg-white text-black font-semibold text-sm rounded-lg hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-100">
            Render Scene
          </Link>
        </div>
      </div>
      
      {/* Main viewport */}
      <div className="flex-1 relative bg-[#050208] flex flex-col z-10 min-h-[400px] md:min-h-0">
        {/* Top toolbar */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-5 bg-black/40">
          <div className="flex items-center gap-3 text-xs font-mono text-white/50">
            <Box className="w-4 h-4" /> 
            <span>Viewport</span>
            <span className="px-2 py-0.5 rounded bg-white/5 text-[10px]">1080p</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-aurora-pink/10 border border-aurora-pink/20">
            <div className="w-1.5 h-1.5 rounded-full bg-aurora-pink animate-pulse"></div>
            <span className="text-[10px] font-mono text-aurora-pink font-semibold tracking-wider">RENDERING</span>
          </div>
        </div>
        
        {/* Viewport content */}
        <div className="flex-1 relative overflow-hidden group">
          <img src={stoneleapImg} alt="Viewport" className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-lighten transition-transform duration-[2s] group-hover:scale-105" />
          
          {/* Scanning line */}
          <div className="absolute inset-x-0 h-[2px] bg-aurora-cyan shadow-[0_0_15px_hsl(var(--aurora-cyan))] animate-[scan_3s_linear_infinite]" />
          
          {/* Subtle grid over image */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQwLDAgNDAsNDAgMCw0MCIvPjwvZz48L3N2Zz4=')] opacity-30 mix-blend-overlay"></div>
          
          {/* Target reticles (Center) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 flex items-center justify-center pointer-events-none">
            <div className="w-2 h-2 border border-white/50 rounded-sm"></div>
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-aurora-cyan"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-aurora-cyan"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-aurora-cyan"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-aurora-cyan"></div>
          </div>
        </div>
        
        {/* Bottom timeline */}
        <div className="h-28 border-t border-white/5 bg-[#030105] p-4 flex flex-col gap-2">
          <div className="flex justify-between px-2 text-[10px] font-mono text-white/30">
             <span>00:00:00:00</span>
             <span>00:00:15:00</span>
             <span>00:00:30:00</span>
          </div>
          {/* Video track */}
          <div className="relative h-7 bg-white/[0.02] rounded-md mx-2 overflow-hidden border border-white/5">
             <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-aurora-purple/30 to-aurora-pink/30 w-[65%]"></div>
             {/* Keyframes */}
             <div className="absolute inset-0 flex items-center justify-around opacity-20">
               {Array.from({length: 12}).map((_, i) => <div key={i} className="w-4 h-4 rounded-sm bg-white border border-white/50" />)}
             </div>
             {/* Playhead */}
             <div className="absolute top-0 bottom-0 left-[65%] w-[2px] bg-white z-10 shadow-[0_0_10px_white]">
                <div className="absolute -top-1 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-white" />
             </div>
          </div>
          {/* Audio track */}
           <div className="relative h-5 mx-2 flex items-center gap-[2px] opacity-40">
             {Array.from({length: 120}).map((_, i) => (
               <div key={i} className="flex-1 bg-aurora-cyan rounded-full" style={{ height: `${10 + Math.random() * 90}%` }}></div>
             ))}
           </div>
        </div>
      </div>
    </motion.div>
  )
}

function FeaturesBento() {
  return (
    <section id="pipeline" className="py-32 relative">
      <div className="mx-auto max-w-6xl px-6 relative z-10">
        <div className="mb-20 md:text-center max-w-2xl mx-auto flex flex-col items-center">
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-6">
            Four inputs.<br/>
            <span className="text-gradient">Infinite outputs.</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
            Our pipeline routes your references to specialized models automatically,
            keeping you focused purely on creative direction.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Capture */}
          <BentoCard 
            title="Motion Capture" 
            desc="Upload up to 30 seconds of raw performance. Timing, gestures, and physics are preserved perfectly."
            visual={<TimelineVisual />}
          />
          {/* Card 2: Identity */}
          <BentoCard 
            title="Identity Lock" 
            desc="A single reference photo anchors your facial likeness across any style, angle, or lighting condition."
            visual={<FaceScanVisual />}
          />
          {/* Card 3: World (Full width) */}
          <div className="md:col-span-2">
            <BentoCard 
              title="World Generation" 
              desc="Describe the environment or upload a scene reference. The engine builds a cohesive cinematic universe around your performance."
              visual={<WorldVisual />}
            />
          </div>
          {/* Card 4: Control */}
          <BentoCard 
            title="Style Control" 
            desc="Dial in film grain, halation, cinematic grading, and motion blur to achieve a true blockbuster look."
            visual={<StyleControlVisual />}
          />
          {/* Card 5: Pipeline */}
          <BentoCard 
            title="Multi-model Routing" 
            desc="We dynamically route face, body, and background to different diffusion models for maximum fidelity."
            visual={<PipelineVisual />}
          />
        </div>
      </div>
    </section>
  )
}

function BentoCard({ title, desc, visual }: { title: string, desc: string, visual: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="group rounded-3xl bg-card border border-white/10 overflow-hidden flex flex-col hover:border-white/20 transition-colors shadow-xl"
    >
      <div className="w-full">
        {visual}
      </div>
      <div className="p-8 md:p-10 flex-1 flex flex-col justify-center">
        <h3 className="text-2xl font-display font-medium mb-3 text-white">{title}</h3>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-sm">{desc}</p>
      </div>
    </motion.div>
  )
}

function TimelineVisual() {
  return (
    <div className="relative h-64 md:h-72 bg-black/40 overflow-hidden p-6 border-b border-white/5 flex flex-col justify-center gap-4 w-full">
      <div className="absolute inset-0 bg-gradient-to-tr from-aurora-purple/5 to-transparent"></div>
      
      <div className="relative z-10 w-full max-w-[90%] mx-auto">
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono mb-3">
          <span>00:00:00:00</span>
          <span>00:00:15:00</span>
          <span>00:00:30:00</span>
        </div>
        
        {/* Video track */}
        <div className="h-10 w-full bg-black/60 border border-white/10 rounded-lg relative overflow-hidden flex mb-3">
           <div className="absolute top-0 bottom-0 left-0 w-[45%] bg-aurora-purple/20 border-r border-aurora-purple"></div>
           <div className="w-full h-full flex items-center justify-around opacity-30 px-2 gap-1">
              {Array.from({length: 12}).map((_, i) => <div key={i} className="h-[70%] w-full bg-white/20 rounded-[2px]"></div>)}
           </div>
        </div>
        
        {/* Audio track */}
        <div className="h-10 w-full bg-black/60 border border-white/10 rounded-lg relative overflow-hidden flex items-center px-2 gap-[2px]">
          {Array.from({length: 60}).map((_, i) => (
            <div key={i} className="flex-1 bg-aurora-cyan/40 rounded-full" style={{ height: `${Math.max(10, Math.random() * 100)}%` }}></div>
          ))}
        </div>
        
        {/* Playhead */}
        <div className="absolute top-4 bottom-[-10px] left-[45%] w-[2px] bg-aurora-pink shadow-[0_0_12px_hsl(var(--aurora-pink))] z-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-aurora-pink" />
        </div>
      </div>
    </div>
  )
}

function FaceScanVisual() {
  return (
    <div className="relative h-64 md:h-72 bg-black/40 overflow-hidden flex items-center justify-center border-b border-white/5 w-full">
      <div className="absolute inset-0 bg-gradient-to-bl from-aurora-cyan/5 to-transparent"></div>
      
      <div className="relative w-36 h-44 rounded-2xl border border-white/20 overflow-hidden shadow-2xl z-10">
        <img src={appUiImg} className="absolute inset-0 w-[400%] h-[400%] max-w-none object-cover object-[75%_50%] opacity-90" alt="Face Anchor" />
        
        {/* Scanning reticle */}
        <div className="absolute inset-3 border-2 border-aurora-cyan/50 rounded-xl border-dashed"></div>
        {/* Scanning line */}
        <div className="absolute inset-x-0 h-[2px] bg-aurora-cyan shadow-[0_0_15px_hsl(var(--aurora-cyan))] animate-[scan-face_3s_ease-in-out_infinite]"></div>
      </div>
      
      <div className="absolute bottom-6 right-6 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-mono text-aurora-cyan flex items-center gap-2 z-10 shadow-lg">
        <div className="w-1.5 h-1.5 bg-aurora-cyan rounded-full animate-pulse"></div>
        IDENTITY MATCH
      </div>
    </div>
  )
}

function WorldVisual() {
  return (
    <div className="relative h-72 md:h-96 w-full bg-black/40 overflow-hidden border-b border-white/5">
      <img src={stoneleapImg} alt="Generated World" className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-lighten" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0510] via-transparent to-[#0A0510]/20 pointer-events-none"></div>
      
      {/* UI Overlay */}
      <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 z-10">
        <div className="flex gap-2 flex-wrap max-w-xl">
          {["Floating islands", "Bioluminescent flora", "Cinematic lighting", "Unreal Engine 5"].map(tag => (
            <span key={tag} className="bg-black/60 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl text-xs font-mono text-white/90 shadow-lg">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex flex-col items-start md:items-end gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-lg">
          <span className="text-[10px] text-white/50 uppercase tracking-widest">Render Status</span>
          <span className="text-sm font-mono text-aurora-cyan font-semibold">100% COMPLETE</span>
        </div>
      </div>
    </div>
  )
}

function StyleControlVisual() {
  return (
    <div className="relative h-64 md:h-72 bg-black/40 overflow-hidden p-8 border-b border-white/5 flex flex-col justify-center gap-7 w-full">
      <div className="absolute inset-0 bg-gradient-to-br from-aurora-pink/5 to-transparent"></div>
      
      {[
        { label: "Cinematic Grade", val: "85%", color: "bg-aurora-pink" },
        { label: "Film Grain", val: "40%", color: "bg-aurora-purple" },
        { label: "Volumetric Fog", val: "65%", color: "bg-aurora-cyan" },
      ].map((ctrl, i) => (
        <div key={i} className="flex flex-col gap-3 relative z-10 w-full max-w-[80%] mx-auto">
          <div className="flex justify-between text-xs font-mono text-white/70">
            <span>{ctrl.label}</span>
            <span>{ctrl.val}</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
            <div className={`h-full ${ctrl.color} rounded-full shadow-[0_0_10px_currentColor]`} style={{ width: ctrl.val }}></div>
          </div>
        </div>
      ))}
    </div>
  )
}

function PipelineVisual() {
  return (
    <div className="relative h-64 md:h-72 bg-black/40 overflow-hidden p-6 border-b border-white/5 flex items-center justify-center w-full">
      <div className="absolute inset-0 aurora-grid opacity-30"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 w-full justify-center">
        {/* Nodes */}
        <div className="flex flex-row md:flex-col gap-4">
          <div className="px-4 py-2 bg-black/80 border border-white/10 rounded-xl text-xs font-mono flex items-center gap-2 backdrop-blur shadow-lg text-white/80">
            <Video className="w-3.5 h-3.5 text-aurora-cyan" /> src_perf.mp4
          </div>
          <div className="px-4 py-2 bg-black/80 border border-white/10 rounded-xl text-xs font-mono flex items-center gap-2 backdrop-blur shadow-lg text-white/80">
            <ImageIcon className="w-3.5 h-3.5 text-aurora-pink" /> id_anchor.jpg
          </div>
        </div>
        
        {/* Connection Lines (Desktop) */}
        <svg width="40" height="80" viewBox="0 0 40 80" className="hidden md:block text-white/20">
          <path d="M0 15 C 20 15, 20 40, 40 40" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M0 65 C 20 65, 20 40, 40 40" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>

        {/* Connection Lines (Mobile) */}
        <svg width="80" height="20" viewBox="0 0 80 20" className="block md:hidden text-white/20">
          <path d="M15 0 C 15 10, 40 10, 40 20" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M65 0 C 65 10, 40 10, 40 20" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        
        {/* Core Router Node */}
        <div className="p-5 bg-aurora-purple/10 border border-aurora-purple/50 rounded-2xl shadow-[0_0_30px_rgba(171,75,255,0.2)] backdrop-blur relative">
           <div className="absolute inset-0 rounded-2xl border border-aurora-purple/30 animate-ping opacity-20"></div>
           <Box className="w-6 h-6 text-aurora-purple" />
        </div>
        
        {/* Line to output */}
        <div className="hidden md:flex flex-col items-center justify-center">
          <svg width="40" height="2" className="text-aurora-purple">
            <line x1="0" y1="1" x2="40" y2="1" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_1s_linear_infinite]" />
          </svg>
        </div>
        <div className="flex md:hidden flex-col items-center justify-center">
          <svg width="2" height="20" className="text-aurora-purple">
            <line x1="1" y1="0" x2="1" y2="20" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_1s_linear_infinite]" />
          </svg>
        </div>

        {/* Output */}
        <div className="px-5 py-3 bg-aurora-pink/10 border border-aurora-pink/30 rounded-xl text-sm font-mono text-aurora-pink backdrop-blur shadow-[0_0_20px_rgba(255,105,180,0.1)]">
          Synthesize
        </div>
      </div>
    </div>
  )
}

function CTA() {
  return (
    <section className="relative py-32 overflow-hidden border-t border-white/5 bg-black">
      <div className="absolute inset-0 aurora-grid opacity-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-b from-aurora-purple/20 to-transparent blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 backdrop-blur-xl">
          <Clapperboard className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-display text-5xl md:text-6xl font-semibold tracking-tight mb-6">
          Cinema for one.
        </h2>
        <p className="text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed">
          No subscription traps. No hidden limits. Buy credits, set up your scene, and render breathtaking takes on demand.
        </p>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 rounded-full bg-white text-black px-8 py-4 font-semibold text-lg hover:bg-white/90 hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)]"
        >
          Start a project <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-12 border-t border-white/5 bg-[#050208] text-muted-foreground text-sm relative z-10">
      <div className="mx-auto flex max-w-6xl flex-col md:flex-row items-center justify-between gap-6 px-6">
        <div className="flex items-center gap-3">
          <img src="/aurora-logo.png" alt="Aurora Logo" className="h-5 w-auto opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
          <span className="font-display tracking-wide uppercase text-xs">Aurora Synthetic Intelligence</span>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-xs font-mono text-white/30">
          <span>Anonymous</span>
          <span>•</span>
          <span>Credit-based</span>
          <span>•</span>
          <span>AI Video Models</span>
        </div>
      </div>
    </footer>
  )
}
