'use strict';

(() => {
  const api = window.YHG3D;
  if (!api || typeof THREE === 'undefined') return;

  const {
    scene, player, camState, HALL_Y, plaque,
    mainBuddhaSlot, sideBuddhas,
    goldMat, antiqueGoldMat, buddhaFaceMat, turquoiseMat,
    hallLight, buddhaSpot, walkPlayerTo, playSound, showToast, makeTex
  } = api;

  /* ================= 1. 雍和宫中轴五殿真实佛祖档案 ================= */
  const HALLS = [
    {
      id: 'yonghemen',
      short: '雍和门殿',
      plaque: '雍  和  门',
      deity: '弥勒佛（大肚布袋笑佛）',
      wish: '主求：喜乐平安 · 开运纳福',
      desc: '袒胸露腹、笑口常开，右手执佛珠、左手倚乾坤布袋，坐于汉白玉彩绘须弥座。',
      camDist: 10.2, camPitch: 0.19, hallInt: 2.8, spotInt: 3.0
    },
    {
      id: 'yonghegong',
      short: '雍和宫殿',
      plaque: '雍  和  宫',
      deity: '三世佛（燃灯佛 · 释迦牟尼佛 · 弥勒佛）',
      wish: '主求：事业高升 · 正财顺遂',
      desc: '中尊释迦牟尼佛右手触地降魔印、左手托金钵；东侧过去燃灯佛托光明宝珠；西侧未来弥勒佛结说法印，背光顶饰大鹏金翅鸟。',
      camDist: 10.8, camPitch: 0.2, hallInt: 2.7, spotInt: 3.3
    },
    {
      id: 'yongyou',
      short: '永佑殿',
      plaque: '永  佑  殿',
      deity: '三尊木雕佛（药师佛 · 无量寿佛 · 狮吼佛）',
      wish: '主求：消灾延寿 · 身心安康',
      desc: '中尊无量寿佛双手捧长寿宝瓶；左尊药师佛托青琉璃药钵、持诃子药枝；右尊狮吼佛结法印端坐莲台。',
      camDist: 10.6, camPitch: 0.2, hallInt: 2.5, spotInt: 3.0
    },
    {
      id: 'falun',
      short: '法轮殿',
      plaque: '法  轮  殿',
      deity: '宗喀巴大师鎏金铜像',
      wish: '主求：学业有成 · 智慧开明 · 仕途稳进',
      desc: '格鲁派祖师，头戴明黄桃形班智达尖帽、披绛红嵌金袈裟，双手当胸结转法轮印，双肩青莲分托智慧宝剑与般若经函。',
      camDist: 10.2, camPitch: 0.2, hallInt: 2.9, spotInt: 3.4
    },
    {
      id: 'wanfu',
      short: '万福阁',
      plaque: '万  福  阁',
      deity: '白檀木雕弥勒大佛立像（18米独木巨佛）',
      wish: '主求：大运亨通 · 万福圆满',
      desc: '雍和宫木雕三绝之首，整根白檀巨木雕成，巍峨立姿、戴五佛宝冠、佩绿松石红珊瑚璎珞，双臂垂侧结印。',
      camDist: 12.8, camPitch: 0.14, hallInt: 3.2, spotInt: 4.0
    }
  ];

  /* ================= 2. 材质与公共雕刻构件 ================= */
  const sandalwoodGoldMat = new THREE.MeshStandardMaterial({
    color: 0xd6a554, metalness: 0.42, roughness: 0.42, emissive: 0x3b2205, emissiveIntensity: 0.16
  });
  const warmBronzeMat = new THREE.MeshStandardMaterial({
    color: 0xc9963e, metalness: 0.72, roughness: 0.34, emissive: 0x452704, emissiveIntensity: 0.18
  });
  const crimsonRobeMat = new THREE.MeshStandardMaterial({
    color: 0x851e16, roughness: 0.65, metalness: 0.08
  });
  const yellowHatMat = new THREE.MeshStandardMaterial({
    color: 0xf4c430, roughness: 0.42, metalness: 0.12, emissive: 0x4a3100, emissiveIntensity: 0.18
  });
  const lapisBowlMat = new THREE.MeshStandardMaterial({
    color: 0x164ea6, metalness: 0.35, roughness: 0.18, emissive: 0x0a255e, emissiveIntensity: 0.35
  });
  const coralMat = new THREE.MeshStandardMaterial({
    color: 0xc93224, metalness: 0.18, roughness: 0.25, emissive: 0x420b06, emissiveIntensity: 0.22
  });
  const jadeBranchMat = new THREE.MeshStandardMaterial({
    color: 0x2c8a56, roughness: 0.42, metalness: 0.1
  });
  const marblePedestalMat = new THREE.MeshStandardMaterial({
    color: 0xe3ddd1, roughness: 0.56, metalness: 0.04
  });
  const laughingSkinMat = new THREE.MeshStandardMaterial({
    color: 0xf2c56b, metalness: 0.74, roughness: 0.26, emissive: 0x5c3605, emissiveIntensity: 0.2
  });

  // 笑口弥勒面部贴图（眯眼大笑）
  const laughFaceTex = makeTex(512, 512, (c, w, h) => {
    const g = c.createRadialGradient(w * 0.5, h * 0.48, 25, w * 0.5, h * 0.5, w * 0.56);
    g.addColorStop(0, '#ffe38a');
    g.addColorStop(0.68, '#eab848');
    g.addColorStop(1, '#bd8720');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    c.strokeStyle = '#5c3408';
    c.lineWidth = 8;
    c.lineCap = 'round';
    // 笑成弯月的眉眼
    c.beginPath(); c.arc(w * 0.41, h * 0.48, 28, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
    c.beginPath(); c.arc(w * 0.59, h * 0.48, 28, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
    // 喜气红颊
    c.fillStyle = 'rgba(214,82,56,0.22)';
    c.beginPath(); c.arc(w * 0.34, h * 0.55, 32, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(w * 0.66, h * 0.55, 32, 0, Math.PI * 2); c.fill();
    // 咧嘴欢笑
    c.fillStyle = '#9e2b1d';
    c.beginPath();
    c.arc(w * 0.5, h * 0.61, 46, 0.1 * Math.PI, 0.9 * Math.PI);
    c.closePath();
    c.fill();
    c.fillStyle = '#fff4da';
    c.fillRect(w * 0.43, h * 0.615, w * 0.14, 14);
  });
  const laughFaceMat = new THREE.MeshStandardMaterial({
    map: laughFaceTex, metalness: 0.62, roughness: 0.28, emissive: 0x452b05, emissiveIntensity: 0.18
  });

  function makeLotusBase(matMain, matSub, scale) {
    const g = new THREE.Group();
    const pts = [
      new THREE.Vector2(1.42, 0), new THREE.Vector2(1.36, 0.14),
      new THREE.Vector2(1.06, 0.26), new THREE.Vector2(0.92, 0.42),
      new THREE.Vector2(1.14, 0.54), new THREE.Vector2(1.26, 0.64)
    ];
    g.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 30), matSub));
    const petalGeo = new THREE.SphereGeometry(0.22, 10, 8);
    petalGeo.scale(0.82, 1.32, 0.34);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const up = new THREE.Mesh(petalGeo, matMain);
      up.position.set(Math.cos(a) * 1.08, 0.74, Math.sin(a) * 1.08);
      up.rotation.y = -a + Math.PI / 2;
      up.rotation.x = 0.44;
      g.add(up);
    }
    if (scale) g.scale.setScalar(scale);
    return g;
  }

  function makeMandorla(matMain, matSub, withGaruda) {
    const g = new THREE.Group();
    const h1 = new THREE.Mesh(new THREE.TorusGeometry(0.84, 0.055, 10, 36), matMain);
    h1.position.set(0, 3.04, -0.34);
    g.add(h1);
    const h2 = new THREE.Mesh(new THREE.TorusGeometry(1.58, 0.06, 10, 44), matSub);
    h2.position.set(0, 2.24, -0.4);
    g.add(h2);
    if (withGaruda) {
      // 雍和宫正殿三世佛背光顶部大鹏金翅鸟
      const bird = new THREE.Group();
      bird.position.set(0, 3.92, -0.36);
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.34, 6), matMain);
      bird.add(body);
      for (const s of [-1, 1]) {
        const wing = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 0.05), matMain);
        wing.position.set(s * 0.3, 0.04, 0);
        wing.rotation.z = s * 0.28;
        bird.add(wing);
      }
      g.add(bird);
    }
    return g;
  }

  // 通用藏式坐佛骨架（按法相配置不同手印、法器、材质与冠饰）
  function buildSeatedBuddha(opts) {
    const g = new THREE.Group();
    const matMain = opts.matMain || goldMat;
    const matSub = opts.matSub || antiqueGoldMat;
    const robeMat = opts.robeMat || matMain;

    g.add(makeLotusBase(matMain, matSub, 1));

    // 跏趺坐双腿
    const legRing = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.24, 14, 28), robeMat);
    legRing.rotation.x = Math.PI / 2;
    legRing.scale.set(1.22, 0.94, 0.85);
    legRing.position.set(0, 1.04, 0.08);
    g.add(legRing);
    const lap = new THREE.Mesh(new THREE.SphereGeometry(0.74, 18, 14), robeMat);
    lap.scale.set(1.24, 0.44, 0.9);
    lap.position.set(0, 1.03, 0.04);
    g.add(lap);

    // 胸腹与斜披袈裟
    const torsoPts = [
      new THREE.Vector2(0.72, 1.08), new THREE.Vector2(0.55, 1.48),
      new THREE.Vector2(0.47, 1.76), new THREE.Vector2(0.62, 2.24),
      new THREE.Vector2(0.52, 2.46), new THREE.Vector2(0.24, 2.56)
    ];
    g.add(new THREE.Mesh(new THREE.LatheGeometry(torsoPts, 28), robeMat));
    const kasaya = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.08, 10, 26), matSub);
    kasaya.position.set(0, 1.86, 0.05);
    kasaya.rotation.set(0.32, 0.2, 0.72);
    g.add(kasaya);

    // 手印与法器分化（一眼区分不同佛祖！）
    for (const side of [-1, 1]) {
      const sh = new THREE.Mesh(new THREE.SphereGeometry(0.21, 12, 10), robeMat);
      sh.position.set(side * 0.64, 2.26, 0.02);
      g.add(sh);
      const uArm = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.115, 0.76, 12), robeMat);
      uArm.position.set(side * 0.7, 1.84, 0.08);
      uArm.rotation.z = side * 0.18;
      uArm.rotation.x = -0.22;
      g.add(uArm);
    }

    if (opts.mudra === 'earth_bowl') {
      // 释迦牟尼佛：右手触地降魔印，左手托金钵
      const rFore = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.09, 0.68, 10), matMain);
      rFore.position.set(0.62, 1.32, 0.26);
      rFore.rotation.x = 0.28;
      rFore.rotation.z = -0.18;
      g.add(rFore);
      const lFore = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.09, 0.65, 10), matMain);
      lFore.position.set(-0.36, 1.4, 0.36);
      lFore.rotation.z = -1.18;
      g.add(lFore);
      const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.65), goldMat);
      bowl.position.set(0, 1.44, 0.48);
      g.add(bowl);
    } else if (opts.mudra === 'dharmachakra') {
      // 未来弥勒佛 / 宗喀巴大师：双手当胸转法轮印
      for (const s of [-1, 1]) {
        const fa = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.088, 0.62, 10), robeMat);
        fa.position.set(s * 0.36, 1.76, 0.36);
        fa.rotation.z = s * 0.92;
        fa.rotation.x = -0.5;
        g.add(fa);
      }
      const hands = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), matMain);
      hands.scale.set(1.25, 0.85, 0.9);
      hands.position.set(0, 1.84, 0.5);
      g.add(hands);
    } else {
      // 禅定印（燃灯佛托光明宝珠 / 无量寿佛捧长寿宝瓶 / 药师佛托琉璃药钵）
      for (const s of [-1, 1]) {
        const fa = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.09, 0.66, 10), robeMat);
        fa.position.set(s * 0.4, 1.4, 0.34);
        fa.rotation.z = s * 1.16;
        g.add(fa);
      }
      const hands = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), matMain);
      hands.scale.set(1.35, 0.52, 0.95);
      hands.position.set(0, 1.34, 0.52);
      g.add(hands);

      if (opts.artifact === 'orb') {
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 14), new THREE.MeshStandardMaterial({
          color: 0xfff0a8, emissive: 0xffb830, emissiveIntensity: 0.75, metalness: 0.4, roughness: 0.15
        }));
        orb.position.set(0, 1.54, 0.54);
        g.add(orb);
      } else if (opts.artifact === 'vase') {
        // 无量寿佛长寿宝瓶
        const vase = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 12), coralMat);
        vase.scale.set(0.95, 1.25, 0.95);
        vase.position.set(0, 1.56, 0.54);
        g.add(vase);
        const vTop = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.16, 12), goldMat);
        vTop.position.set(0, 1.78, 0.54);
        g.add(vTop);
      } else if (opts.artifact === 'medicine') {
        // 药师佛：青琉璃药钵 + 翡翠药枝
        const medBowl = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12, 0, Math.PI * 2, Math.PI * 0.32, Math.PI * 0.68), lapisBowlMat);
        medBowl.position.set(0, 1.46, 0.54);
        g.add(medBowl);
        const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.55, 8), jadeBranchMat);
        branch.position.set(0.32, 1.55, 0.46);
        branch.rotation.z = -0.35;
        g.add(branch);
      }
    }

    // 佛首与五官
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.24, 0.22, 16), matMain);
    neck.position.y = 2.64;
    g.add(neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 26, 22), buddhaFaceMat);
    head.scale.set(0.92, 1.08, 0.96);
    head.rotation.y = -Math.PI / 2;
    head.position.set(0, 3.04, 0.03);
    g.add(head);
    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.26, 6, 8), matMain);
      ear.position.set(s * 0.39, 2.96, -0.02);
      g.add(ear);
    }

    if (opts.hat === 'tsongkhapa') {
      // 宗喀巴大师标志性黄色桃形班智达尖帽 + 双肩青莲花托宝剑与经函
      const hatCone = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.85, 20), yellowHatMat);
      hatCone.position.set(0, 3.72, -0.02);
      hatCone.rotation.x = -0.14;
      g.add(hatCone);
      const hatBrim = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.075, 10, 24), yellowHatMat);
      hatBrim.rotation.x = Math.PI / 2;
      hatBrim.position.set(0, 3.34, 0);
      g.add(hatBrim);
      for (const s of [-1, 1]) {
        const flap = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.65, 0.06), yellowHatMat);
        flap.position.set(s * 0.38, 2.94, -0.06);
        flap.rotation.z = s * 0.16;
        g.add(flap);
        // 双肩青莲花枝
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.028, 1.25, 8), jadeBranchMat);
        stem.position.set(s * 0.84, 2.38, 0.08);
        stem.rotation.z = -s * 0.14;
        g.add(stem);
        const lotus = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.1, 0.14, 12), turquoiseMat);
        lotus.position.set(s * 0.94, 3.0, 0.08);
        g.add(lotus);
      }
      // 右肩智慧宝剑
      const sword = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.72, 0.03), goldMat);
      sword.position.set(0.94, 3.42, 0.08);
      g.add(sword);
      const hilt = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.06), coralMat);
      hilt.position.set(0.94, 3.12, 0.08);
      g.add(hilt);
      // 左肩般若经函
      const sutra = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.16), goldMat);
      sutra.position.set(-0.94, 3.14, 0.08);
      g.add(sutra);
    } else {
      // 肉髻 + 宝珠 + 藏式五叶嵌绿松石宝冠
      const ushnisha = new THREE.Mesh(new THREE.SphereGeometry(0.21, 16, 14), matSub);
      ushnisha.position.set(0, 3.5, -0.02);
      g.add(ushnisha);
      const jewel = new THREE.Mesh(new THREE.OctahedronGeometry(0.085, 0), turquoiseMat);
      jewel.position.set(0, 3.72, -0.02);
      g.add(jewel);
      if (opts.crown !== false) {
        for (let i = -2; i <= 2; i++) {
          const ang = i * 0.34;
          const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.105, i === 0 ? 0.34 : 0.25, 5), matMain);
          leaf.position.set(Math.sin(ang) * 0.35, 3.42 - Math.abs(i) * 0.03, Math.cos(ang) * 0.35);
          leaf.rotation.x = 0.16;
          leaf.rotation.z = -ang * 0.5;
          g.add(leaf);
          const gem = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), turquoiseMat);
          gem.position.set(Math.sin(ang) * 0.39, 3.32 - Math.abs(i) * 0.02, Math.cos(ang) * 0.39);
          g.add(gem);
        }
      }
    }

    g.add(makeMandorla(matMain, matSub, !!opts.garuda));
    g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    return g;
  }

  /* ---- 特色法相 1：雍和门殿 · 大肚布袋笑佛（弥勒佛） ---- */
  function buildLaughingMaitreya() {
    const g = new THREE.Group();
    // 汉白玉须弥彩绘座
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.65, 2.2), marblePedestalMat);
    base.position.y = 0.325;
    g.add(base);
    const cushion = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.48, 0.28, 20), crimsonRobeMat);
    cushion.position.y = 0.78;
    g.add(cushion);

    // 宽厚圆润盘腿与大肚佛腹
    const legs = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.32, 14, 24), crimsonRobeMat);
    legs.rotation.x = Math.PI / 2;
    legs.scale.set(1.22, 0.88, 0.85);
    legs.position.set(0, 1.18, 0.14);
    g.add(legs);

    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.95, 24, 20), laughingSkinMat);
    belly.scale.set(1.12, 0.96, 0.98);
    belly.position.set(0, 1.72, 0.18);
    g.add(belly);

    // 敞怀宽大僧袍（露大肚）
    for (const s of [-1, 1]) {
      const sideRobe = new THREE.Mesh(new THREE.SphereGeometry(0.74, 18, 16), crimsonRobeMat);
      sideRobe.scale.set(0.72, 1.28, 0.96);
      sideRobe.position.set(s * 0.72, 1.85, -0.05);
      g.add(sideRobe);
    }
    const backRobe = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1.02, 1.55, 18), crimsonRobeMat);
    backRobe.position.set(0, 1.8, -0.22);
    g.add(backRobe);

    // 圆润大耳笑佛首
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.52, 24, 20), laughFaceMat);
    head.scale.set(1.04, 0.98, 0.98);
    head.rotation.y = -Math.PI / 2;
    head.position.set(0, 2.94, 0.12);
    g.add(head);
    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.36, 6, 8), laughingSkinMat);
      ear.position.set(s * 0.54, 2.86, 0.08);
      g.add(ear);
    }

    // 右手握大型佛珠，左手倚乾坤布袋
    const beadRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.06, 8, 18), goldMat);
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

  /* ---- 特色法相 2：万福阁 · 18米白檀木雕弥勒大佛立像（雍和宫三绝之首） ---- */
  function buildStandingSandalwoodMaitreya() {
    const g = new THREE.Group();
    // 汉白玉须弥座 + 仰莲台
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.68, 0.62, 24), marblePedestalMat);
    base.position.y = 0.31;
    g.add(base);
    const lotus = makeLotusBase(sandalwoodGoldMat, antiqueGoldMat, 0.95);
    lotus.position.y = 0.58;
    g.add(lotus);

    // 巍峨修长立姿躯干与垂坠天衣裙褶
    const skirtPts = [
      new THREE.Vector2(0.88, 1.2), new THREE.Vector2(0.72, 2.2),
      new THREE.Vector2(0.56, 3.1), new THREE.Vector2(0.68, 3.85),
      new THREE.Vector2(0.58, 4.18), new THREE.Vector2(0.24, 4.32)
    ];
    g.add(new THREE.Mesh(new THREE.LatheGeometry(skirtPts, 32), sandalwoodGoldMat));

    // 多层绿松石与红珊瑚宫廷璎珞项饰
    for (let ring = 0; ring < 3; ring++) {
      const r = 0.42 + ring * 0.14;
      const y = 3.92 - ring * 0.26;
      const neckBead = new THREE.Mesh(new THREE.TorusGeometry(r, 0.036, 8, 28), ring === 1 ? coralMat : turquoiseMat);
      neckBead.rotation.x = Math.PI / 2 + 0.38;
      neckBead.position.set(0, y, 0.18 + ring * 0.04);
      g.add(neckBead);
    }

    // 飘逸天衣帛带与垂侧结印双臂
    for (const s of [-1, 1]) {
      const sh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), sandalwoodGoldMat);
      sh.position.set(s * 0.72, 3.94, 0.02);
      g.add(sh);
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 1.65, 12), sandalwoodGoldMat);
      arm.position.set(s * 0.82, 3.12, 0.14);
      arm.rotation.z = s * 0.12;
      arm.rotation.x = -0.14;
      g.add(arm);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), goldMat);
      hand.scale.set(0.85, 1.3, 0.7);
      hand.position.set(s * 0.92, 2.22, 0.28);
      g.add(hand);
      // 垂地飘带
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.7, 0.05), antiqueGoldMat);
      ribbon.position.set(s * 1.05, 2.65, -0.05);
      ribbon.rotation.z = s * 0.06;
      g.add(ribbon);
    }

    // 庄严佛首 + 五佛宝冠 + 硕大背光
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.24, 16), sandalwoodGoldMat);
    neck.position.y = 4.42;
    g.add(neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 26, 22), buddhaFaceMat);
    head.scale.set(0.92, 1.08, 0.96);
    head.rotation.y = -Math.PI / 2;
    head.position.set(0, 4.82, 0.03);
    g.add(head);
    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.28, 6, 8), sandalwoodGoldMat);
      ear.position.set(s * 0.41, 4.74, -0.02);
      g.add(ear);
    }
    for (let i = -2; i <= 2; i++) {
      const ang = i * 0.34;
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.12, i === 0 ? 0.42 : 0.32, 5), goldMat);
      leaf.position.set(Math.sin(ang) * 0.38, 5.24 - Math.abs(i) * 0.03, Math.cos(ang) * 0.38);
      leaf.rotation.x = 0.16;
      leaf.rotation.z = -ang * 0.5;
      g.add(leaf);
      const gem = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), i === 0 ? coralMat : turquoiseMat);
      gem.position.set(Math.sin(ang) * 0.42, 5.14 - Math.abs(i) * 0.02, Math.cos(ang) * 0.42);
      g.add(gem);
    }
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.07, 12, 40), goldMat);
    halo.position.set(0, 4.82, -0.34);
    g.add(halo);

    // 巍峨挺拔（高达约 6.8 米直冲藻井）
    g.scale.setScalar(1.22);
    g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    return g;
  }

  /* ================= 3. 构建五殿佛像容器并按殿切换 ================= */
  const hallGroups = {};
  const altarY = HALL_Y + 1.35;
  const altarZ = -21.4;

  function makeHallRoot(id) {
    const g = new THREE.Group();
    g.position.set(0, altarY, altarZ);
    g.visible = false;
    scene.add(g);
    hallGroups[id] = g;
    return g;
  }

  // ① 雍和门殿：大肚布袋笑佛
  {
    const g = makeHallRoot('yonghemen');
    g.add(buildLaughingMaitreya());
  }

  // ② 雍和宫殿：三世佛（燃灯佛 · 释迦牟尼佛 · 弥勒佛）
  {
    const g = makeHallRoot('yonghegong');
    const center = buildSeatedBuddha({ mudra: 'earth_bowl', garuda: true });
    center.scale.setScalar(1.42);
    g.add(center);

    const left = buildSeatedBuddha({ mudra: 'dhyana', artifact: 'orb', garuda: false });
    left.scale.setScalar(0.92);
    left.position.set(-3.85, 0, 0);
    g.add(left);

    const right = buildSeatedBuddha({ mudra: 'dharmachakra', garuda: false });
    right.scale.setScalar(0.92);
    right.position.set(3.85, 0, 0);
    g.add(right);
  }

  // ③ 永佑殿：药师佛 · 无量寿佛 · 狮吼佛（木雕三尊）
  {
    const g = makeHallRoot('yongyou');
    const center = buildSeatedBuddha({ mudra: 'dhyana', artifact: 'vase', matMain: sandalwoodGoldMat, matSub: warmBronzeMat });
    center.scale.setScalar(1.36);
    g.add(center);

    const left = buildSeatedBuddha({ mudra: 'dhyana', artifact: 'medicine', matMain: sandalwoodGoldMat, matSub: warmBronzeMat });
    left.scale.setScalar(0.94);
    left.position.set(-3.8, 0, 0);
    g.add(left);

    const right = buildSeatedBuddha({ mudra: 'dharmachakra', matMain: sandalwoodGoldMat, matSub: warmBronzeMat });
    right.scale.setScalar(0.94);
    right.position.set(3.8, 0, 0);
    g.add(right);
  }

  // ④ 法轮殿：宗喀巴大师铜坐像
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
    g.add(master);
  }

  // ⑤ 万福阁：18米白檀木雕弥勒大佛立像
  {
    const g = makeHallRoot('wanfu');
    g.add(buildStandingSandalwoodMaitreya());
  }

  // 隐藏 app.js 原来的通用三尊佛，改由真实五殿佛像组接管（若用户导入了外部 .glb 主佛仍优先展示 .glb）
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

    Object.keys(hallGroups).forEach(k => {
      hallGroups[k].visible = (k === cfg.id);
    });
    setPlaqueText(cfg.plaque);
    if (hallLight) hallLight.intensity = cfg.hallInt;
    if (buddhaSpot) buddhaSpot.intensity = cfg.spotInt;

    // 更新五殿巡拜条与法相铭牌 UI
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

  // 绑定五殿切换按钮
  document.querySelectorAll('.hall-tab').forEach(btn => {
    btn.onclick = () => selectHall(btn.dataset.hall, true);
  });

  // 监测用户是否导入了外部 .glb 主佛（若有则隐藏内置五殿佛像避免重叠）
  api.onTick.push(() => {
    const hasCustomGlb = mainBuddhaSlot && mainBuddhaSlot.glbMount && mainBuddhaSlot.glbMount.children.length > 0;
    if (hallGroups[activeHallId]) {
      hallGroups[activeHallId].visible = !hasCustomGlb;
    }
  });

  // 默认展示雍和宫正殿三世佛
  selectHall('yonghegong', false);
})();
