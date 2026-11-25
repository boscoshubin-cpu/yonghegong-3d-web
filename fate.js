'use strict';

(() => {
  const api = window.YHG3D;
  if (!api || typeof THREE === 'undefined') return;

  const {
    scene, clickableProps, player, camState,
    createMonkMesh, animateMonk, walkPlayerTo,
    playSound, showToast, spawnZenWord, surfaceYAt, makeTex, allOverlays
  } = api;

  /* ================= 1. 雍和宫庭院 · 3D 姻缘红绸古树 ================= */
  const TREE_X = -8.4, TREE_Z = 8.4;
  const fateTreeGroup = new THREE.Group();
  fateTreeGroup.position.set(TREE_X, 0, TREE_Z);

  const ribbonTex = makeTex(64, 256, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#a81d16');
    g.addColorStop(0.5, '#d12c22');
    g.addColorStop(1, '#991812');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(246, 210, 122, 0.72)';
    c.lineWidth = 3;
    c.strokeRect(5, 6, w - 10, h - 18);
    c.fillStyle = '#ffe596';
    c.font = 'bold 22px "Songti SC","STSong",serif';
    c.textAlign = 'center';
    const chars = ['良', '缘', '永', '结', '同', '心'];
    for (let i = 0; i < chars.length; i++) {
      c.fillText(chars[i], w / 2, 36 + i * 34);
    }
  });
  const redSilkMat = new THREE.MeshStandardMaterial({ map: ribbonTex, roughness: 0.52, side: THREE.DoubleSide });
  const twinGoldSilkMat = new THREE.MeshStandardMaterial({
    map: ribbonTex,
    color: 0xffd89e, emissive: 0xd4581c, emissiveIntensity: 0.42,
    roughness: 0.32, metalness: 0.22, side: THREE.DoubleSide
  });
  const plaqueTex = makeTex(256, 96, (c, w, h) => {
    c.fillStyle = '#7d1b15';
    c.fillRect(0, 0, w, h);
    c.strokeStyle = '#ecc774';
    c.lineWidth = 6;
    c.strokeRect(6, 6, w - 12, h - 12);
    c.fillStyle = '#ffe8a3';
    c.font = 'bold 38px "Songti SC","STSong",serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('姻 缘 古 树', w / 2, h / 2 + 2);
  });

  // 汉白玉树池围栏
  const curb = new THREE.Mesh(
    new THREE.CylinderGeometry(1.75, 1.88, 0.38, 8),
    new THREE.MeshStandardMaterial({ color: 0xded8cc, roughness: 0.62 })
  );
  curb.position.y = 0.19;
  curb.receiveShadow = true;
  curb.castShadow = true;
  fateTreeGroup.add(curb);

  const trunk = api.garden.addTree(fateTreeGroup, 'red', 1.03);
  trunk.userData.propAction = 'fate';
  clickableProps.push(trunk);
  const crownTarget = new THREE.Mesh(new THREE.SphereGeometry(2.25, 12, 8), new THREE.MeshBasicMaterial({visible:false}));
  crownTarget.scale.set(1.28,.85,1.18);
  crownTarget.position.y = 4.95;
  crownTarget.userData.propAction = 'fate';
  fateTreeGroup.add(crownTarget);
  clickableProps.push(crownTarget);

  // 22 条随风轻晃的祈愿红绸
  const fateRibbons = [];
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    const rad = 1.25 + (i % 3) * 0.42;
    const len = 0.72 + (i % 4) * 0.16;
    const rib = new THREE.Mesh(new THREE.PlaneGeometry(0.11, len), redSilkMat);
    rib.position.set(Math.cos(a) * rad, 3.65 + (i % 3) * 0.35, Math.sin(a) * rad);
    rib.rotation.y = a;
    fateTreeGroup.add(rib);
    fateRibbons.push({ mesh: rib, phase: i * 0.57, baseY: rib.rotation.y });
  }

  // 配对成功时点亮的双人合缘金红丝带 + 暖光
  const twinRibbonGroup = new THREE.Group();
  twinRibbonGroup.visible = false;
  for (const offset of [-0.14, 0.14]) {
    const rMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 1.18), twinGoldSilkMat);
    rMesh.position.set(offset, 3.15, 1.68);
    twinRibbonGroup.add(rMesh);
  }
  const twinLight = new THREE.PointLight(0xff8c66, 1.6, 9);
  twinLight.position.set(0, 3.0, 1.8);
  twinRibbonGroup.add(twinLight);
  fateTreeGroup.add(twinRibbonGroup);

  // 树冠下悬垂的四盏暖红祈缘小宫灯
  const lanternGlowMat = new THREE.MeshStandardMaterial({
    color: 0xffd088, emissive: 0xe64d19, emissiveIntensity: 0.95, roughness: 0.35
  });
  for (const [lx, ly, lz] of [[-1.35, 3.45, 0.95], [1.4, 3.55, 0.85], [-1.1, 3.6, -1.15], [1.25, 3.5, -1.0]]) {
    const lant = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), lanternGlowMat);
    lant.scale.set(1, 1.22, 1);
    lant.position.set(lx, ly, lz);
    fateTreeGroup.add(lant);
  }

  // 树前朱漆「姻缘古树」祈愿木牌挂架（挂满朱金姻缘木牌，可点击求姻缘）
  const rackMat = new THREE.MeshStandardMaterial({ color: 0x7a1c15, roughness: 0.45 });
  for (const px of [0.95, 2.35]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.11, 1.65, 0.11), rackMat);
    post.position.set(px, 0.82, 1.35);
    fateTreeGroup.add(post);
  }
  const topBeam = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.12, 0.16), rackMat);
  topBeam.position.set(1.65, 1.66, 1.35);
  fateTreeGroup.add(topBeam);

  const woodCardMat = new THREE.MeshStandardMaterial({ color: 0xd99b4e, roughness: 0.55 });
  for (let row = 0; row < 2; row++) {
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 8), rackMat);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(1.65, 1.15 - row * 0.34, 1.35);
    fateTreeGroup.add(bar);
    for (let k = 0; k < 5; k++) {
      const card = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.22, 0.025), k % 2 === 0 ? woodCardMat : redSilkMat);
      card.position.set(1.18 + k * 0.23, 1.02 - row * 0.34, 1.35);
      card.rotation.y = (k - 2) * 0.08;
      card.userData.propAction = 'fate';
      fateTreeGroup.add(card);
      clickableProps.push(card);
    }
  }

  const signBoard = new THREE.Mesh(
    new THREE.BoxGeometry(1.18, 0.44, 0.08),
    new THREE.MeshStandardMaterial({ map: plaqueTex, roughness: 0.45 })
  );
  signBoard.position.set(1.65, 1.88, 1.35);
  signBoard.userData.propAction = 'fate';
  fateTreeGroup.add(signBoard);
  clickableProps.push(signBoard);

  scene.add(fateTreeGroup);

  /* ================= 2. 3D 配对有缘人角色 ================= */
  const fatePartner = {
    active: false,
    x: TREE_X + 2.4, z: TREE_Z + 5.5, y: 0.08, rotY: Math.PI,
    pose: 'idle', poseUntil: 0, pulse: 0, target: null,
    mesh: null
  };

  function spawnPartner3D(partner) {
    if (fatePartner.mesh) {
      scene.remove(fatePartner.mesh.root);
      fatePartner.mesh = null;
    }
    const isFemale = partner.gender === '女';
    const robeId = isFemale ? 'crimson' : 'bamboo';
    const label = partner.nickname + ' · ' + partner.city;
    const mesh = createMonkMesh(label, false, robeId, isFemale);
    fatePartner.mesh = mesh;
    fatePartner.active = true;
    fatePartner.x = TREE_X + 3.2;
    fatePartner.z = TREE_Z + 5.8;
    fatePartner.y = surfaceYAt(fatePartner.x, fatePartner.z);
    fatePartner.rotY = Math.PI;
    fatePartner.pose = 'walk';
    fatePartner.target = { x: TREE_X + 1.35, z: TREE_Z + 2.55, finalRotY: -0.42 };
    mesh.root.position.set(fatePartner.x, fatePartner.y, fatePartner.z);
    twinRibbonGroup.visible = true;
  }

  function hidePartner3D() {
    fatePartner.active = false;
    if (fatePartner.mesh) {
      scene.remove(fatePartner.mesh.root);
      fatePartner.mesh = null;
    }
    twinRibbonGroup.visible = false;
  }

  /* ================= 3. 在线求姻缘实时联机 (SSE) + 演示兜底 ================= */
  const FATE_PROFILE_KEY = 'yonghegong3d.fate.profile.v1';
  const uid = 'u_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now().toString(36);
  const canUseServer = location.protocol === 'http:' || location.protocol === 'https:';

  let sse = null;
  let serverOnline = false;
  let fateState = 'form'; // 'form' | 'wait' | 'match'
  let currentMatch = null;
  let demoMode = false;

  const DEMO_POOL = [
    { nickname: '苏晚', gender: '女', city: '北京', hobbies: ['逛展', '咖啡', '摄影', '读书'], wish: '愿遇合拍之人，周末一起逛雍和宫、看展喝咖啡。' },
    { nickname: '林知夏', gender: '女', city: '上海', hobbies: ['咖啡', '电影', '美食', '旅行'], wish: '希望遇到真诚温柔、愿意一起探索城市的人。' },
    { nickname: '沈清川', gender: '男', city: '北京', hobbies: ['徒步', '摄影', '咖啡', '音乐'], wish: '愿得一人心，一起爬山看秋色，三餐四季。' },
    { nickname: '周景行', gender: '男', city: '杭州', hobbies: ['逛展', '读书', '旅行', '健身'], wish: '慢一点也没关系，重要的是同行的人。' },
    { nickname: '许明月', gender: '女', city: '成都', hobbies: ['美食', '音乐', '逛展', '旅行'], wish: '红绸系佳缘，愿今年顺遂又欢喜。' }
  ];

  const fateOverlay = document.getElementById('fate-overlay');
  const formView = document.getElementById('fate-form-view');
  const waitView = document.getElementById('fate-wait-view');
  const matchView = document.getElementById('fate-match-view');
  const floatPill = document.getElementById('fate-float-pill');
  const floatTxt = document.getElementById('fate-float-txt');
  const chatLog = document.getElementById('fate-chat-log');
  if (fateOverlay) {
    allOverlays.push(fateOverlay);
    fateOverlay.addEventListener('click', e => { if (e.target === fateOverlay) fateOverlay.classList.add('hidden'); });
  }

  function loadFateProfile() {
    try {
      const raw = JSON.parse(localStorage.getItem(FATE_PROFILE_KEY) || 'null');
      if (raw && typeof raw === 'object') return raw;
    } catch (e) {}
    return { nickname: '', gender: '男', seekGender: '不限', city: '北京', hobbies: ['逛展', '咖啡'], wish: '' };
  }
  const myProfile = loadFateProfile();

  function saveFateProfile() {
    try { localStorage.setItem(FATE_PROFILE_KEY, JSON.stringify(myProfile)); } catch (e) {}
  }

  // 初始化表单控件
  const nickInput = document.getElementById('fate-nick');
  const cityInput = document.getElementById('fate-city');
  const wishInput = document.getElementById('fate-wish');
  if (nickInput) nickInput.value = myProfile.nickname || '';
  if (cityInput) cityInput.value = myProfile.city || '北京';
  if (wishInput) wishInput.value = myProfile.wish || '';

  function syncSeg(rowId, key) {
    const row = document.getElementById(rowId);
    if (!row) return;
    row.querySelectorAll('.seg-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.val === myProfile[key]);
      btn.onclick = () => {
        myProfile[key] = btn.dataset.val;
        row.querySelectorAll('.seg-btn').forEach(b => b.classList.toggle('active', b === btn));
        saveFateProfile();
      };
    });
  }
  syncSeg('fate-gender-row', 'gender');
  syncSeg('fate-seek-row', 'seekGender');

  const cityChips = document.getElementById('fate-city-chips');
  if (cityChips) {
    cityChips.querySelectorAll('.q-chip').forEach(ch => {
      ch.onclick = () => {
        if (cityInput) cityInput.value = ch.textContent;
        myProfile.city = ch.textContent;
        saveFateProfile();
      };
    });
  }

  const hobbyChips = document.getElementById('fate-hobby-chips');
  if (hobbyChips) {
    hobbyChips.querySelectorAll('.q-chip').forEach(ch => {
      const name = ch.textContent.trim();
      ch.classList.toggle('active', (myProfile.hobbies || []).includes(name));
      ch.onclick = () => {
        const list = myProfile.hobbies || [];
        const idx = list.indexOf(name);
        if (idx !== -1) {
          if (list.length <= 1) { showToast('至少保留 1 项兴趣爱好'); return; }
          list.splice(idx, 1);
          ch.classList.remove('active');
        } else {
          if (list.length >= 4) { showToast('最多选择 4 项兴趣爱好'); return; }
          list.push(name);
          ch.classList.add('active');
        }
        myProfile.hobbies = list;
        saveFateProfile();
      };
    });
  }

  function showFateView(view) {
    fateState = view;
    if (formView) formView.classList.toggle('hidden', view !== 'form');
    if (waitView) waitView.classList.toggle('hidden', view !== 'wait');
    if (matchView) matchView.classList.toggle('hidden', view !== 'match');
    if (floatPill) floatPill.classList.toggle('hidden', view !== 'match');
  }

  function appendChat(type, text) {
    if (!chatLog) return;
    const div = document.createElement('div');
    div.className = 'chat-msg ' + type;
    div.textContent = text;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function renderMatchCard(data) {
    currentMatch = data;
    const p = data.partner;
    const common = data.commonHobbies || [];
    document.getElementById('p-name').textContent = p.nickname;
    document.getElementById('p-meta').textContent = p.gender + ' · ' + p.city + (demoMode ? '（演示有缘人）' : ' · 实时在线');
    document.getElementById('p-score').textContent = '缘分 ' + (data.score || 92) + '%';
    document.getElementById('p-reason').textContent = data.reason || '同刻入雍和宫求缘';
    document.getElementById('p-wish').textContent = '“' + (p.wish || '愿得一人心，白首不相离') + '”';

    const hWrap = document.getElementById('p-hobbies');
    hWrap.replaceChildren();
    (p.hobbies || []).forEach(h => {
      const span = document.createElement('span');
      const isCommon = common.includes(h);
      span.className = 'hobby-tag' + (isCommon ? ' common' : '');
      span.textContent = isCommon ? '★ ' + h : h;
      hWrap.appendChild(span);
    });

    if (floatTxt) floatTxt.textContent = '已结缘：' + p.nickname + '（' + p.city + ' · ' + p.gender + '）';
    chatLog.replaceChildren();
    appendChat('sys', '你们在雍和宫姻缘红绸古树下相遇了，礼貌打个招呼吧');
    showFateView('match');
    spawnPartner3D(p);
    playSound('bell');
    showToast('结缘成功！' + p.nickname + '（' + p.city + '）已来到姻缘古树旁', 3400);
  }

  function connectSse() {
    if (!canUseServer || sse) return;
    try {
      sse = new EventSource('/api/fate/events?uid=' + encodeURIComponent(uid));
      sse.onopen = () => { serverOnline = true; };
      sse.onerror = () => { serverOnline = false; };
      sse.addEventListener('stats', e => {
        try {
          const d = JSON.parse(e.data);
          serverOnline = true;
          const desc = document.getElementById('fate-wait-desc');
          if (desc && fateState === 'wait') {
            desc.textContent = '当前在线 ' + d.online + ' 人 · 寻缘队列 ' + d.waiting + ' 人（另一位在线用户点击求姻缘即可实时配对）';
          }
        } catch (err) {}
      });
      sse.addEventListener('matched', e => {
        try {
          demoMode = false;
          const d = JSON.parse(e.data);
          renderMatchCard(d);
          if (fateOverlay) fateOverlay.classList.remove('hidden');
        } catch (err) {}
      });
      sse.addEventListener('partner_action', e => {
        try {
          const d = JSON.parse(e.data);
          triggerPartnerPose(d.action === 'bow' ? 'bow' : 'hands');
          appendChat('sys', d.from + (d.action === 'bow' ? ' 与你一同行礼祈缘' : ' 与你一同挂上合缘红绸'));
          playSound('bow');
        } catch (err) {}
      });
      sse.addEventListener('chat', e => {
        try {
          const d = JSON.parse(e.data);
          appendChat('peer', d.from + '：' + d.text);
          playSound('jade');
        } catch (err) {}
      });
      sse.addEventListener('partner_left', () => {
        appendChat('sys', '对方已礼貌告别，你可以随时点击「换一位」继续寻缘');
        hidePartner3D();
      });
    } catch (e) {
      serverOnline = false;
    }
  }
  connectSse();

  function triggerPartnerPose(pose) {
    if (!fatePartner.active) return;
    fatePartner.pose = pose;
    fatePartner.pulse = 0.01;
    fatePartner.poseUntil = api.getClockTime() + 2.2;
  }

  function startDemoMatch() {
    demoMode = true;
    const myCity = (myProfile.city || '北京').trim();
    const myHobbies = myProfile.hobbies || [];
    const candidates = DEMO_POOL.filter(c => myProfile.seekGender === '不限' || c.gender === myProfile.seekGender);
    const pool = candidates.length ? candidates : DEMO_POOL;
    let best = pool[Math.floor(Math.random() * pool.length)];
    let bestScore = -1;
    for (const c of pool) {
      const common = c.hobbies.filter(h => myHobbies.includes(h));
      const sc = (c.city === myCity ? 12 : 0) + common.length * 5 + Math.random() * 4;
      if (sc > bestScore) { bestScore = sc; best = c; }
    }
    const common = best.hobbies.filter(h => myHobbies.includes(h));
    const score = Math.min(98, 82 + (best.city === myCity ? 8 : 0) + common.length * 4);
    const reason = (best.city === myCity ? '同在' + best.city : best.city + '有缘人') +
      (common.length ? ' · 共好「' + common.slice(0, 2).join('、') + '」' : ' · 红绸同心');
    renderMatchCard({ roomId: 'demo', partner: best, commonHobbies: common, score, reason });
  }

  async function startFateMatch() {
    myProfile.nickname = (nickInput && nickInput.value.trim()) || '京城有缘人';
    myProfile.city = (cityInput && cityInput.value.trim()) || '北京';
    myProfile.wish = (wishInput && wishInput.value.trim()) || '愿遇合拍之人，四季三餐常相伴';
    saveFateProfile();

    // 玩家走到姻缘红绸古树前
    walkPlayerTo(TREE_X + 0.15, TREE_Z + 2.55, '');
    showFateView('wait');

    if (canUseServer) {
      try {
        const res = await fetch('/api/fate/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid, ...myProfile })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'matched') {
            demoMode = false;
            renderMatchCard(data);
          } else {
            document.getElementById('fate-wait-desc').textContent =
              '当前在线 ' + (data.online || 1) + ' 人 · 寻缘队列 ' + (data.waiting || 1) + ' 人（开另一个窗口点「求姻缘」即可真人实时配对，或先点下方体验）';
          }
          return;
        }
      } catch (e) {}
    }

    document.getElementById('fate-wait-desc').textContent =
      '当前为本地离线打开模式；启动 node web-3d-sansa/server.cjs 后支持多人实时联机配对，现在可先体验演示有缘人。';
  }

  async function leaveFate() {
    hidePartner3D();
    currentMatch = null;
    if (canUseServer && !demoMode) {
      fetch('/api/fate/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid })
      }).catch(() => {});
    }
    showFateView('form');
  }

  function openFateModal() {
    if (fateState === 'match' && currentMatch) showFateView('match');
    else if (fateState === 'wait') showFateView('wait');
    else showFateView('form');
    if (fateOverlay) fateOverlay.classList.remove('hidden');
  }

  // 按钮绑定
  document.getElementById('close-fate').onclick = () => fateOverlay.classList.add('hidden');
  document.getElementById('btn-fate-start').onclick = startFateMatch;
  document.getElementById('btn-fate-demo').onclick = startDemoMatch;
  document.getElementById('btn-fate-cancel').onclick = leaveFate;
  document.getElementById('btn-fate-next').onclick = leaveFate;
  if (floatPill) floatPill.onclick = openFateModal;

  document.getElementById('btn-fate-scene').onclick = () => {
    fateOverlay.classList.add('hidden');
    camState.inHallView = false;
    camState.dist = 9.5;
    camState.pitch = 0.2;
    camState.yaw = 0.35;
    walkPlayerTo(TREE_X - 0.3, TREE_Z + 2.65, '');
    showToast('已拉近至姻缘红绸古树 · 点顶部红绸条可回到对话');
  };

  function doCoRitual(kind) {
    playSound(kind === 'bow' ? 'bow' : 'bell');
    player.pose = kind === 'bow' ? 'bow' : 'hands';
    player.pulse = 0.01;
    player.poseUntil = api.getClockTime() + 2.0;
    triggerPartnerPose(kind === 'bow' ? 'bow' : 'hands');
    spawnZenWord(kind === 'bow' ? 'bow' : 'hands');
    appendChat('sys', kind === 'bow' ? '你发起了「同拜祈缘」' : '你与有缘人共同挂上合缘红绸');
    if (canUseServer && !demoMode) {
      fetch('/api/fate/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, action: kind })
      }).catch(() => {});
    }
  }
  document.getElementById('btn-fate-ribbon').onclick = () => doCoRitual('ribbon');
  document.getElementById('btn-fate-bow').onclick = () => doCoRitual('bow');

  const chatForm = document.getElementById('fate-chat-form');
  const chatInput = document.getElementById('fate-chat-input');
  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', e => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;
      chatInput.value = '';
      appendChat('self', text);
      if (canUseServer && !demoMode) {
        fetch('/api/fate/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid, text })
        }).catch(() => {});
      } else if (demoMode && currentMatch) {
        const p = currentMatch.partner;
        setTimeout(() => {
          const replies = [
            '好巧，我也在' + p.city + '，平时也很喜欢' + (p.hobbies[0] || '逛展') + '！',
            '刚才在红绸树下许愿，没想到真能刷到同频的人～',
            '你也常来雍和宫吗？红墙银杏配红绸真的很有氛围。'
          ];
          appendChat('peer', p.nickname + '：' + replies[Math.floor(Math.random() * replies.length)]);
          playSound('jade');
        }, 700);
      }
    });
  }

  // 接入主场景动作与帧循环
  api.registerAction('fate', () => {
    walkPlayerTo(TREE_X - 0.25, TREE_Z + 2.65, 'fate_arrive');
  });
  api.registerArrival('fate_arrive', () => {
    player.pose = 'hands';
    player.rotY = 0.2;
    player.poseUntil = api.getClockTime() + 1.4;
    playSound('bell');
    openFateModal();
  });

  api.onTick.push((t, dt) => {
    // 红绸随风轻晃
    for (const r of fateRibbons) {
      r.mesh.rotation.z = Math.sin(t * 2.1 + r.phase) * 0.14;
      r.mesh.rotation.x = Math.cos(t * 1.5 + r.phase) * 0.08;
    }
    if (twinRibbonGroup.visible) {
      twinRibbonGroup.rotation.z = Math.sin(t * 2.4) * 0.09;
      twinLight.intensity = 1.4 + Math.sin(t * 3.0) * 0.35;
    }
    // 3D 有缘人走近与动作更新
    if (fatePartner.active && fatePartner.mesh) {
      if (fatePartner.target) {
        const dx = fatePartner.target.x - fatePartner.x;
        const dz = fatePartner.target.z - fatePartner.z;
        const d = Math.hypot(dx, dz);
        const step = 3.2 * dt;
        if (d <= step) {
          fatePartner.x = fatePartner.target.x;
          fatePartner.z = fatePartner.target.z;
          fatePartner.y = surfaceYAt(fatePartner.x, fatePartner.z);
          fatePartner.rotY = fatePartner.target.finalRotY;
          fatePartner.target = null;
          fatePartner.pose = 'hands';
          fatePartner.poseUntil = t + 2.0;
        } else {
          fatePartner.x += dx / d * step;
          fatePartner.z += dz / d * step;
          fatePartner.y = surfaceYAt(fatePartner.x, fatePartner.z);
          fatePartner.rotY = Math.atan2(dx, dz);
        }
      } else if (fatePartner.poseUntil && t >= fatePartner.poseUntil) {
        fatePartner.pose = 'idle';
        fatePartner.poseUntil = 0;
      }
      if (fatePartner.pose === 'bow') fatePartner.pulse = Math.min(1, fatePartner.pulse + dt * 0.65);
      animateMonk(fatePartner, t, dt);
    }
  });
})();
