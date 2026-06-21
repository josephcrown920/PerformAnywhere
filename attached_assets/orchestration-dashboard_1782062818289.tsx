import { useState } from "react";

const PROVIDERS = {
  text: [
    { name: "Groq", models: ["llama-4-scout", "llama-4-maverick", "mixtral"], free: true, color: "#f97316" },
    { name: "Gemini", models: ["flash-2.0", "flash-lite", "pro-2.0"], free: true, color: "#4285f4" },
    { name: "Mistral", models: ["nemo", "mistral-large", "codestral"], free: false, color: "#f97316" },
    { name: "OpenAI", models: ["gpt-4o-mini", "gpt-4o"], free: false, color: "#10a37f" },
    { name: "Cohere", models: ["command-r", "command-r-plus"], free: true, color: "#39d353" },
    { name: "Together", models: ["llama-4", "deepseek-r1", "qwen-2.5"], free: false, color: "#8b5cf6" },
  ],
  image: [
    { name: "Runware", models: ["flux-schnell", "flux-dev", "sdxl"], free: false, color: "#ec4899" },
    { name: "Fal AI", models: ["flux-schnell", "flux-pro", "ideogram-v3"], free: false, color: "#a855f7" },
    { name: "Replicate", models: ["flux-schnell", "flux-dev", "sdxl"], free: false, color: "#06b6d4" },
    { name: "HuggingFace", models: ["flux-schnell", "sdxl"], free: true, color: "#fbbf24" },
  ],
  video: [
    { name: "Fal (Kling 3.0)", models: ["kling-3.0", "kling-text", "wan-pro"], free: false, color: "#a855f7" },
    { name: "Fal (WAN)", models: ["wan-pro", "wan-img", "luma"], free: false, color: "#8b5cf6" },
    { name: "Replicate", models: ["minimax", "wan-t2v", "ltx-video"], free: false, color: "#06b6d4" },
    { name: "RunPod", models: ["comfyui", "wan-2.1", "cogvideox"], free: false, color: "#f59e0b" },
  ],
  audio: [
    { name: "ElevenLabs", models: ["multilingual-v2", "turbo-v2", "turbo-v2-5"], free: false, color: "#22d3ee" },
    { name: "Replicate (MusicGen)", models: ["musicgen", "bark"], free: false, color: "#06b6d4" },
    { name: "HuggingFace", models: ["speecht5", "musicgen", "bark"], free: true, color: "#fbbf24" },
  ],
};

const CREDIT_COSTS = { text: "~1 credit / 1K tokens", image: "40–60 credits / image", video: "200 credits / sec", audio: "50–120 credits / min" };
const TYPE_ICONS = { text: "🔤", image: "🎨", video: "🎬", audio: "🎵" };
const TYPE_COLORS = { text: "#f97316", image: "#a855f7", video: "#ec4899", audio: "#22d3ee" };

const EXAMPLE_REQUESTS = {
  text: `POST /api/generate\n{\n  "type": "text",\n  "model": "groq/llama-4-scout",\n  "prompt": "Write a hook for an Afrobeats song",\n  "options": { "temperature": 0.9, "maxTokens": 512 },\n  "userEmail": "user@example.com"\n}`,
  image: `POST /api/generate\n{\n  "type": "image",\n  "model": "fal/flux-pro",\n  "prompt": "Cinematic portrait, dramatic lighting, 4K",\n  "options": { "width": 1024, "height": 1024, "steps": 28 },\n  "userEmail": "user@example.com"\n}`,
  video: `POST /api/generate\n{\n  "type": "video",\n  "model": "fal/kling-3.0",\n  "prompt": "NBA Josh walking through Port Harcourt streets, cinematic",\n  "options": { "duration": 5, "aspectRatio": "16:9", "imageUrl": "https://..." },\n  "userEmail": "user@example.com"\n}`,
  audio: `POST /api/generate\n{\n  "type": "audio",\n  "model": "elevenlabs/multilingual-v2",\n  "prompt": "Welcome to Creator Factory, the future of AI content",\n  "options": { "voiceId": "pNInz6obpgDQGcFmaJgB", "stability": 0.5 },\n  "userEmail": "user@example.com"\n}`,
};

function Badge({ label, color, small }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: `${color}18`, border: `1px solid ${color}40`,
      color, borderRadius: 4, padding: small ? "1px 6px" : "2px 8px",
      fontSize: small ? 9 : 10, fontFamily: "monospace", fontWeight: 600,
      letterSpacing: "0.04em",
    }}>{label}</span>
  );
}

function ProviderCard({ provider, active, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: active ? "#0f1117" : "#080a0f",
      border: `1px solid ${active ? provider.color + "60" : "#1a1f2e"}`,
      borderRadius: 8, padding: "10px 12px", cursor: "pointer",
      transition: "all 0.15s", position: "relative", overflow: "hidden",
    }}>
      {active && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: provider.color }} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: active ? provider.color : "#8892a4" }}>{provider.name}</span>
        {provider.free && <Badge label="FREE" color="#22c55e" small />}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {provider.models.slice(0, 2).map(m => (
          <span key={m} style={{ fontSize: 9, color: "#4a5568", fontFamily: "monospace", background: "#0d1017", borderRadius: 3, padding: "1px 5px", border: "1px solid #1a2030" }}>{m}</span>
        ))}
        {provider.models.length > 2 && <span style={{ fontSize: 9, color: "#4a5568" }}>+{provider.models.length - 2}</span>}
      </div>
    </div>
  );
}

export default function App() {
  const [activeType, setActiveType] = useState("text");
  const [activeProvider, setActiveProvider] = useState(null);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard?.writeText(EXAMPLE_REQUESTS[activeType]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const providers = PROVIDERS[activeType];
  const typeColor = TYPE_COLORS[activeType];

  return (
    <div style={{
      background: "#050709", minHeight: "100vh", color: "#c8d0e0",
      fontFamily: "'Inter', system-ui, sans-serif", padding: "24px 20px",
    }}>
      {/* Scan line */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${typeColor}, transparent)`,
        opacity: 0.4, animation: "scan 4s linear infinite", zIndex: 10,
        pointerEvents: "none",
      }} />

      <style>{`@keyframes scan { 0%{top:-2px} 100%{top:100vh} } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid #0d1220" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `linear-gradient(135deg, ${typeColor}, ${typeColor}80)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, flexShrink: 0,
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.03em", color: "#e2e8f0" }}>
              Creator Factory — AI Orchestration
            </div>
            <div style={{ fontSize: 10, color: "#3a4560", fontFamily: "monospace", marginTop: 2 }}>
              POST /api/generate · text | image | video | audio
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontFamily: "monospace", color: "#22c55e", border: "1px solid #22c55e30", padding: "4px 10px", borderRadius: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 2s infinite" }} />
            LIVE
          </div>
        </div>

        {/* Type selector */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {Object.keys(PROVIDERS).map(type => (
            <button key={type} onClick={() => { setActiveType(type); setActiveProvider(null); setShowCode(false); }} style={{
              padding: "7px 16px", borderRadius: 6, border: "none", cursor: "pointer",
              background: activeType === type ? TYPE_COLORS[type] + "18" : "transparent",
              borderBottom: `2px solid ${activeType === type ? TYPE_COLORS[type] : "transparent"}`,
              color: activeType === type ? TYPE_COLORS[type] : "#4a5568",
              fontSize: 12, fontWeight: 600, fontFamily: "monospace",
              transition: "all 0.15s",
            }}>
              {TYPE_ICONS[type]} {type}
            </button>
          ))}
        </div>

        {/* Provider grid */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 9, fontFamily: "monospace", color: "#2a3555", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
            01 — SELECT PROVIDER (fallback chain auto-activates)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 16 }}>
            {providers.map((p, i) => (
              <ProviderCard key={p.name} provider={p} active={activeProvider === i || (activeProvider === null && i === 0)} onClick={() => setActiveProvider(i)} />
            ))}
          </div>
        </div>

        {/* Fallback chain visual */}
        <div style={{ background: "#080b12", border: "1px solid #0d1525", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
          <div style={{ fontSize: 9, fontFamily: "monospace", color: "#2a3555", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
            02 — AUTO FALLBACK CHAIN
          </div>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
            {providers.map((p, i) => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  fontSize: 10, fontFamily: "monospace", padding: "3px 10px", borderRadius: 5,
                  border: `1px solid ${i === 0 ? p.color + "50" : "#1a2030"}`,
                  background: i === 0 ? p.color + "12" : "#0a0d14",
                  color: i === 0 ? p.color : "#3a4560",
                }}>
                  {i === 0 ? "P1" : i === 1 ? "P2" : i === 2 ? "P3" : "P4"} {p.name}
                </span>
                {i < providers.length - 1 && <span style={{ color: "#1e2840", fontSize: 12 }}>→</span>}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 9, color: "#2a3555", fontFamily: "monospace" }}>
            If P1 fails → P2 auto-fires. If P2 fails → P3. Zero downtime.
          </div>
        </div>

        {/* Credit cost + example request */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10, marginBottom: 16 }}>
          <div style={{ background: "#080b12", border: "1px solid #0d1525", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 9, fontFamily: "monospace", color: "#2a3555", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
              CREDIT COST
            </div>
            <div style={{ fontSize: 11, color: typeColor, fontFamily: "monospace", fontWeight: 600 }}>
              {CREDIT_COSTS[activeType]}
            </div>
            <div style={{ marginTop: 10, fontSize: 9, color: "#2a3555", fontFamily: "monospace" }}>
              60% profit / 40% credits split
            </div>
          </div>

          <div style={{ background: "#080b12", border: "1px solid #0d1525", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "#0a0e18", borderBottom: "1px solid #0d1525" }}>
              <span style={{ fontSize: 9, fontFamily: "monospace", color: typeColor }}>example_request.json</span>
              <button onClick={copyCode} style={{
                background: "transparent", border: `1px solid #1a2030`, borderRadius: 4,
                color: copied ? "#22c55e" : "#3a4560", fontSize: 9, fontFamily: "monospace",
                padding: "2px 8px", cursor: "pointer",
              }}>
                {copied ? "✓ copied" : "copy"}
              </button>
            </div>
            <pre style={{ padding: "10px 12px", fontSize: 9, lineHeight: 1.8, color: "#5a6a8a", fontFamily: "monospace", overflow: "auto", margin: 0 }}>
              {EXAMPLE_REQUESTS[activeType]}
            </pre>
          </div>
        </div>

        {/* All providers summary */}
        <div style={{ background: "#080b12", border: "1px solid #0d1525", borderRadius: 8, padding: "12px 14px" }}>
          <div style={{ fontSize: 9, fontFamily: "monospace", color: "#2a3555", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>
            03 — ALL CONFIGURED PROVIDERS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {Object.entries(PROVIDERS).map(([type, provs]) => (
              <div key={type}>
                <div style={{ fontSize: 9, color: TYPE_COLORS[type], fontFamily: "monospace", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {TYPE_ICONS[type]} {type}
                </div>
                {provs.map(p => (
                  <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.free ? "#22c55e" : "#3a4560", flexShrink: 0 }} />
                    <span style={{ fontSize: 9, color: "#3a4560", fontFamily: "monospace" }}>{p.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #0d1525", display: "flex", gap: 16 }}>
            <span style={{ fontSize: 9, fontFamily: "monospace", color: "#2a3555" }}>
              <span style={{ color: "#22c55e" }}>●</span> free tier available
            </span>
            <span style={{ fontSize: 9, fontFamily: "monospace", color: "#2a3555" }}>
              <span style={{ color: "#3a4560" }}>●</span> paid only
            </span>
            <span style={{ fontSize: 9, fontFamily: "monospace", color: "#2a3555" }}>
              {Object.values(PROVIDERS).flat().filter(p => p.free).length} free providers configured
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
