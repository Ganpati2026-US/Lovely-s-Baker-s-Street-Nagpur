'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { Bun, Patty, Cheese, Lettuce, Tomato, Onions, Sauce, BurgerFlag, FlagGlove, CHEESE_SURFACE_HEIGHT } from './Ingredients';
import { Steam } from './Atmosphere';

const TOP_BUN_Y = -.315;
const CHEESE_Y = -.708;
const LETTUCE_Y = -.68;
const DROP_DURATION = .68;
const LAYER_INTERVAL = .95;
const SAUCE_DURATION = 2.8;
const layers = [
  { name: 'bottom-bun', Component: Bun, y: -1.24, from: -3.5 },
  { name: 'patty', Component: Patty, y: -.835, from: 3.8 },
  { name: 'cheese', Component: Cheese, y: CHEESE_Y, from: 3.8 },
  { name: 'lettuce', Component: Lettuce, y: LETTUCE_Y, from: 3.8, supportHeight: CHEESE_Y + CHEESE_SURFACE_HEIGHT - LETTUCE_Y + .006 },
  { name: 'tomato', Component: Tomato, y: -.55, from: 4 },
  { name: 'onions', Component: Onions, y: -.455, from: 4 },
  { name: 'sauce', Component: Sauce, y: -.405, from: 0, application: 'drizzle', duration: SAUCE_DURATION },
  { name: 'top-bun', Component: Bun, y: TOP_BUN_Y, from: 4.2, top: true },
].map((item, index, items) => ({
  ...item,
  duration: item.duration ?? DROP_DURATION,
  delay: .15 + items.slice(0, index).reduce((time, previous) => time + (previous.duration ?? DROP_DURATION) + LAYER_INTERVAL - DROP_DURATION, 0),
}));
const TOP_LANDS_AT = layers.at(-1).delay + DROP_DURATION;
const FLAG_DELAY = TOP_LANDS_AT + .2;

function IngredientLayer({ item, readyProgress, reducedMotion, timeline }) {
  const ref = useRef();
  const applicationProgress = useMemo(() => ({ current: reducedMotion ? 1 : 0 }), [reducedMotion]);
  const compressionProgress = useMemo(() => ({ current: reducedMotion ? 1 : 0 }), [reducedMotion]);
  useFrame(() => {
    if (reducedMotion) return;
    const elapsed = timeline.current.elapsed;
    const progress = THREE.MathUtils.clamp((elapsed - item.delay) / item.duration, 0, 1);
    applicationProgress.current = progress;
    compressionProgress.current = THREE.MathUtils.smoothstep(elapsed, TOP_LANDS_AT - .12, TOP_LANDS_AT + .25);
    const eased = 1 - Math.pow(1 - progress, 3);
    ref.current.visible = timeline.current.ready && elapsed >= item.delay;
    ref.current.position.y = item.y + (1 - eased) * item.from;
    ref.current.rotation.z = item.application === 'drizzle' ? 0 : .12 * (1 - eased);
  });
  return <group name={`ingredient-${item.name}`} ref={ref} position={[0, reducedMotion ? item.y : item.y + item.from, 0]} visible={reducedMotion}>
    <item.Component top={item.top} progress={readyProgress} supportHeight={item.supportHeight} applicationProgress={applicationProgress} compressionProgress={compressionProgress} reducedMotion={reducedMotion} />
  </group>;
}

function FlagReveal({ reducedMotion, timeline }) {
  const flag = useRef(), hand = useRef();
  const release = useMemo(() => ({ current: 0 }), []);
  useFrame(() => {
    if (reducedMotion) return;
    const elapsed = timeline.current.elapsed - FLAG_DELAY;
    const placement = THREE.MathUtils.smootherstep(elapsed, 0, 1.25);
    const lift = (1 - placement) * 2.3;
    const retreat = THREE.MathUtils.smootherstep(elapsed, 1.65, 2.55);
    release.current = THREE.MathUtils.smoothstep(elapsed, 1.30, 1.65);
    flag.current.visible = timeline.current.ready && elapsed >= 0;
    flag.current.position.y = TOP_BUN_Y + lift;
    hand.current.visible = timeline.current.ready && elapsed >= 0 && elapsed < 2.55;
    hand.current.position.set(retreat * 1.8, TOP_BUN_Y + lift + retreat * 2.8, retreat * .25);
    hand.current.rotation.z = -retreat * .15;
  });
  return <>
    <group name="burger-flag" ref={flag} position={[0, reducedMotion ? TOP_BUN_Y : TOP_BUN_Y + 2.3, 0]} visible={reducedMotion}><BurgerFlag /></group>
    <group name="flag-glove" ref={hand} visible={false}><FlagGlove release={release} /></group>
  </>;
}

function Burger({ onReady, reducedMotion, rotation, rotationVersion }) {
  const ref = useRef();
  const { camera, size, invalidate, gl, scene } = useThree();
  const timeline = useRef({ elapsed: 0, ready: false });
  useEffect(() => { invalidate(); }, [invalidate, rotationVersion]);
  useEffect(() => {
    // Fit the complete silhouette on narrow screens while filling wide stages.
    const aspect = size.width / Math.max(1, size.height);
    camera.position.set(0, .65, Math.max(5.65, 1.9 / (Math.tan(Math.PI / 9) * aspect) + .9));
    camera.lookAt(0, .02, 0);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  const readyProgress = useMemo(() => ({ current: 1 }), []);
  const smokeProgress = useMemo(() => ({ current: reducedMotion ? 1 : 0 }), [reducedMotion]);
  useEffect(() => {
    let cancelled = false;
    timeline.current = { elapsed: 0, ready: false };
    // Warm every ingredient's shader before starting the visible sequence.
    gl.compileAsync(scene, camera).then(() => {
      if (cancelled) return;
      timeline.current.ready = true;
      onReady();
      invalidate();
    }).catch(error => console.error('Could not prepare the burger scene.', error));
    return () => { cancelled = true; };
  }, [gl, scene, camera, onReady, invalidate, reducedMotion]);
  useFrame((_, delta) => {
    if (!ref.current) return;
    // Loading, tab switches, and a slow frame must not skip entire ingredients.
    if (timeline.current.ready && !reducedMotion) timeline.current.elapsed += Math.min(delta, .1);
    const elapsed = timeline.current.elapsed;
    ref.current.rotation.y = reducedMotion ? rotation.current.yaw : THREE.MathUtils.damp(ref.current.rotation.y, rotation.current.yaw, 10, delta);
    ref.current.rotation.x = reducedMotion ? rotation.current.pitch : THREE.MathUtils.damp(ref.current.rotation.x, rotation.current.pitch, 10, delta);
    if (!reducedMotion) {
      smokeProgress.current = THREE.MathUtils.damp(smokeProgress.current, elapsed > layers[1].delay + DROP_DURATION ? 1 : 0, 2.5, delta);
    }
    const press = reducedMotion ? 0 : Math.sin(Math.PI * THREE.MathUtils.clamp((elapsed - TOP_LANDS_AT) / .45, 0, 1)) * .016;
    ref.current.scale.y = .9 * (1 - press);
  });
  return <>
    <ambientLight intensity={.32} />
    <Environment resolution={128} frames={1}>
      <Lightformer form="rect" intensity={3} color="#fff5e9" scale={[4, 5, 1]} position={[-4, 5, 4]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={1} color="#ffffff" scale={[2, 4, 1]} position={[4, 2, 3]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={2} color="#ffe3bd" scale={[3, 3, 1]} position={[1, 4, -4]} target={[0, 0, 0]} />
    </Environment>
    <spotLight position={[-3, 6, 5]} intensity={70} angle={.65} penumbra={1} color="#fff5e9" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-.00015} shadow-normalBias={.015} />
    <spotLight position={[4, 3, -3]} intensity={55} angle={.8} penumbra={1} color="#ffe2ba" />
    <pointLight position={[1, 1, 5]} intensity={5} color="#ffffff" />
    <group ref={ref} position={[0, -.144, 0]} scale={[1, .9, 1]} rotation={[0, -.18, 0]}><Steam progress={smokeProgress} />{layers.map((item, index) => <IngredientLayer key={index} item={item} readyProgress={readyProgress} reducedMotion={reducedMotion} timeline={timeline} />)}<FlagReveal reducedMotion={reducedMotion} timeline={timeline} /></group>
    <ContactShadows position={[0, -1.46, 0]} opacity={.5} scale={7} blur={2.2} far={3} resolution={256} color="#382c24" />
  </>;
}

export default function LaunchBurger({ active, onReady, reducedMotion, rotation, rotationVersion }) {
  return <Canvas frameloop={active && !reducedMotion ? 'always' : 'demand'} dpr={[1, 1.75]} shadows camera={{ position: [0, .65, 6.3], fov: 40 }} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}>
    <Burger onReady={onReady} reducedMotion={reducedMotion} rotation={rotation} rotationVersion={rotationVersion} />
  </Canvas>;
}
