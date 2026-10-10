import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Decal, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { random, noise, foodMaps, bunSurface, pattySurface } from './materials';

function lathe(profile, irregularity=0){
 const curve=new THREE.SplineCurve(profile.map(p=>new THREE.Vector2(...p)));const g=new THREE.LatheGeometry(curve.getPoints(100),144);const p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x);const wobble=1+irregularity*(Math.sin(a*11+y*12)+.45*Math.sin(a*23-y*17));p.setXYZ(i,x*wobble,y+irregularity*.35*Math.sin(x*21+z*17),z*wobble*.84);}
 g.computeVertexNormals();g.rotateY(Math.PI);return g;
}
const TOP_PROFILE = [[0,-.065],[1.32,-.065],[1.51,-.015],[1.59,.07],[1.58,.20],[1.48,.40],[1.28,.63],[.96,.82],[.53,.94],[0,.98]];
function Sesame() {
 const ref = useRef();
 useLayoutEffect(() => {
   const dummy = new THREE.Object3D(), color = new THREE.Color();
   const profile = new THREE.SplineCurve(TOP_PROFILE.slice(3).map(p => new THREE.Vector2(...p))).getPoints(500);
   for (let i = 0; i < 440; i++) {
     const a = random(i + 10) * Math.PI * 2, radius = Math.sqrt(random(i + 800)) * 1.55;
     let nearest = 0;
     for (let j = 1; j < profile.length; j++) if (Math.abs(profile[j].x - radius) < Math.abs(profile[nearest].x - radius)) nearest = j;
     const point = profile[nearest], before = profile[Math.max(0, nearest - 1)], after = profile[Math.min(profile.length - 1, nearest + 1)];
     const slope = (after.y - before.y) / Math.min(-.0001, after.x - before.x);
     const normal = new THREE.Vector3(-slope * Math.cos(a), 1, -slope * Math.sin(a) / .84).normalize();
     const x = radius * Math.cos(a), z = radius * Math.sin(a) * .84;
     dummy.position.set(x, point.y + .014, z);
     dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
     dummy.rotateY(random(i + 600) * Math.PI);
     const scale = .8 + random(i + 990) * .5;
     dummy.scale.set(.020 * scale, .011 * scale, .040 * scale);
     // Leave a small space for the existing bakery stamp.
     if (Math.abs(x) < .34 && z > 1.02 && point.y > .25 && point.y < .70) dummy.scale.multiplyScalar(.15);
     dummy.updateMatrix(); ref.current.setMatrixAt(i, dummy.matrix);
     color.set(i % 4 === 0 ? '#201a13' : i % 3 === 0 ? '#d9ad60' : '#f3d89b');
     ref.current.setColorAt(i, color);
   }
   ref.current.instanceMatrix.needsUpdate = true;
 }, []);
 return <instancedMesh ref={ref} args={[null, null, 440]} castShadow receiveShadow><sphereGeometry args={[1, 10, 6]}/><meshPhysicalMaterial roughness={.43} clearcoat={.12}/></instancedMesh>;
}
export function BurgerFlag(){
 const logo=useTexture('/lovely-logo.png');
 useMemo(()=>{logo.colorSpace=THREE.SRGBColorSpace;},[logo]);
 const flagLogo=useMemo(()=>{
   const canvas=document.createElement('canvas');canvas.width=canvas.height=logo.image.width;
   const context=canvas.getContext('2d');context.drawImage(logo.image,0,0);
   const pixels=context.getImageData(0,0,canvas.width,canvas.height);
   for(let i=0;i<pixels.data.length;i+=4){
     const red=pixels.data[i],green=pixels.data[i+1],blue=pixels.data[i+2];
     pixels.data[i+3]=Math.round(pixels.data[i+3]*THREE.MathUtils.smoothstep(red-Math.max(green,blue),12,90));
   }
   context.putImageData(pixels,0,0);
   const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
   return texture;
 },[logo]);
 useEffect(()=>()=>flagLogo.dispose(),[flagLogo]);
 return <group position={[0,0,0]}>
   <mesh position={[0,1.365,0]} castShadow><cylinderGeometry args={[.025,.031,1.53,16]}/><meshStandardMaterial color="#b18a54" roughness={.86}/></mesh>
   <group position={[0,1.58,0]}>
     <mesh position={[.51,0,0]} castShadow><boxGeometry args={[1.02,.58,.012]}/><meshStandardMaterial color="#fffdf5" roughness={.9} emissive="#fffdf5" emissiveIntensity={.18}/></mesh>
     <mesh position={[.51,0,.009]}><planeGeometry args={[.53,.53]}/><meshBasicMaterial map={flagLogo} transparent depthWrite={false} toneMapped={false}/></mesh>
     <mesh position={[.51,0,-.009]} rotation={[0,Math.PI,0]}><planeGeometry args={[.53,.53]}/><meshBasicMaterial map={flagLogo} transparent depthWrite={false} toneMapped={false}/></mesh>
   </group>
 </group>;
}
// A photographic glove cutout keeps the reference pose and natural nitrile folds.
// The lower finger region opens before the hand withdraws from the pick.
export function FlagGlove({ release }) {
 const texture = useTexture('/textures/chef-glove-pinch.webp');
 useMemo(() => { texture.colorSpace = THREE.SRGBColorSpace; }, [texture]);
 const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2, 48, 48), []);
 const rest = useMemo(() => geometry.attributes.position.array.slice(), [geometry]);
 useFrame(() => {
   const vertices = geometry.attributes.position;
   for (let i = 0; i < vertices.count; i++) {
     const x = rest[i * 3], y = rest[i * 3 + 1];
     const finger = 1 - THREE.MathUtils.smoothstep(y, -.78, -.30);
     const side = Math.tanh((x + .312) * 35);
     vertices.setX(i, x + side * finger * release.current * .10);
   }
   vertices.needsUpdate = true;
 });
 return <mesh position={[.312,2.76,.085]} geometry={geometry}>
   <meshBasicMaterial map={texture} transparent alphaTest={.015} depthWrite={false} side={THREE.DoubleSide} toneMapped={false}/>
 </mesh>;
}
function LogoStamp(){
 const logo=useTexture('/lovely-logo.png');
 const stamp=useMemo(()=>{
   const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
   const context=canvas.getContext('2d');context.drawImage(logo.image,0,0,512,512);
   const pixels=context.getImageData(0,0,512,512);
   for(let i=0;i<pixels.data.length;i+=4){
     // Keep the red logo's edges while making its white background transparent.
     const ink=255-(pixels.data[i+1]+pixels.data[i+2])/2;
     pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=255;
     pixels.data[i+3]=Math.max(0,Math.min(255,ink*.85));
   }
   context.putImageData(pixels,0,0);
   const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
   return texture;
 },[logo]);
 useEffect(()=>()=>stamp.dispose(),[stamp]);
 return <Decal position={[0,.48,1.12]} rotation={[-.5,0,0]} scale={[.78,.72,.55]}>
   <meshStandardMaterial map={stamp} color="#6b2b12" transparent polygonOffset polygonOffsetFactor={-4} roughness={1} depthWrite={false}/>
 </Decal>;
}
export function Bun({ top = false }) {
 const crumb = useMemo(() => foodMaps('crumb'), []);
 const crust = useTexture('/textures/brioche-skin-v2.webp');
 useMemo(() => { crust.colorSpace = THREE.SRGBColorSpace; crust.wrapS = crust.wrapT = THREE.RepeatWrapping; crust.anisotropy = 8; }, [crust]);
 const geometry = useMemo(() => lathe(top ? TOP_PROFILE : [[0,-.20],[1.20,-.20],[1.43,-.16],[1.55,-.055],[1.57,.08],[1.50,.20],[1.34,.24],[0,.24]], .007), [top]);
 return <group>
   <mesh geometry={geometry} castShadow receiveShadow>
     <meshPhysicalMaterial map={crust} bumpMap={crust} onBeforeCompile={bunSurface} bumpScale={.025} roughness={.43} clearcoat={.2} clearcoatRoughness={.35} />
     {top && <LogoStamp/>}
   </mesh>
   {top ? <Sesame/> : <mesh position={[0,.243,0]} rotation={[-Math.PI / 2,0,0]} scale={[1.44,1.20,1]} receiveShadow>
     <circleGeometry args={[1,128]}/><meshPhysicalMaterial {...crumb} bumpScale={.038} roughness={.91} clearcoat={.07}/>
   </mesh>}
 </group>;
}

export function Patty() {
 const maps = useMemo(() => foodMaps('patty'), []);
 const coating = useTexture('/textures/chicken-coating.webp');
 useMemo(() => { coating.colorSpace = THREE.SRGBColorSpace; coating.wrapS = coating.wrapT = THREE.RepeatWrapping; coating.anisotropy = 8; }, [coating]);
 const geometry = useMemo(() => {
   const g = lathe([[0,-.18],[.95,-.18],[1.34,-.155],[1.50,-.09],[1.56,.015],[1.48,.125],[1.27,.18],[0,.18]], .007);
   const p = g.attributes.position;
   for (let i = 0; i < p.count; i++) {
     const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
     const n = (noise(x * 17 + 50, z * 17 + y * 9 + 50) - .5) * .014;
     const grain = Math.sin(x * 63 + z * 41) * Math.sin(z * 53 - y * 35) * .002;
     p.setXYZ(i, x + n * .5, y + n + grain, z + n * .5);
   }
   g.computeVertexNormals(); return g;
 }, []);
 return <mesh geometry={geometry} castShadow receiveShadow><meshPhysicalMaterial {...maps} map={coating} bumpMap={coating} onBeforeCompile={pattySurface} roughness={1} bumpScale={.015} clearcoat={.02} clearcoatRoughness={.7}/></mesh>;
}

export const CHEESE_SURFACE_HEIGHT = .074;

export function Cheese({ progress }) {
 const ref = useRef();
 const maps = useMemo(() => foodMaps('cheese'), []);
 useLayoutEffect(() => { ref.current?.updateMorphTargets(); }, []);
 useFrame(() => { if (ref.current?.morphTargetInfluences) ref.current.morphTargetInfluences[0] = 1 - THREE.MathUtils.smoothstep(progress?.current ?? 1, .39, .49); });
 const geometry = useMemo(() => {
   const radial = 32, segments = 160, vertices = [], uvs = [], indices = [];
   // A closed sheet with a rounded lip, and connected drips extending down the patty.
   for (let side = 0; side < 2; side++) for (let ring = 0; ring <= radial; ring++) for (let j = 0; j <= segments; j++) {
     const t = ring / radial, a = j / segments * Math.PI * 2;
     const radius = (1.67 + .025 * Math.sin(a * 5) + .014 * Math.sin(a * 11)) * t;
     let drip = 0;
     [[.62,.25,.14],[1.9,.31,.16],[2.85,.19,.15],[4.25,.24,.18],[5.5,.17,.17]].forEach(([center, depth, width]) => {
       const d = Math.atan2(Math.sin(a - center), Math.cos(a - center));
       drip += depth * Math.exp(-.5 * (d / width) ** 2);
     });
     const edge = THREE.MathUtils.smoothstep(t, .92, 1);
     const y = .065 + .009 * Math.sin(a * 6 + t * 13) * t - edge * (.06 + drip) - side * .014;
     const r = radius + edge * drip * .02;
     vertices.push(Math.cos(a) * r, y, Math.sin(a) * r * .84);
     uvs.push(.5 + Math.cos(a) * t * .5, .5 + Math.sin(a) * t * .5);
     if (ring < radial && j < segments) {
       const k = side * (radial + 1) * (segments + 1) + ring * (segments + 1) + j;
       if (side === 0) indices.push(k,k+1,k+segments+1,k+1,k+segments+2,k+segments+1);
       else indices.push(k,k+segments+1,k+1,k+1,k+segments+1,k+segments+2);
     }
   }
   const stride = (radial + 1) * (segments + 1), edgeStart = radial * (segments + 1);
   // Face the thin rim outward so its normals blend into the upper surface
   // instead of creating a dark inverted edge around the slice.
   for (let j = 0; j < segments; j++) { const k = edgeStart + j; indices.push(k,k+1,k+stride,k+1,k+stride+1,k+stride); }
   const g = new THREE.BufferGeometry();
   g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2)); g.setIndex(indices); g.computeVertexNormals();
   const flat = new Float32Array(vertices);
   for (let i = 1; i < flat.length; i += 3) flat[i] = i / 3 < stride ? .065 : .051;
   g.morphAttributes.position = [new THREE.Float32BufferAttribute(flat,3)]; return g;
 }, []);
 return <mesh ref={ref} geometry={geometry} castShadow receiveShadow><meshPhysicalMaterial {...maps} bumpScale={.006} roughness={.74} clearcoat={.2} clearcoatRoughness={.4} side={THREE.DoubleSide} emissive="#e6a02b" emissiveIntensity={.12}/></mesh>;
}

export function Lettuce({ supportHeight = .052 }) {
 const maps = useMemo(() => foodMaps('leaf'), []);
 const leaf = useTexture('/textures/lettuce-leaf-v2.webp');
 useMemo(() => { leaf.colorSpace = THREE.SRGBColorSpace; leaf.anisotropy = 8; }, [leaf]);
 const leaves = useMemo(() => Array.from({length:9}, (_,i) => {
   const radial = 28, segments = 112, vertices = [], uvs = [], indices = [];
   for (let ring = 0; ring <= radial; ring++) for (let j = 0; j <= segments; j++) {
     const t = ring / radial, a = j / segments * Math.PI * 2;
     const lobe = 1 + .095 * Math.sin(a * 7 + i) + .033 * Math.cos(a * 17 - i);
     const r = t * lobe;
     const ruffle = (.057 * Math.sin(a * 8 + i * 1.4) + .023 * Math.sin(a * 19 + i)) * Math.pow(t, 4);
     const fold = .075 * Math.sin(a * 3 + i) * t * t;
     vertices.push(Math.cos(a) * r * .77, .045 * (1 - t * t) + ruffle + fold, Math.sin(a) * r * .68);
     uvs.push(.5 + Math.cos(a) * t * .5, .5 + Math.sin(a) * t * .5);
     if (ring < radial && j < segments) {const k = ring * (segments + 1) + j; indices.push(k,k+1,k+segments+1,k+1,k+segments+2,k+segments+1);}
   }
   const g = new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2)); g.setIndex(indices);
   const a = i / 7 * Math.PI * 2, radius = i < 7 ? .88 : .24;
   g.applyQuaternion(new THREE.Quaternion().setFromEuler(new THREE.Euler(.02*Math.sin(a),a,.06*Math.cos(a))));
   g.translate(Math.cos(a)*radius, .015+(i%3)*.024, Math.sin(a)*radius*.84);
   // Gently flatten only folds that would penetrate the cheese. Bake this
   // after leaf placement so the clearance holds for every rotated leaf.
   const positions = g.attributes.position;
   for (let vertex = 0; vertex < positions.count; vertex++) {
     const height = positions.getY(vertex);
     positions.setY(vertex, supportHeight + .012*Math.log1p(Math.exp((height-supportHeight)/.012)));
   }
   g.computeVertexNormals(); return g;
 }), [supportHeight]);
 return <group>{leaves.map((g,i) => {
   return <mesh key={i} geometry={g} castShadow receiveShadow>
     <meshPhysicalMaterial {...maps} map={leaf} bumpMap={leaf} color={i%3 ? '#ffffff' : '#edf6c8'} bumpScale={.012} roughness={.84} side={THREE.DoubleSide} clearcoat={.18} clearcoatRoughness={.4} emissive="#486b0a" emissiveIntensity={.065}/>
   </mesh>;
 })}</group>;
}

export function Tomato() {
 const map = useTexture('/textures/tomato-cut-v2.webp');
 const skin = useMemo(() => foodMaps('tomato'), []);
 useMemo(() => { map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8; }, [map]);
 const geometry = useMemo(() => {
   const g = new THREE.CylinderGeometry(.85,.84,.14,112,3,true);
   const p = g.attributes.position;
   for (let i=0;i<p.count;i++) { const x=p.getX(i),z=p.getZ(i),a=Math.atan2(z,x),w=1+.012*Math.sin(a*5)+.008*Math.cos(a*9);p.setXYZ(i,x*w,p.getY(i)+.004*Math.sin(a*4),z*w); }
   g.computeVertexNormals(); return g;
 }, []);
 return <group>{[-.68,.53].map((x,i) => <group key={x} position={[x,i*.027,i?-.13:.13]} rotation={[.012,i*.63,i?-.025:.025]}>
   <mesh geometry={geometry} castShadow receiveShadow>
     <meshPhysicalMaterial {...skin} bumpScale={.009} roughness={.6} clearcoat={.4} clearcoatRoughness={.25}/>
   </mesh>
   <mesh position={[0,.071,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><circleGeometry args={[.847,112]}/><meshPhysicalMaterial map={map} bumpMap={skin.bumpMap} bumpScale={.007} roughness={.3} clearcoat={.4} clearcoatRoughness={.2}/></mesh>
   <mesh position={[0,-.071,0]} rotation={[Math.PI/2,0,0]} receiveShadow><circleGeometry args={[.838,112]}/><meshPhysicalMaterial map={map} roughness={.38}/></mesh>
 </group>)}</group>;
}

function OnionRing({ radius = .56, width = .085 }) {
 const geometry = useMemo(() => {
   const profile = [[radius-width,-.032],[radius-.009,-.032],[radius,.0],[radius-.009,.032],[radius-width,.032],[radius-width-.006,0],[radius-width,-.032]];
   const g = lathe(profile, .004);
   const colors = [], color = new THREE.Color(), p = g.attributes.position;
   for (let i=0;i<p.count;i++) {
     const x=p.getX(i),z=p.getZ(i),y=p.getY(i),r=Math.hypot(x,z/.84);
     const outside = THREE.MathUtils.smoothstep(r,radius-.019,radius-.003);
     const ring = .5+.5*Math.cos((r-radius+width)*Math.PI*2/.017);
     color.set('#f4e4d8'); color.lerp(new THREE.Color('#ae3871'),Math.max(outside*.92,Math.pow(ring,12)*.24));
     if (Math.abs(y)<.018) color.multiplyScalar(.94);
     colors.push(color.r,color.g,color.b);
   }
   g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3)); return g;
 }, [radius,width]);
 return <mesh geometry={geometry} castShadow receiveShadow><meshPhysicalMaterial vertexColors roughness={.34} clearcoat={.27} clearcoatRoughness={.3}/></mesh>;
}
export function Onions() {
 return <group>{[0,1,2].map(i => <group key={i} position={[(i-1)*.44,.005+i*.01,.27-(i%2)*.45]} rotation={[.05*(i-1),i*.8,.045*(i-1)]}><OnionRing radius={.52+i*.05} width={.075+i*.006}/></group>)}</group>;
}

// An inward spiral follows the motion of a chef using a squeeze bottle.
class SauceSpiral extends THREE.Curve {
 getPoint(t, target = new THREE.Vector3()) {
   const angle = -Math.PI / 2 + t * Math.PI * 2 * 2.7;
   const radius = 1.20 * (1 - t) + .06;
   return target.set(Math.cos(angle)*radius, .035, Math.sin(angle)*radius*.84);
 }
}

export function Sauce({ applicationProgress, compressionProgress, reducedMotion = false }) {
 const spiralRef = useRef(), bottleRef = useRef(), streamRef = useRef(), tipRef = useRef(), spreadRef = useRef();
 const path = useMemo(() => new SauceSpiral(), []);
 const head = useMemo(() => new THREE.Vector3(), []);
 const segments = 240, sides = 10;
 const spiral = useMemo(() => {
   const geometry = new THREE.TubeGeometry(path, segments, .043, sides, false);
   const positions = geometry.attributes.position;
   for (let i = 0; i < positions.count; i++) positions.setY(i, .035 + (positions.getY(i)-.035)*.62);
   geometry.computeVertexNormals();
   geometry.setDrawRange(0, reducedMotion ? Infinity : 0);
   return geometry;
 }, [path, reducedMotion]);
 useFrame(() => {
   const phase = reducedMotion ? 1 : (applicationProgress?.current ?? 1);
   const compressed = reducedMotion ? 1 : (compressionProgress?.current ?? 1);
   const poured = THREE.MathUtils.clamp((phase-.16)/.70, 0, 1);
   const completedSegments = Math.floor(poured*segments);
   spiral.setDrawRange(0, completedSegments*sides*6);
   // Match the rounded end exactly to the last revealed section of the tube.
   path.getPoint(completedSegments/segments, head);
   spiralRef.current.visible = poured > 0 && compressed < .995;
   spiralRef.current.scale.y = 1 - compressed*.6;
   tipRef.current.position.copy(head);
   const lift = (1-THREE.MathUtils.smoothstep(phase,0,.14))*.9 + THREE.MathUtils.smoothstep(phase,.86,1)*.9;
   bottleRef.current.visible = phase > 0 && phase < 1;
   bottleRef.current.position.set(head.x, 1.07+lift, head.z);
   bottleRef.current.rotation.set(Math.cos(poured*Math.PI*5.4)*.045,0,Math.sin(poured*Math.PI*5.4)*.07);
   streamRef.current.visible = phase >= .16 && phase < .86;
   const streamHeight = 1.07 + lift - head.y;
   streamRef.current.position.set(head.x, head.y+streamHeight/2, head.z);
   streamRef.current.scale.set(.026,streamHeight,.026);
   // The spiral spreads only when the bun presses onto it.
   spreadRef.current.visible = compressed > .001;
   const spreadScale = .3 + compressed*.7;
   spreadRef.current.scale.set(spreadScale,1,spreadScale);
 });
 const spread = useMemo(() => {
   const g = lathe([[0,-.014],[1.04,-.02],[1.34,-.02],[1.39,0],[1.34,.022],[.8,.022],[0,.02]],.006);
   const p=g.attributes.position;
   for(let i=0;i<p.count;i++){
     const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z/.84,x);
     const edge=THREE.MathUtils.smoothstep(Math.hypot(x,z/.84),1.15,1.4);
     p.setY(i,y-.055*Math.pow(Math.max(0,Math.sin(a*5+.8)),10)*edge);
   }
   g.computeVertexNormals();return g;
 },[]);
 return <group>
   <group ref={spiralRef} name="sauce-spiral" visible={!reducedMotion}>
     <mesh geometry={spiral} castShadow receiveShadow><meshPhysicalMaterial color="#edbd83" roughness={.36} clearcoat={.22} clearcoatRoughness={.3}/></mesh>
     <mesh ref={tipRef} scale={[.043,.027,.043]} castShadow><sphereGeometry args={[1,12,8]}/><meshPhysicalMaterial color="#edbd83" roughness={.36} clearcoat={.22}/></mesh>
   </group>
   <mesh ref={streamRef} name="sauce-stream" visible={false} castShadow><cylinderGeometry args={[1,1,1,12]}/><meshPhysicalMaterial color="#edbd83" roughness={.34} clearcoat={.25}/></mesh>
   <group ref={bottleRef} name="sauce-bottle" visible={false}>
     <mesh position={[0,.10,0]} castShadow><cylinderGeometry args={[.074,.017,.22,20]}/><meshPhysicalMaterial color="#fff5de" roughness={.46}/></mesh>
     <mesh position={[0,.235,0]} castShadow><cylinderGeometry args={[.105,.105,.07,24]}/><meshPhysicalMaterial color="#fff5de" roughness={.5}/></mesh>
     <mesh position={[0,.52,0]} castShadow><capsuleGeometry args={[.15,.35,5,20]}/><meshPhysicalMaterial color="#ecc88c" roughness={.48} clearcoat={.15} clearcoatRoughness={.4}/></mesh>
   </group>
   <mesh ref={spreadRef} name="sauce-spread" geometry={spread} visible={reducedMotion} castShadow receiveShadow><meshPhysicalMaterial color="#e7b47b" roughness={.37} clearcoat={.2} clearcoatRoughness={.3}/></mesh>
 </group>;
}
