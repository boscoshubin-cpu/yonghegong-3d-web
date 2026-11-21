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
})();
