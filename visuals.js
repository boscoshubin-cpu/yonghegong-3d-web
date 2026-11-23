'use strict';

(() => {
  const api = window.YHG3D;
  if (!api || typeof THREE === 'undefined') return;

  const {
    renderer, scene, skyDome, smokeParticles, ground,
    marbleMat, palaceRedMat, pillarRedMat, goldRoofMat, bronzeMat,
    ginkgoCardMat, fallenGinkgoMat,
    HALL_Y, HALL_Z, journal, MOODS,
    makeTex, onTick, onMoodChange
  } = api;

  // =========================================================================
  // 风格一：写实电影感 · 宫廷金秋 (Photorealistic Imperial Golden-Hour Cinema)
  // =========================================================================

  // 1. 电影级曝光与 360° 宫廷金秋穹顶环境反射贴图 (IBL)
  try {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    const envDome = new THREE.Mesh(
      new THREE.SphereGeometry(28, 28, 18),
      new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: makeTex(128, 128, (c, w, h) => {
          const g = c.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, '#2c588a');
          g.addColorStop(0.36, '#9cbcd6');
          g.addColorStop(0.49, '#ffe2aa');
          g.addColorStop(0.56, '#d99e44');
          g.addColorStop(0.76, '#6e251a');
          g.addColorStop(1, '#261d17');
          c.fillStyle = g;
          c.fillRect(0, 0, w, h);
        })
      })
    );
    envScene.add(envDome);
    const sunOrb = new THREE.Mesh(
      new THREE.SphereGeometry(5.2, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xfff3cc })
    );
    sunOrb.position.set(-16, 10, 11);
    envScene.add(sunOrb);
    const bounceCard = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 12),
      new THREE.MeshBasicMaterial({ color: 0x9bc4ec, side: THREE.DoubleSide })
    );
    bounceCard.position.set(16, 8, -10);
    bounceCard.lookAt(0, 0, 0);
    envScene.add(bounceCard);
    const oldEnv = scene.environment;
    scene.environment = pmrem.fromScene(envScene, 0.032).texture;
    if (oldEnv && oldEnv.dispose) oldEnv.dispose();
    pmrem.dispose();
  } catch (e) {}

  // 2. 电影级三点补光（低角度暖金主阳 + 对向清冷天光阴影补光）
  const skyFillLight = new THREE.DirectionalLight(0x8fb8e6, 0.42);
  skyFillLight.position.set(32, 24, -22);
  scene.add(skyFillLight);

  const censerWarmGlow = new THREE.PointLight(0xffb866, 0.65, 14, 1.5);
  censerWarmGlow.position.set(0, 3.2, 2.2);
  scene.add(censerWarmGlow);

  // 3. 高精写实 PBR 材质细腻度全面升级（1024px 青砖墁地 + 粗糙度贴图 + 扇形银杏叶）
  // 3A. 1024×1024 故宫/雍和宫「工字错缝青砖墁地」漫反射 + 粗糙度 + 凹凸贴图
  const imperialBrickDiffuse = makeTex(1024, 1024, (c, w, h) => {
    c.fillStyle = '#48453e';
    c.fillRect(0, 0, w, h);
    const rows = 16, cols = 8;
    const bh = h / rows, bw = w / cols;
    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * (bw * 0.5);
      for (let col = -1; col <= cols; col++) {
        const bx = col * bw + offset;
        const by = r * bh;
        const seed = Math.abs((r * 73 + col * 139 + 17) % 100);
        const luma = 96 + (seed % 32) - 14;
        const warm = (seed % 11) - 4;
        const grad = c.createLinearGradient(bx, by, bx + bw, by + bh);
        grad.addColorStop(0, `rgb(${luma + warm + 4},${luma + warm + 1},${luma - 5})`);
        grad.addColorStop(0.55, `rgb(${luma + warm},${luma + warm - 2},${luma - 7})`);
        grad.addColorStop(1, `rgb(${luma + warm - 7},${luma + warm - 8},${luma - 12})`);
        c.fillStyle = grad;
        c.fillRect(bx + 2.5, by + 2.5, bw - 5, bh - 5);
        // 砖面微风化颗粒与磨光包浆
        for (let k = 0; k < 22; k++) {
          c.fillStyle = k % 3 === 0 ? 'rgba(255,246,226,0.065)' : 'rgba(20,18,14,0.085)';
          const gx = bx + 4 + ((seed * 19 + k * 41) % Math.max(4, bw - 8));
          const gy = by + 4 + ((seed * 29 + k * 23) % Math.max(4, bh - 8));
          c.fillRect(gx, gy, 2 + (k % 3), 2);
        }
        // 砖缝边缘细微高光倒角
        c.strokeStyle = 'rgba(235,226,208,0.12)';
        c.lineWidth = 1;
        c.strokeRect(bx + 3, by + 3, bw - 6, bh - 6);
      }
    }
  }, 24, 24);

  const imperialBrickRough = makeTex(512, 512, (c, w, h) => {
    c.fillStyle = '#f2f2f2'; // 砖缝保持完全哑光
    c.fillRect(0, 0, w, h);
    const rows = 16, cols = 8;
    const bh = h / rows, bw = w / cols;
    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * (bw * 0.5);
      for (let col = -1; col <= cols; col++) {
        const bx = col * bw + offset;
        const by = r * bh;
        const seed = Math.abs((r * 53 + col * 97) % 60);
        // 砖面中部经百年踩踏略带温润反光（金秋斜阳拉出细腻地面高光）
        const v = 132 + seed;
        c.fillStyle = `rgb(${v},${v},${v})`;
        c.fillRect(bx + 2, by + 2, bw - 4, bh - 4);
      }
    }
  }, 24, 24, false);

  const imperialBrickBump = makeTex(512, 512, (c, w, h) => {
    c.fillStyle = '#1a1a1a';
    c.fillRect(0, 0, w, h);
    const rows = 16, cols = 8;
    const bh = h / rows, bw = w / cols;
    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * (bw * 0.5);
      for (let col = -1; col <= cols; col++) {
        c.fillStyle = '#dcdcdc';
        c.fillRect(col * bw + offset + 2, r * bh + 2, bw - 4, bh - 4);
      }
    }
  }, 24, 24, false);

  if (ground && ground.material) {
    ground.material.map = imperialBrickDiffuse;
    ground.material.roughnessMap = imperialBrickRough;
    ground.material.bumpMap = imperialBrickBump;
    ground.material.bumpScale = 0.065;
    ground.material.roughness = 0.88;
    ground.material.metalness = 0.06;
    ground.material.envMapIntensity = 0.85;
    ground.material.needsUpdate = true;
  }

  // 3B. 黄琉璃瓦、朱砂宫墙、大漆红柱、汉白玉与青铜器高光细节拉满
  if (goldRoofMat) {
    goldRoofMat.roughness = 0.17;
    goldRoofMat.metalness = 0.44;
    goldRoofMat.bumpScale = 0.14;
    goldRoofMat.envMapIntensity = 1.45;
    goldRoofMat.needsUpdate = true;
  }
  if (pillarRedMat) {
    pillarRedMat.roughness = 0.24;
    pillarRedMat.metalness = 0.12;
    pillarRedMat.envMapIntensity = 1.25;
    pillarRedMat.needsUpdate = true;
  }
  if (palaceRedMat) {
    palaceRedMat.roughness = 0.78;
    palaceRedMat.envMapIntensity = 0.65;
    palaceRedMat.needsUpdate = true;
  }
  if (marbleMat) {
    marbleMat.roughness = 0.5;
    marbleMat.metalness = 0.04;
    marbleMat.envMapIntensity = 0.9;
    marbleMat.needsUpdate = true;
  }
  if (bronzeMat) {
    bronzeMat.roughness = 0.28;
    bronzeMat.metalness = 0.84;
    bronzeMat.envMapIntensity = 1.35;
    bronzeMat.needsUpdate = true;
  }

  // 3C. 升级 512×512 真实扇形金秋银杏叶簇贴图（透光亮金 + 暖琥珀叠层）
  const fineGinkgoTex = makeTex(512, 512, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    const palette = ['#ffdb58', '#f5c030', '#e5a41e', '#ffe67a', '#d68f14', '#f8cc44'];
    for (let i = 0; i < 165; i++) {
      const a = i * 2.39996;
      const rad = Math.sqrt(i / 165) * 204;
      const x = w / 2 + Math.cos(a) * rad;
      const y = h / 2 + Math.sin(a) * rad;
      const sz = 20 + (i % 13);
      c.save();
      c.translate(x, y);
      c.rotate(a + (i % 7) * 0.45);
      // 真实银杏扇形叶片（含叶柄微弧与中央小缺口）
      c.fillStyle = palette[i % palette.length];
      c.beginPath();
      c.moveTo(0, sz * 0.45);
      c.quadraticCurveTo(-sz * 0.95, -sz * 0.1, -sz * 0.52, -sz * 0.72);
      c.lineTo(0, -sz * 0.46);
      c.lineTo(sz * 0.52, -sz * 0.72);
      c.quadraticCurveTo(sz * 0.95, -sz * 0.1, 0, sz * 0.45);
      c.closePath();
      c.fill();
      c.strokeStyle = 'rgba(130, 74, 8, 0.25)';
      c.lineWidth = 1;
      c.stroke();
      c.restore();
    }
  });
  if (ginkgoCardMat) {
    ginkgoCardMat.map = fineGinkgoTex;
    ginkgoCardMat.alphaTest = 0.28;
    ginkgoCardMat.roughness = 0.72;
    ginkgoCardMat.emissive = new THREE.Color(0x6e4406);
    ginkgoCardMat.emissiveIntensity = 0.22;
    ginkgoCardMat.needsUpdate = true;
  }
  if (fallenGinkgoMat) {
    fallenGinkgoMat.map = fineGinkgoTex;
    fallenGinkgoMat.needsUpdate = true;
  }

  // 4. 庭院满地金秋银杏落叶（480 片 InstancedMesh 零卡顿单次绘制）
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.quadraticCurveTo(-0.14, 0.08, -0.09, 0.18);
  leafShape.lineTo(0, 0.14);
  leafShape.lineTo(0.09, 0.18);
  leafShape.quadraticCurveTo(0.14, 0.08, 0, 0);
  const leafGeo = new THREE.ShapeGeometry(leafShape);
  leafGeo.rotateX(-Math.PI / 2);
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0xf4c236,
    roughness: 0.65,
    metalness: 0.05,
    side: THREE.DoubleSide
  });
  const LEAF_COUNT = 480;
  const leafInst = new THREE.InstancedMesh(leafGeo, leafMat, LEAF_COUNT);
  leafInst.receiveShadow = true;
  const dummy = new THREE.Object3D();
  const leafCol = new THREE.Color();
  const treeCenters = [[-11.2, 5.5], [11.2, 5.5], [-11.6, 14.5], [11.6, 14.5]];
  const leafTones = [0xf8cd44, 0xe8ad24, 0xffdf68, 0xd89218, 0xf2be34];
  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < LEAF_COUNT; i++) {
    let lx, lz;
    if (i < 300) {
      const tc = treeCenters[i % treeCenters.length];
      const ang = rand() * Math.PI * 2;
      const rad = 0.8 + Math.pow(rand(), 0.75) * 6.8;
      lx = tc[0] + Math.cos(ang) * rad;
      lz = tc[1] + Math.sin(ang) * rad;
    } else {
      // 散落在青砖庭院、丹陛台阶脚与宝鼎四周
      lx = (rand() - 0.5) * 32;
      lz = -3.8 + rand() * 26;
      if (Math.hypot(lx, lz - 2.2) < 1.9) lx += 2.6;
    }
    const sc = 0.75 + rand() * 0.85;
    dummy.position.set(lx, 0.018 + rand() * 0.012, lz);
    dummy.rotation.set((rand() - 0.5) * 0.14, rand() * Math.PI * 2, (rand() - 0.5) * 0.14);
    dummy.scale.setScalar(sc);
    dummy.updateMatrix();
    leafInst.setMatrixAt(i, dummy.matrix);
    leafCol.setHex(leafTones[i % leafTones.length]);
    leafInst.setColorAt(i, leafCol);
  }
  leafInst.instanceMatrix.needsUpdate = true;
  if (leafInst.instanceColor) leafInst.instanceColor.needsUpdate = true;
  scene.add(leafInst);

  // 5. 物理大气 GLSL 天空穹顶（低角度金秋太阳光晕、地平线暖金瑞霭、夜空繁星）
  const skyUniforms = {
    uTopColor: { value: new THREE.Color('#2b5582') },
    uMidColor: { value: new THREE.Color('#8db0cc') },
    uBotColor: { value: new THREE.Color('#f5d9a8') },
    uSunDir: { value: new THREE.Vector3(-34, 19, 20).normalize() },
    uSunColor: { value: new THREE.Color('#ffdf9e') },
    uSunStrength: { value: 1.2 },
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
      '  vec3 col = mix(uBotColor, uMidColor, smoothstep(0.0, 0.34, h));',
      '  col = mix(col, uTopColor, smoothstep(0.26, 0.88, h));',
      '  float sunDot = max(dot(dir, normalize(uSunDir)), 0.0);',
      '  col += uSunColor * pow(sunDot, 7.0) * 0.38 * uSunStrength;',
      '  col += uSunColor * pow(sunDot, 120.0) * 1.25 * uSunStrength;',
      '  col += vec3(1.0, 0.98, 0.9) * smoothstep(0.9982, 0.9996, sunDot) * 1.35 * uSunStrength;',
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

  // 6. 庭院斜阳体积丁达尔光束（穿过金秋银杏树冠斜洒向宝鼎与丹陛）
  const rayTex = makeTex(128, 256, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255, 236, 182, 0)');
    g.addColorStop(0.2, 'rgba(255, 230, 168, 0.34)');
    g.addColorStop(0.65, 'rgba(255, 212, 134, 0.18)');
    g.addColorStop(1, 'rgba(255, 212, 134, 0)');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    // 横向羽化边缘
    c.globalCompositeOperation = 'destination-in';
    const hg = c.createLinearGradient(0, 0, w, 0);
    hg.addColorStop(0, 'rgba(0,0,0,0)');
    hg.addColorStop(0.5, 'rgba(0,0,0,1)');
    hg.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = hg;
    c.fillRect(0, 0, w, h);
  });
  const godRayMat = new THREE.MeshBasicMaterial({
    map: rayTex,
    color: 0xffe4a6,
    transparent: true,
    opacity: 0.11,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const godRays = [];
  const raySpecs = [
    [-8.2, 7.0, 3.8, 2.2, 5.2, 16, -0.58, 0.28],
    [-3.6, 6.6, 0.6, 2.5, 5.8, 17, -0.58, 0.26],
    [2.0, 7.4, -3.2, 2.8, 6.2, 18, -0.56, 0.24]
  ];
  for (const [rx, ry, rz, rTop, rBot, rh, rotZ, rotX] of raySpecs) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, rh, 18, 1, true), godRayMat);
    m.position.set(rx, ry, rz);
    m.rotation.set(rotX, 0.2, rotZ);
    scene.add(m);
    godRays.push({ mesh: m, baseY: ry, phase: rx * 0.4 + rz * 0.2 });
  }

  // 7. 高空缓动水墨流云（12 片柔和云带）
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
      g.addColorStop(0, 'rgba(255, 250, 240, 0.48)');
      g.addColorStop(0.55, 'rgba(255, 244, 224, 0.18)');
      g.addColorStop(1, 'rgba(255, 244, 224, 0)');
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
    map: cloudTex, transparent: true, opacity: 0.52,
    depthWrite: false, side: THREE.DoubleSide
  });
  const clouds = [];
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2 + 0.3;
    const rad = 52 + (i % 3) * 18;
    const cm = new THREE.Mesh(new THREE.PlaneGeometry(36 + (i % 3) * 10, 15 + (i % 2) * 5), cloudMat);
    cm.position.set(Math.cos(ang) * rad, 34 + (i % 3) * 7, Math.sin(ang) * rad);
    cm.lookAt(0, 26, 0);
    scene.add(cm);
    clouds.push({ mesh: cm, ang, rad, speed: 0.008 + (i % 3) * 0.004 });
  }

  // 8. 360° 远景北京西山黛青层峦天际线
  const mountainMat = new THREE.MeshStandardMaterial({
    color: 0x4b5c6e, roughness: 0.96, metalness: 0.02
  });
  const mountainRing = new THREE.Group();
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const dist = 88 + (i % 3) * 14;
    const h = 11 + ((i * 17) % 12);
    const r = 26 + ((i * 13) % 16);
    const peak = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), mountainMat);
    peak.scale.set(1.25, h / r, 0.92);
    peak.position.set(Math.cos(a) * dist, -2.5, Math.sin(a) * dist);
    peak.rotation.y = i * 0.6;
    mountainRing.add(peak);
  }
  scene.add(mountainRing);

  // 9. 建筑墙根与石雕柔和接触阴影 (Contact AO)
  const aoStripTex = makeTex(64, 64, (c, w, h) => {
    const g = c.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(12, 8, 5, 0.56)');
    g.addColorStop(0.65, 'rgba(12, 8, 5, 0.24)');
    g.addColorStop(1, 'rgba(12, 8, 5, 0)');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  });
  const aoMat = new THREE.MeshBasicMaterial({
    map: aoStripTex, transparent: true, opacity: 0.76, depthWrite: false
  });
  const aoSpecs = [
    [0, 0.02, HALL_Z, 36.0, 23.5],
    [0, 0.02, 2.2, 4.6, 4.6],
    [0, 0.02, 22.2, 10.8, 10.8],
    [-21.5, 0.02, 4.5, 10.8, 21.5],
    [21.5, 0.02, 4.5, 10.8, 21.5],
    [-5.4, 0.02, -4.9, 3.3, 3.7],
    [5.4, 0.02, -4.9, 3.3, 3.7],
    [5.2, 0.02, -1.6, 4.1, 4.1],
    [-5.2, 0.02, -1.6, 3.7, 3.7]
  ];
  for (const [ax, ay, az, aw, ad] of aoSpecs) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(aw, ad), aoMat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(ax, ay, az);
    scene.add(m);
  }

  // 10. 宫灯、石灯与大殿酥油灯柔和光晕 (Additive Glow Sprites)
  const glowTex = makeTex(128, 128, (c, w, h) => {
    const g = c.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255, 242, 192, 0.94)');
    g.addColorStop(0.28, 'rgba(255, 180, 74, 0.46)');
    g.addColorStop(0.65, 'rgba(235, 108, 36, 0.12)');
    g.addColorStop(1, 'rgba(235, 108, 36, 0)');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  });
  const lanternGlowMat = new THREE.SpriteMaterial({
    map: glowTex, transparent: true, opacity: 0.42,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const glowPositions = [
    [-5.8, HALL_Y + 5.25, -9.05, 2.5],
    [5.8, HALL_Y + 5.25, -9.05, 2.5],
    [-6.8, 1.58, 6.2, 1.8],
    [6.8, 1.58, 6.2, 1.8],
    [-6.8, 1.58, 15.2, 1.8],
    [6.8, 1.58, 15.2, 1.8],
    [-2.8, HALL_Y + 2.02, -19.75, 1.05],
    [-1.9, HALL_Y + 2.02, -19.75, 1.05],
    [1.9, HALL_Y + 2.02, -19.75, 1.05],
    [2.8, HALL_Y + 2.02, -19.75, 1.05]
  ];
  const glowSprites = [];
  for (const [gx, gy, gz, gs] of glowPositions) {
    const sp = new THREE.Sprite(lanternGlowMat);
    sp.position.set(gx, gy, gz);
    sp.scale.set(gs, gs, 1);
    scene.add(sp);
    glowSprites.push({ sp, baseScale: gs, phase: gx * 0.7 + gz * 0.3 });
  }

  // 11. 阳光透射云雾状香烟 + 庭院与大殿 90 颗浮游金尘微粒
  const softSmokeTex = makeTex(128, 128, (c, w, h) => {
    const g = c.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255, 248, 232, 0.62)');
    g.addColorStop(0.42, 'rgba(250, 238, 214, 0.28)');
    g.addColorStop(0.76, 'rgba(240, 228, 205, 0.08)');
    g.addColorStop(1, 'rgba(240, 228, 205, 0)');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  });
  if (Array.isArray(smokeParticles)) {
    smokeParticles.forEach(sp => {
      if (sp && sp.mesh) {
        sp.mesh.geometry = new THREE.PlaneGeometry(1.18, 1.18);
        sp.mesh.material = new THREE.MeshBasicMaterial({
          map: softSmokeTex, color: 0xfff4dd, transparent: true, opacity: 0.34,
          depthWrite: false, side: THREE.DoubleSide
        });
      }
    });
  }

  const dustCount = 90;
  const dustPos = new Float32Array(dustCount * 3);
  const dustSeeds = new Float32Array(dustCount);
  for (let i = 0; i < dustCount; i++) {
    if (i < 55) {
      // 大殿内圣光金尘
      dustPos[i * 3] = (Math.random() - 0.5) * 14;
      dustPos[i * 3 + 1] = HALL_Y + 0.8 + Math.random() * 5.6;
      dustPos[i * 3 + 2] = -21.5 + Math.random() * 11.5;
    } else {
      // 庭院金秋斜阳浮尘
      dustPos[i * 3] = (Math.random() - 0.5) * 20;
      dustPos[i * 3 + 1] = 1.2 + Math.random() * 7.2;
      dustPos[i * 3 + 2] = -4 + Math.random() * 16;
    }
    dustSeeds[i] = Math.random() * Math.PI * 2;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    map: glowTex, color: 0xffe6a3, size: 0.25,
    transparent: true, opacity: 0.78,
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
    renderer.toneMappingExposure = m.id === 'day' ? 0.74 : 1.05;
    skyUniforms.uSunStrength.value = isNight ? 0.36 : (isDusk ? 1.35 : 1.2);
    skyUniforms.uNightFactor.value = isNight ? 1.0 : 0.0;
    skyFillLight.intensity = isNight ? 0.18 : (isDusk ? 0.28 : 0.44);
    skyFillLight.color.setHex(isDusk ? 0x7c8cc4 : 0x90b9e8);
    godRayMat.opacity = isNight ? 0.0 : (isDusk ? 0.1 : 0.055);
    godRayMat.color.setHex(isDusk ? 0xffb36b : 0xffe4a6);
    cloudMat.opacity = isNight ? 0.14 : (isDusk ? 0.46 : 0.52);
    cloudMat.color.setHex(isDusk ? 0xffb580 : (isNight ? 0x3b4d6b : 0xfff8ea));
    mountainMat.color.setHex(isNight ? 0x111a29 : (isDusk ? 0x52312c : 0x586b7e));
    lanternGlowMat.opacity = isNight ? 0.94 : (isDusk ? 0.74 : 0.34);
    if (ginkgoCardMat) {
      ginkgoCardMat.emissiveIntensity = isNight ? 0.04 : (isDusk ? 0.28 : 0.22);
    }
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
    for (const r of godRays) {
      r.mesh.position.y = r.baseY + Math.sin(t * 0.45 + r.phase) * 0.12;
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
      pos[i * 3 + 1] += dt * 0.075;
      const maxY = i < 55 ? (HALL_Y + 6.5) : 8.4;
      const minY = i < 55 ? (HALL_Y + 0.8) : 1.2;
      if (pos[i * 3 + 1] > maxY) pos[i * 3 + 1] = minY;
    }
    dustGeo.attributes.position.needsUpdate = true;
  });
})();
