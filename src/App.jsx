import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, DepthOfField, EffectComposer } from "@react-three/postprocessing";
import { Suspense } from "react";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";


function Navbar() {
  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-black/60 backdrop-blur-md text-white flex justify-between items-center px-8 py-4 shadow-lg">
      <div className="font-bold text-2xl tracking-widest">Evan's Portfolio</div>
      <ul className="flex gap-8 text-lg">
        <li><a href="#hero" className="hover:text-teal-300 transition">Home</a></li>
        <li><a href="#about" className="hover:text-teal-300 transition">About</a></li>
        <li><a href="#projects" className="hover:text-teal-300 transition">Projects</a></li>
        <li><a href="#experience" className="hover:text-teal-300 transition">Experience</a></li>
        <li><a href="#contact" className="hover:text-teal-300 transition">Contact</a></li>
      </ul>
    </nav>
  );
}

function HeroSection() {
  return (
    <section id="hero" className="relative w-full h-screen flex flex-col justify-center items-center">
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
            worldFocusRange={8.0}
            focalLength={0.015}
            bokehScale={0.35}
            height={480}
          />
          <Bloom
            luminanceThreshold={0.35}
            luminanceSmoothing={0.25}
            intensity={0.6}
            mipmapBlur
            radius={0.7}
          />
        </EffectComposer>
      </Canvas>
    </section>
  );
}

function TextSection() {
  return (
    <section id="about" className="w-full max-w-3xl mx-auto py-24 px-6 text-center">
      <h2 className="text-4xl font-bold mb-6">About Me</h2>
      <p className="text-lg text-gray-200 mb-4">
        Hi, I'm Evan! I'm a creative developer passionate about building interactive 3D experiences and beautiful web applications. Explore my work below!
      </p>
    </section>
  );
}

function App() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <TextSection />
      {/* More sections like Projects, Experience, Contact can be added here */}
    </>
  );
}

export default App;
