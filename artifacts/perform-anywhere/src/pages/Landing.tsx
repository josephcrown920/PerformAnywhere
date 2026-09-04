import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight, Box, Clapperboard, Sparkles, ChevronRight, Play, Camera, Video
} from "lucide-react";
import React from "react";

// Asset imports
import portraitImg from "@assets/IMG_0978_1788519281635.png";
import atvRainImg from "@assets/IMG_3849_1788519281635.png";
import standingBackImg from "@assets/IMG_3850_1788519281635.png";
import crowdImg from "@assets/IMG_3851_1788519281635.png";
import studioSetImg from "@assets/IMG_9787_1788519281635.jpeg";
import portraitPink2 from "@assets/IMG_9985_1788519281635.jpeg";
import portraitPink3 from "@assets/396420DD-94AF-4D2E-9BB3-CFCB51D3AFC5_1788519281635.png";
import uploadUiImg from "@assets/IMG_9877_1788519281635.jpeg";
import explainerImg from "@assets/4aa8e578-1b09-4cda-97b7-19821b329f12_1788519281635.jpeg";

export default function Landing() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground overflow-x-hidden selection:bg-aurora-pink/30">
      <Header />
      <main>
        <Hero />
        <PipelineStory />
        <FeaturesBento />
        <ProductPrinciple />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-background/50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 font-display text-xl tracking-tight font-medium hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-pink to-aurora-purple flex items-center justify-center shadow-[0_0_15px_rgba(255,105,180,0.4)]">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <span>Aurora</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <a href="#pipeline" className="hidden text-muted-foreground hover:text-white transition sm:inline">
            How it works
          </a>
          <a href="#features" className="hidden text-muted-foreground hover:text-white transition sm:inline">
            Features
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
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-[20%] w-[40%] h-[50%] rounded-full bg-aurora-purple/10 blur-[120px] mix-blend-screen animate-float" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[40%] rounded-full bg-aurora-pink/10 blur-[120px] mix-blend-screen animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 aurora-grid opacity-30 [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-4 py-1.5 text-xs font-mono text-white/80 tracking-widest uppercase mb-8"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-aurora-pink animate-pulse" />
          Perform Anywhere Engine v3
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.05] tracking-tight font-semibold mb-6 max-w-5xl"
        >
          Film yourself anywhere.<br />
          <span className="text-gradient">Aurora builds the world.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-12"
        >
          Upload a 30-second phone clip. Lock your identity. Transfer your exact motion and energy into an AI-generated blockbuster scene. No crew required.
        </motion.p>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full"
        >
          <StudioUI />
        </motion.div>
      </div>
    </section>
  )
}

function StudioUI() {
  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full h-auto lg:h-[600px] text-left">
      <div className="w-full lg:w-[320px] shrink-0 bg-[#0A0510]/80 backdrop-blur-2xl rounded-2xl border border-white/10 p-5 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        <div className="flex gap-4 text-sm font-medium mb-6 text-white/50 border-b border-white/10 pb-4 relative z-10">
          <span className="text-white relative cursor-pointer">Motion Control <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-white rounded-t-full"></div></span>
          <span className="hover:text-white transition cursor-pointer">World Gen</span>
          <span className="hover:text-white transition cursor-pointer">Orchestrate</span>
        </div>

        <div className="flex flex-col gap-4 flex-1 relative z-10">
          <div className="p-4 rounded-xl border border-aurora-pink/30 bg-aurora-pink/5 flex gap-4 items-center relative overflow-hidden ring-1 ring-inset ring-aurora-pink/10 shadow-[0_0_20px_rgba(255,105,180,0.05)]">
            <img src={portraitImg} alt="Identity background" className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm scale-110" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0510]/90 to-[#0A0510]/60"></div>
            <div className="relative z-10 flex gap-3 items-center w-full">
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/20 shrink-0 shadow-lg">
                <img src={portraitImg} alt="Identity portrait" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col justify-center overflow-hidden">
                <span className="text-sm font-medium text-white truncate">Identity Locked</span>
                <span className="text-[10px] text-aurora-pink font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-aurora-pink rounded-full animate-pulse" /> 99.8% Match
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition flex gap-3 items-center relative overflow-hidden group cursor-pointer h-24">
            <img src={studioSetImg} alt="Motion reference" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0510] to-transparent"></div>
            <div className="w-10 h-10 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center shrink-0 relative z-10 backdrop-blur-md">
              <Video className="w-4 h-4 text-white/70" />
            </div>
            <div className="flex flex-col relative z-10">
              <span className="text-sm font-medium text-white/90">take_04_raw.mp4</span>
              <span className="text-[10px] text-white/40">Motion Reference • 0:15s</span>
            </div>
          </div>

          <div className="mt-auto flex justify-between items-center p-3.5 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md cursor-pointer hover:bg-white/5 transition">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-white/40 font-mono uppercase tracking-wide">Model</span>
              <span className="text-xs text-white font-medium">Aurora 3.0 Cinematic</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/40" />
          </div>
        </div>

        <Link href="/projects" className="mt-4 w-full py-4 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2 relative z-10">
          Generate <Sparkles className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex-1 bg-[#0A0510]/90 backdrop-blur-3xl rounded-2xl border border-white/10 flex flex-col overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-h-[400px]">
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-aurora-purple/10 blur-[100px] pointer-events-none -z-10" />

        <div className="p-5 md:p-6 pb-4 flex justify-between items-end border-b border-white/5 bg-black/20">
          <div>
            <h2 className="text-2xl font-display font-medium text-white tracking-wide flex items-center gap-2">
              <Box className="w-5 h-5 text-aurora-cyan" /> Viewport
            </h2>
            <p className="text-xs text-white/40 mt-1 font-mono uppercase tracking-wider">Output / Direct your shoot</p>
          </div>
          <div className="hidden md:flex gap-2">
            <span className="px-3 py-1 bg-white/5 rounded-md text-[10px] font-mono text-white/50 border border-white/10">1080p</span>
            <span className="px-3 py-1 bg-white/5 rounded-md text-[10px] font-mono text-white/50 border border-white/10">24fps</span>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6 flex flex-col md:flex-row gap-4 overflow-hidden relative z-10">
          <div className="flex-1 rounded-xl overflow-hidden relative group border border-white/10 shadow-2xl bg-black">
            <img src={atvRainImg} alt="Cinematic Output" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105 opacity-90" />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
                <Play className="w-6 h-6 text-white ml-1" />
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div className="flex gap-2 flex-wrap max-w-[70%]">
                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-mono text-white/80 border border-white/10">NIGHT_STREET</span>
                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-mono text-white/80 border border-white/10">POLICE_LIGHTS</span>
                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-mono text-white/80 border border-white/10">RAIN</span>
              </div>
              <div className="px-3 py-1.5 bg-aurora-cyan/10 border border-aurora-cyan/30 rounded-md text-[10px] font-mono text-aurora-cyan flex items-center gap-2 backdrop-blur-md shadow-[0_0_15px_rgba(0,255,255,0.1)]">
                COMPLETED
              </div>
            </div>
          </div>

          <div className="w-full md:w-[180px] flex md:flex-col gap-4">
            <div className="flex-1 md:flex-none h-24 md:h-[calc(50%-8px)] rounded-xl overflow-hidden relative border border-white/10 hover:border-aurora-purple/50 transition cursor-pointer group">
              <img src={portraitPink3} alt="Variation 1" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition duration-500" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition backdrop-blur-[2px]">
                <span className="text-[10px] font-mono text-white tracking-widest bg-black/60 px-2 py-1 rounded">VAR_01</span>
              </div>
            </div>
            <div className="flex-1 md:flex-none h-24 md:h-[calc(50%-8px)] rounded-xl overflow-hidden relative border border-white/10 hover:border-aurora-pink/50 transition cursor-pointer group">
              <img src={standingBackImg} alt="Variation 2" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition duration-500" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition backdrop-blur-[2px]">
                <span className="text-[10px] font-mono text-white tracking-widest bg-black/60 px-2 py-1 rounded">VAR_02</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PipelineStory() {
  return (
    <section id="pipeline" className="py-32 relative bg-black border-y border-white/5 overflow-hidden">
      <div className="absolute inset-0 aurora-grid opacity-20" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="text-center mb-24">
          <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight mb-4">
            Your vision. <span className="text-aurora-purple">Our physics.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From a single portrait to a fully simulated environment in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-[40%] left-[15%] right-[15%] h-px bg-gradient-to-r from-aurora-pink/20 via-aurora-purple/50 to-aurora-cyan/20 border-t border-dashed border-white/20 z-0"></div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center relative z-10"
          >
            <div className="w-12 h-12 rounded-full bg-black border border-aurora-pink/30 text-aurora-pink flex items-center justify-center font-mono text-lg font-bold mb-6 shadow-[0_0_20px_rgba(255,105,180,0.2)]">1</div>
            <div className="w-full aspect-[4/5] rounded-2xl border border-white/10 overflow-hidden mb-6 relative group">
              <img src={portraitImg} alt="Source Portrait" className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-5">
                <span className="text-xs font-mono text-aurora-pink tracking-widest uppercase mb-1">Source</span>
                <span className="text-white font-medium">The Identity</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed px-4">Upload a single clear photo. Our engine extracts facial structure, skin texture, and micro-expressions.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center text-center relative z-10 pt-8 md:pt-0"
          >
            <div className="w-12 h-12 rounded-full bg-black border border-aurora-purple/30 text-aurora-purple flex items-center justify-center font-mono text-lg font-bold mb-6 shadow-[0_0_20px_rgba(171,75,255,0.2)]">2</div>
            <div className="w-full aspect-[4/5] rounded-2xl border border-white/10 overflow-hidden mb-6 relative group">
              <img src={studioSetImg} alt="Motion Reference" className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-5">
                <span className="text-xs font-mono text-aurora-purple tracking-widest uppercase mb-1">Motion</span>
                <span className="text-white font-medium">The Performance</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed px-4">Record yourself in any room. The AI transfers your exact physical movement, weight, and timing.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-center text-center relative z-10 pt-8 md:pt-0"
          >
            <div className="w-12 h-12 rounded-full bg-black border border-aurora-cyan/30 text-aurora-cyan flex items-center justify-center font-mono text-lg font-bold mb-6 shadow-[0_0_20px_rgba(0,255,255,0.2)]">3</div>
            <div className="w-full aspect-[4/5] rounded-2xl border border-white/10 overflow-hidden mb-6 relative group">
              <img src={standingBackImg} alt="Final Scene" className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-5">
                <span className="text-xs font-mono text-aurora-cyan tracking-widest uppercase mb-1">Output</span>
                <span className="text-white font-medium">The Scene</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed px-4">Describe the world. Aurora composites your locked identity and motion into a photorealistic cinematic render.</p>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

function FeaturesBento() {
  return (
    <section id="features" className="py-32 relative">
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="mb-20 max-w-2xl">
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-6">
            Professional control.<br/>
            <span className="text-white/40">Zero complexity.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl bg-card border border-white/5 overflow-hidden flex flex-col hover:border-white/10 transition-colors shadow-xl group">
            <div className="h-72 bg-black relative overflow-hidden">
               <img src={uploadUiImg} alt="Direct your shoot UI" className="absolute inset-0 w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 transition duration-700 group-hover:scale-105" />
               <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
            </div>
            <div className="p-8 relative z-10 -mt-12">
              <h3 className="text-2xl font-display font-medium mb-3 text-white">Direct your shoot</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed max-w-md">Drop references, write direction, and generate. Provide a performance video and an identity photo to get started instantly.</p>
            </div>
          </div>

          <div className="rounded-3xl bg-card border border-white/5 overflow-hidden flex flex-col hover:border-white/10 transition-colors shadow-xl group">
             <div className="h-72 bg-black relative overflow-hidden">
               <img src={portraitPink2} alt="Persistent Identity" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-700 group-hover:scale-105" />
               <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
             </div>
             <div className="p-8 pt-0 relative z-10 -mt-4">
              <h3 className="text-xl font-display font-medium mb-3 text-white">Persistent Identity</h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed">Your facial features, expressions, and styling remain completely consistent across all outputs.</p>
            </div>
          </div>

          <div className="rounded-3xl bg-card border border-white/5 overflow-hidden flex flex-col hover:border-white/10 transition-colors shadow-xl group">
            <div className="h-64 bg-[#050208] relative overflow-hidden">
               <img src={explainerImg} alt="Motion Control Engine" className="absolute inset-0 w-full h-full object-cover object-center opacity-80 group-hover:opacity-100 transition duration-700 group-hover:scale-105" />
               <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
            </div>
            <div className="p-8 pt-0 relative z-10">
              <h3 className="text-xl font-display font-medium mb-3 text-white">Motion Control</h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed">Reads real movement from a phone clip and transfers style, motion, and energy into the AI scene.</p>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-3xl bg-card border border-white/5 overflow-hidden flex flex-col md:flex-row hover:border-white/10 transition-colors shadow-xl group">
            <div className="p-8 md:p-10 flex-1 flex flex-col justify-center order-2 md:order-1">
              <h3 className="text-2xl font-display font-medium mb-3 text-white">Complex Subject Interaction</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed max-w-sm">Our pipeline ensures your character correctly occludes and interacts with foreground elements, crowds, and atmospheric effects.</p>
            </div>
            <div className="w-full md:w-1/2 bg-black relative overflow-hidden min-h-[250px] order-1 md:order-2">
              <img src={crowdImg} alt="Crowd interaction" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-card hidden md:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent md:hidden" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProductPrinciple() {
  return (
    <section className="py-24 border-y border-white/5 bg-[#050208] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(171,75,255,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="mx-auto max-w-4xl px-6 relative z-10 text-center">
        <Sparkles className="w-10 h-10 mx-auto text-aurora-pink/50 mb-8" />
        <h3 className="text-2xl md:text-4xl font-display font-medium leading-tight mb-8">
          Empowering independent creators to achieve blockbuster visual fidelity without the blockbuster budget. Every frame should feel intentional, cinematic, and entirely yours.
        </h3>
        <div className="flex flex-col items-center">
          <div className="font-semibold text-white">Product Principle</div>
          <div className="text-sm text-muted-foreground font-mono mt-1 uppercase tracking-wider">
            Aurora Synthetic Intelligence
          </div>
          <div className="mt-4 text-[11px] text-muted-foreground/50 italic">
            (Owner note: Verified customer quotes can be added here once available)
          </div>
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="relative py-32 overflow-hidden bg-black">
      <div className="absolute inset-0 aurora-grid opacity-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-b from-aurora-cyan/10 to-transparent blur-[100px] pointer-events-none" />

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
          className="inline-flex items-center gap-2 rounded-full bg-white text-black px-8 py-4 font-semibold text-lg hover:bg-white/90 hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] group"
        >
          Start a project <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-12 border-t border-white/5 bg-[#030105] text-muted-foreground text-sm relative z-10">
      <div className="mx-auto flex max-w-7xl flex-col md:flex-row items-center justify-between gap-6 px-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
             <Camera className="w-3 h-3 text-white" />
          </div>
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
