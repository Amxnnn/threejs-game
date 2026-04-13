/* eslint-disable react/no-unknown-property */
import { Canvas } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera } from "@react-three/drei"; // Drei simplifies OrbitControls
import Model from "./Model";
import Controls from "./Controls";





const Hero = () => {
    const aspect = window.innerWidth / window.innerHeight
  return (
     <div className="h-screen bg-black w-full fixed top-0 left-0 overflow-hidden">

          {/* GitHub Link */}
          <a
            href="https://github.com/Amxnnn/threejs-game"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed top-5 left-5 z-50 flex items-center gap-2 px-4 py-2 rounded-xl text-white/70 hover:text-white transition-all duration-200"
            style={{
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              fontFamily: "'Segoe UI', system-ui, sans-serif",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            <svg height="18" width="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
                -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
                .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
                -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27
                .68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12
                .51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48
                0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            <span>View Source</span>
          </a>

          {/* Work In Progress Badge */}
          <div
            className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest"
            style={{
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,200,0,0.3)",
              color: "rgba(255,200,0,0.85)",
              boxShadow: "0 0 16px rgba(255,180,0,0.1)",
              fontFamily: "'Segoe UI', system-ui, sans-serif",
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "rgba(255,200,0,0.85)" }}
            />
            Still Under Progress
          </div>

          {/* Controls Overlay */}
          <Controls />

          <Canvas shadows >
          <ambientLight intensity={0.5} />  {/*to lighten the shadow */}
          <directionalLight
          position={[40, 90, 20]} // Adjust position for proper lighting
          intensity={1.5}
          castShadow // Enable shadows
       
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-300}
          shadow-camera-right={300}
          shadow-camera-top={300}
          shadow-camera-bottom={-300}
          shadow-normalBias={2}
        />            <Model/>
            <OrbitControls enableDamping={true} />
            <OrthographicCamera 
                makeDefault
                position={[134.46150534763422, 104.35639323494996,-105.04367713137451]}

                manual 
                left={-aspect * 40}   // Left bound of the frustum
                right={aspect * 80}  // Right bound of the frustum
                top={50}     // Top bound of the frustum
                bottom={-50}
                         // Adjust zoom level
                near={0.1}              // Near clipping plane
                far={10000}              // Far clipping plane
            />
          </Canvas>
    </div>
  )
}

export default Hero
