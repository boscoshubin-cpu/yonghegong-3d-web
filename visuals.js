'use strict';

(() => {
  const api = window.YHG3D;
  if (!api || typeof THREE === 'undefined') return;

  const {
    renderer, scene, skyDome, smokeParticles,
    HALL_Y, HALL_Z, journal, MOODS,
    makeTex, onTick, onMoodChange
  } = api;

  // 1. 电影级曝光与 360° 穹顶环境反射贴图 (IBL)
  renderer.toneMappingExposure = 1.14;
  try {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    const envDome = new THREE.Mesh(
      new THREE.SphereGeometry(28, 24, 16),
      new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: makeTex(64, 128, (c, w, h) => {
          const g = c.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, '#3a6699');
          g.addColorStop(0.45, '#f2d9a8');
          g.addColorStop(0.55, '#c9933b');
          g.addColorStop(0.75, '#6b221a');
          g.addColorStop(1, '#2b2019');
          c.fillStyle = g;
          c.fillRect(0, 0, w, h);
        })
      })
    );
    envScene.add(envDome);
    const sunOrb = new THREE.Mesh(
      new THREE.SphereGeometry(4.5, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xfff4d6 })
    );
    sunOrb.position.set(14, 15, 12);
    envScene.add(sunOrb);
    const oldEnv = scene.environment;
    scene.environment = pmrem.fromScene(envScene, 0.035).texture;
    if (oldEnv && oldEnv.dispose) oldEnv.dispose();
    pmrem.dispose();
  } catch (e) {}

  // 2. 物理大气 GLSL 天空穹顶（太阳光晕、地平线散射、夜空繁星）
  const skyUniforms = {
    uTopColor: { value: new THREE.Color('#24528a') },
    uMidColor: { value: new THREE.Color('#72a0cc') },
    uBotColor: { value: new THREE.Color('#ebd8b7') },
    uSunDir: { value: new THREE.Vector3(0.5, 0.55, 0.45).normalize() },
    uSunColor: { value: new THREE.Color('#fff2cc') },
    uSunStrength: { value: 1.0 },
    uNightFactor: { value: 0.0 },
    uTime: { value: 0 }
  };

  const skyShaderMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: skyUniforms,
    vertexShader: [
      'varying vec3 vWorldPos;',
      'void main() {',
      '  vec4 wp = modelMatrix * vec4(position, 1.0);',
      '  vWorldPos = wp.xyz;',
      '  gl_Position = projectionMatrix * viewMatrix * wp;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 uTopColor;',
      'uniform vec3 uMidColor;',
      'uniform vec3 uBotColor;',
      'uniform vec3 uSunDir;',
      'uniform vec3 uSunColor;',
      'uniform float uSunStrength;',
      'uniform float uNightFactor;',
      'uniform float uTime;',
      'varying vec3 vWorldPos;',
      'float hash(vec3 p) {',
      '  p = fract(p * 0.3183099 + 0.1);',
      '  p *= 17.0;',
      '  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));',
      '}',
      'void main() {',
      '  vec3 dir = normalize(vWorldPos);',
      '  float h = clamp(dir.y, 0.0, 1.0);',
      '  vec3 col = mix(uBotColor, uMidColor, smoothstep(0.0, 0.32, h));',
      '  col = mix(col, uTopColor, smoothstep(0.24, 0.88, h));',
      '  float sunDot = max(dot(dir, normalize(uSunDir)), 0.0);',
      '  col += uSunColor * pow(sunDot, 10.0) * 0.34 * uSunStrength;',
      '  col += uSunColor * pow(sunDot, 160.0) * 1.15 * uSunStrength;',
      '  col += vec3(1.0, 0.97, 0.88) * smoothstep(0.9985, 0.9996, sunDot) * 1.2 * uSunStrength;',
      '  if (uNightFactor > 0.05 && dir.y > 0.08) {',
      '    vec3 grid = floor(dir * 165.0);',
      '    float s = hash(grid);',
      '    if (s > 0.9945) {',
      '      float twinkle = 0.55 + 0.45 * sin(uTime * 2.4 + s * 420.0);',
      '      col += vec3(0.88, 0.93, 1.0) * twinkle * uNightFactor * smoothstep(0.08, 0.3, dir.y);',
      '    }',
      '  }',
      '  gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n')
  });
  if (skyDome) skyDome.material = skyShaderMat;

  // 3. 高空缓动水墨流云（12 片柔和云带）
  const cloudTex = makeTex(256, 128, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    const puffs = [
      [w * 0.5, h * 0.52, 68, 32],
      [w * 0.32, h * 0.58, 52, 24],
      [w * 0.68, h * 0.56, 56, 26],
      [w * 0.44, h * 0.42, 46, 24],
      [w * 0.58, h * 0.44, 44, 22]
    ];
    for (const [cx, cy, rx, ry] of puffs) {
      const g = c.createRadialGradient(cx, cy, 4, cx, cy, rx);
      g.addColorStop(0, 'rgba(255, 250, 240, 0.46)');
      g.addColorStop(0.55, 'rgba(255, 246, 232, 0.18)');
      g.addColorStop(1, 'rgba(255, 246, 232, 0)');
      c.fillStyle = g;
      c.save();
      c.translate(cx, cy);
      c.scale(1, ry / rx);
      c.beginPath();
      c.arc(0, 0, rx, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }
  });
  const cloudMat = new THREE.MeshBasicMaterial({
    map: cloudTex, transparent: true, opacity: 0.55,
    depthWrite: false, side: THREE.DoubleSide
  });
  const clouds = [];
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2 + 0.3;
    const rad = 52 + (i % 3) * 18;
    const cm = new THREE.Mesh(new THREE.PlaneGeometry(34 + (i % 3) * 10, 15 + (i % 2) * 5), cloudMat);
    cm.position.set(Math.cos(ang) * rad, 34 + (i % 3) * 7, Math.sin(ang) * rad);
    cm.lookAt(0, 26, 0);
    scene.add(cm);
    clouds.push({ mesh: cm, ang, rad, speed: 0.008 + (i % 3) * 0.004 });
  }

  // 4. 360° 远景北京西山黛青层峦天际线
  const mountainMat = new THREE.MeshStandardMaterial({
    color: 0x3b4d5e, roughness: 0.96, metalness: 0.02
  });
  const mountainRing = new THREE.Group();
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const dist = 82 + (i % 3) * 14;
    const h = 14 + ((i * 19) % 16);
    const r = 18 + ((i * 11) % 12);
    const peak = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), mountainMat);
    peak.position.set(Math.cos(a) * dist, h * 0.42 - 1.5, Math.sin(a) * dist);
    peak.rotation.y = i * 0.7;
    mountainRing.add(peak);
  }
  scene.add(mountainRing);

  // 5. 建筑墙根柔和接触阴影 (Contact AO)
  const aoStripTex = makeTex(64, 64, (c, w, h) => {
    const g = c.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(12, 8, 5, 0.52)');
    g.addColorStop(0.65, 'rgba(12, 8, 5, 0.22)');
    g.addColorStop(1, 'rgba(12, 8, 5, 0)');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  });
  const aoMat = new THREE.MeshBasicMaterial({
    map: aoStripTex, transparent: true, opacity: 0.72, depthWrite: false
  });
  const aoSpecs = [
    [0, 0.02, HALL_Z, 35.5, 23.0],
    [0, 0.02, 2.2, 4.4, 4.4],
    [0, 0.02, 22.2, 10.5, 10.5],
    [-21.5, 0.02, 4.5, 10.5, 21.0],
    [21.5, 0.02, 4.5, 10.5, 21.0],
    [-5.4, 0.02, -4.9, 3.2, 3.6],
    [5.4, 0.02, -4.9, 3.2, 3.6],
    [5.2, 0.02, -1.6, 4.0, 4.0],
    [-5.2, 0.02, -1.6, 3.6, 3.6]
  ];
  for (const [ax, ay, az, aw, ad] of aoSpecs) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(aw, ad), aoMat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(ax, ay, az);
    scene.add(m);
  }

  // 6. 宫灯、庭院石灯与大殿酥油灯柔和光晕 (Additive Glow Sprites)
  const glowTex = makeTex(128, 128, (c, w, h) => {
    const g = c.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255, 240, 185, 0.92)');
    g.addColorStop(0.28, 'rgba(255, 178, 72, 0.45)');
    g.addColorStop(0.65, 'rgba(235, 108, 36, 0.12)');
    g.addColorStop(1, 'rgba(235, 108, 36, 0)');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  });
  const lanternGlowMat = new THREE.SpriteMaterial({
    map: glowTex, transparent: true, opacity: 0.45,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const glowPositions = [
    [-5.8, HALL_Y + 5.25, -9.05, 2.4],
    [5.8, HALL_Y + 5.25, -9.05, 2.4],
    [-6.8, 1.58, 6.2, 1.7],
    [6.8, 1.58, 6.2, 1.7],
    [-6.8, 1.58, 15.2, 1.7],
    [6.8, 1.58, 15.2, 1.7],
    [-2.8, HALL_Y + 2.02, -19.75, 1.0],
    [-1.9, HALL_Y + 2.02, -19.75, 1.0],
    [1.9, HALL_Y + 2.02, -19.75, 1.0],
    [2.8, HALL_Y + 2.02, -19.75, 1.0]
  ];
  const glowSprites = [];
  for (const [gx, gy, gz, gs] of glowPositions) {
    const sp = new THREE.Sprite(lanternGlowMat);
    sp.position.set(gx, gy, gz);
    sp.scale.set(gs, gs, 1);
    scene.add(sp);
    glowSprites.push({ sp, baseScale: gs, phase: gx * 0.7 + gz * 0.3 });
  }

  // 7. 羽化云雾状香烟 + 殿内浮游丁达尔金尘微粒
  const softSmokeTex = makeTex(128, 128, (c, w, h) => {
    const g = c.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255, 250, 238, 0.58)');
    g.addColorStop(0.5, 'rgba(244, 236, 218, 0.22)');
    g.addColorStop(1, 'rgba(244, 236, 218, 0)');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  });
  if (Array.isArray(smokeParticles)) {
    smokeParticles.forEach(sp => {
      if (sp && sp.mesh) {
        sp.mesh.geometry = new THREE.PlaneGeometry(0.95, 0.95);
        sp.mesh.material = new THREE.MeshBasicMaterial({
          map: softSmokeTex, transparent: true, opacity: 0.3,
          depthWrite: false, side: THREE.DoubleSide
        });
      }
    });
  }

  const dustCount = 55;
  const dustPos = new Float32Array(dustCount * 3);
  const dustSeeds = new Float32Array(dustCount);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 14;
    dustPos[i * 3 + 1] = HALL_Y + 0.8 + Math.random() * 5.6;
    dustPos[i * 3 + 2] = -21.5 + Math.random() * 11.5;
    dustSeeds[i] = Math.random() * Math.PI * 2;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    map: glowTex, color: 0xffe49c, size: 0.24,
    transparent: true, opacity: 0.72,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const hallDust = new THREE.Points(dustGeo, dustMat);
  scene.add(hallDust);

  function syncVisualMood(m) {
    if (!m) return;
    skyUniforms.uTopColor.value.set(m.skyTop);
    skyUniforms.uMidColor.value.set(m.skyMid);
    skyUniforms.uBotColor.value.set(m.skyBot);
    skyUniforms.uSunColor.value.setHex(m.sunColor);
    skyUniforms.uSunDir.value.set(m.sunPos[0], m.sunPos[1], m.sunPos[2]).normalize();
    const isNight = m.id === 'night';
    const isDusk = m.id === 'dusk';
    skyUniforms.uSunStrength.value = isNight ? 0.38 : (isDusk ? 1.25 : 1.0);
    skyUniforms.uNightFactor.value = isNight ? 1.0 : 0.0;
    cloudMat.opacity = isNight ? 0.14 : (isDusk ? 0.44 : 0.56);
    cloudMat.color.setHex(isDusk ? 0xffb382 : (isNight ? 0x3b4d6b : 0xfffaf0));
    mountainMat.color.setHex(isNight ? 0x111a29 : (isDusk ? 0x4f302c : 0x4c6278));
    lanternGlowMat.opacity = isNight ? 0.92 : (isDusk ? 0.72 : 0.28);
  }
  const initMood = (MOODS || []).find(x => x.id === (journal && journal.mood)) || (MOODS && MOODS[0]);
  syncVisualMood(initMood);
  if (Array.isArray(onMoodChange)) onMoodChange.push(syncVisualMood);

  onTick.push((t, dt) => {
    skyUniforms.uTime.value = t;
    for (const c of clouds) {
      c.ang += c.speed * dt;
      c.mesh.position.x = Math.cos(c.ang) * c.rad;
      c.mesh.position.z = Math.sin(c.ang) * c.rad;
      c.mesh.lookAt(0, 26, 0);
    }
    for (const gs of glowSprites) {
      const f = 0.94 + 0.08 * Math.sin(t * 4.5 + gs.phase);
      gs.sp.scale.set(gs.baseScale * f, gs.baseScale * f, 1);
    }
    if (Array.isArray(smokeParticles)) {
      smokeParticles.forEach(sp => {
        if (sp && sp.mesh && api.camera) sp.mesh.lookAt(api.camera.position);
      });
    }
    const pos = dustGeo.attributes.position.array;
    for (let i = 0; i < dustCount; i++) {
      pos[i * 3] += Math.sin(t * 0.55 + dustSeeds[i]) * dt * 0.09;
      pos[i * 3 + 1] += dt * 0.08;
      if (pos[i * 3 + 1] > HALL_Y + 6.5) pos[i * 3 + 1] = HALL_Y + 0.8;
    }
    dustGeo.attributes.position.needsUpdate = true;
  });
})();
