'use strict';

(() => {
  const api = window.YHG3D;
  if (!api || typeof THREE === 'undefined') return;

  const {
    scene, player, camState, HALL_Y, plaque,
    mainBuddhaSlot, sideBuddhas,
    goldMat, antiqueGoldMat, turquoiseMat,
    hallLight, buddhaSpot, walkPlayerTo, playSound, showToast, makeTex
  } = api;

  /* ================= 1. 雍和宫中轴五殿真实佛祖档案 ================= */
  const HALLS = [
    {
      id: 'yonghemen',
      short: '雍和门殿',
      plaque: '雍  和  门',
      deity: '弥勒佛（大肚布袋笑佛 · 四大天王护法）',
      wish: '主求：喜乐平安 · 开运纳福',
      desc: '中央为木雕笑佛，笑眼、大肚与层叠的衣襟取自布袋和尚雕像；两侧列四大天王。',
      coupletUp: '大肚能容容天下难容之事',
      coupletDown: '慈颜常笑笑世间可笑之人',
      camDist: 10.2, camPitch: 0.19, hallInt: 1.1, spotInt: 1.45
    },
    {
      id: 'yonghegong',
      short: '雍和宫殿',
      plaque: '雍  和  宫',
      deity: '三世佛（燃灯佛 · 释迦牟尼佛 · 弥勒佛）',
      wish: '主求：事业高升 · 正财顺遂',
      desc: '中央保留缅甸触地印坐佛，两侧分别用带背光的石雕坐佛和弥勒造像碑演绎过去佛与未来佛。',
      coupletUp: '法界示吉祥慈云永护',
      coupletDown: '皇图昭赫奕佛日长明',
      camDist: 10.8, camPitch: 0.2, hallInt: 1.05, spotInt: 1.5
    },
    {
      id: 'yongyou',
      short: '永佑殿',
      plaque: '永  佑  殿',
      deity: '三尊造像（药师佛 · 无量寿佛 · 狮吼佛）',
      wish: '主求：消灾延寿 · 身心安康',
      desc: '游戏以宝瓶表现无量寿佛，以青钵表现药师佛，以举手说法的木雕演绎狮吼佛；两侧白塔环侍。',
      coupletUp: '慧日丽璇霄光明万象',
      coupletDown: '慈云覆玉宇福佑千秋',
      camDist: 10.6, camPitch: 0.2, hallInt: 1.1, spotInt: 1.45
    },
    {
      id: 'falun',
      short: '法轮殿',
      plaque: '法  轮  殿',
      deity: '宗喀巴大师 · 罗汉山',
      wish: '主求：学业有成 · 智慧开明 · 仕途稳进',
      desc: '游戏以僧人木雕为造型基础，加配班智达黄帽来演绎宗喀巴大师。可近观帽脊、衣褶与说法手势。',
      coupletUp: '法轮常转明心开般若',
      coupletDown: '宝相庄严持戒证菩提',
      camDist: 10.2, camPitch: 0.2, hallInt: 1.1, spotInt: 1.45
    },
    {
      id: 'wanfu',
      short: '万福阁',
      plaque: '万  福  阁',
      deity: '弥勒大佛立像',
      wish: '主求：大运亨通 · 万福圆满',
      desc: '本阁以漆金木质菩萨立像演绎弥勒，举手立于两侧飞廊之间。可转动视角观察袍缘与金漆肌理。',
      coupletUp: '万福萃瑶林白檀焕彩',
      coupletDown: '千祥环宝阁金粟腾辉',
      camDist: 12.8, camPitch: 0.14, hallInt: 1.1, spotInt: 1.45
    }
  ];

  /* ================= 2. 宫廷造像 PBR 材质 ================= */
  const faceGoldMat = new THREE.MeshStandardMaterial({
    color: 0xf7cf66, metalness: 0.72, roughness: 0.24,
    emissive: 0x5c3806, emissiveIntensity: 0.22
  });
  const sandalwoodGoldMat = new THREE.MeshStandardMaterial({
    color: 0xdba958, metalness: 0.44, roughness: 0.38,
    emissive: 0x3b2205, emissiveIntensity: 0.18
  });
  const warmBronzeMat = new THREE.MeshStandardMaterial({
    color: 0xc9963e, metalness: 0.74, roughness: 0.32,
    emissive: 0x452704, emissiveIntensity: 0.18
  });
  const lapisHairMat = new THREE.MeshStandardMaterial({
    color: 0x16243d, metalness: 0.22, roughness: 0.52,
    emissive: 0x070e1c, emissiveIntensity: 0.25
  });
  const browLineMat = new THREE.MeshStandardMaterial({ color: 0x261a0e, roughness: 0.5 });
  const lipCinnabarMat = new THREE.MeshStandardMaterial({
    color: 0xb83827, roughness: 0.38, metalness: 0.12,
    emissive: 0x360c06, emissiveIntensity: 0.18
  });
  const urnaPearlMat = new THREE.MeshStandardMaterial({
    color: 0xfff8e2, metalness: 0.2, roughness: 0.12,
    emissive: 0xffdf8a, emissiveIntensity: 0.65
  });
  const crimsonRobeMat = new THREE.MeshStandardMaterial({
    color: 0x871f16, roughness: 0.6, metalness: 0.1
  });
  const yellowHatMat = new THREE.MeshStandardMaterial({
    color: 0xf4c430, roughness: 0.38, metalness: 0.14,
    emissive: 0x4a3100, emissiveIntensity: 0.18
  });
  const lapisBowlMat = new THREE.MeshStandardMaterial({
    color: 0x164ea6, metalness: 0.35, roughness: 0.16,
    emissive: 0x0a255e, emissiveIntensity: 0.38
  });
  const coralMat = new THREE.MeshStandardMaterial({
    color: 0xc93224, metalness: 0.18, roughness: 0.24,
    emissive: 0x420b06, emissiveIntensity: 0.22
  });
  const jadeBranchMat = new THREE.MeshStandardMaterial({
    color: 0x2c8a56, roughness: 0.4, metalness: 0.12
  });
  const marblePedestalMat = new THREE.MeshStandardMaterial({
    color: 0xe3ddd1, roughness: 0.56, metalness: 0.04
  });

  /* ================= 3. 3D 精雕庄严佛首（立体五官 + 青螺发 + 肉髻 + 五佛冠） ================= */
  function createSculptedBuddhaHead(opts) {
    const g = new THREE.Group();
    const skinMat = opts.skinMat || faceGoldMat;
    const metalMain = opts.matMain || goldMat;
    const metalSub = opts.matSub || antiqueGoldMat;

    // 三道吉祥颈纹（立体雕环）
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.235, 0.26, 20), skinMat);
    neck.position.y = -0.36;
    g.add(neck);
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.196 + i * 0.012, 0.011, 6, 24), metalSub);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.29 - i * 0.065;
      g.add(ring);
    }

    // 饱满庄严椭圆佛面（非球面拉伸贴图，纯 3D 雕塑比例）
    const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.39, 32, 26), skinMat);
    cranium.scale.set(0.91, 1.07, 0.94);
    g.add(cranium);

    // 柔和丰润下颌与面颊
    const chin = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 16), skinMat);
    chin.scale.set(1.06, 0.88, 0.92);
    chin.position.set(0, -0.17, 0.12);
    g.add(chin);

    // 垂肩大耳（带立体耳廓与耳垂穿孔）
    for (const s of [-1, 1]) {
      const ear = new THREE.Group();
      ear.position.set(s * 0.365, -0.05, -0.02);
      const upper = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 10), skinMat);
      upper.scale.set(0.55, 1.3, 0.9);
      upper.position.y = 0.07;
      ear.add(upper);
      const lobe = new THREE.Mesh(new THREE.CapsuleGeometry(0.046, 0.22, 6, 10), skinMat);
      lobe.position.y = -0.11;
      ear.add(lobe);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.012, 6, 12), metalMain);
      ring.rotation.y = Math.PI / 2;
      ring.position.y = -0.24;
      ear.add(ring);
      g.add(ear);
    }

    // 立体眉弓、挺直鼻梁、半垂慈目、眉间白毫、慈悲朱唇
    for (const s of [-1, 1]) {
      // 弯月眉弓
      const brow = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.013, 8, 18, Math.PI * 0.72), browLineMat);
      brow.position.set(s * 0.118, 0.068, 0.328);
      brow.rotation.z = Math.PI * 0.14 - s * 0.06;
      brow.rotation.y = s * 0.22;
      g.add(brow);

      // 半垂上眼睑（慈悲俯视众生相）
      const upperLid = new THREE.Mesh(new THREE.SphereGeometry(0.068, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), skinMat);
      upperLid.scale.set(1.25, 0.65, 0.55);
      upperLid.position.set(s * 0.116, 0.032, 0.335);
      upperLid.rotation.y = s * 0.24;
      upperLid.rotation.x = 0.15;
      g.add(upperLid);

      // 细长含蓄眼线（微微向下弯弧）
      const eyeSlit = new THREE.Mesh(new THREE.TorusGeometry(0.066, 0.0085, 6, 16, Math.PI * 0.68), browLineMat);
      eyeSlit.position.set(s * 0.116, 0.044, 0.352);
      eyeSlit.rotation.z = Math.PI + Math.PI * 0.16;
      eyeSlit.rotation.y = s * 0.24;
      g.add(eyeSlit);
    }

    // 眉间白毫相（微发光珍珠宝点）
    const urna = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 10), urnaPearlMat);
    urna.position.set(0, 0.095, 0.365);
    g.add(urna);

    // 立体端正鼻梁与鼻翼
    const noseBridge = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.038, 0.165, 10), skinMat);
    noseBridge.position.set(0, -0.02, 0.368);
    noseBridge.rotation.x = -0.14;
    g.add(noseBridge);
    const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 10), skinMat);
    noseTip.scale.set(1.22, 0.8, 0.92);
    noseTip.position.set(0, -0.095, 0.382);
    g.add(noseTip);

    // 慈悲含笑双唇（上唇菱形微翘 + 丰满下唇）
    const upperLip = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.015, 8, 16, Math.PI * 0.72), lipCinnabarMat);
    upperLip.position.set(0, -0.175, 0.342);
    upperLip.rotation.z = Math.PI + Math.PI * 0.14;
    g.add(upperLip);
    const lowerLip = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 10), lipCinnabarMat);
    lowerLip.scale.set(1.45, 0.45, 0.75);
    lowerLip.position.set(0, -0.205, 0.342);
    g.add(lowerLip);

    // 顶部发冠分化：宗喀巴黄帽 vs 青螺发肉髻 + 五佛宝冠
    if (opts.hat === 'tsongkhapa') {
      const hatCone = new THREE.Mesh(new THREE.ConeGeometry(0.37, 0.88, 22), yellowHatMat);
      hatCone.position.set(0, 0.68, -0.02);
      hatCone.rotation.x = -0.12;
      g.add(hatCone);
      const hatBrim = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.072, 10, 24), yellowHatMat);
      hatBrim.rotation.x = Math.PI / 2;
      hatBrim.position.set(0, 0.28, -0.01);
      g.add(hatBrim);
      for (const s of [-1, 1]) {
        const flap = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.66, 0.06), yellowHatMat);
        flap.position.set(s * 0.37, -0.1, -0.06);
        flap.rotation.z = s * 0.14;
        g.add(flap);
      }
    } else {
      // 藏传宫廷青蓝螺发底冠 + 38 颗立体螺发卷
      const hairDome = new THREE.Mesh(new THREE.SphereGeometry(0.398, 26, 20, 0, Math.PI * 2, 0, Math.PI * 0.56), lapisHairMat);
      hairDome.scale.set(0.92, 1.04, 0.96);
      hairDome.position.set(0, 0.04, -0.02);
      hairDome.rotation.x = -0.18;
      g.add(hairDome);

      const curlGeo = new THREE.SphereGeometry(0.046, 8, 8);
      for (let ring = 0; ring < 3; ring++) {
        const lat = 0.32 + ring * 0.34;
        const cnt = ring === 0 ? 16 : (ring === 1 ? 13 : 9);
        const rad = Math.cos(lat) * 0.375;
        const y = Math.sin(lat) * 0.41 + 0.06;
        for (let i = 0; i < cnt; i++) {
          const a = (i / cnt) * Math.PI * 2 + ring * 0.25;
          const curl = new THREE.Mesh(curlGeo, lapisHairMat);
          curl.position.set(Math.sin(a) * rad * 0.92, y, Math.cos(a) * rad * 0.94 - 0.02);
          g.add(curl);
        }
      }

      // 高耸肉髻 + 摩尼宝珠顶严
      const ushnisha = new THREE.Mesh(new THREE.SphereGeometry(0.185, 18, 14), lapisHairMat);
      ushnisha.scale.set(1, 0.95, 1);
      ushnisha.position.set(0, 0.49, -0.02);
      g.add(ushnisha);
      const jewelBase = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.095, 0.06, 12), metalMain);
      jewelBase.position.set(0, 0.66, -0.02);
      g.add(jewelBase);
      const jewel = new THREE.Mesh(new THREE.OctahedronGeometry(0.088, 0), turquoiseMat);
      jewel.position.set(0, 0.74, -0.02);
      g.add(jewel);

      // 藏式五佛宝冠 + 绿松石/红珊瑚嵌宝 + 耳后宝缯飘带
      if (opts.crown !== false) {
        const crownBand = new THREE.Mesh(new THREE.TorusGeometry(0.355, 0.032, 8, 28), metalMain);
        crownBand.rotation.x = Math.PI / 2;
        crownBand.position.set(0, 0.24, 0.01);
        g.add(crownBand);
        for (let i = -2; i <= 2; i++) {
          const ang = i * 0.35;
          const leafH = i === 0 ? 0.36 : (Math.abs(i) === 1 ? 0.29 : 0.23);
          const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.105, leafH, 5), metalMain);
          leaf.position.set(Math.sin(ang) * 0.34, 0.36 + leafH * 0.2 - Math.abs(i) * 0.025, Math.cos(ang) * 0.34);
          leaf.rotation.x = 0.14;
          leaf.rotation.z = -ang * 0.48;
          g.add(leaf);
          const gem = new THREE.Mesh(new THREE.SphereGeometry(0.034, 8, 8), i === 0 ? coralMat : turquoiseMat);
          gem.position.set(Math.sin(ang) * 0.385, 0.31 - Math.abs(i) * 0.015, Math.cos(ang) * 0.385);
          g.add(gem);
        }
        // 耳后飘逸宝缯冠带
        for (const s of [-1, 1]) {
          const rib = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.48, 0.02), metalSub);
          rib.position.set(s * 0.44, 0.06, -0.1);
          rib.rotation.z = s * 0.24;
          g.add(rib);
        }
      }
    }
    return g;
  }

  /* ================= 4. 双层仰覆莲花须弥座 + 火焰祥云背光 ================= */
  function makeLotusBase(matMain, matSub, scale) {
    const g = new THREE.Group();
    const pts = [
      new THREE.Vector2(1.48, 0), new THREE.Vector2(1.42, 0.14),
      new THREE.Vector2(1.1, 0.28), new THREE.Vector2(0.95, 0.44),
      new THREE.Vector2(1.18, 0.58), new THREE.Vector2(1.32, 0.68)
    ];
    g.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 32), matSub));

    // 上下两圈鎏金连珠纹
    for (const [ry, rr] of [[0.67, 1.31], [0.15, 1.41]]) {
      for (let i = 0; i < 28; i++) {
        const a = (i / 28) * Math.PI * 2;
        const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), matMain);
        pearl.position.set(Math.cos(a) * rr, ry, Math.sin(a) * rr);
        g.add(pearl);
      }
    }

    // 20 瓣仰莲 + 20 瓣覆莲
    const petalGeo = new THREE.SphereGeometry(0.22, 12, 10);
    petalGeo.scale(0.84, 1.36, 0.32);
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const up = new THREE.Mesh(petalGeo, matMain);
      up.position.set(Math.cos(a) * 1.12, 0.78, Math.sin(a) * 1.12);
      up.rotation.y = -a + Math.PI / 2;
      up.rotation.x = 0.46;
      g.add(up);

      const dn = new THREE.Mesh(petalGeo, matSub);
      dn.scale.set(0.92, 0.86, 0.9);
      dn.position.set(Math.cos(a + 0.15) * 1.24, 0.42, Math.sin(a + 0.15) * 1.24);
      dn.rotation.y = -(a + 0.15) + Math.PI / 2;
      dn.rotation.x = -0.58;
      g.add(dn);
    }
    if (scale) g.scale.setScalar(scale);
    return g;
  }

  function makeMandorla(matMain, matSub, withGaruda) {
    const g = new THREE.Group();
    // 头光双环 + 放射细毫光
    const h1 = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.055, 12, 42), matMain);
    h1.position.set(0, 3.06, -0.34);
    g.add(h1);
    const h1In = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.024, 8, 36), matSub);
    h1In.position.set(0, 3.06, -0.34);
    g.add(h1In);

    // 身光大环 + 外圈智慧火焰舌纹（24 簇雕金火焰）
    const h2 = new THREE.Mesh(new THREE.TorusGeometry(1.66, 0.068, 12, 48), matSub);
    h2.position.set(0, 2.24, -0.4);
    g.add(h2);
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      if (Math.sin(a) < -0.55) continue;
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.28, 5), matMain);
      flame.position.set(Math.cos(a) * 1.82, 2.24 + Math.sin(a) * 1.82, -0.4);
      flame.rotation.z = a - Math.PI / 2;
      g.add(flame);
    }

    if (withGaruda) {
      // 雍和宫正殿三世佛背光顶部大鹏金翅鸟
      const bird = new THREE.Group();
      bird.position.set(0, 4.02, -0.36);
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.38, 6), matMain);
      bird.add(body);
      for (const s of [-1, 1]) {
        const wing = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.16, 0.06), matMain);
        wing.position.set(s * 0.34, 0.05, 0);
        wing.rotation.z = s * 0.28;
        bird.add(wing);
      }
      g.add(bird);
    }
    return g;
  }

  /* ================= 5. 庄严坐佛骨架（多层垂坠衣褶 + 精雕手印法器） ================= */
  function buildSeatedBuddha(opts) {
    const g = new THREE.Group();
    const matMain = opts.matMain || goldMat;
    const matSub = opts.matSub || antiqueGoldMat;
    const robeMat = opts.robeMat || matMain;

    g.add(makeLotusBase(matMain, matSub, 1));

    // 双跏趺坐莲花腿 + 垂落莲座前沿的衣褶裙摆
    const legRing = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.25, 16, 32), robeMat);
    legRing.rotation.x = Math.PI / 2;
    legRing.scale.set(1.24, 0.94, 0.86);
    legRing.position.set(0, 1.06, 0.08);
    g.add(legRing);
    const lap = new THREE.Mesh(new THREE.SphereGeometry(0.76, 22, 16), robeMat);
    lap.scale.set(1.24, 0.44, 0.92);
    lap.position.set(0, 1.05, 0.04);
    g.add(lap);
    // 垂落座前的U形衣摆
    const drape = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.56, 0.36, 16, 1, false, -0.9, 1.8), matSub);
    drape.position.set(0, 0.88, 0.48);
    g.add(drape);

    // 宽肩收腰庄严躯干 + 多层斜披袒右肩袈裟衣褶
    const torsoPts = [
      new THREE.Vector2(0.74, 1.08), new THREE.Vector2(0.56, 1.48),
      new THREE.Vector2(0.49, 1.78), new THREE.Vector2(0.65, 2.28),
      new THREE.Vector2(0.54, 2.48), new THREE.Vector2(0.24, 2.58)
    ];
    g.add(new THREE.Mesh(new THREE.LatheGeometry(torsoPts, 32), robeMat));
    for (let k = 0; k < 3; k++) {
      const fold = new THREE.Mesh(new THREE.TorusGeometry(0.57 + k * 0.025, 0.052, 10, 30), k === 1 ? matMain : matSub);
      fold.position.set(0, 1.88 - k * 0.14, 0.06 + k * 0.015);
      fold.rotation.set(0.32, 0.2, 0.72);
      g.add(fold);
    }

    // 庄严双臂与精雕手印/法器
    for (const side of [-1, 1]) {
      const sh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 12), robeMat);
      sh.position.set(side * 0.65, 2.28, 0.02);
      g.add(sh);
      const uArm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.118, 0.76, 14), robeMat);
      uArm.position.set(side * 0.71, 1.86, 0.08);
      uArm.rotation.z = side * 0.18;
      uArm.rotation.x = -0.22;
      g.add(uArm);
    }

    if (opts.mudra === 'earth_bowl') {
      // 释迦牟尼佛：右手触地降魔印，左手托金钵
      const rFore = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.088, 0.7, 12), matMain);
      rFore.position.set(0.62, 1.32, 0.26);
      rFore.rotation.x = 0.28;
      rFore.rotation.z = -0.18;
      g.add(rFore);
      const rPalm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.06), faceGoldMat);
      rPalm.position.set(0.58, 0.98, 0.42);
      rPalm.rotation.x = 0.35;
      g.add(rPalm);

      const lFore = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.088, 0.65, 12), robeMat);
      lFore.position.set(-0.36, 1.4, 0.36);
      lFore.rotation.z = -1.18;
      g.add(lFore);
      const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.23, 18, 14, 0, Math.PI * 2, Math.PI * 0.34, Math.PI * 0.66), goldMat);
      bowl.position.set(0, 1.45, 0.48);
      g.add(bowl);
      const bowlRim = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 8, 22), antiqueGoldMat);
      bowlRim.rotation.x = Math.PI / 2;
      bowlRim.position.set(0, 1.56, 0.48);
      g.add(bowlRim);
    } else if (opts.mudra === 'dharmachakra') {
      // 未来弥勒佛 / 宗喀巴大师：双手当胸转法轮印
      for (const s of [-1, 1]) {
        const fa = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.086, 0.62, 12), robeMat);
        fa.position.set(s * 0.36, 1.76, 0.36);
        fa.rotation.z = s * 0.92;
        fa.rotation.x = -0.5;
        g.add(fa);
      }
      const hands = new THREE.Mesh(new THREE.SphereGeometry(0.165, 14, 12), faceGoldMat);
      hands.scale.set(1.28, 0.85, 0.9);
      hands.position.set(0, 1.85, 0.51);
      g.add(hands);
    } else {
      // 禅定印（燃灯佛托光明宝珠 / 无量寿佛捧长寿宝瓶 / 药师佛托琉璃药钵）
      for (const s of [-1, 1]) {
        const fa = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.088, 0.66, 12), robeMat);
        fa.position.set(s * 0.4, 1.4, 0.34);
        fa.rotation.z = s * 1.16;
        g.add(fa);
      }
      const hands = new THREE.Mesh(new THREE.SphereGeometry(0.185, 14, 12), faceGoldMat);
      hands.scale.set(1.38, 0.52, 0.95);
      hands.position.set(0, 1.35, 0.52);
      g.add(hands);

      if (opts.artifact === 'orb') {
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.165, 18, 16), new THREE.MeshStandardMaterial({
          color: 0xfff2b2, emissive: 0xffb830, emissiveIntensity: 0.8, metalness: 0.35, roughness: 0.14
        }));
        orb.position.set(0, 1.56, 0.54);
        g.add(orb);
      } else if (opts.artifact === 'vase') {
        const vase = new THREE.Mesh(new THREE.SphereGeometry(0.185, 16, 14), coralMat);
        vase.scale.set(0.95, 1.25, 0.95);
        vase.position.set(0, 1.58, 0.54);
        g.add(vase);
        const vTop = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.18, 12), goldMat);
        vTop.position.set(0, 1.81, 0.54);
        g.add(vTop);
      } else if (opts.artifact === 'medicine') {
        const medBowl = new THREE.Mesh(new THREE.SphereGeometry(0.21, 18, 14, 0, Math.PI * 2, Math.PI * 0.32, Math.PI * 0.68), lapisBowlMat);
        medBowl.position.set(0, 1.47, 0.54);
        g.add(medBowl);
        const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.58, 8), jadeBranchMat);
        branch.position.set(0.32, 1.56, 0.46);
        branch.rotation.z = -0.35;
        g.add(branch);
      }
    }

    // 精雕佛首
    const headObj = createSculptedBuddhaHead({
      skinMat: opts.skinMat || faceGoldMat,
      matMain, matSub,
      hat: opts.hat,
      crown: opts.crown
    });
    headObj.position.set(0, 3.04, 0.03);
    g.add(headObj);

    // 宗喀巴大师双肩青莲花托智慧宝剑与般若经函
    if (opts.hat === 'tsongkhapa') {
      for (const s of [-1, 1]) {
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.028, 1.28, 8), jadeBranchMat);
        stem.position.set(s * 0.85, 2.38, 0.08);
        stem.rotation.z = -s * 0.14;
        g.add(stem);
        const lotus = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.1, 0.14, 14), turquoiseMat);
        lotus.position.set(s * 0.95, 3.02, 0.08);
        g.add(lotus);
      }
      const sword = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.76, 0.03), goldMat);
      sword.position.set(0.95, 3.45, 0.08);
      g.add(sword);
      const hilt = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.06), coralMat);
      hilt.position.set(0.95, 3.14, 0.08);
      g.add(hilt);
      const sutra = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.13, 0.16), goldMat);
      sutra.position.set(-0.95, 3.16, 0.08);
      g.add(sutra);
    }

    g.add(makeMandorla(matMain, matSub, !!opts.garuda));
    g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    return g;
  }

  /* ---- 特色法相 1：雍和门殿 · 大肚布袋笑佛（精雕立体笑颜） ---- */
  function buildLaughingMaitreya() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.65, 2.2), marblePedestalMat);
    base.position.y = 0.325;
    g.add(base);
    const cushion = new THREE.Mesh(new THREE.CylinderGeometry(1.38, 1.5, 0.28, 24), crimsonRobeMat);
    cushion.position.y = 0.78;
    g.add(cushion);

    const legs = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.32, 16, 26), crimsonRobeMat);
    legs.rotation.x = Math.PI / 2;
    legs.scale.set(1.22, 0.88, 0.85);
    legs.position.set(0, 1.18, 0.14);
    g.add(legs);

    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.96, 28, 22), faceGoldMat);
    belly.scale.set(1.12, 0.96, 0.98);
    belly.position.set(0, 1.72, 0.18);
    g.add(belly);

    for (const s of [-1, 1]) {
      const sideRobe = new THREE.Mesh(new THREE.SphereGeometry(0.74, 20, 16), crimsonRobeMat);
      sideRobe.scale.set(0.72, 1.28, 0.96);
      sideRobe.position.set(s * 0.72, 1.85, -0.05);
      g.add(sideRobe);
    }
    const backRobe = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1.02, 1.55, 20), crimsonRobeMat);
    backRobe.position.set(0, 1.8, -0.22);
    g.add(backRobe);

    // 立体精雕圆润欢喜笑佛首
    const headG = new THREE.Group();
    headG.position.set(0, 2.94, 0.12);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 28, 24), faceGoldMat);
    head.scale.set(1.05, 0.97, 0.98);
    headG.add(head);
    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.36, 6, 10), faceGoldMat);
      ear.position.set(s * 0.53, -0.08, -0.02);
      headG.add(ear);
      // 笑成弯月的立体双目
      const eyeArc = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.015, 6, 16, Math.PI * 0.75), browLineMat);
      eyeArc.position.set(s * 0.155, 0.03, 0.44);
      eyeArc.rotation.z = Math.PI * 0.12;
      eyeArc.rotation.y = s * 0.22;
      headG.add(eyeArc);
      // 丰腴喜气苹果肌
      const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), faceGoldMat);
      cheek.position.set(s * 0.21, -0.08, 0.41);
      headG.add(cheek);
    }
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 10), faceGoldMat);
    nose.scale.set(1.2, 0.9, 1.0);
    nose.position.set(0, -0.05, 0.48);
    headG.add(nose);
    // 咧嘴大笑朱唇
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.024, 8, 18, Math.PI * 0.8), lipCinnabarMat);
    smile.position.set(0, -0.13, 0.44);
    smile.rotation.z = Math.PI + Math.PI * 0.1;
    headG.add(smile);
    g.add(headG);

    // 挂脖与手执大佛珠 + 乾坤布袋
    const beadRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.058, 8, 20), goldMat);
    beadRing.position.set(0.96, 1.48, 0.62);
    beadRing.rotation.y = 0.5;
    g.add(beadRing);
    const sack = new THREE.Mesh(new THREE.SphereGeometry(0.58, 18, 14), sandalwoodGoldMat);
    sack.scale.set(1.15, 0.85, 0.95);
    sack.position.set(-1.18, 1.38, 0.25);
    g.add(sack);

    g.scale.setScalar(1.22);
    g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    return g;
  }

  /* ---- 特色法相 2：万福阁 · 18米白檀木雕弥勒大佛立像 ---- */
  function buildStandingSandalwoodMaitreya() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.48, 1.7, 0.62, 24), marblePedestalMat);
    base.position.y = 0.31;
    g.add(base);
    const lotus = makeLotusBase(sandalwoodGoldMat, antiqueGoldMat, 0.95);
    lotus.position.y = 0.58;
    g.add(lotus);

    // 巍峨立姿躯干与「曹衣出水」立体衣褶
    const skirtPts = [
      new THREE.Vector2(0.88, 1.2), new THREE.Vector2(0.72, 2.2),
      new THREE.Vector2(0.56, 3.1), new THREE.Vector2(0.68, 3.85),
      new THREE.Vector2(0.58, 4.18), new THREE.Vector2(0.24, 4.32)
    ];
    g.add(new THREE.Mesh(new THREE.LatheGeometry(skirtPts, 36), sandalwoodGoldMat));
    for (let i = 0; i < 4; i++) {
      const dr = new THREE.Mesh(new THREE.TorusGeometry(0.66 + i * 0.045, 0.032, 8, 28, Math.PI), antiqueGoldMat);
      dr.position.set(0, 2.85 - i * 0.42, 0.28 + i * 0.03);
      dr.rotation.z = Math.PI;
      dr.rotation.x = 0.3;
      g.add(dr);
    }

    // 多层绿松石与红珊瑚宫廷璎珞项饰
    for (let ring = 0; ring < 3; ring++) {
      const r = 0.42 + ring * 0.14;
      const y = 3.92 - ring * 0.26;
      const neckBead = new THREE.Mesh(new THREE.TorusGeometry(r, 0.038, 8, 30), ring === 1 ? coralMat : turquoiseMat);
      neckBead.rotation.x = Math.PI / 2 + 0.38;
      neckBead.position.set(0, y, 0.18 + ring * 0.04);
      g.add(neckBead);
    }

    for (const s of [-1, 1]) {
      const sh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 12), sandalwoodGoldMat);
      sh.position.set(s * 0.72, 3.94, 0.02);
      g.add(sh);
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 1.65, 14), sandalwoodGoldMat);
      arm.position.set(s * 0.82, 3.12, 0.14);
      arm.rotation.z = s * 0.12;
      arm.rotation.x = -0.14;
      g.add(arm);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.135, 12, 10), faceGoldMat);
      hand.scale.set(0.85, 1.32, 0.7);
      hand.position.set(s * 0.92, 2.22, 0.28);
      g.add(hand);
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.75, 0.05), antiqueGoldMat);
      ribbon.position.set(s * 1.05, 2.65, -0.05);
      ribbon.rotation.z = s * 0.06;
      g.add(ribbon);
    }

    // 精雕庄严大佛首 + 五佛宝冠
    const headObj = createSculptedBuddhaHead({
      skinMat: sandalwoodGoldMat,
      matMain: goldMat,
      matSub: antiqueGoldMat,
      crown: true
    });
    headObj.scale.setScalar(1.06);
    headObj.position.set(0, 4.82, 0.03);
    g.add(headObj);

    const halo = new THREE.Mesh(new THREE.TorusGeometry(1.04, 0.075, 12, 42), goldMat);
    halo.position.set(0, 4.82, -0.36);
    g.add(halo);

    g.scale.setScalar(1.22);
    g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    return g;
  }

  /* ================= 6. 构建五殿佛像容器与各殿镇殿陈设 ================= */
  const hallGroups = {};
  const altarY = HALL_Y + 1.35;
  const altarZ = -21.4;

  // Slot order follows the visitor's view: principal figure, then left and right.
  const sculptures = {
    yonghemen: [['布袋弥勒', 'budai', 4.05]],
    yonghegong: [['释迦牟尼佛', 'enshrined-buddha', 5.15], ['燃灯佛', 'past', 3.45], ['弥勒佛', 'maitreya-stele', 3.6]],
    yongyou: [['无量寿佛', 'longevity', 4.75], ['药师佛', 'medicine', 3.45], ['狮吼佛', 'discourse', 3.45]],
    falun: [['宗喀巴大师', 'teacher', 4.75]],
    wanfu: [['弥勒大佛', 'standing', 5.17]]
  };
  const placed = {};
  const loader = new THREE.GLTFLoader();
  const chooser = document.getElementById('figure-select');
  let focusedIndex = 0;

  function attachFigure(hall, fallback) {
    const slots = placed[hall] || (placed[hall] = []);
    const [name, asset, height] = sculptures[hall][slots.length];
    hallGroups[hall].add(fallback);
    slots.push({ name, asset, height, x: fallback.position.x, fallback, loading: false, ready: false });
  }

  function loadFigure(hall, slot) {
    if (slot.ready || slot.loading) return;
    slot.loading = true;
    const original = slot.asset === 'enshrined-buddha';
    const url = original ? './assets/enshrined-buddha.glb' : './assets/statues/' + slot.asset + '.glb';
    loader.load(url, ({ scene: sculpture }) => {
      if (original) sculpture.getObjectByName('pCube1')?.removeFromParent();
      orientFigure(slot.asset, sculpture);
      const bounds = new THREE.Box3().setFromObject(sculpture, true);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      const scale = slot.height / size.y;
      const mount = new THREE.Group();
      mount.name = slot.asset;
      const normalized = new THREE.Group();
      normalized.scale.setScalar(scale);
      normalized.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
      normalized.add(sculpture);
      mount.add(normalized);
      mount.position.x = slot.x;
      sculpture.traverse(part => {
        if (!part.isMesh) return;
        part.castShadow = true;
        part.receiveShadow = true;
        part.material.envMapIntensity = 0.42;
      });
      dressFigure(slot.asset, mount, slot.height);
      hallGroups[hall].add(mount);
      hallGroups[hall].remove(slot.fallback);
      slot.width = size.x * scale;
      slot.ready = true;
      slot.loading = false;
    }, undefined, () => {
      slot.loading = false;
      console.warn('造像资源未能加载，已保留内置造像：' + slot.name);
    });
  }

  function orientFigure(asset, sculpture) {
    const yaw = { budai: -Math.PI / 2, discourse: -Math.PI / 2, standing: -Math.PI / 4, past: -0.16 };
    if (yaw[asset]) sculpture.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), yaw[asset]);
  }

  const gilt = new THREE.MeshStandardMaterial({color: 0xaa8040, metalness: 0.53, roughness: 0.49});
  const saffron = new THREE.MeshStandardMaterial({color: 0x73501b, envMapIntensity: 0.06, metalness: 0.02, roughness: 0.96, side: THREE.DoubleSide});
  const lapis = new THREE.MeshStandardMaterial({color: 0x102538, envMapIntensity: 0.16, roughness: 0.58, metalness: 0.22});
  const copper = new THREE.MeshStandardMaterial({color: 0x644225, envMapIntensity: 0.2, roughness: 0.56, metalness: 0.46});
  function vessel(profile, material) {
    return new THREE.Mesh(new THREE.LatheGeometry(profile.map(([r,y]) => new THREE.Vector2(r,y)), 48), material);
  }
  function dressFigure(asset, mount, height) {
    const detail = new THREE.Group();
    detail.scale.setScalar(height);
    if (asset === 'teacher') {
      // The folded pandita hat has a high central ridge and cloth lappets on either side.
      const rows = [[0,.116,.124], [.032,.128,.125], [.083,.104,.117], [.139,.063,.092], [.191,.012,.050], [.199,.001,.004]];
      const pos = [], idx = [];
      rows.forEach(([y,rx,rz], row) => {
        for (let i=0;i<=48;i++) {
          const a=i*Math.PI/24;
          pos.push(Math.sin(a)*rx, y + .018*Math.cos(a), Math.cos(a)*rz-.15*y);
          if(row && i) {
            const k=row*49+i;
            idx.push(k-50,k-49,k,k-50,k,k-1);
          }
        }
      });
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
      geometry.setIndex(idx); geometry.computeVertexNormals();
      const cap = new THREE.Mesh(geometry,saffron);
      cap.position.set(.075,.896,.018); cap.rotation.z = -.11;
      for (const side of [-1,1]) {
        const lappet = new THREE.Shape();
        lappet.moveTo(0,0); lappet.quadraticCurveTo(.024,-.06,.006,-.152);
        lappet.quadraticCurveTo(-.036,-.12,-.037,0);
        const flap = new THREE.Mesh(new THREE.ExtrudeGeometry(lappet,{depth:.007,bevelEnabled:false}),saffron);
        flap.position.set(side*.102,.017,.043);flap.rotation.z=side*.12;cap.add(flap);
      }
      detail.add(cap);
    } else if (asset === 'medicine') {
      const bowl = vessel([[.001,0],[.046,0],[.061,.01],[.09,.048],[.095,.068],[.091,.073],[.084,.07],[.074,.045],[.042,.018],[.001,.015]],lapis);
      bowl.position.set(0,.283,.165); detail.add(bowl);
    } else if (asset === 'longevity') {
      const vase = vessel([[.001,0],[.055,0],[.058,.012],[.035,.024],[.045,.038],[.066,.065],[.069,.085],[.056,.108],[.023,.128],[.021,.147],[.034,.155],[.029,.166],[.001,.166]],copper);
      vase.position.set(0,.256,.139);
      const finial=vessel([[.033,0],[.036,.006],[.018,.012],[.01,.029],[.001,.039]],gilt);
      finial.position.y=.164; vase.add(finial);detail.add(vase);
    }
    if(detail.children.length) mount.add(detail);
  }

  chooser.addEventListener('change', () => { focusedIndex = chooser.selectedIndex; });
  api.inspectedFigure = () => placed[activeHallId][focusedIndex];

  function makeHallRoot(id) {
    const g = new THREE.Group();
    g.position.set(0, altarY, altarZ);
    g.visible = false;
    scene.add(g);
    hallGroups[id] = g;
    return g;
  }

  // ① 雍和门殿（天王殿）
  {
    const g = makeHallRoot('yonghemen');
    attachFigure('yonghemen', buildLaughingMaitreya());

    const armorColors = [0x2c6e49, 0x1d4e89, 0x9e2a2b, 0xd4a338];
    const kingPositions = [[-4.8, 0.2], [-3.1, -0.3], [3.1, -0.3], [4.8, 0.2]];
    kingPositions.forEach(([kx, kz], idx) => {
      const king = new THREE.Group();
      king.position.set(kx, 0, kz);
      king.rotation.y = kx < 0 ? 0.22 : -0.22;
      const armorMat = new THREE.MeshStandardMaterial({ color: armorColors[idx], roughness: 0.42, metalness: 0.35 });
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.36, 1.05), marblePedestalMat);
      base.position.y = 0.18;
      king.add(base);
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.44, 1.55, 14), armorMat);
      torso.position.y = 1.12;
      king.add(torso);
      const shoulder = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.26, 0.48), goldMat);
      shoulder.position.y = 1.78;
      king.add(shoulder);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 14), faceGoldMat);
      head.position.y = 2.15;
      king.add(head);
      const crown = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.38, 8), goldMat);
      crown.position.y = 2.48;
      king.add(crown);
      const haloScarf = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.04, 8, 22, Math.PI * 1.2), goldMat);
      haloScarf.position.set(0, 1.95, -0.15);
      haloScarf.rotation.z = -0.45;
      king.add(haloScarf);
      const weapon = new THREE.Mesh(
        idx === 3 ? new THREE.CylinderGeometry(0.18, 0.22, 1.45, 10) : new THREE.BoxGeometry(0.12, 1.35, 0.08),
        idx === 2 ? coralMat : goldMat
      );
      weapon.position.set(kx < 0 ? 0.52 : -0.52, 1.55, 0.32);
      weapon.rotation.z = kx < 0 ? -0.18 : 0.18;
      king.add(weapon);
      g.add(king);
    });
  }

  // ② 雍和宫殿（三世佛 + 罗汉金龛）
  {
    const g = makeHallRoot('yonghegong');
    const center = buildSeatedBuddha({ mudra: 'earth_bowl', garuda: true });
    center.scale.setScalar(1.42);
    attachFigure('yonghegong', center);

    const left = buildSeatedBuddha({ mudra: 'dhyana', artifact: 'orb', garuda: false });
    left.scale.setScalar(0.92);
    left.position.set(-3.85, 0, 0);
    attachFigure('yonghegong', left);

    const right = buildSeatedBuddha({ mudra: 'dharmachakra', garuda: false });
    right.scale.setScalar(0.92);
    right.position.set(3.85, 0, 0);
    attachFigure('yonghegong', right);

    for (const side of [-1, 1]) {
      for (let k = 0; k < 3; k++) {
        const arhat = new THREE.Group();
        arhat.position.set(side * (6.2 + k * 0.9), 0, 1.1 + k * 1.15);
        arhat.rotation.y = -side * 0.85;
        const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.34, 12), antiqueGoldMat);
        ped.position.y = 0.17;
        arhat.add(ped);
        const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.55, 8, 12), goldMat);
        body.position.y = 0.72;
        arhat.add(body);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), faceGoldMat);
        head.position.y = 1.24;
        arhat.add(head);
        g.add(arhat);
      }
    }
  }

  // ③ 永佑殿（药师佛 · 无量寿佛 · 狮吼佛 + 白塔）
  {
    const g = makeHallRoot('yongyou');
    const center = buildSeatedBuddha({ mudra: 'dhyana', artifact: 'vase', matMain: sandalwoodGoldMat, matSub: warmBronzeMat, skinMat: sandalwoodGoldMat });
    center.scale.setScalar(1.36);
    attachFigure('yongyou', center);

    const left = buildSeatedBuddha({ mudra: 'dhyana', artifact: 'medicine', matMain: sandalwoodGoldMat, matSub: warmBronzeMat, skinMat: sandalwoodGoldMat });
    left.scale.setScalar(0.94);
    left.position.set(-3.8, 0, 0);
    attachFigure('yongyou', left);

    const right = buildSeatedBuddha({ mudra: 'dharmachakra', matMain: sandalwoodGoldMat, matSub: warmBronzeMat, skinMat: sandalwoodGoldMat });
    right.scale.setScalar(0.94);
    right.position.set(3.8, 0, 0);
    attachFigure('yongyou', right);

    for (const sx of [-6.1, 6.1]) {
      const stupa = new THREE.Group();
      stupa.position.set(sx, 0, 0.65);
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.75, 1.25), marblePedestalMat);
      base.position.y = 0.375;
      stupa.add(base);
      const steps = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.45, 1.02), goldMat);
      steps.position.y = 0.96;
      stupa.add(steps);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.54, 18, 14), marblePedestalMat);
      dome.scale.set(1, 1.15, 1);
      dome.position.y = 1.62;
      stupa.add(dome);
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.24, 1.05, 14), goldMat);
      spire.position.y = 2.65;
      stupa.add(spire);
      const sunMoon = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), turquoiseMat);
      sunMoon.position.y = 3.24;
      stupa.add(sunMoon);
      g.add(stupa);
    }
  }

  function palaceWoodGrain() {
    return makeTex(128, 256, (ctx, w, h) => {
      ctx.fillStyle = '#49312c'; ctx.fillRect(0, 0, w, h);
      for(let i=0;i<84;i++) {
        const x = i*w/84;
        ctx.strokeStyle = i%3 ? '#38251e' : '#5e4435';
        ctx.beginPath();ctx.moveTo(x,0);
        ctx.bezierCurveTo(x+7,h*.25,x-8,h*.72,x+2,h);ctx.stroke();
      }
    });
  }

  // ④ 法轮殿（宗喀巴大师 + 紫檀五百罗汉山）
  {
    const g = makeHallRoot('falun');
    const master = buildSeatedBuddha({
      mudra: 'dharmachakra',
      hat: 'tsongkhapa',
      matMain: goldMat,
      matSub: antiqueGoldMat,
      robeMat: crimsonRobeMat
    });
    master.scale.setScalar(1.48);
    attachFigure('falun', master);

    const mountainGroup = new THREE.Group();
    mountainGroup.position.set(0, 0, -1.35);
    const rosewoodCliffMat = new THREE.MeshStandardMaterial({ color: 0x26180e, roughness: 0.95, metalness: 0.01, envMapIntensity: 0.025 });
    rosewoodCliffMat.map = palaceWoodGrain();
    const peakSpecs = [
      [0, 2.3, 1.35, 4.6], [-1.9, 1.85, 1.05, 3.7], [1.9, 1.9, 1.05, 3.8],
      [-3.5, 1.45, 0.88, 2.9], [3.5, 1.5, 0.88, 3.0], [-0.95, 2.1, 0.95, 4.1], [0.95, 2.1, 0.95, 4.1]
    ];
    for (const [px, py, r, h] of peakSpecs) {
      const peak = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), rosewoodCliffMat);
      peak.position.set(px, py, 0);
      peak.rotation.y = px * 0.5;
      mountainGroup.add(peak);
    }
    for (let i = 0; i < 28; i++) {
      const ax = ((i % 7) - 3) * 1.05 + Math.sin(i * 2.1) * 0.32;
      const ay = 0.65 + Math.floor(i / 7) * 0.82 + (i % 2) * 0.25;
      const miniArhat = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.06, 0.12, 4, 6),
        i % 3 === 0 ? goldMat : (i % 3 === 1 ? sandalwoodGoldMat : antiqueGoldMat)
      );
      miniArhat.position.set(ax, ay, 0.52);
      mountainGroup.add(miniArhat);
    }
    g.add(mountainGroup);
  }

  // ⑤ 万福阁（18米白檀木雕弥勒大佛立像 + 飞虹木廊）
  {
    const g = makeHallRoot('wanfu');
    attachFigure('wanfu', buildStandingSandalwoodMaitreya());

    const galleryMat = new THREE.MeshStandardMaterial({ color: 0x761b14, roughness: 0.42 });
    for (const side of [-1, 1]) {
      const gallery = new THREE.Group();
      gallery.position.set(side * 4.4, 3.35, 0.35);
      const beam = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.26, 2.6), galleryMat);
      gallery.add(beam);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.65, 0.14), antiqueGoldMat);
      rail.position.set(0, 0.45, 1.24);
      gallery.add(rail);
      for (const px of [-1.4, 0, 1.4]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.5, 10), galleryMat);
        post.position.set(px, 1.35, 1.2);
        gallery.add(post);
      }
      const banner = new THREE.Mesh(new THREE.BoxGeometry(0.82, 4.8, 0.06), crimsonRobeMat);
      banner.position.set(-side * 1.15, -0.75, 1.26);
      gallery.add(banner);
      const border = new THREE.Mesh(new THREE.BoxGeometry(0.9, 4.9, 0.04), goldMat);
      border.position.set(-side * 1.15, -0.75, 1.24);
      gallery.add(border);
      g.add(gallery);
    }
  }

  if (mainBuddhaSlot && mainBuddhaSlot.builtIn) mainBuddhaSlot.builtIn.visible = false;
  (sideBuddhas || []).forEach(sb => { if (sb && sb.builtIn) sb.builtIn.visible = false; });

  const plaqueTexCache = {};
  function setPlaqueText(text) {
    if (!plaque) return;
    if (!plaqueTexCache[text]) {
      plaqueTexCache[text] = makeTex(512, 200, (c, w, h) => {
        const g = c.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#142744');
        g.addColorStop(1, '#1d375e');
        c.fillStyle = g;
        c.fillRect(0, 0, w, h);
        c.strokeStyle = '#e5be58';
        c.lineWidth = 11;
        c.strokeRect(9, 9, w - 18, h - 18);
        c.strokeStyle = 'rgba(245,215,126,0.55)';
        c.lineWidth = 2.5;
        c.strokeRect(22, 22, w - 44, h - 44);
        c.fillStyle = '#fae091';
        c.font = 'bold 84px "Songti SC","STSong",serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(text, w / 2, h / 2 + 4);
      });
    }
    plaque.material.map = plaqueTexCache[text];
    plaque.material.needsUpdate = true;
  }

  let activeHallId = 'yonghegong';

  function selectHall(hallId, moveCamera) {
    const cfg = HALLS.find(h => h.id === hallId) || HALLS[1];
    activeHallId = cfg.id;
    focusedIndex = 0;
    chooser.replaceChildren(...placed[cfg.id].map(slot => new Option(slot.name, slot.asset)));
    chooser.hidden = placed[cfg.id].length === 1;
    document.getElementById('view-statue').disabled = false;
    placed[cfg.id].forEach(slot => loadFigure(cfg.id, slot));

    Object.keys(hallGroups).forEach(k => {
      hallGroups[k].visible = (k === cfg.id);
    });
    setPlaqueText(cfg.plaque);
    if (typeof api.setHallCouplet === 'function') {
      api.setHallCouplet(cfg.coupletUp, cfg.coupletDown);
    }
    if (hallLight) hallLight.intensity = cfg.hallInt;
    if (buddhaSpot) buddhaSpot.intensity = cfg.spotInt;

    document.querySelectorAll('.hall-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.hall === cfg.id);
    });
    const titleEl = document.getElementById('deity-title');
    const wishEl = document.getElementById('deity-wish');
    const descEl = document.getElementById('deity-desc');
    if (titleEl) titleEl.textContent = cfg.short + ' · ' + cfg.deity;
    if (wishEl) wishEl.textContent = cfg.wish;
    if (descEl) descEl.textContent = cfg.desc;

    if (moveCamera) {
      playSound('bell');
      camState.inHallView = true;
      camState.dist = cfg.camDist;
      camState.pitch = cfg.camPitch;
      camState.yaw = 0.08;
      const viewTxt = document.getElementById('view-txt');
      if (viewTxt) viewTxt.textContent = '出庭院';
      walkPlayerTo(0, -11.8, '', HALL_Y + 0.12);
      showToast('已步入「' + cfg.short + '」· ' + cfg.deity, 3000);
    }
  }

  document.querySelectorAll('.hall-tab').forEach(btn => {
    btn.onclick = () => selectHall(btn.dataset.hall, true);
  });

  api.onTick.push(() => {
    const hasCustomGlb = mainBuddhaSlot && mainBuddhaSlot.glbMount && mainBuddhaSlot.glbMount.children.length > 0;
    if (hallGroups[activeHallId]) {
      hallGroups[activeHallId].visible = !hasCustomGlb;
    }
  });

  selectHall('yonghegong', false);
})();
