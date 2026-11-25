'use strict';

(() => {
  // 1. 入宫序幕平滑溶入（点击可立即跳过，绝不阻塞交互）
  const curtain = document.getElementById('intro-curtain');
  if (curtain) {
    const dismiss = () => {
      if (curtain.classList.contains('gone')) return;
      curtain.classList.add('gone');
      setTimeout(() => curtain.remove(), 950);
    };
    curtain.addEventListener('click', dismiss);
    requestAnimationFrame(() => setTimeout(dismiss, 750));
  }

  // 2. 清净模式（隐藏全部 HUD 纯粹赏景 / 礼佛）
  const zenBtn = document.getElementById('btn-zen');
  const zenExitBtn = document.getElementById('btn-zen-exit');
  function setZenMode(on) {
    document.body.classList.toggle('zen-mode', !!on);
    if (window.YHG3D && window.YHG3D.showToast && on) {
      window.YHG3D.showToast('已进入清净赏景模式 · 点右上角或按 H 恢复界面', 2200);
    }
  }
  if (zenBtn) zenBtn.addEventListener('click', () => setZenMode(true));
  if (zenExitBtn) zenExitBtn.addEventListener('click', () => setZenMode(false));

  window.addEventListener('keydown', e => {
    if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (e.key === 'h' || e.key === 'H') {
      setZenMode(!document.body.classList.contains('zen-mode'));
    }
  });

  // 3. 佛祖法相铭牌折叠/展开
  const deityCard = document.querySelector('.deity-card');
  const deityToggle = document.getElementById('deity-toggle');
  if (deityCard && deityToggle) {
    deityToggle.addEventListener('click', () => {
      const collapsed = deityCard.classList.toggle('collapsed');
      deityToggle.textContent = collapsed ? '展开' : '收起';
    });
  }

  // 4. 手机端切换五殿时自动将当前殿名滑入视野中央
  document.querySelectorAll('.hall-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.scrollIntoView) {
        tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });
  });

  // 5. 人物自由行走控制（WASD / 方向键 + Shift 轻跑 + 左下角暗金摇杆与方向键）
  const api = window.YHG3D;
  const moveRing = document.getElementById('move-ring');
  const moveKnob = document.getElementById('move-knob');
  if (api && api.player && api.onTick) {
    const keys = { up: false, down: false, left: false, right: false, shift: false };
    const padVec = { x: 0, z: 0, active: false };
    let manualWalking = false;

    const dirBtns = {
      up: document.querySelector('.move-up'),
      down: document.querySelector('.move-down'),
      left: document.querySelector('.move-left'),
      right: document.querySelector('.move-right')
    };

    function anyModalOpen() {
      return (api.allOverlays || []).some(ov => ov && !ov.classList.contains('hidden'));
    }

    function setKeyState(code, isDown) {
      if (code === 'KeyW' || code === 'ArrowUp') keys.up = isDown;
      else if (code === 'KeyS' || code === 'ArrowDown') keys.down = isDown;
      else if (code === 'KeyA' || code === 'ArrowLeft') keys.left = isDown;
      else if (code === 'KeyD' || code === 'ArrowRight') keys.right = isDown;
      else if (code === 'ShiftLeft' || code === 'ShiftRight') keys.shift = isDown;
      else return false;
      return true;
    }

    window.addEventListener('keydown', e => {
      if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
      if (anyModalOpen()) return;
      if (setKeyState(e.code, true) && e.code.startsWith('Arrow')) e.preventDefault();
    });
    window.addEventListener('keyup', e => { setKeyState(e.code, false); });
    window.addEventListener('blur', () => {
      keys.up = keys.down = keys.left = keys.right = keys.shift = false;
      padVec.x = padVec.z = 0;
      padVec.active = false;
      if (moveKnob) moveKnob.style.transform = 'translate(0px, 0px)';
      if (moveRing) moveRing.classList.remove('active');
    });

    // 摇杆拖拽 + 四向按钮点按（兼容鼠标与触控）
    if (moveRing && moveKnob) {
      let dragId = null;
      const maxR = 26;

      Object.values(dirBtns).forEach(btn => {
        if (!btn) return;
        btn.addEventListener('pointerdown', e => {
          e.stopPropagation();
          padVec.x = parseFloat(btn.dataset.dx || '0');
          padVec.z = parseFloat(btn.dataset.dz || '0');
          padVec.active = true;
          moveKnob.style.transform = `translate(${(padVec.x * maxR * 0.85).toFixed(1)}px, ${(padVec.z * maxR * 0.85).toFixed(1)}px)`;
        });
        const stopDir = e => {
          if (dragId !== null) return;
          e.stopPropagation();
          padVec.x = 0;
          padVec.z = 0;
          padVec.active = false;
          moveKnob.style.transform = 'translate(0px, 0px)';
        };
        btn.addEventListener('pointerup', stopDir);
        btn.addEventListener('pointerleave', stopDir);
        btn.addEventListener('pointercancel', stopDir);
      });

      const updateStick = (clientX, clientY) => {
        const rect = moveRing.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dx = clientX - cx;
        let dy = clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist > maxR) {
          dx = (dx / dist) * maxR;
          dy = (dy / dist) * maxR;
        }
        moveKnob.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
        padVec.x = dist > 5 ? dx / maxR : 0;
        padVec.z = dist > 5 ? dy / maxR : 0;
        padVec.active = dist > 5;
      };

      const resetStick = () => {
        dragId = null;
        padVec.x = 0;
        padVec.z = 0;
        padVec.active = false;
        moveRing.classList.remove('active');
        moveKnob.style.transform = 'translate(0px, 0px)';
      };

      moveRing.addEventListener('pointerdown', e => {
        e.stopPropagation();
        dragId = e.pointerId;
        moveRing.setPointerCapture(e.pointerId);
        moveRing.classList.add('active');
        updateStick(e.clientX, e.clientY);
      });
      moveRing.addEventListener('pointermove', e => {
        if (dragId !== e.pointerId) return;
        e.stopPropagation();
        updateStick(e.clientX, e.clientY);
      });
      moveRing.addEventListener('pointerup', e => {
        if (dragId !== e.pointerId) return;
        e.stopPropagation();
        resetStick();
      });
      moveRing.addEventListener('pointercancel', resetStick);
    }

    api.onTick.push((t, dt) => {
      let ix = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      let iz = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
      if (padVec.active) {
        ix = padVec.x;
        iz = padVec.z;
      }

      if (dirBtns.up) dirBtns.up.classList.toggle('lit', iz < -0.25);
      if (dirBtns.down) dirBtns.down.classList.toggle('lit', iz > 0.25);
      if (dirBtns.left) dirBtns.left.classList.toggle('lit', ix < -0.25);
      if (dirBtns.right) dirBtns.right.classList.toggle('lit', ix > 0.25);

      const mag = Math.hypot(ix, iz);
      if (mag > 0.08 && !anyModalOpen()) {
        const normX = ix / Math.max(1, mag);
        const normZ = iz / Math.max(1, mag);
        const yaw = api.camState ? api.camState.yaw : 0;
        // 相对当前镜头朝向计算世界坐标移动方向
        const cosY = Math.cos(yaw);
        const sinY = Math.sin(yaw);
        const worldDx = normX * cosY + normZ * sinY;
        const worldDz = -normX * sinY + normZ * cosY;

        const speed = (keys.shift ? 6.6 : 4.5) * Math.min(1, mag);
        const p = api.player;
        p.target = null;
        p.poseUntil = 0;
        p.pose = 'walk';
        p.x = Math.max(-22, Math.min(22, p.x + worldDx * speed * dt));
        p.z = Math.max(-19.5, Math.min(24, p.z + worldDz * speed * dt));
        p.y = api.surfaceYAt(p.x, p.z);
        p.rotY = Math.atan2(worldDx, worldDz);

        // 进出大殿时自然切换视角高度
        if (api.camState) {
          const inHall = p.z < -8.2 && Math.abs(p.x) < 13.5;
          if (api.camState.inHallView !== inHall) {
            api.camState.inHallView = inHall;
            const vt = document.getElementById('view-txt');
            if (vt) vt.textContent = inHall ? '出庭院' : '进大殿';
          }
        }

        const hintBar = document.getElementById('hint-bar');
        if (hintBar) hintBar.classList.add('faded');
        manualWalking = true;
      } else if (manualWalking) {
        manualWalking = false;
        if (api.player.pose === 'walk' && !api.player.target) {
          api.player.pose = 'idle';
        }
      }
    });
  }
})();

(() => {
  const portrait = matchMedia('(max-width: 700px) and (orientation: portrait)');
  const menus = [
    [document.getElementById('hall-menu'), document.getElementById('hall-panel'), 'halls'],
    [document.getElementById('tool-menu'), document.getElementById('tool-panel'), 'tools'],
    [document.getElementById('action-menu'), document.querySelector('.hud-dock'), 'actions']
  ];
  const extraTools = ['btn-crowd', 'btn-temple'].map(id => document.getElementById(id));
  const home = document.querySelector('.hud-left');
  function setMenu(name) {
    document.body.dataset.mobileMenu = name;
    for (const [button, , key] of menus) {
      button.setAttribute('aria-expanded', String(name === key));
    }
    menus[2][0].textContent = name === 'actions' ? '收起动作' : '更多动作';
  }
  for (const [button, panel, key] of menus) {
    button.addEventListener('click', () => setMenu(document.body.dataset.mobileMenu === key ? '' : key));
    panel.addEventListener('click', event => {
      const item = event.target.closest('button');
      if (!portrait.matches || !item || item === button) return;
      if (item.matches('.hall-tab')) {
        menus[0][0].textContent = item.textContent.split('·')[0].replace(/^\S+\s+/, '') + ' ▾';
      }
      if (item.id !== 'deity-toggle') setMenu('');
    });
  }
  document.addEventListener('pointerdown', event => {
    if (!menus.some(([button, panel]) => button.contains(event.target) || panel.contains(event.target))) setMenu('');
  });
  document.addEventListener('keydown', event => {
    const active = menus.find(([, , key]) => document.body.dataset.mobileMenu === key);
    if (active && event.key === 'Escape') {
      setMenu('');
      active[0].focus();
    }
  });
  function adapt() {
    setMenu('');
    const parent = portrait.matches ? menus[1][1] : home;
    for (const tool of extraTools) parent.append(tool);
    const selected = document.querySelector('.hall-tab.active');
    if (selected) menus[0][0].textContent = selected.textContent.split('·')[0].replace(/^\S+\s+/, '') + ' ▾';
  }
  portrait.addEventListener('change', adapt);
  adapt();

  // 同步「五殿造像 · 观像模式」底部藏品铭牌标题
  const figSelect = document.getElementById('figure-select');
  const plaqueTitle = document.getElementById('statue-plaque-title');
  const viewStatueBtn = document.getElementById('view-statue');
  function syncStatuePlaque() {
    if (!plaqueTitle) return;
    const activeTab = document.querySelector('.hall-tab.active');
    const hallLabel = activeTab ? activeTab.textContent.split('·')[0].replace(/^\S+\s+/, '').trim() : '雍和宫';
    const figLabel = figSelect && figSelect.options[figSelect.selectedIndex]
      ? figSelect.options[figSelect.selectedIndex].text
      : '主尊造像';
    plaqueTitle.textContent = hallLabel + ' · ' + figLabel;
  }
  if (figSelect) figSelect.addEventListener('change', syncStatuePlaque);
  if (viewStatueBtn) viewStatueBtn.addEventListener('click', syncStatuePlaque);
  document.querySelectorAll('.hall-tab').forEach(tab => {
    tab.addEventListener('click', () => setTimeout(syncStatuePlaque, 0));
  });
  syncStatuePlaque();
})();
