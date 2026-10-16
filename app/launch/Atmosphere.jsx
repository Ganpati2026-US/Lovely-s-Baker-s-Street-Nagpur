import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { random } from './materials';
const vertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragment=`uniform float time;uniform float strength;varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float n=0.;float a=.5;for(int i=0;i<4;i++){n+=noise(p)*a;p=p*2.04+11.3;a*=.5;}return n;}
void main(){vec2 uv=vUv;float drift=sin(uv.y*7.-time*.3)*.15+sin(uv.y*15.+time*.2)*.05;
float n=fbm(vec2((uv.x+drift)*5.,uv.y*6.-time*.23));
float w=exp(-pow((uv.x-.5+drift)*3.3,2.));float edge=smoothstep(0.,.14,uv.y)*(1.-smoothstep(.55,1.,uv.y));
float alpha=smoothstep(.32,.72,n)*w*edge*strength;
gl_FragColor=vec4(vec3(.48,.44,.40),alpha);}`;
export function Steam({progress}){
 const ref=useRef();const uniforms=useMemo(()=>({time:{value:0},strength:{value:0}}),[]);
 useFrame(({clock})=>{uniforms.time.value=clock.elapsedTime;uniforms.strength.value=THREE.MathUtils.smoothstep(progress.current,.15,.8)*.55;});
 return <group ref={ref}>{[-1.4,-1.1,1.1,1.4].map((x,i)=><mesh key={i} position={[x,-.01,.8+(i%2)*.12]} scale={[.75+(i%2)*.22,2.8+(i%2)*.3,1]} rotation={[0,0,(i<2?-.12:.12)]}><planeGeometry/><shaderMaterial uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment} transparent depthWrite={false} side={THREE.DoubleSide}/></mesh>)}</group>;
}
export function CounterCrumbs(){
 const ref=useRef();useLayoutEffect(()=>{const obj=new THREE.Object3D();for(let i=0;i<85;i++){const a=random(i+44)*Math.PI*2,r=1.85+random(i+125)*1.55;obj.position.set(Math.cos(a)*r,-1.43,Math.sin(a)*r*.62);obj.rotation.set(random(i)*3,random(i+90)*3,random(i+165)*3);obj.scale.setScalar(.011+random(i+80)*.022);obj.updateMatrix();ref.current.setMatrixAt(i,obj.matrix);}ref.current.instanceMatrix.needsUpdate=true;},[]);
 return <instancedMesh ref={ref} args={[null,null,85]} castShadow><dodecahedronGeometry args={[1,0]}/><meshStandardMaterial color="#bb7c35" roughness={.85}/></instancedMesh>;
}
