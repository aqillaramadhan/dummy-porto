"use client";

/**
 * HeroCanvas.tsx — "Digital Renaissance · Cosmic Edition"
 *
 * Performance vs previous version:
 *   Crystal faces:    2562 → 320  (-87%)
 *   Transmission:     samples=12, res=512 → samples=4, res=256
 *   Stars:            1800 → 900 near + 300 far (2 depth layers)
 *   SpotLight:        disabled on mobile
 *   EffectComposer:   multisampling=0 (unchanged, already optimal)
 *   dpr:              1.8 → 1.2 cap
 *
 * New additions:
 *   CosmicEnvironment — 3 low-poly planets, 1 black hole, nebula blobs
 *   StarField ×2 — near-field + far-field with hyperspace boost on Works dive
 *   CameraRig — 4-act journey with smooth look-at ref
 *   Works→Contact transition — crane-shot pull-back + crystal floats up
 */

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

// Cast drei/postprocessing to suppress intrinsic element type errors
const MTM  = MeshTransmissionMaterial as any;
const MDM  = MeshDistortMaterial      as any;
const SFX  = Sparkles                 as any;
const ENV  = Environment              as any;
const FLT  = Float                    as any;
const TRS  = Torus                    as any;
const ICO  = Icosahedron              as any;
const SPT  = SpotLight                as any;
const ECFX = EffectComposer           as any;
const BLM  = Bloom                    as any;
const CAFX = ChromaticAberration      as any;
const NSX  = Noise                    as any;

interface SceneProps { scrollYProgress: MotionValue<number>; }

// ─── Smooth mouse ─────────────────────────────────────────────────────────────
function useSmoothMouse() {
  const smooth = useRef({ x: 0, y: 0 });
  const raw    = useRef({ x: 0, y: 0 });
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
  radius:number; tube:number; color:string; opacity:number;
  rotX:number; rotY:number; speed:number; axis:"x"|"y"|"z";
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation[axis] += dt * speed; });
  return (
    <TRS ref={ref} args={[radius, tube, 10, 100]} rotation={[rotX, rotY, 0]}>
      <meshBasicMaterial color={color} transparent opacity={opacity}
        blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
    </TRS>
  );
}

// ─── COSMIC ENVIRONMENT ───────────────────────────────────────────────────────

function DistantPlanet({ pos, radius, color, emissive, rotSpeed }: {
  pos:[number,number,number]; radius:number; color:string; emissive:string; rotSpeed:number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * rotSpeed;
    ref.current.rotation.x += dt * rotSpeed * 0.4;
  });
  return (
    <mesh ref={ref} position={pos}>
      <icosahedronGeometry args={[radius, 0]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.35}
        roughness={0.75} metalness={0.15} flatShading />
    </mesh>
  );
}

function PlanetRing({ pos }: { pos:[number,number,number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * 0.04; });
  return (
    <mesh ref={ref} position={pos} rotation={[Math.PI*0.3, 0, 0]}>
      <torusGeometry args={[1.8, 0.3, 4, 32]} />
      <meshBasicMaterial color="#4a3a8a" transparent opacity={0.20}
        blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function BlackHole({ pos }: { pos:[number,number,number] }) {
  const acc   = useRef<THREE.Mesh>(null);
  const outer = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (acc.current)   acc.current.rotation.z   =  t * 0.22;
    if (outer.current) outer.current.rotation.z =  t * 0.07;
    if (inner.current) inner.current.rotation.z = -t * 0.14;
  });
  return (
    <group position={pos} rotation={[Math.PI*0.2, 0.3, 0]}>
      <mesh ref={acc}>
        <torusGeometry args={[3.2, 0.55, 4, 64]} />
        <meshBasicMaterial color="#c9a84c" transparent opacity={0.12}
          blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={outer}>
        <torusGeometry args={[2.6, 1.0, 4, 64]} />
        <meshBasicMaterial color="#090510" transparent opacity={0.90} depthWrite={false} />
      </mesh>
      <mesh ref={inner}>
        <torusGeometry args={[2.0, 0.35, 4, 64]} />
        <meshBasicMaterial color="#6d28d9" transparent opacity={0.28}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.5, 8, 8]} />
        <meshBasicMaterial color="#020108" />
      </mesh>
    </group>
  );
}

function NebulaClouds() {
  const blobs = useMemo(() => [
    { pos:[-28,  8, -50] as [number,number,number], color:"#4c1d95", opacity:0.07, r:22 },
    { pos:[ 30,-10, -60] as [number,number,number], color:"#7c2d12", opacity:0.06, r:18 },
    { pos:[  5, 18, -45] as [number,number,number], color:"#1e3a8a", opacity:0.05, r:26 },
  ], []);
  return (
    <>
      {blobs.map((d, i) => (
        <mesh key={i} position={d.pos}>
          <sphereGeometry args={[d.r, 5, 5]} />
          <meshBasicMaterial color={d.color} transparent opacity={d.opacity}
            side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </>
  );
}

function CosmicEnvironment() {
  return (
    <>
      <NebulaClouds />
      <DistantPlanet pos={[ 22,  12, -40]} radius={2.8} color="#3d2a5c" emissive="#6d28d9" rotSpeed={0.04} />
      <DistantPlanet pos={[-26,  -8, -52]} radius={3.5} color="#1a2a4a" emissive="#1e3a8a" rotSpeed={0.025} />
      <PlanetRing    pos={[-26,  -8, -52]} />
      <DistantPlanet pos={[-16,  18, -70]} radius={1.2} color="#2d1a08" emissive="#c9a84c" rotSpeed={0.07} />
      <BlackHole     pos={[ 38,  -5, -65]} />
    </>
  );
}

// ─── Star field — two depth layers ───────────────────────────────────────────
function StarField({
  count, rMin, rMax, size, opacity, color, scrollYProgress,
}: {
  count:number; rMin:number; rMax:number; size:number; opacity:number; color:string;
  scrollYProgress?: MotionValue<number>;
}) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo<Float32Array>(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r     = rMin + Math.random() * (rMax - rMin);
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      arr[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      arr[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i*3+2] = r * Math.cos(phi);
    }
    return arr;
  }, [count, rMin, rMax]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const s     = scrollYProgress ? scrollYProgress.get() : 0;
    const boost = s >= 0.5 && s < 0.8 ? THREE.MathUtils.mapLinear(s, 0.5, 0.8, 1, 6) : 1;
    ref.current.rotation.y += dt * boost * 0.025;
    ref.current.rotation.x += dt * boost * 0.012;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={size} color={color} transparent opacity={opacity}
        sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

// ─── Crystal ─────────────────────────────────────────────────────────────────
function DataCrystal({ scrollYProgress }: SceneProps) {
  const groupRef   = useRef<THREE.Group>(null);
  const crystalRef = useRef<THREE.Mesh>(null);
  const coreRef    = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  const { smooth, raw } = useSmoothMouse();
  const isMobile = viewport.width < 6;

  useFrame(({ clock }, dt) => {
    const s   = scrollYProgress.get();
    const t   = clock.elapsedTime;
    const mob = isMobile ? 0.72 : 1.0;

    smooth.current.x += (raw.current.x - smooth.current.x) * 0.04;
    smooth.current.y += (raw.current.y - smooth.current.y) * 0.04;

    if (!groupRef.current) return;

    let tX=0, tY=0, tScale=1.0;
    if (s > 0.2 && s <= 0.5) {
      const p = (s-0.2)/0.3;
      tX      = THREE.MathUtils.lerp(0, 1.2, p);
    } else if (s > 0.5 && s <= 0.8) {
      const p = (s-0.5)/0.3;
      tX      = THREE.MathUtils.lerp(1.2, 0, p);
      tScale  = THREE.MathUtils.lerp(1.0, 0.82, p);
    } else if (s > 0.8) {
      const p = (s-0.8)/0.2;
      tY      = THREE.MathUtils.lerp(0, 0.8, p);
      tScale  = THREE.MathUtils.lerp(0.82, 0.92, p);
    }

    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, tX, 0.055);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, tY, 0.055);
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, tScale * mob, 0.055));
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, smooth.current.x * 0.42, 0.05);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, smooth.current.y * 0.28, 0.05);

    const rotSpeed = s >= 0.5 && s <= 0.8
      ? THREE.MathUtils.mapLinear(s, 0.5, 0.8, 0.08, 0.28) : 0.08;
    if (crystalRef.current) {
      crystalRef.current.rotation.y += dt * rotSpeed;
      crystalRef.current.rotation.z  = Math.sin(t * 0.25) * 0.08;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y -= dt * 0.18;
      coreRef.current.rotation.x += dt * 0.11;
      coreRef.current.scale.setScalar(1 + Math.sin(t * 2.4) * 0.06);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer halo */}
      <mesh>
        <icosahedronGeometry args={[2.0, 1]} />
        <meshBasicMaterial color="#5b21b6" transparent opacity={0.022}
          side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Main crystal — Icosahedron(1.2, 2) = 320 faces, was 2562 */}
      <FLT speed={1.0} rotationIntensity={0.04} floatIntensity={0.38}>
        <ICO ref={crystalRef} args={[1.2, 2]}>
          <MTM
            transmission={1} thickness={2.0} roughness={0.06} ior={1.38}
            chromaticAberration={0.06} distortionScale={0.35} temporalDistortion={0.08}
            color="#ddd6f8" attenuationColor="#c9a84c" attenuationDistance={1.0}
            iridescence={0.8} iridescenceIOR={1.4} iridescenceThicknessRange={[80, 600]}
            envMapIntensity={2.8}
            samples={isMobile ? 2 : 4}
            resolution={isMobile ? 128 : 256}
            background={new THREE.Color("#050508")}
          />
        </ICO>
      </FLT>

      {/* Glowing core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.50, 1]} />
        <MDM color="#7c3aed" distort={0.55} speed={2.5}
          roughness={0} metalness={0.15} transparent opacity={0.88}
          envMapIntensity={1.8} emissive="#4c1d95" emissiveIntensity={2.0} />
      </mesh>

      {/* Rings */}
      <OrbitalRing radius={1.75} tube={0.006} color="#c9a84c" opacity={0.55} rotX={Math.PI*0.32} rotY={0}            speed={ 0.10} axis="z" />
      <OrbitalRing radius={1.95} tube={0.004} color="#8b5cf6" opacity={0.38} rotX={Math.PI*0.15} rotY={Math.PI*0.4} speed={-0.07} axis="y" />
      <OrbitalRing radius={2.12} tube={0.003} color="#e8c97a" opacity={0.18} rotX={Math.PI*0.58} rotY={Math.PI*0.1} speed={ 0.05} axis="x" />

      {/* Sparkles */}
      <SFX count={60} scale={5.0} size={1.4} speed={0.18} noise={0.3} color="#e8c97a" opacity={0.75} />
      <SFX count={40} scale={6.0} size={0.9} speed={0.12} noise={0.4} color="#a78bfa" opacity={0.60} />
      <SFX count={20} scale={3.0} size={1.8} speed={0.25} noise={0.2} color="#ffffff" opacity={0.40} />
    </group>
  );
}

// ─── Camera rig ───────────────────────────────────────────────────────────────
function CameraRig({ scrollYProgress }: SceneProps) {
  const { camera } = useThree();
  const lookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const s = scrollYProgress.get();
    let tx=0, ty=0, tz=5.0, lx=0, ly=0;

    if (s <= 0.2) {
      tz=5.0;
    } else if (s <= 0.5) {
      const p = (s-0.2)/0.3;
      tx = THREE.MathUtils.lerp(0,   -3.0, p);
      tz = THREE.MathUtils.lerp(5.0,  4.0, p);
      lx = THREE.MathUtils.lerp(0,    1.2, p);
    } else if (s <= 0.8) {
      const p = (s-0.5)/0.3;
      tx = THREE.MathUtils.lerp(-3.0, 0.0, p);
      tz = THREE.MathUtils.lerp( 4.0, 2.2, p);
      lx = THREE.MathUtils.lerp( 1.2, 0.0, p);
    } else {
      // Contact crane-shot: pull back wide and rise
      const p = (s-0.8)/0.2;
      ty = THREE.MathUtils.lerp(0.0,  1.5, p);
      tz = THREE.MathUtils.lerp(2.2,  6.0, p);
      ly = THREE.MathUtils.lerp(0.0, -0.4, p);
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, tx, 0.055);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, ty, 0.055);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, tz, 0.055);
    lookAt.current.x  = THREE.MathUtils.lerp(lookAt.current.x,  lx, 0.055);
    lookAt.current.y  = THREE.MathUtils.lerp(lookAt.current.y,  ly, 0.055);
    camera.lookAt(lookAt.current);
  });

  return null;
}

// ─── Lights ───────────────────────────────────────────────────────────────────
function SceneLights({ isMobile }: { isMobile: boolean }) {
  const violetRef = useRef<THREE.PointLight>(null);
  const goldRef   = useRef<THREE.PointLight>(null);
  const spotRef   = useRef<THREE.SpotLight>(null);
  const depthBuffer = useDepthBuffer({ frames: isMobile ? 0 : 1 });

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (violetRef.current) violetRef.current.position.set(Math.sin(t*0.38)*5, Math.sin(t*0.22)*3, Math.cos(t*0.38)*5);
    if (goldRef.current) {
      goldRef.current.position.set(Math.cos(t*0.28)*4, -2.5+Math.sin(t*0.5)*1, Math.sin(t*0.28)*4);
      goldRef.current.intensity = 16 + Math.sin(t*0.9)*5;
    }
    if (!isMobile && spotRef.current) spotRef.current.position.set(Math.sin(t*0.12)*3, 5+Math.cos(t*0.08)*0.5, 3);
  });

  return (
    <>
      <ambientLight color="#2d1a08" intensity={4} />
      <directionalLight color="#fff8f0" intensity={5} position={[-4,6,4]} />
      <pointLight ref={violetRef} color="#6d28d9" intensity={28} distance={14} position={[4,2,4]} />
      <pointLight ref={goldRef}   color="#c9a84c" intensity={16} distance={11} position={[3,-2,2]} />
      <pointLight color="#1e3a8a" intensity={10} distance={10} position={[-3,1,-6]} />
      <pointLight color="#ffffff" intensity={8}  distance={6}  position={[0,5,2]} />
      {!isMobile && (
        <SPT ref={spotRef} depthBuffer={depthBuffer} color="#e8d5a0" intensity={60}
          distance={16} angle={0.35} attenuation={5} anglePower={5} position={[2,5,3]} />
      )}
    </>
  );
}

// ─── Post-processing ─────────────────────────────────────────────────────────
function PostFX({ scrollYProgress, isMobile }: SceneProps & { isMobile: boolean }) {
  const caOffset = useRef(new THREE.Vector2(0.001, 0.001));
  useFrame(() => {
    const s = scrollYProgress.get();
    const intensity = s >= 0.5 && s <= 0.8
      ? THREE.MathUtils.mapLinear(s, 0.5, 0.8, 0.001, isMobile ? 0.002 : 0.004)
      : 0.001;
    caOffset.current.set(intensity, intensity);
  });
  return (
    <ECFX multisampling={0} disableNormalPass>
      <BLM luminanceThreshold={0.20} luminanceSmoothing={0.08} intensity={isMobile ? 1.0 : 1.6} mipmapBlur />
      <CAFXFX blendFunction={BlendFunction.NORMAL} offset={caOffset.current} radialModulation={false} modulationOffset={0} />
      <NSX opacity={0.020} blendFunction={BlendFunction.ADD} />
    </ECFX>
  );
}
const CAFXFX = CAFX as any;

// ─── Full scene ───────────────────────────────────────────────────────────────
function Scene({ scrollYProgress }: SceneProps) {
  const { viewport } = useThree();
  const isMobile = viewport.width < 6;
  return (
    <>
      <ENV preset="warehouse" />
      <SceneLights isMobile={isMobile} />
      <CosmicEnvironment />
      <StarField count={isMobile ? 600 : 900}  rMin={20} rMax={55}  size={0.09} opacity={0.55} color="#d4c8f0" scrollYProgress={scrollYProgress} />
      <StarField count={isMobile ? 150 : 300}  rMin={55} rMax={100} size={0.14} opacity={0.35} color="#c9a84c" />
      <DataCrystal scrollYProgress={scrollYProgress} />
      <CameraRig   scrollYProgress={scrollYProgress} />
      <PostFX      scrollYProgress={scrollYProgress} isMobile={isMobile} />
    </>
  );
}

// ─── Canvas export ────────────────────────────────────────────────────────────
export default function HeroCanvas({ scrollYProgress }: SceneProps) {
  return (
    <Canvas
      camera={{ position:[0,0,5], fov:48 }}
      gl={{ antialias:true, alpha:true, powerPreference:"high-performance", toneMapping:THREE.NoToneMapping, stencil:false, depth:true }}
      dpr={[1, 1.2]}
      shadows={false}
      style={{ position:"fixed", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}
    >
      <Suspense fallback={null}>
        <Scene scrollYProgress={scrollYProgress} />
      </Suspense>
    </Canvas>
  );
}