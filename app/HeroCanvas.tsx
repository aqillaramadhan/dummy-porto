"use client";

import { Suspense, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  MeshTransmissionMaterial,
  MeshDistortMaterial,
  Sparkles,
  Environment,
  Float,
  Torus,
  Icosahedron,
  SpotLight,
  useDepthBuffer,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";

// ─── Shared props type ────────────────────────────────────────────────────────
interface SceneProps {
  scrollYProgress: MotionValue<number>;
}

// JALUR NUKLIR: Supress library intrinsic JSX attributes type errors
const MeshTransmissionMaterialFX = MeshTransmissionMaterial as any;
const MeshDistortMaterialFX = MeshDistortMaterial as any;
const SparklesFX = Sparkles as any;
const EnvironmentFX = Environment as any;
const FloatFX = Float as any;
const TorusFX = Torus as any;
const IcosahedronFX = Icosahedron as any;
const SpotLightFX = SpotLight as any;
const EffectComposerFX = EffectComposer as any;
const BloomFX = Bloom as any;
const ChromaticAberrationFX = ChromaticAberration as any;
const NoiseFX = Noise as any;


// ─── Smooth mouse hook ────────────────────────────────────────────────────────
function useSmoothMouse() {
  const smooth  = useRef({ x: 0, y: 0 });
  const raw     = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      raw.current.x =  (e.clientX / window.innerWidth  - 0.5) * 2;
      raw.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", fn, { passive: true });
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  return { smooth, raw };
}

// ─── Orbital ring ─────────────────────────────────────────────────────────────
function OrbitalRing({
  radius, tube, color, opacity, rotX, rotY, speed, axis,
}: {
  radius: number; tube: number; color: string; opacity: number;
  rotX: number;   rotY: number; speed: number; axis: "x"|"y"|"z";
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation[axis] += dt * speed; });
  return (
    <TorusFX ref={ref} args={[radius, tube, 16, 260]} rotation={[rotX, rotY, 0]}>
      <meshBasicMaterial
        color={color} transparent opacity={opacity}
        blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide}
      />
    </TorusFX>
  );
}

// ─── The Crystal — raw icosahedron gem ───────────────────────────────────────
function DataCrystal({ scrollYProgress }: SceneProps) {
  const groupRef   = useRef<THREE.Group>(null);
  const crystalRef = useRef<THREE.Mesh>(null);
  const coreRef    = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  const { smooth, raw } = useSmoothMouse();

  useFrame(({ clock }, dt) => {
    const s   = scrollYProgress.get();
    const t   = clock.elapsedTime;
    const mob = viewport.width < 5 ? 0.72 : 1.0;

    smooth.current.x += (raw.current.x - smooth.current.x) * 0.04;
    smooth.current.y += (raw.current.y - smooth.current.y) * 0.04;

    if (!groupRef.current) return;

    let tX = 0, tY = 0, tScale = 1.0;

    if (s > 0.2 && s <= 0.5) {
      const p = (s - 0.2) / 0.3;
      tX     = THREE.MathUtils.lerp(0,  1.2, p);
    } else if (s > 0.5 && s <= 0.8) {
      const p = (s - 0.5) / 0.3;
      tX     = THREE.MathUtils.lerp(1.2, 0,   p);
      tScale = THREE.MathUtils.lerp(1.0, 0.85, p); 
    } else if (s > 0.8) {
      const p = (s - 0.8) / 0.2;
      tY     = THREE.MathUtils.lerp(0,   0.8, p);
      tScale = THREE.MathUtils.lerp(0.85, 0.95, p);
    }

    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, tX, 0.055);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, tY, 0.055);
    groupRef.current.scale.setScalar(
      THREE.MathUtils.lerp(groupRef.current.scale.x, tScale * mob, 0.055)
    );

    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, smooth.current.x * 0.38, 0.05);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, smooth.current.y * 0.25, 0.05);

    const rotSpeed = s >= 0.5 && s <= 0.8
      ? THREE.MathUtils.mapLinear(s, 0.5, 0.8, 0.06, 0.22)
      : 0.06;

    if (crystalRef.current) {
      crystalRef.current.rotation.y += dt * rotSpeed;
      crystalRef.current.rotation.z  = Math.sin(t * 0.28) * 0.06;
    }

    if (coreRef.current) {
      coreRef.current.rotation.y -= dt * 0.14;
      coreRef.current.rotation.x += dt * 0.09;
      const pulse = 1 + Math.sin(t * 2.2) * 0.05;
      coreRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[2.1, 1]} />
        <meshBasicMaterial color="#5b21b6" transparent opacity={0.022} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      <FloatFX speed={1.2} rotationIntensity={0.05} floatIntensity={0.40}>
        <IcosahedronFX ref={crystalRef} args={[1.5, 6]}>
          <MeshTransmissionMaterialFX
            transmission={1} thickness={2.5} roughness={0.05} ior={1.4}
            chromaticAberration={0.08} distortionScale={0.40} temporalDistortion={0.10}
            color="#e0d8f8" attenuationColor="#c9a84c" attenuationDistance={0.8}
            iridescence={0.9} iridescenceIOR={1.5} iridescenceThicknessRange={[100, 800]}
            envMapIntensity={3.2} samples={6} resolution={256} background={new THREE.Color("#050508")}
          />
        </IcosahedronFX>
      </FloatFX>

      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.60, 2]} />
        <MeshDistortMaterialFX color="#7c3aed" distort={0.65} speed={3.0} roughness={0.0} metalness={0.2} transparent opacity={0.90} envMapIntensity={2.0} emissive="#4c1d95" emissiveIntensity={1.8} />
      </mesh>

      <OrbitalRing radius={2.05} tube={0.007} color="#c9a84c" opacity={0.55} rotX={Math.PI * 0.32} rotY={0}              speed={ 0.09} axis="z" />
      <OrbitalRing radius={2.25} tube={0.005} color="#8b5cf6" opacity={0.40} rotX={Math.PI * 0.15} rotY={Math.PI * 0.40} speed={-0.06} axis="y" />
      <OrbitalRing radius={2.45} tube={0.004} color="#e8c97a" opacity={0.20} rotX={Math.PI * 0.58} rotY={Math.PI * 0.12} speed={ 0.04} axis="x" />

      <SparklesFX count={100} scale={6.0} size={1.6} speed={0.20} noise={0.3} color="#e8c97a" opacity={0.80} />
      <SparklesFX count={70}  scale={7.0} size={1.0} speed={0.14} noise={0.4} color="#a78bfa" opacity={0.65} />
      <SparklesFX count={40}  scale={3.5} size={2.2} speed={0.30} noise={0.2} color="#ffffff" opacity={0.45} />
    </group>
  );
}

// ─── Camera rig — full 4-act scroll journey ───────────────────────────────────
function CameraRig({ scrollYProgress }: SceneProps) {
  const { camera } = useThree();
  const lookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const s = scrollYProgress.get();

    let tx = 0, ty = 0, tz = 5.0;
    let lx = 0, ly = 0;        

    if (s <= 0.2) {
      tx = 0;  ty = 0;   tz = 5.0;
      lx = 0;  ly = 0;
    } else if (s <= 0.5) {
      const p = (s - 0.2) / 0.3;
      tx = THREE.MathUtils.lerp(0,   -3.0, p);
      ty = THREE.MathUtils.lerp(0,    0.0, p);
      tz = THREE.MathUtils.lerp(5.0,  4.0, p);
      lx = THREE.MathUtils.lerp(0,    1.2, p); 
      ly = 0;
    } else if (s <= 0.8) {
      const p = (s - 0.5) / 0.3;
      tx = THREE.MathUtils.lerp(-3.0, 0.0, p);
      ty = THREE.MathUtils.lerp(  0,  0.0, p);
      tz = THREE.MathUtils.lerp( 4.0, 1.5, p);  
      lx = THREE.MathUtils.lerp( 1.2, 0.0, p);
      ly = 0;
    } else {
      const p = (s - 0.8) / 0.2;
      tx = THREE.MathUtils.lerp(0,   0.0, p);
      ty = THREE.MathUtils.lerp(0,   2.0, p);
      tz = THREE.MathUtils.lerp(1.5, 6.0, p);
      lx = 0;
      ly = THREE.MathUtils.lerp(0,  -0.5, p); 
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, tx, 0.055);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, ty, 0.055);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, tz, 0.055);

    lookAt.current.x = THREE.MathUtils.lerp(lookAt.current.x, lx, 0.055);
    lookAt.current.y = THREE.MathUtils.lerp(lookAt.current.y, ly, 0.055);
    camera.lookAt(lookAt.current);
  });

  return null;
}

// ─── Lighting rig ─────────────────────────────────────────────────────────────
function SceneLights() {
  const violetRef = useRef<THREE.PointLight>(null);
  const goldRef   = useRef<THREE.PointLight>(null);
  const spotRef   = useRef<THREE.SpotLight>(null);
  const depthBuffer = useDepthBuffer({ frames: 1 });

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (violetRef.current) violetRef.current.position.set(Math.sin(t * 0.38) * 5.0, Math.sin(t * 0.22) * 3.0, Math.cos(t * 0.38) * 5.0);
    if (goldRef.current) {
      goldRef.current.position.set(Math.cos(t * 0.28) * 4.0, -2.5 + Math.sin(t * 0.5) * 1.0, Math.sin(t * 0.28) * 4.0);
      goldRef.current.intensity = 16 + Math.sin(t * 0.9) * 5;
    }
    if (spotRef.current) spotRef.current.position.set(Math.sin(t * 0.12) * 3, 5 + Math.cos(t * 0.08) * 0.5, 3);
  });

  return (
    <>
      <ambientLight color="#2d1a08" intensity={4} />
      <directionalLight color="#fff8f0" intensity={5} position={[-4, 6, 4]} />
      <pointLight ref={violetRef} color="#6d28d9" intensity={28} distance={14} position={[4, 2, 4]} />
      <pointLight ref={goldRef} color="#c9a84c" intensity={16} distance={11} position={[3, -2, 2]} />
      <pointLight color="#1e3a8a" intensity={10} distance={10} position={[-3, 1, -6]} />
      <pointLight color="#ffffff" intensity={8} distance={6} position={[0, 5, 2]} />
      <SpotLightFX ref={spotRef} depthBuffer={depthBuffer} color="#e8d5a0" intensity={60} distance={16} angle={0.35} attenuation={5} anglePower={5} position={[2, 5, 3]} />
    </>
  );
}

// ─── Scroll-accelerated star field ───────────────────────────────────────────
function AnimatedStars({ scrollYProgress }: SceneProps) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo<Float32Array>(() => {
    const count = 1800;
    const arr   = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r     = 30 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

useFrame((_, dt) => {
    const s     = scrollYProgress.get();
    const boost = s >= 0.5 && s < 0.8 ? THREE.MathUtils.mapLinear(s, 0.5, 0.8, 1, 5.0) : 1;
    
    // INI BARIS PENGAMANNYA
    if (!ref.current) return; 

    ref.current.rotation.y += dt * boost * 0.032;
    ref.current.rotation.x += dt * boost * 0.016;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.10} color="#d4c8f0" transparent opacity={0.60} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

// ─── Post-Processing ─────────────────────────────────────────────────────────
function PostFX({ scrollYProgress }: SceneProps) {
  const caOffset = useRef(new THREE.Vector2(0.0012, 0.0012));

  useFrame(() => {
    const s = scrollYProgress.get();
    const intensity = s >= 0.5 && s <= 0.8 ? THREE.MathUtils.mapLinear(s, 0.5, 0.8, 0.0012, 0.004) : 0.0012;
    caOffset.current.set(intensity, intensity);
  });

  return (
    <EffectComposerFX multisampling={0} disableNormalPass>
      <BloomFX luminanceThreshold={0.18} luminanceSmoothing={0.08} intensity={1.6} mipmapBlur />
      <ChromaticAberrationFX blendFunction={BlendFunction.NORMAL} offset={caOffset.current} radialModulation={false} modulationOffset={0} />
      <NoiseFX opacity={0.028} blendFunction={BlendFunction.ADD} />
    </EffectComposerFX>
  );
}

// ─── Canvas export ────────────────────────────────────────────────────────────
export default function HeroCanvas({ scrollYProgress }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 48 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.NoToneMapping, stencil: false, depth: true }}
      dpr={[1, 1.2]}
      shadows={false}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <Suspense fallback={null}>
        <EnvironmentFX preset="warehouse" />
        <SceneLights />
        <AnimatedStars scrollYProgress={scrollYProgress} />
        <DataCrystal   scrollYProgress={scrollYProgress} />
        <CameraRig     scrollYProgress={scrollYProgress} />
        <PostFX        scrollYProgress={scrollYProgress} />
      </Suspense>
    </Canvas>
  );
}