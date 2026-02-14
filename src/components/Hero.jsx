/* eslint-disable react/no-unknown-property */
import { Canvas } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera } from "@react-three/drei"; // Drei simplifies OrbitControls
import Model from "./Model";





const Hero = () => {
    const aspect = window.innerWidth / window.innerHeight
  return (
     <div className="h-screen bg-black w-full fixed top-0 left-0 overflow-hidden">
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
