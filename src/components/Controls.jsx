import { useState } from "react";

const KeyCap = ({ children }) => (
  <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-md text-xs font-bold text-white border border-white/20 shadow-[0_2px_0_rgba(0,0,0,0.5)] select-none"
    style={{ background: "linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)" }}>
    {children}
  </span>
);

const ControlRow = ({ keys, label }) => (
  <div className="flex items-center gap-3">
    <div className="flex items-center gap-1 min-w-[80px] justify-end">
      {keys.map((k, i) => (
        <span key={i} className="flex items-center gap-1">
          <KeyCap>{k}</KeyCap>
          {i < keys.length - 1 && <span className="text-white/30 text-xs">/</span>}
        </span>
      ))}
    </div>
    <span className="text-white/60 text-xs">{label}</span>
  </div>
);

const Controls = () => {
  const [open, setOpen] = useState(true);

  return (
    <>
      {/* Controls Panel */}
      <div
        className="fixed bottom-6 left-6 z-50 transition-all duration-300"
        style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
      >
        {open ? (
          <div
            className="rounded-xl p-4 w-64"
            style={{
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-white/90 text-sm font-semibold tracking-wide uppercase">Controls</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/30 hover:text-white/70 transition-colors text-lg leading-none"
                aria-label="Hide controls"
              >
                ×
              </button>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-white/10 mb-4" />

            {/* Movement section */}
            <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">Movement</p>
            <div className="flex flex-col gap-2 mb-4">
              <ControlRow keys={["W", "↑"]} label="Move Forward" />
              <ControlRow keys={["S", "↓"]} label="Move Backward" />
              <ControlRow keys={["A", "←"]} label="Move Left" />
              <ControlRow keys={["D", "→"]} label="Move Right" />
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-white/10 mb-4" />

            {/* Action section */}
            <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">Actions</p>
            <div className="flex flex-col gap-2 mb-4">
              <ControlRow keys={["Space"]} label="Jump" />
              <ControlRow keys={["Space"]} label="Double Jump (mid-air)" />
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-white/10 mb-4" />

            {/* Camera section */}
            <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">Camera</p>
            <div className="flex flex-col gap-2">
              <ControlRow keys={["Drag"]} label="Rotate Camera" />
              <ControlRow keys={["Scroll"]} label="Zoom In / Out" />
            </div>
          </div>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/70 hover:text-white transition-all text-xs font-semibold uppercase tracking-wide"
            style={{
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <span>⌨</span>
            <span>Controls</span>
          </button>
        )}
      </div>
    </>
  );
};

export default Controls;
