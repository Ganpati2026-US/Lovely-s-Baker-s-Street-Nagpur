import * as THREE from 'three';

export const random = n => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const smooth = x => x * x * (3 - 2 * x);
export function noise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = smooth(x - ix), fy = smooth(y - iy);
  return THREE.MathUtils.lerp(
    THREE.MathUtils.lerp(random(ix + iy * 157), random(ix + 1 + iy * 157), fx),
    THREE.MathUtils.lerp(random(ix + (iy + 1) * 157), random(ix + 1 + (iy + 1) * 157), fx), fy);
}
function texture(canvas, color = false) {
  const t = new THREE.CanvasTexture(canvas);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}
const cache = {};

// Separate albedo, height and roughness keep highlights attached to the actual
// lights instead of baking a photograph's lighting into the rotating model.
export function foodMaps(kind) {
  if (cache[kind]) return cache[kind];
  const size = 768;
  const canvases = Array.from({ length: 3 }, () => {
    const c = document.createElement('canvas'); c.width = c.height = size; return c;
  });
  const contexts = canvases.map(c => c.getContext('2d'));
  const [color, height, rough] = contexts.map(c => c.createImageData(size, size));
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size;
    const broad = noise(u * 6, v * 6), n = noise(u * 28, v * 28);
    const fine = noise(u * 180, v * 180), grain = random(x + y * size);
    let r, g, b, h, roughness;
    if (kind === 'bun') {
      const mottling = broad * .55 + n * .3 + fine * .15;
      const pore = Math.pow(Math.max(0, (fine - .58) / .42), 2);
      r = 157 + mottling * 85; g = 55 + mottling * 66; b = 13 + mottling * 25;
      h = 110 + fine * 65 + n * 18 - pore * 85 + grain * 12;
      roughness = 110 + n * 45 + pore * 60;
    } else if (kind === 'crumb') {
      const toast = THREE.MathUtils.smoothstep(n * .6 + broad * .4, .38, .76);
      const pore = Math.pow(Math.max(0, (fine - .49) / .51), 2);
      r = 248 - toast * 112 - pore * 50;
      g = 213 - toast * 158 - pore * 58;
      b = 137 - toast * 120 - pore * 48;
      h = 185 - pore * 155 + fine * 20;
      roughness = 178 + fine * 40;
    } else if (kind === 'patty') {
      const char = THREE.MathUtils.smoothstep(n * .7 + broad * .3, .36, .72);
      const crevice = Math.pow(1 - fine, 4);
      r = 118 - char * 82 + fine * 22 - crevice * 50;
      g = 56 - char * 37 + fine * 10 - crevice * 24;
      b = 27 - char * 20 + fine * 5;
      h = 40 + n * 80 + fine * 110;
      roughness = 110 + char * 92 + crevice * 30;
    } else if (kind === 'leaf') {
      const px = (u - .5) * 2, py = (v - .5) * 2;
      const midrib = Math.exp(-Math.pow(px * 65, 2));
      const branches = Math.pow(Math.max(0, Math.cos((py - Math.abs(px) * .7) * 27)), 34);
      const smallVeins = Math.pow(Math.max(0, Math.cos((py + Math.abs(px) * .45) * 94)), 24) * .28;
      const vein = Math.max(midrib, branches * .65, smallVeins);
      const edge = Math.min(1, Math.hypot(px, py));
      r = 53 + broad * 37 + vein * 65 + edge * 19;
      g = 102 + n * 47 + vein * 58 + edge * 16;
      b = 9 + n * 13 + vein * 25;
      h = 83 + fine * 26 + vein * 102;
      roughness = 130 + n * 35 - vein * 22;
    } else if (kind === 'cheese') {
      const blister = THREE.MathUtils.smoothstep(n, .69, .9);
      r = 244 - blister * 45; g = 157 + broad * 20 - blister * 57; b = 19 + broad * 9;
      h = 125 + fine * 8 + n * 13;
      roughness = 110 + broad * 35;
    } else {
      r = 218 + n * 29; g = 34 + fine * 22; b = 12 + fine * 8;
      h = 120 + fine * 28; roughness = 105 + fine * 30;
    }
    const i = (y * size + x) * 4;
    color.data.set([r, g, b, 255], i);
    height.data.set([h, h, h, 255], i);
    rough.data.set([roughness, roughness, roughness, 255], i);
  }
  [color, height, rough].forEach((pixels, i) => contexts[i].putImageData(pixels, 0, 0));
  cache[kind] = { map: texture(canvases[0], true), bumpMap: texture(canvases[1]), roughnessMap: texture(canvases[2]) };
  return cache[kind];
}

// Project colour and bump in object space: lathe UVs stretch at the bun's
// shoulder and pinch at its crown. All three projections rotate with the food.
function projectFoodSurface(shader, scale) {
  shader.vertexShader = 'varying vec3 vFoodPosition; varying vec3 vFoodNormal;\n' + shader.vertexShader;
  shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvFoodPosition = position; vFoodNormal = normal;');
  shader.fragmentShader = `
    varying vec3 vFoodPosition;
    varying vec3 vFoodNormal;
    vec4 sampleFoodMap(sampler2D source, vec3 p) {
      vec3 weights = pow(abs(normalize(vFoodNormal)), vec3(5.));
      weights /= max(.0001, weights.x + weights.y + weights.z);
      p *= ${scale.toFixed(3)};
      return texture2D(source, p.yz)*weights.x + texture2D(source, p.xz)*weights.y + texture2D(source, p.xy)*weights.z;
    }
  ` + shader.fragmentShader;
  shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', '#ifdef USE_MAP\ndiffuseColor *= sampleFoodMap(map, vFoodPosition);\n#endif');
  const bump = THREE.ShaderChunk.bumpmap_pars_fragment.replace(/vec2 dHdxy_fwd\(\) \{[\s\S]*?return vec2\( dBx, dBy \);\s*\}/, `
    vec2 dHdxy_fwd() {
      float h = sampleFoodMap(bumpMap, vFoodPosition).r;
      float dx = sampleFoodMap(bumpMap, vFoodPosition + dFdx(vFoodPosition)).r - h;
      float dy = sampleFoodMap(bumpMap, vFoodPosition + dFdy(vFoodPosition)).r - h;
      return bumpScale * vec2(dx, dy);
    }
  `);
  shader.fragmentShader = shader.fragmentShader.replace('#include <bumpmap_pars_fragment>', bump);
}
export function bunSurface(shader) {
  projectFoodSurface(shader, .68);
  shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `
    #include <color_fragment>
    float rise = smoothstep(-.03, .42, vFoodPosition.y);
    float crease = sin(atan(vFoodPosition.z, vFoodPosition.x)*19. + vFoodPosition.y*8.);
    diffuseColor.rgb *= vec3(.92 + .08*rise, .91 + .09*rise, .88 + .12*rise);
    diffuseColor.rgb *= 1. - .06*pow(max(0., crease), 9.)*(1.-rise);
    float softEdge = 1. - smoothstep(-.16, -.025, vFoodPosition.y);
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.64,.35,.13), softEdge*.45);
  `);
}
export function pattySurface(shader) {
  projectFoodSurface(shader, 1.65);
  // A fine breaded coating with an even toasted-brown colour, independent
  // of the source texture's bright and dark flecks.
  const dark = new THREE.Color('#87501d'), light = new THREE.Color('#ba8138');
  shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `
    #include <color_fragment>
    float crumbTone = smoothstep(.025, .34, dot(diffuseColor.rgb, vec3(.2126, .7152, .0722)));
    diffuseColor.rgb = mix(
      vec3(${dark.r.toFixed(5)}, ${dark.g.toFixed(5)}, ${dark.b.toFixed(5)}),
      vec3(${light.r.toFixed(5)}, ${light.g.toFixed(5)}, ${light.b.toFixed(5)}),
      crumbTone
    );
  `);
}
