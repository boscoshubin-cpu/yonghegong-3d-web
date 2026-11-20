'use strict';

(() => {
  const api = window.YHG3D;
  if (!api || typeof THREE === 'undefined') return;

  const {
    scene, player, journal, allOverlays,
    goldMat, antiqueGoldMat, playSound, showToast, spawnZenWord
  } = api;

  /* ================= 1. 五阶打坐禅座成长体系 ================= */
  const CUSHION_TIERS = [
    {
      id: 'straw', level: 1, name: '素麻蒲团', reqSec: 0,
      badge: '初入禅境', swatch: '#b8a078',
      desc: '质朴粗麻手工编织圆蒲团，伴随柔和淡暖定心光环。'
    },
    {
      id: 'brocade', level: 2, name: '朱红织锦拜垫', reqSec: 30,
      badge: '打坐 30 秒解锁', swatch: '#8f241c',
      desc: '雍和宫御制朱红锦缎与金边回纹，静坐时脚下浮现金色法轮光环。'
    },
    {
      id: 'rosewood', level: 3, name: '紫檀雕花法座', reqSec: 120,
      badge: '打坐 2 分钟解锁', swatch: '#4f231e',
      desc: '沉稳紫檀雕花方台配软锦坐垫，入定时檀香金粒子袅袅升腾。'
    },
    {
      id: 'jade_lotus', level: 4, name: '青玉荷莲禅台', reqSec: 300,
      badge: '打坐 5 分钟解锁', swatch: '#5fa395',
      desc: '温润青白玉八瓣立体莲花禅台，花瓣随呼吸节律柔和舒展发光。'
    },
    {
      id: 'gold_lotus', level: 5, name: '九品金莲宝座', reqSec: 600,
      badge: '打坐 10 分钟解锁', swatch: '#eab949',
      desc: '皇家鎏金九瓣双层金莲宝座，环绕双层旋转祥云光轮与流金星点。'
    }
  ];

  const CUSHION_SAVE_KEY = 'yonghegong3d.cushion.v1';
  function loadCushionPrefs() {
    try {
      const raw = JSON.parse(localStorage.getItem(CUSHION_SAVE_KEY) || 'null');
      if (raw && typeof raw === 'object') return raw;
    } catch (e) {}
    return { equipped: null, maxUnlocked: 0, breathOn: true };
  }
  const prefs = loadCushionPrefs();
  function savePrefs() {
    try { localStorage.setItem(CUSHION_SAVE_KEY, JSON.stringify(prefs)); } catch (e) {}
  }

  function getUnlockedIndex(sec) {
    let idx = 0;
    for (let i = 0; i < CUSHION_TIERS.length; i++) {
      if (sec >= CUSHION_TIERS[i].reqSec) idx = i;
    }
    return idx;
  }

  function getEquippedTier() {
    const maxIdx = getUnlockedIndex(journal.sit || 0);
    if (prefs.equipped) {
      const found = CUSHION_TIERS.findIndex(t => t.id === prefs.equipped);
      if (found !== -1 && found <= maxIdx) return CUSHION_TIERS[found];
    }
    return CUSHION_TIERS[maxIdx];
  }

  /* ================= 2. 构建五阶专属 3D 升级禅座 ================= */
  const cushionRoot = new THREE.Group();
  cushionRoot.visible = false;
  scene.add(cushionRoot);

  const tierMeshes = {};
  const animRefs = { jadePetals: [], goldRings: [], particles: [] };

  // Lv.1 素麻蒲团
  {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0xbda478, roughness: 0.92 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.62, 0.14, 24), mat);
    base.position.y = 0.07;
    base.castShadow = true; base.receiveShadow = true;
    g.add(base);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.035, 8, 24), new THREE.MeshStandardMaterial({ color: 0x997d52, roughness: 0.9 }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.13;
    g.add(ring);
    cushionRoot.add(g);
    tierMeshes.straw = g;
  }

  // Lv.2 朱红织锦拜垫
  {
    const g = new THREE.Group();
    const redM = new THREE.MeshStandardMaterial({ color: 0x8f2219, roughness: 0.72 });
    const pad = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.16, 1.18), redM);
    pad.position.y = 0.08;
    pad.castShadow = true; pad.receiveShadow = true;
    g.add(pad);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.05, 1.24), goldMat);
    trim.position.y = 0.03;
    g.add(trim);
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.76, 0.86, 36),
      new THREE.MeshBasicMaterial({ color: 0xf6cf74, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.025;
    g.add(halo);
    animRefs.goldRings.push(halo);
    cushionRoot.add(g);
    tierMeshes.brocade = g;
  }

  // Lv.3 紫檀雕花法座
  {
    const g = new THREE.Group();
    const woodM = new THREE.MeshStandardMaterial({ color: 0x451d18, roughness: 0.45, metalness: 0.12 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.18, 1.36), woodM);
    deck.position.y = 0.09;
    deck.castShadow = true; deck.receiveShadow = true;
    g.add(deck);
    const topPad = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.6, 0.1, 24), new THREE.MeshStandardMaterial({ color: 0xa12b1f, roughness: 0.75 }));
    topPad.position.y = 0.21;
    g.add(topPad);
    for (const sx of [-0.66, 0.66]) {
      for (const sz of [-0.66, 0.66]) {
        const corner = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), goldMat);
        corner.position.set(sx, 0.18, sz);
        g.add(corner);
      }
    }
    cushionRoot.add(g);
    tierMeshes.rosewood = g;
  }

  // Lv.4 青玉荷莲禅台
  {
    const g = new THREE.Group();
    const jadeMat = new THREE.MeshStandardMaterial({
      color: 0x76b8a8, roughness: 0.25, metalness: 0.15,
      emissive: 0x1a4d42, emissiveIntensity: 0.28
    });
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.68, 0.18, 24), jadeMat);
    core.position.y = 0.09;
    core.castShadow = true;
    g.add(core);
    const pGeo = new THREE.SphereGeometry(0.24, 12, 10);
    pGeo.scale(0.86, 1.35, 0.34);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const p = new THREE.Mesh(pGeo, jadeMat);
      p.position.set(Math.cos(a) * 0.64, 0.18, Math.sin(a) * 0.64);
      p.rotation.y = -a + Math.PI / 2;
      p.rotation.x = 0.72;
      g.add(p);
      animRefs.jadePetals.push({ mesh: p, baseX: 0.72 });
    }
    cushionRoot.add(g);
    tierMeshes.jade_lotus = g;
  }

  // Lv.5 九品金莲宝座
  {
    const g = new THREE.Group();
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.76, 0.22, 28), antiqueGoldMat);
    core.position.y = 0.11;
    core.castShadow = true;
    g.add(core);
    const pGeo = new THREE.SphereGeometry(0.25, 12, 10);
    pGeo.scale(0.84, 1.38, 0.34);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const up = new THREE.Mesh(pGeo, goldMat);
      up.position.set(Math.cos(a) * 0.68, 0.24, Math.sin(a) * 0.68);
      up.rotation.y = -a + Math.PI / 2;
      up.rotation.x = 0.64;
      g.add(up);
      const out = new THREE.Mesh(pGeo, antiqueGoldMat);
      out.position.set(Math.cos(a + 0.35) * 0.82, 0.14, Math.sin(a + 0.35) * 0.82);
      out.rotation.y = -(a + 0.35) + Math.PI / 2;
      out.rotation.x = 1.02;
      g.add(out);
    }
    const ring1 = new THREE.Mesh(
      new THREE.RingGeometry(0.95, 1.06, 40),
      new THREE.MeshBasicMaterial({ color: 0xffe494, transparent: true, opacity: 0.68, side: THREE.DoubleSide })
    );
    ring1.rotation.x = -Math.PI / 2;
    ring1.position.y = 0.04;
    g.add(ring1);
    const ring2 = new THREE.Mesh(
      new THREE.RingGeometry(1.22, 1.28, 40),
      new THREE.MeshBasicMaterial({ color: 0xffc852, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
    );
    ring2.rotation.x = -Math.PI / 2;
    ring2.position.y = 0.03;
    g.add(ring2);
    animRefs.goldRings.push(ring1, ring2);
    cushionRoot.add(g);
    tierMeshes.gold_lotus = g;
  }

  // 高阶打坐飘浮金粒子（Lv.3 及以上激活）
  const partGroup = new THREE.Group();
  cushionRoot.add(partGroup);
  const pGeo = new THREE.SphereGeometry(0.035, 6, 6);
  for (let i = 0; i < 16; i++) {
    const pm = new THREE.Mesh(
      pGeo,
      new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffe89e : 0x9ef0de, transparent: true, opacity: 0.7 })
    );
    partGroup.add(pm);
    animRefs.particles.push({ mesh: pm, angle: (i / 16) * Math.PI * 2, phase: i / 16 });
  }

  function applyActiveCushionMesh() {
    const tier = getEquippedTier();
    Object.keys(tierMeshes).forEach(k => {
      tierMeshes[k].visible = (k === tier.id);
    });
    partGroup.visible = tier.level >= 3;
    const hudName = document.getElementById('sit-tier-name');
    if (hudName) hudName.textContent = 'Lv.' + tier.level + ' ' + tier.name;
  }

  /* ================= 3. 禅座图鉴弹窗与打坐实时进度条 ================= */
  const cushionOverlay = document.getElementById('cushion-overlay');
  const sitHud = document.getElementById('sit-hud');
  if (cushionOverlay) {
    allOverlays.push(cushionOverlay);
    cushionOverlay.addEventListener('click', e => { if (e.target === cushionOverlay) cushionOverlay.classList.add('hidden'); });
  }

  function fmtDur(sec) {
    const s = Math.floor(sec || 0);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m > 0 ? (m + '分' + (r < 10 ? '0' : '') + r + '秒') : (r + '秒');
  }

  function renderCushionGallery() {
    const total = journal.sit || 0;
    const maxIdx = getUnlockedIndex(total);
    const equipped = getEquippedTier();
    const sub = document.getElementById('cushion-sub');
    if (sub) sub.textContent = '累计静坐 ' + fmtDur(total) + ' · 已解锁 ' + (maxIdx + 1) + ' / ' + CUSHION_TIERS.length + ' 阶禅座';

    const list = document.getElementById('cushion-list');
    if (!list) return;
    list.replaceChildren();
    CUSHION_TIERS.forEach((tier, i) => {
      const unlocked = i <= maxIdx;
      const isEq = equipped.id === tier.id;
      const pct = tier.reqSec === 0 ? 100 : Math.min(100, Math.round((total / tier.reqSec) * 100));
      const item = document.createElement('div');
      item.className = 'cushion-item' + (isEq ? ' active' : '') + (unlocked ? '' : ' locked');
      item.innerHTML = `
        <div class="c-swatch" style="background:${tier.swatch}">Lv.${tier.level}</div>
        <div class="c-body">
          <div class="c-head">
            <span class="c-name">${tier.name}</span>
            <span class="c-badge">${isEq ? '使用中' : (unlocked ? '已解锁' : tier.badge)}</span>
          </div>
          <div class="c-desc">${tier.desc}</div>
          ${!unlocked ? `<div class="c-bar"><span style="width:${pct}%"></span></div>` : ''}
        </div>
      `;
      item.onclick = () => {
        if (!unlocked) {
          showToast('还需再静坐 ' + fmtDur(tier.reqSec - total) + ' 解锁「' + tier.name + '」');
          return;
        }
        prefs.equipped = tier.id;
        savePrefs();
        applyActiveCushionMesh();
        renderCushionGallery();
        playSound('jade');
        showToast('已换上「' + tier.name + '」禅座');
      };
      list.appendChild(item);
    });
  }

  function openCushionModal() {
    renderCushionGallery();
    if (cushionOverlay) cushionOverlay.classList.remove('hidden');
  }

  const btnCushion = document.getElementById('btn-cushion');
  if (btnCushion) btnCushion.onclick = openCushionModal;
  const closeCushion = document.getElementById('close-cushion');
  if (closeCushion) closeCushion.onclick = () => cushionOverlay.classList.add('hidden');
  const hudOpenBtn = document.getElementById('sit-open-gallery');
  if (hudOpenBtn) hudOpenBtn.onclick = openCushionModal;

  const breathBtn = document.getElementById('sit-breath-toggle');
  const breathBox = document.getElementById('sit-breath-box');
  function syncBreathUI() {
    if (breathBtn) breathBtn.textContent = '呼吸引导：' + (prefs.breathOn ? '开' : '关');
    if (breathBox) breathBox.classList.toggle('hidden', !prefs.breathOn);
  }
  syncBreathUI();
  if (breathBtn) {
    breathBtn.onclick = () => {
      prefs.breathOn = !prefs.breathOn;
      savePrefs();
      syncBreathUI();
    };
  }
  const sitWoodBtn = document.getElementById('sit-tap-wood');
  if (sitWoodBtn) {
    sitWoodBtn.onclick = () => {
      playSound('wood');
      spawnZenWord('wood');
    };
  }
  const sitBellBtn = document.getElementById('sit-tap-bell');
  if (sitBellBtn) {
    sitBellBtn.onclick = () => {
      playSound('bell');
      spawnZenWord('sit');
    };
  }

  /* ================= 4. 主循环：实时升级检测、3D 禅座特效与呼吸引导 ================= */
  let sessionSitSec = 0;
  let lastSaveSec = 0;
  let wasSitting = false;
  let lastMaxUnlocked = getUnlockedIndex(journal.sit || 0);
  prefs.maxUnlocked = Math.max(prefs.maxUnlocked || 0, lastMaxUnlocked);
  applyActiveCushionMesh();

  api.onTick.push((t, dt) => {
    const isSitting = player.pose === 'sit';
    cushionRoot.visible = isSitting;
    if (sitHud) sitHud.classList.toggle('hidden', !isSitting);

    if (isSitting) {
      if (!wasSitting) {
        sessionSitSec = 0;
        applyActiveCushionMesh();
      }
      sessionSitSec += dt;
      cushionRoot.position.set(player.x, player.y - 0.12, player.z);

      // 检测打坐时长是否触发坐垫升级！
      const total = journal.sit || 0;
      const curUnlocked = getUnlockedIndex(total);
      if (curUnlocked > lastMaxUnlocked) {
        lastMaxUnlocked = curUnlocked;
        const newTier = CUSHION_TIERS[curUnlocked];
        prefs.maxUnlocked = curUnlocked;
        prefs.equipped = newTier.id;
        savePrefs();
        applyActiveCushionMesh();
        playSound('bell');
        spawnZenWord('sit');
        showToast('禅定进阶！解锁 Lv.' + newTier.level + '「' + newTier.name + '」', 4200);
        if (cushionOverlay && !cushionOverlay.classList.contains('hidden')) renderCushionGallery();
      }

      // 每 5 秒自动保存打坐时长，防止刷新丢失
      if (total - lastSaveSec >= 5) {
        lastSaveSec = total;
        try { localStorage.setItem('yonghegong3d.journal.v2', JSON.stringify(journal)); } catch (e) {}
      }

      // 更新悬浮进度卡
      const nextTier = CUSHION_TIERS[curUnlocked + 1];
      const timeEl = document.getElementById('sit-timer-txt');
      const nextEl = document.getElementById('sit-next-txt');
      const barEl = document.getElementById('sit-progress-fill');
      if (timeEl) timeEl.textContent = '本次 ' + fmtDur(sessionSitSec) + ' · 累计 ' + fmtDur(total);
      if (nextTier) {
        const prevReq = CUSHION_TIERS[curUnlocked].reqSec;
        const pct = Math.min(100, Math.max(0, ((total - prevReq) / (nextTier.reqSec - prevReq)) * 100));
        if (nextEl) nextEl.textContent = '距「' + nextTier.name + '」还差 ' + fmtDur(Math.max(0, nextTier.reqSec - total));
        if (barEl) barEl.style.width = pct.toFixed(1) + '%';
      } else {
        if (nextEl) nextEl.textContent = '已圆满解锁最高阶「九品金莲宝座」';
        if (barEl) barEl.style.width = '100%';
      }

      // 呼吸引导（10秒一轮：吸4s / 屏2s / 呼4s）
      if (prefs.breathOn) {
        const phase = t % 10;
        const orb = document.getElementById('breath-orb');
        const txt = document.getElementById('breath-txt');
        let scale = 1;
        let label = '缓缓吸气';
        if (phase < 4) {
          scale = 0.72 + (phase / 4) * 0.42;
          label = '缓缓吸气 · ' + Math.ceil(4 - phase) + 's';
        } else if (phase < 6) {
          scale = 1.14;
          label = '静心屏息 · ' + Math.ceil(6 - phase) + 's';
        } else {
          scale = 1.14 - ((phase - 6) / 4) * 0.42;
          label = '舒缓呼气 · ' + Math.ceil(10 - phase) + 's';
        }
        if (orb) orb.style.transform = 'scale(' + scale.toFixed(3) + ')';
        if (txt) txt.textContent = label;
      }

      // 3D 禅座呼吸光效与金粒子
      for (let i = 0; i < animRefs.goldRings.length; i++) {
        animRefs.goldRings[i].rotation.z = t * (i % 2 ? -0.35 : 0.45);
      }
      for (const jp of animRefs.jadePetals) {
        jp.mesh.rotation.x = jp.baseX + Math.sin(t * 1.4) * 0.08;
      }
      if (partGroup.visible) {
        for (const p of animRefs.particles) {
          const f = (t * 0.28 + p.phase) % 1;
          const r = 0.55 + Math.sin(f * Math.PI) * 0.28;
          const a = p.angle + t * 0.4;
          p.mesh.position.set(Math.cos(a) * r, 0.2 + f * 1.75, Math.sin(a) * r);
          p.mesh.material.opacity = Math.sin(f * Math.PI) * 0.78;
        }
      }
    }
    wasSitting = isSitting;
  });
})();
