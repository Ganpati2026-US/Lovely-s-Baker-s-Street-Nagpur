import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Decal, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { random, foodMaps, tomatoMap } from './materials';

function lathe(profile, irregularity=0){
 const curve=new THREE.SplineCurve(profile.map(p=>new THREE.Vector2(...p)));const g=new THREE.LatheGeometry(curve.getPoints(100),144);const p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x);const wobble=1+irregularity*(Math.sin(a*11+y*12)+.45*Math.sin(a*23-y*17));p.setXYZ(i,x*wobble,y+irregularity*.35*Math.sin(x*21+z*17),z*wobble*.84);}
 g.computeVertexNormals();g.rotateY(Math.PI);return g;
}
function Sesame(){
 const ref=useRef();useLayoutEffect(()=>{const dummy=new THREE.Object3D();const profile=new THREE.SplineCurve([[1.61,.04],[1.60,.14],[1.53,.29],[1.38,.46],[1.13,.62],[.81,.73],[.42,.81],[0,.84]].map(p=>new THREE.Vector2(...p))).getPoints(300);for(let i=0;i<260;i++){
   const a=random(i+10)*Math.PI*2,r=Math.sqrt(random(i+800))*.975,theta=r*Math.PI/2;
   const x=Math.sin(theta)*Math.cos(a)*1.60,z=Math.sin(theta)*Math.sin(a)*1.34,y=.04+Math.cos(theta)*.76;
   // Keep the burned brand unobstructed.
   const brandZone=Math.abs(x)<.60&&z>.77&&y>.30;
   const radius=Math.sqrt(x*x+(z/.84)**2);let nearest=profile[0];for(const p of profile)if(Math.abs(p.x-radius)<Math.abs(nearest.x-radius))nearest=p;dummy.position.set(x,nearest.y+.009,z);const normal=new THREE.Vector3(x/2.56,(y-.04)/.5776,z/1.8).normalize();dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),normal);dummy.rotateY(random(i+600)*Math.PI);dummy.scale.set(.025,.017,.055);if(brandZone)dummy.scale.setScalar(0);dummy.updateMatrix();ref.current.setMatrixAt(i,dummy.matrix);
 }ref.current.instanceMatrix.needsUpdate=true;},[]);
 return <instancedMesh ref={ref} args={[null,null,260]}><sphereGeometry args={[1,8,6]}/><meshStandardMaterial color="#151310" roughness={.62}/></instancedMesh>;
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
 const flag=useRef();
 useFrame(({clock})=>{
   if(flag.current)flag.current.rotation.y=Math.sin(clock.elapsedTime*1.5)*.045;
 });
 return <group position={[0,0,0]}>
   <mesh position={[0,1.06,0]} castShadow><cylinderGeometry args={[.018,.022,1.12,10]}/><meshStandardMaterial color="#c7a177" roughness={.8}/></mesh>
   <group ref={flag} position={[0,1.31,0]}>
     <mesh position={[.51,0,0]} castShadow><planeGeometry args={[1.02,.58]}/><meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} roughness={.85}/></mesh>
     <mesh position={[.51,0,.006]}><planeGeometry args={[.53,.53]}/><meshBasicMaterial map={flagLogo} transparent depthWrite={false} side={THREE.DoubleSide} toneMapped={false}/></mesh>
     <mesh position={[.51,0,-.006]} rotation={[0,Math.PI,0]}><planeGeometry args={[.53,.53]}/><meshBasicMaterial map={flagLogo} transparent depthWrite={false} side={THREE.DoubleSide} toneMapped={false}/></mesh>
   </group>
 </group>;
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
export function Bun({top=false}){
 const maps=useMemo(()=>foodMaps('bun'),[]);const crust=useTexture('/textures/brioche-crust.webp');useMemo(()=>{crust.colorSpace=THREE.SRGBColorSpace;crust.wrapS=crust.wrapT=THREE.RepeatWrapping;crust.repeat.set(2.5,1.1);crust.anisotropy=8;},[crust]);
 const geometry=useMemo(()=>top?lathe([[0,-.075],[1.35,-.075],[1.52,-.025],[1.61,.04],[1.60,.14],[1.53,.29],[1.38,.46],[1.13,.62],[.81,.73],[.42,.81],[0,.84]],.009):lathe([[0,-.20],[1.26,-.20],[1.48,-.14],[1.57,-.02],[1.59,.10],[1.51,.22],[1.32,.25],[0,.25]],.012),[top]);
 return <group><mesh geometry={geometry} castShadow receiveShadow><meshPhysicalMaterial {...maps} map={crust} color="#fff0d6" onBeforeCompile={shader=>{shader.fragmentShader=shader.fragmentShader.replace("#include <map_fragment>",THREE.ShaderChunk.map_fragment.replace("diffuseColor *= sampledDiffuseColor;","diffuseColor *= mix(vec4(1.0),sampledDiffuseColor,.86);"));}} bumpScale={.026} roughness={.48} clearcoat={.2} clearcoatRoughness={.42}/>{top&&<LogoStamp/>}</mesh>{top&&<Sesame/>}
 {!top&&<mesh position={[0,.252,0]} rotation={[-Math.PI/2,0,0]} scale={[1.40,1.17,1]}><circleGeometry args={[1,80]}/><meshStandardMaterial {...maps} color="#f1c47a" bumpScale={.07} roughness={.92}/></mesh>}
 </group>;
}
export function Patty(){
 const maps=useMemo(()=>foodMaps('chicken'),[]);const coating=useTexture('/textures/chicken-coating.webp');useMemo(()=>{coating.colorSpace=THREE.SRGBColorSpace;coating.wrapS=coating.wrapT=THREE.RepeatWrapping;coating.repeat.set(1,1);coating.anisotropy=8;},[coating]);
 const geometry=useMemo(()=>{
  const g=lathe([[0,-.22],[1.22,-.22],[1.43,-.18],[1.57,-.08],[1.60,.045],[1.52,.17],[1.32,.22],[0,.22]],.025);const p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const n=Math.sin(x*38+z*27)*Math.sin(z*41-y*32)*.035+Math.sin(x*81-z*57)*.009;p.setXYZ(i,x+n,y+n,z+n);}
  g.computeVertexNormals();return g;
 },[]);
 return <group><mesh geometry={geometry} castShadow receiveShadow><meshPhysicalMaterial {...maps} map={coating} onBeforeCompile={chickenSurface} roughness={.82} bumpScale={.055} clearcoat={.08} clearcoatRoughness={.4}/></mesh><ChickenCrust/></group>;
}
export function Cheese({progress}){
 const ref=useRef();useLayoutEffect(()=>{ref.current?.updateMorphTargets();},[]);useFrame(()=>{if(ref.current?.morphTargetInfluences){const t=THREE.MathUtils.smoothstep(progress?.current??1,.39,.49);ref.current.morphTargetInfluences[0]=1-t;}});
 const geometry=useMemo(()=>{
  const g=new THREE.PlaneGeometry(3.10,2.60,80,80);const p=g.attributes.position;
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),z=p.getY(i),r=Math.sqrt((x/1.62)**2+(z/1.36)**2);
   const over=Math.max(0,r-.88),drape=Math.pow(over,1.3)*1.05;
   const cr=r>1?1.045/r:1.045;
   const angle=.20,rx=x*Math.cos(angle)-z*Math.sin(angle),rz=x*Math.sin(angle)+z*Math.cos(angle);
   p.setXYZ(i,rx*cr,.115-drape+.012*Math.sin(x*4+z*3),rz*cr);
  }g.computeVertexNormals();const flat=new Float32Array(p.array);for(let i=1;i<flat.length;i+=3)flat[i]=.115;g.morphAttributes.position=[new THREE.Float32BufferAttribute(flat,3)];return g;
 },[]);
 return <mesh ref={ref} geometry={geometry} castShadow receiveShadow><meshPhysicalMaterial color="#e9a11b" roughness={.36} clearcoat={.18} clearcoatRoughness={.25} side={THREE.DoubleSide}/></mesh>;
}
export function Lettuce(){
 const maps=useMemo(()=>foodMaps('leaf'),[]);
 const leaves=useMemo(()=>Array.from({length:14},(_,i)=>{
  const radial=22,segments=80,vertices=[],uvs=[],indices=[];
  for(let ring=0;ring<=radial;ring++)for(let j=0;j<=segments;j++){
   const t=ring/radial,a=j/segments*Math.PI*2;
   const lobe=1+.14*Math.sin(a*7+i)+.045*Math.cos(a*15-i);
   const r=t*lobe;
   vertices.push(Math.cos(a)*r*.66,.075*Math.sin(a*8+i)*t*t+.045*Math.cos(a*19)*Math.pow(t,5)+.045*(1-t*t),Math.sin(a)*r*.49);
   uvs.push(.5+Math.cos(a)*t*.5,.5+Math.sin(a)*t*.5);
   if(ring<radial&&j<segments){const k=ring*(segments+1)+j;indices.push(k,k+1,k+segments+1,k+1,k+segments+2,k+segments+1);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;
 }),[]);
 return <group>{leaves.map((g,i)=>{const a=i/11*Math.PI*2,radius=i<11?.95:.32;return <mesh key={i} geometry={g} position={[Math.cos(a)*radius,.01+random(i)*.025,Math.sin(a)*radius*.76]} rotation={[Math.sin(a)*.13,a,Math.cos(a)*.14]} castShadow receiveShadow><meshPhysicalMaterial {...maps} color={i%3?'#d9ec9e':'#afce75'} roughness={.57} bumpScale={.035} side={THREE.DoubleSide} clearcoat={.14} clearcoatRoughness={.45}/></mesh>})}</group>;
}
export function Tomato(){
 const map=useMemo(tomatoMap,[]);
 return <group>{[-.72,.46].map((x,i)=><group key={x} position={[x,0,i?-.18:.14]} rotation={[0,i*.65,0]}><mesh castShadow receiveShadow><cylinderGeometry args={[.83,.82,.15,80]}/><meshPhysicalMaterial color="#cf321b" roughness={.34} clearcoat={.45}/></mesh><mesh position={[0,.076,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.81,80]}/><meshPhysicalMaterial map={map} roughness={.32} clearcoat={.3}/></mesh></group>)}</group>;
}
export function Onions(){
 return <group>{[0,1,2].map(i=><group key={i} position={[(i-1)*.43,.025,.22-(i%2)*.45]} rotation={[-Math.PI/2+.025*i,.04,0]} scale={[1,.85,1]}>
   <mesh castShadow receiveShadow><torusGeometry args={[.52,.062,16,80]}/><meshPhysicalMaterial color="#97325c" roughness={.4} clearcoat={.22}/></mesh>
   <mesh position={[0,0,.033]}><torusGeometry args={[.515,.043,12,80]}/><meshPhysicalMaterial color="#f4d9dd" roughness={.38} clearcoat={.2}/></mesh>
 </group>)}</group>;
}
export function Sauce(){
 // A rounded, continuous spread: the drips grow out of its edge rather than
 // floating as separate tubes beneath a paper-thin disc.
 const spread=useMemo(()=>{
   const geometry=lathe([[0,-.025],[1.1,-.04],[1.46,-.045],[1.5,-.01],[1.48,.015],[1.3,.035],[.8,.035],[0,.025]],.006);
   const p=geometry.attributes.position;
   for(let i=0;i<p.count;i++){
     const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
     const radius=Math.hypot(x,z/.84),angle=Math.atan2(z/.84,x);
     const edge=THREE.MathUtils.smoothstep(radius,1.15,1.46);
     const underside=1-THREE.MathUtils.smoothstep(y,-.025,.028);
     let drip=0;
     [[.8,.09,.16],[1.6,.14,.12],[2.3,.07,.18]].forEach(([center,depth,width])=>{
       const distance=Math.atan2(Math.sin(angle-center),Math.cos(angle-center));
       drip+=depth*Math.exp(-.5*(distance/width)**2);
     });
     p.setY(i,y-drip*edge*underside);
   }
   geometry.computeVertexNormals();return geometry;
 },[]);
 return <mesh geometry={spread} castShadow receiveShadow>
   <meshPhysicalMaterial color="#e5b578" roughness={.43} clearcoat={.12} clearcoatRoughness={.4}/>
 </mesh>;
}

function ChickenCrust(){
 const ref=useRef();useLayoutEffect(()=>{const dummy=new THREE.Object3D(),color=new THREE.Color();for(let i=0;i<1100;i++){
 const a=random(i+501)*Math.PI*2,top=i<410,r=top?Math.sqrt(random(i+2000))*1.48:1.50+random(i+3000)*.075;
 dummy.position.set(Math.cos(a)*r,top?.18+random(i+4000)*.03:(random(i+5000)-.5)*.28,Math.sin(a)*r*.84);
 dummy.rotation.set(random(i)*2,random(i+99)*3,random(i+100)*2);const sz=.015+random(i+300)*.029;dummy.scale.set(sz*1.8,sz*.42,sz);dummy.updateMatrix();ref.current.setMatrixAt(i,dummy.matrix);
 color.set(i%7===0?'#81501d':i%3?'#c58a36':'#e1ac59');ref.current.setColorAt(i,color);
 }ref.current.instanceMatrix.needsUpdate=true;},[]);
 return <instancedMesh ref={ref} args={[null,null,1100]} castShadow receiveShadow><icosahedronGeometry args={[1,1]}/><meshPhysicalMaterial roughness={.64} clearcoat={.28} clearcoatRoughness={.37}/></instancedMesh>
}

function chickenSurface(shader){
 shader.vertexShader='varying vec3 vFoodPosition; varying vec3 vFoodNormal;\n'+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvFoodPosition=position;vFoodNormal=normal;');
 shader.fragmentShader='varying vec3 vFoodPosition; varying vec3 vFoodNormal;\n'+shader.fragmentShader;
 shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
 vec3 w=pow(abs(normalize(vFoodNormal)),vec3(4.));w/=w.x+w.y+w.z;
 vec4 coatingX=texture2D(map,vFoodPosition.yz*.42);
 vec4 coatingY=texture2D(map,vFoodPosition.xz*.42);
 vec4 coatingZ=texture2D(map,vFoodPosition.xy*.42);
 diffuseColor*=coatingX*w.x+coatingY*w.y+coatingZ*w.z;`);
}
