import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { DepthOfField, EffectComposer } from "@react-three/postprocessing";
import { Suspense } from "react";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";

function App() {
  return (
    <>
      <UI />
      <Loader />
      <Canvas shadows camera={{ position: [-2.5, -0.2, 6.5], fov: 45 }}>
        <group position-y={0}>
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </group>
        <EffectComposer>
          <DepthOfField
            target={[0, 0.3, 0]}
            worldFocusDistance={4.2}
            worldFocusRange={6.5}
            focalLength={0.02}
            bokehScale={1.2}
            height={480}
          />
        </EffectComposer>
      </Canvas>
    </>
  );
}

export default App;
