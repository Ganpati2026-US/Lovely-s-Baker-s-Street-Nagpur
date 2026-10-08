import * as THREE from 'three';

export const random = n => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const smooth = x => x * x * (3 - 2 * x);
function noise(x, y) {
  const ix=Math.floor(x), iy=Math.floor(y), fx=smooth(x-ix), fy=smooth(y-iy);
  const a=random(ix+iy*157), b=random(ix+1+iy*157), c=random(ix+(iy+1)*157), d=random(ix+1+(iy+1)*157);
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a,b,fx),THREE.MathUtils.lerp(c,d,fx),fy);
}
function texture(canvas, color=false) {
  const t=new THREE.CanvasTexture(canvas);
  if(color)t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;
  return t;
}
const cache={};
export function foodMaps(kind) {
  if(cache[kind])return cache[kind];
  const size=512, canvas=document.createElement('canvas'), bump=document.createElement('canvas');
  canvas.width=canvas.height=bump.width=bump.height=size;
  const ctx=canvas.getContext('2d'), bc=bump.getContext('2d'), pixels=ctx.createImageData(size,size), heights=bc.createImageData(size,size);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const u=x/size,v=y/size,n=noise(u*18,v*18),fine=noise(u*130,v*130),grain=random(x+y*size),broad=noise(u*5,v*5);
    let r,g,b,h;
    if(kind==='bun'){
      const toast=.35+broad*.4+n*.2;
      r=140+toast*76+fine*10;g=47+toast*75+fine*9;b=12+toast*32;
      const pore=grain>.967?-.55:0;
      h=125+(fine-.5)*70+pore*110;
      r+=pore*22;g+=pore*20;
    }else if(kind==='chicken'){
      const char=Math.pow(n,1.7),grill=Math.pow(Math.max(0,Math.cos((u*8+v*.4)*Math.PI*2)),18)*.3;
      r=134+char*100-grill*20;g=70+char*83-grill*10;b=20+char*41;
      h=35+n*160+fine*50;
      if(grain>.97){r+=28;g+=16;b+=6;h+=30;}
    }else if(kind==='leaf'){
      const vein=Math.pow(Math.max(0,Math.cos((u-.5)*60+Math.abs(v-.5)*25)),28);
      r=48+n*35+vein*25;g=94+broad*64+n*35+vein*20;b=10+n*19;
      h=80+fine*30+vein*100;
    }else{
      r=231+n*13;g=156+n*20;b=30+n*12;h=120+fine*12;
    }
    const i=(y*size+x)*4;pixels.data.set([r,g,b,255],i);heights.data.set([h,h,h,255],i);
  }
  ctx.putImageData(pixels,0,0);bc.putImageData(heights,0,0);
  if(kind==='bun'){
    // Pores in the crust remain small enough to read as baked bread at close range.
    ctx.globalAlpha=.22;for(let i=0;i<2400;i++){ctx.fillStyle=i%3?'#6e310d':'#ffcf7b';ctx.beginPath();ctx.ellipse(random(i)*size,random(i+3000)*size,.4+random(i+5000)*1.2,.4+random(i+9000),0,0,Math.PI*2);ctx.fill();}
  }
  cache[kind]={map:texture(canvas,true),bumpMap:texture(bump)};return cache[kind];
}
export function tomatoMap(){
  if(cache.tomato)return cache.tomato;
  const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');
  ctx.fillStyle='#b9200c';ctx.fillRect(0,0,512,512);
  const grad=ctx.createRadialGradient(256,256,40,256,256,252);grad.addColorStop(0,'#f88142');grad.addColorStop(.45,'#e94d24');grad.addColorStop(.9,'#db3214');grad.addColorStop(1,'#9b1a08');ctx.fillStyle=grad;ctx.fillRect(0,0,512,512);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.save();ctx.translate(256+Math.cos(a)*132,256+Math.sin(a)*132);ctx.rotate(a);ctx.fillStyle='#a92b10';ctx.beginPath();ctx.ellipse(0,0,66,39,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e5b65c';for(let j=0;j<8;j++){ctx.beginPath();ctx.ellipse((random(i*10+j)-.5)*85,(random(i*10+j+100)-.5)*45,3,7,.8,0,Math.PI*2);ctx.fill();}ctx.restore();}
  return cache.tomato=texture(c,true);
}
