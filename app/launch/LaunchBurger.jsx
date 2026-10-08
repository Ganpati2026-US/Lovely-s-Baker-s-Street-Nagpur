'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { Bun, Patty, Cheese, Lettuce, Tomato, Onions, Sauce, BurgerFlag } from './Ingredients';
import { Steam } from './Atmosphere';

const layers = [
  { Component: Bun, y: -1.24, from: -3.5, delay: 0 },
  { Component: Patty, y: -.79, from: 3.8, delay: .38 },
  { Component: Cheese, y: -.62, from: 3.8, delay: .76 },
  { Component: Lettuce, y: -.49, from: 3.8, delay: 1.14 },
  { Component: Tomato, y: -.29, from: 4, delay: 1.52 },
  { Component: Onions, y: -.175, from: 4, delay: 1.9 },
  { Component: Sauce, y: -.14, from: 3.8, delay: 2.28 },
  { Component: Bun, y: -.035, from: 4.2, delay: 2.66, top: true },
];

function IngredientLayer({ item, readyProgress, reducedMotion }) {
  const ref = useRef();
  useFrame(({ clock }, delta) => {
    if (reducedMotion) return;
    const elapsed = clock.elapsedTime;
    const entered = elapsed > item.delay + .12;
    const target = item.y + (entered ? 0 : item.from);
    ref.current.visible = elapsed > item.delay;
    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, target, 5.5, delta);
    ref.current.rotation.z = THREE.MathUtils.damp(ref.current.rotation.z, entered ? 0 : .18, 5, delta);
  });
  return <group ref={ref} position={[0, reducedMotion ? item.y : item.y + item.from, 0]} visible={reducedMotion}>
    <item.Component top={item.top} progress={readyProgress} />
  </group>;
}

function FlagReveal({ reducedMotion }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const progress = THREE.MathUtils.clamp((clock.elapsedTime - 3.65) / 1.05, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    ref.current.visible = clock.elapsedTime >= 3.65;
    ref.current.position.y = -.035 + (1 - eased) * 2.3;
  });
  return <group ref={ref} position={[0, reducedMotion ? -.035 : 2.265, 0]} visible={reducedMotion}><BurgerFlag /></group>;
}

function Burger({ onReady, reducedMotion, rotation, rotationVersion }) {
  const ref = useRef();
  const { camera, size, invalidate } = useThree();
  useEffect(() => { invalidate(); }, [invalidate, rotationVersion]);
  useEffect(() => {
    // Fit the complete silhouette on narrow screens while filling wide stages.
    const aspect = size.width / Math.max(1, size.height);
    camera.position.set(0, -.12, Math.max(5.35, 1.9 / (Math.tan(Math.PI / 9) * aspect) + .9));
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  const readyProgress = useMemo(() => ({ current: 1 }), []);
  const smokeProgress = useMemo(() => ({ current: reducedMotion ? 1 : 0 }), [reducedMotion]);
  useEffect(() => {
    onReady();
  }, [onReady, reducedMotion]);
  useFrame(({ clock }, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y = reducedMotion ? rotation.current.yaw : THREE.MathUtils.damp(ref.current.rotation.y, rotation.current.yaw, 10, delta);
    ref.current.rotation.x = reducedMotion ? rotation.current.pitch : THREE.MathUtils.damp(ref.current.rotation.x, rotation.current.pitch, 10, delta);
    if (!reducedMotion) {
      smokeProgress.current = THREE.MathUtils.damp(smokeProgress.current, clock.elapsedTime > 1.15 ? 1 : 0, 2.5, delta);
    }
    const press = reducedMotion ? 0 : Math.sin(Math.PI * THREE.MathUtils.clamp((clock.elapsedTime - 3.45) / .55, 0, 1)) * .016;
    ref.current.scale.y = 1 - press;
  });
  return <>
    <ambientLight intensity={.45} />
    <Environment resolution={128} frames={1}>
      <Lightformer form="rect" intensity={2.2} color="#fff1df" scale={[5, 4, 1]} position={[-4, 5, 4]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={1.2} color="#ffffff" scale={[3, 4, 1]} position={[4, 2, 3]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={2} color="#ffe3bd" scale={[3, 3, 1]} position={[1, 4, -4]} target={[0, 0, 0]} />
    </Environment>
    <spotLight position={[-3, 6, 5]} intensity={65} angle={.65} penumbra={1} color="#fff0dc" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-.0002} />
    <spotLight position={[4, 3, -3]} intensity={55} angle={.8} penumbra={1} color="#ffe2ba" />
    <pointLight position={[1, 1, 5]} intensity={5} color="#ffffff" />
    <group ref={ref} position={[0, 0, 0]} rotation={[0, -.18, 0]}><Steam progress={smokeProgress} />{layers.map((item, index) => <IngredientLayer key={index} item={item} readyProgress={readyProgress} reducedMotion={reducedMotion} />)}<FlagReveal reducedMotion={reducedMotion} /></group>
    <ContactShadows position={[0, -1.46, 0]} opacity={.5} scale={7} blur={2.2} far={3} resolution={256} color="#382c24" />
  </>;
}

export default function LaunchBurger({ active, onReady, reducedMotion, rotation, rotationVersion }) {
  return <Canvas frameloop={active && !reducedMotion ? 'always' : 'demand'} dpr={[1, 1.5]} shadows camera={{ position: [0, -.15, 6.3], fov: 40 }} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1 }}>
    <Burger onReady={onReady} reducedMotion={reducedMotion} rotation={rotation} rotationVersion={rotationVersion} />
  </Canvas>;
}
