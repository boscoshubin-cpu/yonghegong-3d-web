'use strict';

(() => {
  const api = window.YHG3D;
  if (!api || typeof THREE === 'undefined') return;
  if (location.protocol !== 'http:' && location.protocol !== 'https:') return;

  const {
    scene, camera, player, journal,
    createMonkMesh, applyRobeToMonk, animateMonk,
    playSound, showToast, surfaceYAt
  } = api;

  /* ================= 1. 玩家实时同屏身份 ================= */
  const WORLD_ID_KEY = 'yonghegong3d.world.identity.v1';
  const POETIC_NAMES = ['清岚', '云舟', '知秋', '疏影', '景明', '听雪', '松风', '竹溪', '南风', '见山', '望舒', '青禾'];

  function loadIdentity() {
    let base = null;
    try { base = JSON.parse(localStorage.getItem(WORLD_ID_KEY) || 'null'); } catch (e) {}
    if (!base || !base.uid) {
      base = {
        uid: 'w_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now().toString(36),
        nickname: POETIC_NAMES[Math.floor(Math.random() * POETIC_NAMES.length)] + Math.floor(10 + Math.random() * 89),
        gender: Math.random() > 0.5 ? '女' : '男'
      };
      try { localStorage.setItem(WORLD_ID_KEY, JSON.stringify(base)); } catch (e) {}
    }
    // 若用户填写过求姻缘名帖，自动沿用真实昵称与性别
    try {
      const fp = JSON.parse(localStorage.getItem('yonghegong3d.fate.profile.v1') || 'null');
      if (fp && fp.nickname) base.nickname = fp.nickname;
      if (fp && (fp.gender === '男' || fp.gender === '女')) base.gender = fp.gender;
    } catch (e) {}
    return base;
  }

  const me = loadIdentity();
  const remotePlayers = new Map(); // uid -> entity
  const remoteHitboxes = [];       // clickable meshes for greeting other live players
  let worldSse = null;
  let currentHall = '大殿一';
  let reconnectTimer = null;

  function updateOnlineBadge(hallCount, totalOnline) {
    const peerEl = document.getElementById('peer-count');
    if (peerEl) {
      peerEl.textContent = hallCount + ' / 50 · 实时同殿';
    }
    const crowdEl = document.getElementById('crowd-txt');
    if (crowdEl && hallCount > 1) {
      crowdEl.textContent = hallCount + '人在线';
    }
  }

  /* ================= 2. 远程真人 3D 角色管理 ================= */
  function spawnRemotePlayer(data) {
    if (!data || !data.uid || data.uid === me.uid) return;
    if (remotePlayers.has(data.uid)) {
      updateRemotePlayer(data);
      return;
    }
    const isFemale = data.gender === '女';
    const mesh = createMonkMesh(data.nickname || '有缘香客', false, data.robe || 'saffron', isFemale);
    const sx = typeof data.x === 'number' ? data.x : 0;
    const sz = typeof data.z === 'number' ? data.z : 10;
    const sy = surfaceYAt(sx, sz);

    // 隐形点击碰撞盒，支持点击场景里其他真人合掌致意
    const hit = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.45, 1.85, 8),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    hit.position.y = 0.92;
    hit.userData.remoteUid = data.uid;
    hit.userData.remoteName = data.nickname || '有缘香客';
    mesh.root.add(hit);
    remoteHitboxes.push(hit);

    const entity = {
      uid: data.uid,
      nickname: data.nickname || '有缘香客',
      robe: data.robe || 'saffron',
      x: sx, z: sz, y: sy,
      targetX: sx, targetZ: sz,
      rotY: typeof data.rotY === 'number' ? data.rotY : Math.PI,
      finalRotY: typeof data.rotY === 'number' ? data.rotY : Math.PI,
      pose: data.pose || 'idle',
      finalPose: data.pose || 'idle',
      pulse: 0,
      mesh,
      hitbox: hit
    };
    mesh.root.position.set(sx, sy, sz);
    mesh.root.rotation.y = entity.rotY;
    remotePlayers.set(data.uid, entity);
  }

  function updateRemotePlayer(data) {
    if (!data || !data.uid || data.uid === me.uid) return;
    let ent = remotePlayers.get(data.uid);
    if (!ent) {
      spawnRemotePlayer(data);
      return;
    }
    if (typeof data.x === 'number') ent.targetX = data.x;
    if (typeof data.z === 'number') ent.targetZ = data.z;
    if (typeof data.rotY === 'number') ent.finalRotY = data.rotY;
    if (data.pose) {
      ent.finalPose = data.pose;
      if (data.pose === 'bow') ent.pulse = 0.01;
    }
    if (data.robe && data.robe !== ent.robe) {
      ent.robe = data.robe;
      applyRobeToMonk(ent.mesh, data.robe);
    }
  }

  function removeRemotePlayer(uid) {
    const ent = remotePlayers.get(uid);
    if (!ent) return;
    scene.remove(ent.mesh.root);
    const hi = remoteHitboxes.indexOf(ent.hitbox);
    if (hi !== -1) remoteHitboxes.splice(hi, 1);
    remotePlayers.delete(uid);
  }

  function clearAllRemotePlayers() {
    for (const uid of Array.from(remotePlayers.keys())) removeRemotePlayer(uid);
  }

  /* ================= 3. 状态上报与 SSE 实时同步 ================= */
  let lastSentKey = '';
  let lastSentAt = 0;

  function sendMyState(force) {
    const gx = player.target ? player.target.x : player.x;
    const gz = player.target ? player.target.z : player.z;
    const key = [
      Math.round(gx * 10), Math.round(gz * 10),
      player.pose, journal.robe, me.nickname
    ].join('|');
    const now = performance.now();
    if (!force && key === lastSentKey) return;
    if (!force && now - lastSentAt < 180) return;
    lastSentKey = key;
    lastSentAt = now;

    fetch('/api/world/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: me.uid,
        nickname: me.nickname,
        gender: me.gender,
        robe: journal.robe,
        x: Number(gx.toFixed(2)),
        z: Number(gz.toFixed(2)),
        rotY: Number(player.rotY.toFixed(2)),
        pose: player.pose
      })
    }).catch(() => {});
  }

  function connectWorld() {
    if (worldSse) {
      try { worldSse.close(); } catch (e) {}
      worldSse = null;
    }
    const qs = new URLSearchParams({
      uid: me.uid,
      nickname: me.nickname,
      gender: me.gender,
      robe: journal.robe || 'saffron',
      x: String(Number(player.x.toFixed(2))),
      z: String(Number(player.z.toFixed(2)))
    });
    const es = new EventSource('/api/world/events?' + qs.toString());
    worldSse = es;

    es.addEventListener('world_init', e => {
      try {
        const d = JSON.parse(e.data);
        currentHall = d.hall || '大殿一';
        clearAllRemotePlayers();
        (d.players || []).forEach(spawnRemotePlayer);
        updateOnlineBadge(d.hallCount || 1, d.totalOnline || 1);
      } catch (err) {}
    });

    es.addEventListener('player_join', e => {
      try {
        const d = JSON.parse(e.data);
        spawnRemotePlayer(d.player);
        updateOnlineBadge(d.hallCount || (remotePlayers.size + 1), d.totalOnline || 1);
        if (d.player && d.player.nickname) {
          showToast('香客「' + d.player.nickname + '」步入雍和宫', 2200);
        }
      } catch (err) {}
    });

    es.addEventListener('player_update', e => {
      try {
        const d = JSON.parse(e.data);
        updateRemotePlayer(d);
      } catch (err) {}
    });

    es.addEventListener('player_leave', e => {
      try {
        const d = JSON.parse(e.data);
        removeRemotePlayer(d.uid);
        updateOnlineBadge(d.hallCount || (remotePlayers.size + 1), d.totalOnline || 1);
      } catch (err) {}
    });

    es.addEventListener('player_greet', e => {
      try {
        const d = JSON.parse(e.data);
        const ent = remotePlayers.get(d.fromUid);
        if (ent) ent.finalPose = 'hands';
        playSound('bow');
        showToast('「' + (d.fromName || '有缘香客') + '」在殿中向你合掌致意', 3000);
      } catch (err) {}
    });

    es.onerror = () => {
      try { es.close(); } catch (err) {}
      if (worldSse === es) worldSse = null;
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connectWorld, 4000);
    };
  }

  connectWorld();

  /* ================= 4. 点击场景内其他真人：合掌致意 ================= */
  const canvas = document.getElementById('webgl');
  const ray = new THREE.Raycaster();
  const pt = new THREE.Vector2();
  let downPos = null;

  if (canvas) {
    canvas.addEventListener('pointerdown', e => {
      if (e.button === 0) downPos = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener('pointerup', e => {
      if (!downPos || !remoteHitboxes.length) return;
      const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
      downPos = null;
      if (dist > 6) return;
      pt.x = (e.clientX / window.innerWidth) * 2 - 1;
      pt.y = -(e.clientY / window.innerHeight) * 2 + 1;
      ray.setFromCamera(pt, camera);
      const hits = ray.intersectObjects(remoteHitboxes, false);
      if (hits.length) {
        const targetUid = hits[0].object.userData.remoteUid;
        const targetName = hits[0].object.userData.remoteName || '有缘香客';
        player.pose = 'hands';
        player.poseUntil = api.getClockTime() + 1.6;
        playSound('bow');
        showToast('已向「' + targetName + '」合掌致意');
        fetch('/api/world/greet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromUid: me.uid, fromName: me.nickname, toUid: targetUid })
        }).catch(() => {});
      }
    });
  }

  /* ================= 5. 每帧平滑移动远程玩家 + 监听本地状态变化 ================= */
  api.onTick.push((t, dt) => {
    sendMyState(false);

    for (const ent of remotePlayers.values()) {
      const dx = ent.targetX - ent.x;
      const dz = ent.targetZ - ent.z;
      const d = Math.hypot(dx, dz);
      const step = 4.4 * dt;
      if (d > step) {
        ent.x += (dx / d) * step;
        ent.z += (dz / d) * step;
        ent.y = surfaceYAt(ent.x, ent.z);
        ent.rotY = Math.atan2(dx, dz);
        ent.pose = 'walk';
      } else {
        ent.x = ent.targetX;
        ent.z = ent.targetZ;
        ent.y = ent.finalPose === 'sit' ? surfaceYAt(ent.x, ent.z) + 0.12 : surfaceYAt(ent.x, ent.z);
        ent.rotY = ent.finalRotY;
        ent.pose = ent.finalPose || 'idle';
      }
      if (ent.pose === 'bow') {
        ent.pulse = Math.min(1, ent.pulse + dt * 0.65);
        if (ent.pulse >= 1) ent.finalPose = 'idle';
      }
      animateMonk(ent, t, dt);
    }
  });
})();
