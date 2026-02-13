import { Environment, Float, OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { CanvasTexture, LinearFilter } from "three";
import { Book } from "./Book";

const PILLAR_X_OFFSET = 2.5;
const PILLAR_HEIGHT = 7.2;
const PILLAR_RADIUS = 0.55;
const PILLAR_Y = -2.2;
const PILLAR_BOTTOM_EXTRA = 24.0;
const BASE_Y = -1.2;
const BASE_RADIUS = 1.2;
const BASE_HEIGHT = 0.35;
const BASE_TOP_Y = BASE_Y + BASE_HEIGHT / 2;
const RIM_HEIGHT = 0.12;
const WALKWAY_WIDTH = 1.0;
const WALKWAY_LENGTH = 6.0;
const WALKWAY_HEIGHT = 0.08;
const WALKWAY_Z = BASE_RADIUS + WALKWAY_LENGTH / 2 - 0.1;
const WALKWAY_SIDE_WIDTH = 0.12;
const WALKWAY_RAIL_HEIGHT = 0.12;
const WALKWAY_INSET_WIDTH = WALKWAY_WIDTH * 0.72;
const WALKWAY_INSET_HEIGHT = 0.04;
const WALKWAY_STEP_LENGTH = 0.9;
const WALKWAY_STEP_HEIGHT = 0.06;
const WALKWAY_BASE_Y = BASE_TOP_Y + WALKWAY_HEIGHT / 2 + 0.002;
const WALKWAY_INSET_Y = BASE_TOP_Y + WALKWAY_HEIGHT + WALKWAY_INSET_HEIGHT / 2 + 0.004;
const WALKWAY_RAIL_Y = BASE_TOP_Y + WALKWAY_HEIGHT + WALKWAY_RAIL_HEIGHT / 2 + 0.004;
const WALKWAY_STEP_Y = BASE_TOP_Y + WALKWAY_STEP_HEIGHT / 2 + 0.002;
const BACKDROP_RING_RADIUS = 10.5;
const BACKDROP_RING_RADIUS_OUTER = 14.2;
const BACKDROP_RING_Y = -0.2;
const CITY_RING_COUNT = 16;
const CITY_RING_COUNT_OUTER = 22;
const ORB_GROUP_Y = 4.6;
const ORB_PARTICLE_COUNT = 28;
const CITY_BOTTOM_EXTRA = 26.0;
const FOG_COLOR = "#0a201b";
const FOG_DENSITY = 0.08;
const MIST_Y = -2.4;
const MIST_SIZE = 90;
const MIST_OPACITY = 0.75;
const PILLAR_RING_OFFSETS_LEFT = [-2.7, -1.35, -0.1, 1.1, 2.6];
const PILLAR_RING_OFFSETS_RIGHT = [-2.2, -0.6, 0.7, 2.1, 3.0];
const PILLAR_GLOW_OFFSETS_LEFT = [-2.0, -0.3, 1.4, 2.9];
const PILLAR_GLOW_OFFSETS_RIGHT = [-1.7, 0.4, 1.9, 2.7];
const PILLAR_GLOW_THICKNESS = 0.06;

const Pillar = ({ x, rings, glows, tilt }) => {
  return (
    <group position={[x, 0, 0]} rotation-z={tilt}>
      <mesh
        position={[0, PILLAR_Y - PILLAR_HEIGHT / 2 - PILLAR_BOTTOM_EXTRA / 2, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[PILLAR_RADIUS * 0.95, PILLAR_RADIUS * 0.95, PILLAR_BOTTOM_EXTRA, 28]} />
        <meshStandardMaterial color="#0b1b16" roughness={0.75} metalness={0.06} />
      </mesh>
      <mesh position={[0, PILLAR_Y, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[PILLAR_RADIUS * 0.88, PILLAR_RADIUS * 1.05, PILLAR_HEIGHT, 32]}
        />
        <meshStandardMaterial color="#0c1c17" roughness={0.7} metalness={0.08} />
      </mesh>

      <mesh position={[0, PILLAR_Y + PILLAR_HEIGHT * 0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[PILLAR_RADIUS * 0.55, PILLAR_RADIUS * 0.8, PILLAR_HEIGHT * 0.9, 28]}
        />
        <meshStandardMaterial color="#0f2a22" roughness={0.65} metalness={0.12} />
      </mesh>

      {rings.map((offset, index) => (
        <mesh
          key={`ring-${offset}`}
          position={[0, PILLAR_Y + offset, 0]}
          rotation-x={Math.PI / 2}
          rotation-z={index % 2 === 0 ? 0.15 : -0.1}
          castShadow
          receiveShadow
        >
          <torusGeometry args={[PILLAR_RADIUS * (1.02 + index * 0.02), 0.045 + index * 0.006, 16, 48]} />
          <meshStandardMaterial color="#14352a" roughness={0.55} metalness={0.14} />
        </mesh>
      ))}

      {glows.map((offset, index) => (
        <mesh
          key={`glow-${offset}`}
          position={[0, PILLAR_Y + offset, 0]}
          rotation-y={index * 0.6}
          castShadow
          receiveShadow
        >
          <cylinderGeometry
            args={[PILLAR_RADIUS * (1.01 + index * 0.01), PILLAR_RADIUS * (1.01 + index * 0.01), PILLAR_GLOW_THICKNESS, 48]}
          />
          <meshStandardMaterial
            color="#163a2d"
            emissive="#5bffcc"
            emissiveIntensity={0.75}
            roughness={0.35}
            metalness={0.18}
          />
        </mesh>
      ))}

      {glows.map((offset, index) => (
        <mesh
          key={`node-${offset}`}
          position={[0, PILLAR_Y + offset + 0.15, PILLAR_RADIUS * 0.65]}
          rotation-z={index * 0.4}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[0.12 + index * 0.03, 24, 24]} />
          <meshStandardMaterial
            color="#1b3b2e"
            emissive="#7cffd5"
            emissiveIntensity={0.9}
            roughness={0.25}
            metalness={0.2}
          />
        </mesh>
      ))}

      <mesh position={[0, PILLAR_Y + PILLAR_HEIGHT / 2 + 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[PILLAR_RADIUS * 1.18, PILLAR_RADIUS * 1.12, 0.36, 32]} />
        <meshStandardMaterial color="#133328" roughness={0.5} metalness={0.15} />
      </mesh>
    </group>
  );
};

const Background = () => {
  const orbRef = useRef(null);
  const ringRef = useRef(null);
  const beamRef = useRef(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (orbRef.current) {
      orbRef.current.material.emissiveIntensity = 0.85 + Math.sin(t * 1.2) * 0.18;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.12;
    }
    if (beamRef.current) {
      beamRef.current.material.emissiveIntensity = 0.55 + Math.sin(t * 2.1) * 0.25;
    }
  });

  return (
    <group>
      <group position={[0, ORB_GROUP_Y, 0]}>
        <mesh position={[0, 0, 0]} ref={orbRef}>
          <sphereGeometry args={[0.95, 32, 32]} />
          <meshStandardMaterial color="#102c25" emissive="#6bffcf" emissiveIntensity={0.9} roughness={0.25} />
        </mesh>

        <mesh position={[0, -0.05, 0]} rotation-x={Math.PI / 2} ref={ringRef}>
          <torusGeometry args={[2.8, 0.07, 24, 120]} />
          <meshStandardMaterial color="#0f2b24" emissive="#5bffcc" emissiveIntensity={0.6} roughness={0.4} />
        </mesh>

        <mesh position={[0, -1.0, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[1.6, 0.04, 20, 90]} />
          <meshStandardMaterial color="#0f2b24" emissive="#4bffbf" emissiveIntensity={0.4} roughness={0.5} />
        </mesh>
      </group>

      <group position={[0, BACKDROP_RING_Y, 0]}>
        {Array.from({ length: CITY_RING_COUNT }).map((_, index) => {
          const angle = (index / CITY_RING_COUNT) * Math.PI * 2;
          const x = Math.cos(angle) * BACKDROP_RING_RADIUS;
          const z = Math.sin(angle) * BACKDROP_RING_RADIUS;
          const height = 1.8 + (index % 5) * 0.5;
          const baseRadius = 0.35 + (index % 4) * 0.08;
          const topRadius = baseRadius * (0.6 + (index % 3) * 0.1);
          const bulgeRadius = baseRadius * 1.25;
          const coreHeight = height * 0.7;
          const neckHeight = height * 0.18;
          const capHeight = height * 0.12;
          return (
            <group key={`ring-${angle}`} position={[x, 0, z]} rotation-y={-angle}>
              <mesh position={[0, -CITY_BOTTOM_EXTRA / 2, 0]}>
                <cylinderGeometry args={[baseRadius * 0.9, baseRadius * 0.95, CITY_BOTTOM_EXTRA, 20]} />
                <meshStandardMaterial color="#051512" emissive="#0a3329" emissiveIntensity={0.16} roughness={0.9} />
              </mesh>
              <mesh position={[0, coreHeight / 2, 0]}>
                <cylinderGeometry args={[baseRadius, topRadius, coreHeight, 20]} />
                <meshStandardMaterial color="#061815" emissive="#0b3a2f" emissiveIntensity={0.2} roughness={0.85} />
              </mesh>
              <mesh position={[0, coreHeight * 0.55, 0]}>
                <cylinderGeometry args={[bulgeRadius, baseRadius * 0.9, coreHeight * 0.35, 22]} />
                <meshStandardMaterial color="#081d18" emissive="#0f4436" emissiveIntensity={0.24} roughness={0.7} />
              </mesh>
              <mesh position={[0, coreHeight + neckHeight / 2, 0]}>
                <cylinderGeometry args={[topRadius * 0.8, topRadius * 0.55, neckHeight, 18]} />
                <meshStandardMaterial color="#0b1f1a" emissive="#1b5748" emissiveIntensity={0.22} roughness={0.65} />
              </mesh>
              <mesh position={[0, coreHeight + neckHeight + capHeight / 2, 0]}>
                <cylinderGeometry args={[topRadius * 0.45, topRadius * 0.25, capHeight, 16]} />
                <meshStandardMaterial color="#0b1f1a" emissive="#2a7a62" emissiveIntensity={0.3} roughness={0.5} />
              </mesh>
            </group>
          );
        })}
      </group>

      <group position={[0, BACKDROP_RING_Y - 0.2, 0]}>
        {Array.from({ length: CITY_RING_COUNT_OUTER }).map((_, index) => {
          const angle = (index / CITY_RING_COUNT_OUTER) * Math.PI * 2;
          const x = Math.cos(angle) * BACKDROP_RING_RADIUS_OUTER;
          const z = Math.sin(angle) * BACKDROP_RING_RADIUS_OUTER;
          const height = 2.2 + (index % 6) * 0.55;
          const baseRadius = 0.25 + (index % 5) * 0.07;
          const topRadius = baseRadius * (0.5 + (index % 4) * 0.08);
          return (
            <group key={`outer-${angle}`} position={[x, 0, z]} rotation-y={-angle}>
              <mesh position={[0, -CITY_BOTTOM_EXTRA / 2, 0]}>
                <cylinderGeometry args={[baseRadius * 0.85, baseRadius * 0.9, CITY_BOTTOM_EXTRA, 18]} />
                <meshStandardMaterial color="#051512" emissive="#0a3329" emissiveIntensity={0.14} roughness={0.92} />
              </mesh>
              <mesh position={[0, height / 2, 0]}>
                <cylinderGeometry args={[baseRadius, topRadius, height, 18]} />
                <meshStandardMaterial color="#071a16" emissive="#0c3a2f" emissiveIntensity={0.18} roughness={0.9} />
              </mesh>
              <mesh position={[0, height + 0.2, 0]}>
                <sphereGeometry args={[topRadius * 0.75, 16, 16]} />
                <meshStandardMaterial color="#0a1f1a" emissive="#2a7a62" emissiveIntensity={0.25} roughness={0.6} />
              </mesh>
            </group>
          );
        })}
      </group>

      {Array.from({ length: ORB_PARTICLE_COUNT }).map((_, index) => {
        const angle = (index / ORB_PARTICLE_COUNT) * Math.PI * 2;
        const radius = 4.5 + (index % 6) * 0.55;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = 2.0 + (index % 7) * 0.25;
        const size = 0.08 + (index % 4) * 0.035;
        return (
          <mesh key={`orb-${angle}`} position={[x, y, z]}>
            <sphereGeometry args={[size, 16, 16]} />
            <meshStandardMaterial color="#14352b" emissive="#8affe0" emissiveIntensity={0.7} roughness={0.25} />
          </mesh>
        );
      })}

      <mesh position={[-2.4, 0.2, 0.2]} ref={beamRef}>
        <cylinderGeometry args={[0.08, 0.08, 3.2, 16]} />
        <meshStandardMaterial color="#0b2c24" emissive="#73ffd7" emissiveIntensity={0.65} roughness={0.3} />
      </mesh>
      <mesh position={[2.8, 0.4, 0.1]}>
        <cylinderGeometry args={[0.06, 0.06, 2.6, 16]} />
        <meshStandardMaterial color="#0b2c24" emissive="#6affd0" emissiveIntensity={0.5} roughness={0.35} />
      </mesh>
    </group>
  );
};
export const Experience = () => {
  const mistAlpha = useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.1,
      size / 2,
      size / 2,
      size * 0.5
    );
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
    gradient.addColorStop(0.6, "rgba(255, 255, 255, 0.4)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0.0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new CanvasTexture(canvas);
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }, []);

  return (
    <>
      <fogExp2 attach="fog" args={[FOG_COLOR, FOG_DENSITY]} />
      <Background />
      <group>
        <mesh position={[0, BASE_Y, 0]} receiveShadow>
          <cylinderGeometry args={[BASE_RADIUS, BASE_RADIUS, BASE_HEIGHT, 64]} />
          <meshStandardMaterial color="#0b1f1a" roughness={0.7} metalness={0.05} />
        </mesh>
        <mesh position={[0, BASE_Y + BASE_HEIGHT / 2 + RIM_HEIGHT / 2, 0]} receiveShadow>
          <cylinderGeometry args={[BASE_RADIUS * 1.08, BASE_RADIUS * 1.08, RIM_HEIGHT, 64]} />
          <meshStandardMaterial color="#123025" roughness={0.6} metalness={0.1} />
        </mesh>
        <group>
          <mesh position={[0, WALKWAY_BASE_Y, WALKWAY_Z]} receiveShadow>
            <boxGeometry args={[WALKWAY_WIDTH, WALKWAY_HEIGHT, WALKWAY_LENGTH]} />
            <meshStandardMaterial color="#0e2a22" roughness={0.65} metalness={0.08} />
          </mesh>
          <mesh position={[0, WALKWAY_INSET_Y, WALKWAY_Z]} receiveShadow>
            <boxGeometry args={[WALKWAY_INSET_WIDTH, WALKWAY_INSET_HEIGHT, WALKWAY_LENGTH * 0.92]} />
            <meshStandardMaterial
              color="#163a2d"
              emissive="#4bffbf"
              emissiveIntensity={0.25}
              roughness={0.35}
              metalness={0.12}
            />
          </mesh>
          <mesh
            position={[WALKWAY_WIDTH / 2 - WALKWAY_SIDE_WIDTH / 2, WALKWAY_RAIL_Y, WALKWAY_Z]}
            receiveShadow
          >
            <boxGeometry args={[WALKWAY_SIDE_WIDTH, WALKWAY_RAIL_HEIGHT, WALKWAY_LENGTH * 0.98]} />
            <meshStandardMaterial color="#0b1f1a" roughness={0.7} metalness={0.08} />
          </mesh>
          <mesh
            position={[-WALKWAY_WIDTH / 2 + WALKWAY_SIDE_WIDTH / 2, WALKWAY_RAIL_Y, WALKWAY_Z]}
            receiveShadow
          >
            <boxGeometry args={[WALKWAY_SIDE_WIDTH, WALKWAY_RAIL_HEIGHT, WALKWAY_LENGTH * 0.98]} />
            <meshStandardMaterial color="#0b1f1a" roughness={0.7} metalness={0.08} />
          </mesh>
          <mesh
            position={[0, WALKWAY_STEP_Y, BASE_RADIUS + WALKWAY_STEP_LENGTH / 2 + 0.05]}
            receiveShadow
          >
            <boxGeometry args={[WALKWAY_WIDTH * 0.92, WALKWAY_STEP_HEIGHT, WALKWAY_STEP_LENGTH]} />
            <meshStandardMaterial color="#0b1f1a" roughness={0.7} metalness={0.05} />
          </mesh>
        </group>
      </group>

      <group>
        <Pillar
          x={-PILLAR_X_OFFSET}
          rings={PILLAR_RING_OFFSETS_LEFT}
          glows={PILLAR_GLOW_OFFSETS_LEFT}
          tilt={0.04}
        />
        <Pillar
          x={PILLAR_X_OFFSET}
          rings={PILLAR_RING_OFFSETS_RIGHT}
          glows={PILLAR_GLOW_OFFSETS_RIGHT}
          tilt={-0.03}
        />
      </group>
      <Float
        rotation-x={-Math.PI / 4}
        floatIntensity={1}
        speed={2}
        rotationIntensity={2}
      >
        <Book position-y={0.2} />
      </Float>
      <OrbitControls />
      <Environment preset="studio"></Environment>
      <directionalLight
        position={[2, 5, 2]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <mesh position={[0, MIST_Y, 0]} rotation-x={-Math.PI / 2} renderOrder={1}>
        <planeGeometry args={[MIST_SIZE, MIST_SIZE]} />
        <meshStandardMaterial
          color="#0a2019"
          emissive="#0e3026"
          emissiveIntensity={0.25}
          transparent
          opacity={MIST_OPACITY}
          alphaMap={mistAlpha}
          depthWrite={false}
        />
      </mesh>
    </>
  );
};