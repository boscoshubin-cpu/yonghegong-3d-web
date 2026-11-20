'use strict';

(() => {
  const api = window.YHG3D;
  if (!api || typeof THREE === 'undefined') return;

  const {
    scene, HALL_Y, HALL_Z, mainHallGroup,
    marbleMat, palaceRedMat, pillarRedMat, goldRoofMat, hexieMat, bronzeMat,
    goldMat, antiqueGoldMat, turquoiseMat, lanternLights,
    buildImperialRoof, makeTex, onTick
  } = api;

  /* =========================================================================
   * 北京 · 雍和宫实景建筑精细化增强模块 (architecture.js)
   * 还原真实雍和宫核心规制：
   *  1. 正殿三交六椀菱花隔扇门窗、金龙雀替、殿内彩绘藻井与藏式柱毯
   *  2. 佛前藏传八吉祥供桌（长明酥油灯、七净水碗、景泰蓝花瓶、黄绸绣龙桌围）
   *  3. 丹陛汉白玉须弥座雕栏 + 殿前左右鎏金青铜狮
   *  4. 庭院真实三宝：青铜须弥山、乾隆《喇嘛说》八角重檐御碑亭、双立藏式嘛呢杆经幡
   *  5. 南向「雍和门」三间四柱黄瓦山门与东西钟鼓楼合围（360° 无穿帮实景院落）
   *  6. 东西配殿（讲经殿 / 密宗殿）菱花窗、匾额与藏式彩绘门幔
   * ========================================================================= */

  // 1. 精致程序化纹理：三交六椀菱花隔扇门窗、殿内团龙藻井、藏式香布门幔、御碑四体碑文
  const latticeDoorTex = makeTex(256, 512, (c, w, h) => {
    // 上半菱花隔心（透暖光窗纸 + 朱漆格棂）
    c.fillStyle = '#5c1410';
    c.fillRect(0, 0, w, h);
    c.fillStyle = '#f2dec0';
    c.fillRect(16, 18, w - 32, h * 0.56);
    c.strokeStyle = '#7e1d16';
    c.lineWidth = 4;
    // 三交六椀菱花几何格栅
    for (let y = 36; y < h * 0.56; y += 36) {
      for (let x = 32; x < w - 24; x += 36) {
        c.beginPath();
        c.moveTo(x - 18, y); c.lineTo(x + 18, y);
        c.moveTo(x, y - 18); c.lineTo(x, y + 18);
        c.moveTo(x - 13, y - 13); c.lineTo(x + 13, y + 13);
        c.moveTo(x + 13, y - 13); c.lineTo(x - 13, y + 13);
        c.stroke();
        c.fillStyle = '#d9aa43';
        c.beginPath(); c.arc(x, y, 3.2, 0, Math.PI * 2); c.fill();
      }
    }
    // 隔扇边框与涤环板/裙板
    c.strokeStyle = '#e2b548';
    c.lineWidth = 5;
    c.strokeRect(10, 10, w - 20, h - 20);
    c.fillStyle = '#761b14';
    c.fillRect(14, h * 0.58, w - 28, h * 0.39);
    c.strokeStyle = '#d8a63c';
    c.lineWidth = 3;
    c.strokeRect(24, h * 0.61, w - 48, h * 0.08);
    c.strokeRect(24, h * 0.72, w - 48, h * 0.22);
    // 鎏金铜泡钉
    c.fillStyle = '#f2ca5c';
    for (let r = 0; r < 3; r++) {
      for (let k = 0; k < 4; k++) {
        c.beginPath();
        c.arc(46 + k * 54, h * 0.76 + r * 28, 4.2, 0, Math.PI * 2);
        c.fill();
      }
    }
  });

  const caissonTex = makeTex(512, 512, (c, w, h) => {
    c.fillStyle = '#143344';
    c.fillRect(0, 0, w, h);
    const n = 4, s = w / n;
    for (let r = 0; r < n; r++) {
      for (let col = 0; col < n; col++) {
        const x = col * s, y = r * s;
        c.fillStyle = '#1b4743';
        c.fillRect(x + 6, y + 6, s - 12, s - 12);
        c.strokeStyle = '#e5bc55';
        c.lineWidth = 4;
        c.strokeRect(x + 6, y + 6, s - 12, s - 12);
        c.beginPath();
        c.arc(x + s / 2, y + s / 2, s * 0.3, 0, Math.PI * 2);
        c.stroke();
        c.fillStyle = '#99261b';
        c.beginPath();
        c.arc(x + s / 2, y + s / 2, s * 0.16, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#f5d16c';
        c.beginPath();
        c.arc(x + s / 2, y + s / 2, s * 0.07, 0, Math.PI * 2);
        c.fill();
      }
    }
  }, 4, 2);

  const tibetanCurtainTex = makeTex(256, 256, (c, w, h) => {
    const stripes = ['#9c1e18', '#e2b238', '#1f4e78', '#2a6b48', '#f2e8d2'];
    const sh = h / 5;
    for (let i = 0; i < 5; i++) {
      c.fillStyle = stripes[i];
      c.fillRect(0, i * sh, w, sh);
    }
    c.strokeStyle = '#f2cc62';
    c.lineWidth = 6;
    c.strokeRect(4, 4, w - 8, h - 8);
    // 吉祥云纹
    c.fillStyle = 'rgba(255,232,162,0.55)';
    for (let x = 32; x < w; x += 64) {
      c.beginPath(); c.arc(x, h * 0.1, 12, 0, Math.PI * 2); c.fill();
    }
  });

  const steleTex = makeTex(256, 512, (c, w, h) => {
    c.fillStyle = '#d9d3c5';
    c.fillRect(0, 0, w, h);
    c.strokeStyle = '#948b7a';
    c.lineWidth = 8;
    c.strokeRect(10, 10, w - 20, h - 20);
    c.fillStyle = '#5c5346';
    c.font = 'bold 26px "Songti SC","STSong",serif';
    c.textAlign = 'center';
    c.fillText('御制喇嘛说', w / 2, 54);
    c.fillStyle = 'rgba(85,78,68,0.45)';
    for (let col = 0; col < 9; col++) {
      const x = 34 + col * 23;
      for (let row = 0; row < 24; row++) {
        c.fillRect(x, 80 + row * 16, 11, 9);
      }
    }
  });

  function makeHallPlaqueTex(text, bg) {
    return makeTex(384, 150, (c, w, h) => {
      c.fillStyle = bg || '#162d4f';
      c.fillRect(0, 0, w, h);
      c.strokeStyle = '#e7be56';
      c.lineWidth = 10;
      c.strokeRect(8, 8, w - 16, h - 16);
      c.fillStyle = '#fce295';
      c.font = 'bold 62px "Songti SC","STSong",serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(text, w / 2, h / 2 + 2);
    });
  }

  const latticeDoorMat = new THREE.MeshStandardMaterial({ map: latticeDoorTex, roughness: 0.56 });
  const caissonMat = new THREE.MeshStandardMaterial({ map: caissonTex, roughness: 0.62 });
  const curtainMat = new THREE.MeshStandardMaterial({ map: tibetanCurtainTex, roughness: 0.78, side: THREE.DoubleSide });
  const butterFlameMat = new THREE.MeshBasicMaterial({ color: 0xffd36e });

  /* ================= 1. 正殿真实菱花隔扇、雀替、藻井天花与藏式供桌 ================= */
  // 前檐次间与梢间安装实雕三交六椀菱花隔扇门（明间 [-3.8..3.8] 保持敞开迎客）
  const bayRanges = [[-11.5, -7.6], [-7.6, -3.8], [3.8, 7.6], [7.6, 11.5]];
  for (const [x0, x1] of bayRanges) {
    const bw = x1 - x0 - 0.65;
    const cx = (x0 + x1) / 2;
    const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(bw, 5.1, 0.22), latticeDoorMat);
    doorPanel.position.set(cx, HALL_Y + 2.55, -9.45);
    doorPanel.castShadow = true;
    doorPanel.receiveShadow = true;
    mainHallGroup.add(doorPanel);

    // 上方横披隔扇窗
    const transom = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.85, 0.22), hexieMat);
    transom.position.set(cx, HALL_Y + 5.55, -9.45);
    mainHallGroup.add(transom);
  }

  // 明间敞开的两扇朱漆隔扇大门页（向殿内两侧推开）
  for (const side of [-1, 1]) {
    const openDoor = new THREE.Mesh(new THREE.BoxGeometry(1.55, 5.0, 0.14), latticeDoorMat);
    openDoor.position.set(side * 3.32, HALL_Y + 2.5, -10.15);
    openDoor.rotation.y = side * 1.18;
    openDoor.castShadow = true;
    mainHallGroup.add(openDoor);
  }

  // 正殿前檐柱头金绿雕花雀替
  for (const px of [-11.5, -7.6, -3.8, 3.8, 7.6, 11.5]) {
    for (const dir of [-1, 1]) {
      if ((px === -11.5 && dir === -1) || (px === 11.5 && dir === 1)) continue;
      const queti = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.42, 0.24), goldMat);
      queti.position.set(px + dir * 0.56, HALL_Y + 5.88, -9.4);
      mainHallGroup.add(queti);
    }
  }

  // 正殿内部彩绘团龙藻井天花板
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(23.8, 14.2), caissonMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, HALL_Y + 6.72, HALL_Z);
  mainHallGroup.add(ceiling);

  // 正殿明间檐下悬垂藏式彩绘香布门幔
  const topCurtain = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 1.05), curtainMat);
  topCurtain.position.set(0, HALL_Y + 5.55, -9.32);
  mainHallGroup.add(topCurtain);

  // 佛前供桌藏传八吉祥供器：黄绸绣龙桌围 + 七净水碗 + 酥油长明灯 + 景泰蓝宝瓶
  const altarCloth = new THREE.Mesh(
    new THREE.PlaneGeometry(10.8, 1.25),
    new THREE.MeshStandardMaterial({ color: 0xd49a24, roughness: 0.62, metalness: 0.18 })
  );
  altarCloth.position.set(0, HALL_Y + 0.68, -19.48);
  scene.add(altarCloth);

  const butterFlames = [];
  for (let i = -3; i <= 3; i++) {
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.08, 0.14, 14), goldMat);
    bowl.position.set(i * 0.58, HALL_Y + 1.42, -19.72);
    scene.add(bowl);
  }
  for (const fx of [-2.8, -1.9, 1.9, 2.8]) {
    const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.15, 0.42, 12), goldMat);
    lampStem.position.set(fx, HALL_Y + 1.56, -19.75);
    scene.add(lampStem);
    const lampCup = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.07, 0.16, 14), goldMat);
    lampCup.position.set(fx, HALL_Y + 1.82, -19.75);
    scene.add(lampCup);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.18, 8), butterFlameMat);
    flame.position.set(fx, HALL_Y + 1.98, -19.75);
    scene.add(flame);
    butterFlames.push({ mesh: flame, phase: fx * 1.7 });
  }
  for (const vx of [-4.2, 4.2]) {
    const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.68, 14), turquoiseMat);
    vase.position.set(vx, HALL_Y + 1.69, -19.82);
    scene.add(vase);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 0.26, 12), goldMat);
    neck.position.set(vx, HALL_Y + 2.12, -19.82);
    scene.add(neck);
  }

  /* ================= 2. 殿前丹陛一对鎏金青铜狮 ================= */
  function buildBronzeLion(x, z, side) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = side < 0 ? 0.15 : -0.15;

    // 汉白玉须弥石座
    const ped1 = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.32, 2.2), marbleMat);
    ped1.position.y = 0.16;
    g.add(ped1);
    const waist = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.54, 1.88), marbleMat);
    waist.position.y = 0.59;
    g.add(waist);
    const ped2 = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.24, 2.15), marbleMat);
    ped2.position.y = 0.98;
    g.add(ped2);

    // 蹲坐鎏金铜狮身躯
    const lionMat = antiqueGoldMat;
    const haunch = new THREE.Mesh(new THREE.SphereGeometry(0.46, 16, 14), lionMat);
    haunch.scale.set(1.0, 0.92, 1.22);
    haunch.position.set(0, 1.48, -0.22);
    g.add(haunch);
    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.48, 16, 14), lionMat);
    chest.scale.set(0.96, 1.05, 1.0);
    chest.position.set(0, 1.88, 0.18);
    g.add(chest);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 14), lionMat);
    head.position.set(0, 2.38, 0.34);
    g.add(head);
    // 卷毛鬃毛环
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const curl = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), goldMat);
      curl.position.set(Math.cos(a) * 0.34, 2.36 + Math.sin(a) * 0.22, 0.24);
      g.add(curl);
    }
    for (const px of [-0.26, 0.26]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.72, 10), lionMat);
      leg.position.set(px, 1.44, 0.44);
      g.add(leg);
    }
    // 雄狮踏绣球 / 雌狮抚幼狮
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), goldMat);
    orb.position.set(side < 0 ? 0.24 : -0.24, 1.24, 0.66);
    g.add(orb);

    g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    scene.add(g);
  }
  buildBronzeLion(-5.4, -4.9, -1);
  buildBronzeLion(5.4, -4.9, 1);

  /* ================= 3. 雍和宫真实庭院三宝 ================= */
  // 3A. 青铜须弥山（丹陛前东侧，真实雍和宫名物）
  function buildMountMeru(x, z) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    const octBase = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.65, 0.95, 8), marbleMat);
    octBase.position.y = 0.475;
    g.add(octBase);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(1.56, 1.56, 0.16, 8), marbleMat);
    rim.position.y = 1.02;
    g.add(rim);

    // 青铜层叠须弥山峰（须弥山底座 + 七金山 + 山巅鎏金佛殿）
    const sea = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.32, 0.24, 16), bronzeMat);
    sea.position.y = 1.22;
    g.add(sea);
    const tierRadii = [[0.92, 0.62, 0.68], [0.68, 0.46, 0.58], [0.48, 0.3, 0.48]];
    let yAcc = 1.34;
    for (const [rBot, rTop, h] of tierRadii) {
      const rock = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 9), bronzeMat);
      rock.position.y = yAcc + h / 2;
      rock.rotation.y = yAcc;
      g.add(rock);
      yAcc += h - 0.06;
    }
    const summit = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.34, 6), goldMat);
    summit.position.y = yAcc + 0.18;
    g.add(summit);
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.44, 6), goldMat);
    spire.position.y = yAcc + 0.54;
    g.add(spire);

    g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    scene.add(g);
  }
  buildMountMeru(5.2, -1.6);

  // 3B. 西侧汉白玉八角经幢（与青铜须弥山对称呼应）
  function buildDharaniPillar(x, z) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    const b1 = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.72, 8), marbleMat);
    b1.position.y = 0.36;
    g.add(b1);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.52, 2.25, 8), marbleMat);
    shaft.position.y = 1.84;
    g.add(shaft);
    const cap1 = new THREE.Mesh(new THREE.ConeGeometry(0.96, 0.52, 8), goldRoofMat);
    cap1.position.y = 3.16;
    g.add(cap1);
    const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), goldMat);
    jewel.position.y = 3.55;
    g.add(jewel);
    g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    scene.add(g);
  }
  buildDharaniPillar(-5.2, -1.6);

  // 3C. 藏传佛教双立「嘛呢杆」（朱漆高杆 + 鎏金宝顶 + 五色经幡）
  const maniFlags = [];
  function buildManiPole(x, z) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.72, 0.75, 8), marbleMat);
    base.position.y = 0.375;
    g.add(base);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.18, 10.6, 12), pillarRedMat);
    pole.position.y = 5.65;
    g.add(pole);
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.42, 12), goldMat);
    canopy.position.y = 10.85;
    g.add(canopy);
    const finial = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), goldMat);
    finial.position.y = 11.25;
    g.add(finial);

    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 3.8), curtainMat);
    flag.position.set(x < 0 ? 0.55 : -0.55, 8.2, 0);
    g.add(flag);
    maniFlags.push({ mesh: flag, phase: x * 0.4 });

    g.traverse(m => { if (m.isMesh) m.castShadow = true; });
    scene.add(g);
  }
  buildManiPole(-9.8, -2.6);
  buildManiPole(9.8, -2.6);

  // 3D. 乾隆《喇嘛说》八角重檐黄琉璃瓦御碑亭（中轴南侧 z = 22.0）
  function buildStelePavilion(x, z) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    // 汉白玉八角台基
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3.9, 4.2, 0.72, 8), marbleMat);
    base.position.y = 0.36;
    g.add(base);

    // 8 根朱红檐柱
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 4.4, 12), pillarRedMat);
      col.position.set(Math.cos(a) * 3.15, 0.72 + 2.2, Math.sin(a) * 3.15);
      g.add(col);
    }

    // 亭内《喇嘛说》汉白玉龟趺御碑
    const turtle = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.65, 1.95), marbleMat);
    turtle.position.y = 1.04;
    g.add(turtle);
    const stele = new THREE.Mesh(
      new THREE.BoxGeometry(1.18, 2.75, 0.34),
      new THREE.MeshStandardMaterial({ map: steleTex, roughness: 0.62 })
    );
    stele.position.y = 2.74;
    g.add(stele);
    const steleTop = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.38, 12), marbleMat);
    steleTop.rotation.x = Math.PI / 2;
    steleTop.position.y = 4.18;
    g.add(steleTop);

    // 重檐八角黄琉璃攒尖顶
    const eave1 = new THREE.Mesh(new THREE.ConeGeometry(4.85, 1.55, 8), goldRoofMat);
    eave1.position.y = 5.65;
    eave1.rotation.y = Math.PI / 8;
    g.add(eave1);
    const midDrum = new THREE.Mesh(new THREE.CylinderGeometry(2.55, 2.65, 1.05, 8), palaceRedMat);
    midDrum.position.y = 6.55;
    g.add(midDrum);
    const eave2 = new THREE.Mesh(new THREE.ConeGeometry(3.75, 2.2, 8), goldRoofMat);
    eave2.position.y = 8.15;
    eave2.rotation.y = Math.PI / 8;
    g.add(eave2);
    const topBall = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), goldMat);
    topBall.position.y = 9.42;
    g.add(topBall);

    g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    scene.add(g);
  }
  buildStelePavilion(0, 22.2);

  /* ================= 4. 南向「雍和门」山门殿与东西钟鼓楼合围 ================= */
  function buildSouthGate() {
    const g = new THREE.Group();
    g.position.set(0, 0, 32.5);

    // 两侧朱红高墙合围庭院
    for (const side of [-1, 1]) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(19.5, 4.6, 0.9), palaceRedMat);
      w.position.set(side * 17.8, 2.3, 0);
      g.add(w);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(19.8, 0.48, 1.38), goldRoofMat);
      cap.position.set(side * 17.8, 4.84, 0);
      g.add(cap);
    }

    // 三间四柱黄琉璃瓦雍和门殿
    const gateBase = new THREE.Mesh(new THREE.BoxGeometry(17.5, 0.72, 7.6), marbleMat);
    gateBase.position.y = 0.36;
    g.add(gateBase);

    for (const px of [-7.4, -2.5, 2.5, 7.4]) {
      for (const pz of [-2.8, 2.8]) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 5.2, 14), pillarRedMat);
        col.position.set(px, 0.72 + 2.6, pz);
        g.add(col);
      }
    }
    // 门殿左右实墙（中间留宽阔通道）
    for (const side of [-1, 1]) {
      const sw = new THREE.Mesh(new THREE.BoxGeometry(4.8, 4.8, 4.8), palaceRedMat);
      sw.position.set(side * 5.0, 0.72 + 2.4, 0);
      g.add(sw);
    }
    const gateFrieze = new THREE.Mesh(new THREE.BoxGeometry(16.2, 0.62, 6.2), hexieMat);
    gateFrieze.position.y = 0.72 + 5.1;
    g.add(gateFrieze);

    const gatePlaque = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 1.25, 0.18),
      new THREE.MeshStandardMaterial({ map: makeHallPlaqueTex('雍 和 门'), roughness: 0.45 })
    );
    gatePlaque.position.set(0, 0.72 + 4.45, -3.15);
    g.add(gatePlaque);

    buildImperialRoof(g, 16.4, 6.6, 0.72 + 5.35, false);
    g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    scene.add(g);
  }
  buildSouthGate();

  // 东西钟楼与鼓楼（重檐黄瓦二层楼阁）
  function buildTower(x, z, label) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    const base = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.85, 7.2), marbleMat);
    base.position.y = 0.425;
    g.add(base);
    const floor1 = new THREE.Mesh(new THREE.BoxGeometry(6.0, 4.2, 6.0), palaceRedMat);
    floor1.position.y = 0.85 + 2.1;
    g.add(floor1);
    const frieze = new THREE.Mesh(new THREE.BoxGeometry(6.3, 0.46, 6.3), hexieMat);
    frieze.position.y = 0.85 + 4.25;
    g.add(frieze);
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.82, 0.16),
      new THREE.MeshStandardMaterial({ map: makeHallPlaqueTex(label), roughness: 0.45 })
    );
    sign.position.set(x < 0 ? 3.12 : -3.12, 0.85 + 3.4, 0);
    sign.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
    g.add(sign);
    buildImperialRoof(g, 6.4, 6.4, 0.85 + 4.5, true);
    g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    scene.add(g);
  }
  buildTower(-20.5, 22.8, '鼓  楼');
  buildTower(20.5, 22.8, '钟  楼');

  /* ================= 5. 东西配殿（讲经殿 / 密宗殿）菱花窗、匾额与宫灯 ================= */
  for (const [side, title] of [[-1, '密 宗 殿'], [1, '讲 经 殿']]) {
    const g = new THREE.Group();
    g.position.set(side * 21.5, 0, 4.5);
    g.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;

    for (let i = -2; i <= 2; i++) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(2.1, 3.6, 0.16), latticeDoorMat);
      win.position.set(i * 2.5, 0.9 + 1.85, 3.24);
      g.add(win);
    }
    const sideCurtain = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.78), curtainMat);
    sideCurtain.position.set(0, 0.9 + 3.65, 3.38);
    g.add(sideCurtain);

    const sidePlaque = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 1.0, 0.16),
      new THREE.MeshStandardMaterial({ map: makeHallPlaqueTex(title), roughness: 0.45 })
    );
    sidePlaque.position.set(0, 0.9 + 4.25, 3.42);
    g.add(sidePlaque);

    for (const lx of [-3.6, 3.6]) {
      const lantern = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.2, 0.46, 8),
        new THREE.MeshStandardMaterial({ color: 0xffd785, emissive: 0xe66524, emissiveIntensity: 0.95 })
      );
      lantern.position.set(lx, 0.9 + 3.85, 3.62);
      g.add(lantern);
      const pt = new THREE.PointLight(0xffaa44, 0.3, 12);
      pt.position.set(lx, 0.9 + 3.5, 3.7);
      g.add(pt);
      lanternLights.push(pt);
    }
    scene.add(g);
  }

  /* ================= 6. 乾隆宝鼎青铜三足与浮雕金箍 ================= */
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.72, 10), bronzeMat);
    leg.position.set(Math.cos(a) * 0.85, 1.02, 2.2 + Math.sin(a) * 0.85);
    leg.castShadow = true;
    scene.add(leg);
  }
  const dingBand = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.055, 8, 28), antiqueGoldMat);
  dingBand.rotation.x = Math.PI / 2;
  dingBand.position.set(0, 1.72, 2.2);
  scene.add(dingBand);

  /* ================= 7. 微动态：嘛呢经幡随风轻摆 & 酥油灯火摇曳 ================= */
  onTick.push(t => {
    for (const mf of maniFlags) {
      mf.mesh.rotation.y = Math.sin(t * 1.9 + mf.phase) * 0.22;
      mf.mesh.rotation.z = Math.cos(t * 1.4 + mf.phase) * 0.06;
    }
    for (const bf of butterFlames) {
      const s = 0.88 + Math.sin(t * 7.5 + bf.phase) * 0.16;
      bf.mesh.scale.set(1, s, 1);
    }
  });
})();
