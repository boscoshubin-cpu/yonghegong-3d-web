'use strict';

(() => {
  if (typeof THREE === 'undefined') {
    document.body.innerHTML = '<div style="padding:40px;color:#fbf4e4;text-align:center;font-family:sans-serif;">未能加载 Three.js，请检查网络连接后刷新页面。</div>';
    return;
  }

  /* ================= 1. 雍和宫数据与存档 ================= */
  const SAVE_KEY = 'yonghegong3d.journal.v2';
  const BEAD_MATERIALS = [
    { id: 'ash', name: '香灰琉璃', req: 0, fill: '#b8a992', hi: '#efe5d4', sound: 'jade', hint: '雍和宫经典初缘' },
    { id: 'sandal', name: '老山檀香', req: 18, fill: '#9f653c', hi: '#d9a473', sound: 'bead', hint: '累计 18 颗解锁' },
    { id: 'rosewood', name: '金星紫檀', req: 54, fill: '#5d2624', hi: '#b86c4b', sound: 'bead', hint: '累计 54 颗解锁' },
    { id: 'jade', name: '白玉招财', req: 108, fill: '#dfd8c3', hi: '#ffffff', sound: 'jade', hint: '累计 108 颗解锁' },
    { id: 'agate', name: '南红事业', req: 216, fill: '#b53022', hi: '#ed7d64', sound: 'jade', hint: '累计 216 颗解锁' }
  ];
  const ROBES = [
    { id: 'saffron', name: '素麻立领', req: 0, robe: '#d2cabd', sash: '#8a6b43', hint: '初始拥有' },
    { id: 'crimson', name: '宫红锦衫', req: 12, robe: '#7e2219', sash: '#d8ab4c', hint: '福德 12 解锁' },
    { id: 'ink', name: '松烟墨袍', req: 35, robe: '#2f3a38', sash: '#8b9c8c', hint: '福德 35 解锁' },
    { id: 'bamboo', name: '石青云衫', req: 70, robe: '#2b4352', sash: '#c9b070', hint: '福德 70 解锁' },
    { id: 'gold', name: '明黄福衫', req: 120, robe: '#9e7222', sash: '#ebd082', hint: '福德 120 解锁' }
  ];
  const WISH_LOTS = {
    career: [
      { no: '第廿八签 · 乾宫', rank: '上上签', title: '青云直上', lines: ['大鹏一日同风起，扶摇直上九万里。', '红墙金瓦迎贵气，此番谋事必成蹊。'], decode: '解曰：云开见日，龙入沧海；贵人暗助，所谋皆遂。', advice: '宜：果断推进核心项目、主动展现担当' },
      { no: '第十六签 · 巽宫', rank: '上吉签', title: '贵人扶摇', lines: ['长风破浪会有时，直挂云帆济沧海。', '自有明师兼挚友，一路提携步步高。'], decode: '解曰：东风助力，舟行顺水；良朋引路，前程万里。', advice: '宜：拓展合作人脉、把握晋升窗口' },
      { no: '第卅二签 · 艮宫', rank: '中吉签', title: '厚积薄发', lines: ['宝剑锋从磨砺出，梅花香自苦寒来。', '莫道眼前阶梯陡，登临绝顶见天开。'], decode: '解曰：守正待时，久炼成金；目下勤勉，秋后丰盈。', advice: '宜：沉心打磨作品、稳扎稳打' },
      { no: '第〇九签 · 离宫', rank: '上上签', title: '紫气东来', lines: ['凤鸣朝阳振金羽，九重春色醉仙桃。', '昔日辛勤今得报，名标金阙步步高。'], decode: '解曰：鸿运当头，名利双收；凡事当机，切莫迟疑。', advice: '宜：求职面试、发布新作、签约履新' }
    ],
    wealth: [
      { no: '第〇八签 · 坤宫', rank: '上上签', title: '八方聚财', lines: ['金秋银杏满宫墙，正财偏财共入囊。', '勤勉持家兼有道，源头活水日日长。'], decode: '解曰：财星高照，库廪丰盈；以诚营商，源远流长。', advice: '宜：稳健布局、专注长期高价值赛道' },
      { no: '第廿一签 · 兑宫', rank: '上吉签', title: '利市大开', lines: ['春风得意马蹄疾，商道通明百事宜。', '诚意待人终得报，丰盈喜乐自相随。'], decode: '解曰：和气生财，贵客盈门；积少成多，自见奇功。', advice: '宜：谈成新单、合理规划收支' },
      { no: '第十九签 · 乾宫', rank: '上吉签', title: '金玉满堂', lines: ['宝鼎香烟绕碧空，瑞气千条护华堂。', '耕耘不负四时雨，秋收万斛满仓箱。'], decode: '解曰：正财稳固，小有横财；量入为出，福泽绵长。', advice: '宜：盘点资产、结清尾款、稳步投资' }
    ],
    study: [
      { no: '第〇一签 · 乾宫', rank: '上上签', title: '金榜题名', lines: ['十年寒窗勤伏案，一朝捷报入皇城。', '文昌高照心澄澈，落笔生花万事成。'], decode: '解曰：文曲星明，蟾宫折桂；功不唐捐，金榜高悬。', advice: '宜：查漏补缺、从容赴考' },
      { no: '第十五签 · 坎宫', rank: '上吉签', title: '豁然贯通', lines: ['书山有路勤为径，学海无涯乐作舟。', '静气凝神读一卷，灵光乍现解千忧。'], decode: '解曰：心定神宁，疑云尽散；名师指点，学业精进。', advice: '宜：整理错题笔记、保持规律作息' },
      { no: '第廿四签 · 震宫', rank: '上吉签', title: '鱼跃龙门', lines: ['桃花浪暖禹门开，锦鳞一跃化龙来。', '莫怕考场风浪急，胸藏万卷自成才。'], decode: '解曰：厚积之力，一朝迸发；沉着应战，必获佳音。', advice: '宜：模拟演练、早睡养神、坚定信心' }
    ],
    peace: [
      { no: '第十二签 · 坤宫', rank: '上上签', title: '岁岁安澜', lines: ['红墙之外尘嚣远，香火绵延护此身。', '晨钟暮鼓心常定，四季平安喜乐真。'], decode: '解曰：佛光普照，出入平安；家宅和睦，百福骈臻。', advice: '宜：规律作息、与家人共进晚餐' },
      { no: '第廿七签 · 巽宫', rank: '上吉签', title: '顺遂无忧', lines: ['行到水穷云起处，心安便是福田深。', '凡事宽怀休计较，清风明月照如今。'], decode: '解曰：逢凶化吉，遇难成祥；放下执念，自在清凉。', advice: '宜：放下焦虑、轻装慢行' },
      { no: '第卅六签 · 兑宫', rank: '上上签', title: '福寿康宁', lines: ['宝殿香云护吉人，春风化雨润身心。', '旧疾如霜逢日化，从此康泰百岁春。'], decode: '解曰：药师垂慈，灾消福至；气血调和，喜乐安康。', advice: '宜：早起散步、饮茶静心、笑口常开' }
    ]
  };
  const ZEN_WORDS = {
    hands: ['合十祈愿', '顺遂安康', '善哉'],
    bow: ['礼佛祈福', '事业高升', '福慧双增'],
    wood: ['静', '清', '定', '明', '安'],
    beads: ['十全十美', '招财纳福', '诸事顺遂', '心想事成'],
    sit: ['观心入定', '神清气爽', '慧光常照'],
    wheel: ['转运纳福', '八方来财', '前程似锦', '功德圆满'],
    incense: ['三炷清香', '事业顺遂', '贵人相助'],
    lot: ['灵签初落', '吉运将至']
  };
  // 电影级京城古刹三时天色（通透晴秋金光 / 残阳红墙 / 玄夜宫灯）
  const MOODS = [
    { id: 'day', label: '京秋金昼', skyTop: '#24528a', skyMid: '#72a0cc', skyBot: '#ebd8b7', fog: 0xc8c3b4, fogDensity: 0.0044, sunColor: 0xffebc2, sunInt: 2.35, sunPos: [28, 34, 26], ambSky: 0xc4daf2, ambGnd: 0x5c4636, ambInt: 0.78, hallInt: 3.2, lanternInt: 0.45 },
    { id: 'dusk', label: '斜阳红墙', skyTop: '#1d1c38', skyMid: '#944332', skyBot: '#f09c54', fog: 0x8f503a, fogDensity: 0.0068, sunColor: 0xff893b, sunInt: 2.2, sunPos: [-34, 13, 22], ambSky: 0x9c6658, ambGnd: 0x331d16, ambInt: 0.56, hallInt: 4.0, lanternInt: 1.9 },
    { id: 'night', label: '夜宫灯影', skyTop: '#050a14', skyMid: '#101c30', skyBot: '#1e283b', fog: 0x0d1422, fogDensity: 0.0092, sunColor: 0x8bb4e8, sunInt: 0.62, sunPos: [-22, 34, -24], ambSky: 0x344a6e, ambGnd: 0x18120e, ambInt: 0.42, hallInt: 4.9, lanternInt: 3.0 }
  ];

  function loadJournal() {
    const base = {
      hands: 0, bow: 0, wood: 0, beads: 0, sit: 0, wheel: 0, incense: 0,
      sound: true, mood: 'day', beadMat: 'ash', robe: 'saffron', wishType: 'career'
    };
    try {
      const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (raw && typeof raw === 'object') return Object.assign(base, raw);
    } catch (e) {}
    return base;
  }
  const journal = loadJournal();
  function saveJournal() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(journal)); } catch (e) {}
  }
  function calcMerit() {
    return journal.wood + Math.floor(journal.beads / 3) + journal.bow * 3 + journal.hands * 2 + Math.floor(journal.sit / 5) + journal.wheel * 3 + journal.incense * 5;
  }

  /* ================= 2. 独立交互音效（无自动背景音） ================= */
  const soundExt = { bow: '.wav', sweep: '.wav', incense: '.wav', lot: '.wav', jade: '.wav' };
  const audioBanks = {};
  let audioCtx = null;

  function synthFallback(name) {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const freqMap = { wood: 440, bead: 680, jade: 1850, bow: 528, bell: 320, incense: 392, lot: 820 };
      osc.type = name === 'wood' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freqMap[name] || 520, now);
      osc.frequency.exponentialRampToValueAtTime((freqMap[name] || 520) * 0.72, now + 0.25);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (name === 'bell' || name === 'incense' ? 1.2 : 0.3));
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 1.3);
    } catch (e) {}
  }

  function playSound(name) {
    if (!journal.sound) return;
    if (!audioBanks[name]) {
      const ext = soundExt[name] || '.mp3';
      audioBanks[name] = {
        next: 0,
        clips: Array.from({ length: 3 }, () => {
          const a = new Audio('./assets/' + name + ext);
          a.preload = 'auto';
          return a;
        })
      };
    }
    const bank = audioBanks[name];
    const clip = bank.clips[bank.next++ % bank.clips.length];
    clip.volume = name === 'bell' ? 0.55 : 0.76;
    clip.currentTime = 0;
    const p = clip.play();
    if (p && p.catch) p.catch(() => synthFallback(name));
  }

  /* ================= 3. 写实高精 PBR 程序化纹理 ================= */
  function setTexSRGB(tex) {
    if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    else if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
  }

  function makeTex(w, h, drawFn, rx, ry, isColor) {
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    drawFn(cv.getContext('2d'), w, h);
    const tex = new THREE.CanvasTexture(cv);
    if (isColor !== false) setTexSRGB(tex);
    if (rx || ry) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(rx || 1, ry || 1);
    }
    tex.anisotropy = 8;
    return tex;
  }

  const brickDiffuse = makeTex(512, 512, (c, w, h) => {
    c.fillStyle = '#5f5e59';
    c.fillRect(0, 0, w, h);
    const rows = 8, cols = 8, sw = w / cols, sh = h / rows;
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const seed = (r * 37 + col * 73) % 100;
        const base = 104 + (seed % 26) - 10;
        const warm = (seed % 9) - 4;
        c.fillStyle = `rgb(${base + warm},${base + warm - 1},${base - 4})`;
        c.fillRect(col * sw + 2, r * sh + 2, sw - 4, sh - 4);
        for (let k = 0; k < 28; k++) {
          c.fillStyle = k % 2 ? 'rgba(255,250,240,0.06)' : 'rgba(25,24,20,0.09)';
          const gx = col * sw + 3 + ((seed * 13 + k * 29) % (sw - 6));
          const gy = r * sh + 3 + ((seed * 19 + k * 41) % (sh - 6));
          c.fillRect(gx, gy, 2, 2);
        }
      }
    }
  }, 22, 26);

  const brickBump = makeTex(512, 512, (c, w, h) => {
    c.fillStyle = '#202020';
    c.fillRect(0, 0, w, h);
    const rows = 8, cols = 8, sw = w / cols, sh = h / rows;
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        c.fillStyle = '#d4d4d4';
        c.fillRect(col * sw + 2, r * sh + 2, sw - 4, sh - 4);
      }
    }
  }, 22, 26, false);

  const marbleTex = makeTex(512, 512, (c, w, h) => {
    c.fillStyle = '#ded9cd';
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 45; i++) {
      c.strokeStyle = i % 2 ? 'rgba(175,168,156,0.22)' : 'rgba(250,248,242,0.25)';
      c.lineWidth = 1.5 + (i % 4);
      c.beginPath();
      const y = (i * 19) % h;
      c.moveTo(0, y);
      c.bezierCurveTo(w * 0.3, y + Math.sin(i) * 28, w * 0.7, y - Math.cos(i) * 28, w, y + 12);
      c.stroke();
    }
    c.strokeStyle = 'rgba(120,114,102,0.36)';
    c.lineWidth = 2;
    for (let y = 0; y < h; y += 128) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    for (let x = 0; x < w; x += 256) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
  }, 2, 4);

  const redWallTex = makeTex(512, 512, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#78221b');
    g.addColorStop(0.55, '#86271e');
    g.addColorStop(1, '#631b15');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 3200; i++) {
      c.fillStyle = i % 3 === 0 ? 'rgba(255,220,190,0.035)' : 'rgba(30,8,5,0.06)';
      c.fillRect((i * 83) % w, (i * 151) % h, 2 + (i % 4), 2 + (i % 3));
    }
  }, 3, 1);

  const goldRoofTex = makeTex(512, 512, (c, w, h) => {
    c.fillStyle = '#c48d1d';
    c.fillRect(0, 0, w, h);
    const cols = 16, cw = w / cols;
    for (let i = 0; i < cols; i++) {
      const x = i * cw;
      const g = c.createLinearGradient(x, 0, x + cw, 0);
      g.addColorStop(0, '#7a5009');
      g.addColorStop(0.28, '#d99e26');
      g.addColorStop(0.52, '#f8ce5a');
      g.addColorStop(0.78, '#c28918');
      g.addColorStop(1, '#6c4407');
      c.fillStyle = g;
      c.fillRect(x, 0, cw, h);
    }
    for (let y = 0; y < h; y += 32) {
      c.fillStyle = 'rgba(72,44,6,0.34)';
      c.fillRect(0, y, w, 3);
      c.fillStyle = 'rgba(255,234,156,0.22)';
      c.fillRect(0, y + 3, w, 2);
    }
  }, 14, 5);

  const goldRoofBump = makeTex(512, 512, (c, w, h) => {
    const cols = 16, cw = w / cols;
    for (let i = 0; i < cols; i++) {
      const x = i * cw;
      const g = c.createLinearGradient(x, 0, x + cw, 0);
      g.addColorStop(0, '#222');
      g.addColorStop(0.5, '#fff');
      g.addColorStop(1, '#222');
      c.fillStyle = g;
      c.fillRect(x, 0, cw, h);
    }
  }, 14, 5, false);

  const hexieTex = makeTex(512, 96, (c, w, h) => {
    c.fillStyle = '#183f54';
    c.fillRect(0, 0, w, h);
    c.fillStyle = '#1b5c47';
    c.fillRect(0, 18, w, h - 36);
    c.strokeStyle = '#ebc35b';
    c.lineWidth = 3.5;
    c.strokeRect(4, 6, w - 8, h - 12);
    c.strokeStyle = 'rgba(245,212,118,0.6)';
    c.lineWidth = 1.5;
    c.strokeRect(10, 14, w - 20, h - 28);
    for (let x = 48; x < w; x += 96) {
      c.strokeStyle = '#f2cc68';
      c.lineWidth = 2.4;
      c.beginPath(); c.arc(x, h / 2, 20, 0, Math.PI * 2); c.stroke();
      c.fillStyle = '#99281c';
      c.beginPath(); c.arc(x, h / 2, 10, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#f5d47a';
      c.beginPath(); c.arc(x, h / 2, 4, 0, Math.PI * 2); c.fill();
    }
  }, 6, 1);

  const signTex = makeTex(512, 200, (c, w, h) => {
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
    c.fillText('雍  和  宫', w / 2, h / 2 + 4);
  });

  // 皇家丹陛「海水江崖云龙御路石」浮雕纹理与凹凸贴图
  function drawDragonRampCanvas(c, w, h, isBump) {
    c.fillStyle = isBump ? '#787878' : '#dfd8cb';
    c.fillRect(0, 0, w, h);
    // 汉白玉石材细密颗粒
    if (!isBump) {
      for (let i = 0; i < 900; i++) {
        c.fillStyle = i % 2 ? 'rgba(255,252,245,0.16)' : 'rgba(120,112,98,0.12)';
        c.fillRect((i * 73) % w, (i * 137) % h, 2, 2);
      }
    }
    // 双层卷草回纹边框
    c.strokeStyle = isBump ? '#d8d8d8' : '#9c9282';
    c.lineWidth = 10;
    c.strokeRect(10, 10, w - 20, h - 20);
    c.strokeStyle = isBump ? '#4a4a4a' : '#b8afa0';
    c.lineWidth = 3;
    c.strokeRect(22, 22, w - 44, h - 44);

    // 底部海水江崖（寿山福海波涛纹）
    for (let row = 0; row < 3; row++) {
      const by = h - 32 - row * 22;
      for (let col = 0; col < 5; col++) {
        const bx = 34 + col * 46 + (row % 2) * 20;
        c.fillStyle = isBump ? '#cfcfcf' : '#cfc7b8';
        c.strokeStyle = isBump ? '#ffffff' : '#857b6b';
        c.lineWidth = 2.5;
        c.beginPath();
        c.arc(bx, by, 24, Math.PI, 0);
        c.fill();
        c.stroke();
      }
    }

    // 盘旋升龙躯干（S形龙身 + 龙鳞 + 火焰宝珠 + 祥云）
    c.save();
    c.strokeStyle = isBump ? '#efefef' : '#8c8270';
    c.lineWidth = 22;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(w * 0.5, h - 85);
    c.bezierCurveTo(w * 0.14, h * 0.72, w * 0.86, h * 0.54, w * 0.5, h * 0.38);
    c.bezierCurveTo(w * 0.18, h * 0.24, w * 0.82, h * 0.18, w * 0.5, 92);
    c.stroke();

    c.strokeStyle = isBump ? '#ffffff' : '#f2ece0';
    c.lineWidth = 13;
    c.stroke();

    // 顶部二龙戏珠之火焰宝珠
    c.fillStyle = isBump ? '#ffffff' : '#e8dfd0';
    c.strokeStyle = isBump ? '#dcdcdc' : '#7d7364';
    c.lineWidth = 3;
    c.beginPath();
    c.arc(w * 0.5, 62, 20, 0, Math.PI * 2);
    c.fill();
    c.stroke();

    // 四周浮雕如意祥云
    const clouds = [
      [58, 120], [198, 130], [54, 230], [202, 245],
      [62, 340], [194, 355], [128, 195], [128, 305]
    ];
    for (const [cx, cy] of clouds) {
      c.fillStyle = isBump ? '#e2e2e2' : '#e7e0d2';
      c.strokeStyle = isBump ? '#ffffff' : '#8e8474';
      c.lineWidth = 2.2;
      for (const [ox, oy, r] of [[0, 0, 16], [-13, 6, 11], [13, 6, 11]]) {
        c.beginPath();
        c.arc(cx + ox, cy + oy, r, 0, Math.PI * 2);
        c.fill();
        c.stroke();
      }
    }
    c.restore();
  }

  const dragonRampTex = makeTex(256, 512, (c, w, h) => drawDragonRampCanvas(c, w, h, false));
  const dragonRampBump = makeTex(256, 512, (c, w, h) => drawDragonRampCanvas(c, w, h, true), 1, 1, false);

  // 清代御窑「苏州金砖」殿内地面纹理（深润青黑、细密包浆与金丝砖缝）
  const hallFloorTex = makeTex(512, 512, (c, w, h) => {
    c.fillStyle = '#261b16';
    c.fillRect(0, 0, w, h);
    const n = 4, s = w / n;
    for (let r = 0; r < n; r++) {
      for (let col = 0; col < n; col++) {
        const x = col * s, y = r * s;
        const g = c.createLinearGradient(x, y, x + s, y + s);
        const even = (r + col) % 2 === 0;
        g.addColorStop(0, even ? '#3b281f' : '#35231b');
        g.addColorStop(0.5, even ? '#473126' : '#402c22');
        g.addColorStop(1, even ? '#33221a' : '#2e1e17');
        c.fillStyle = g;
        c.fillRect(x + 2, y + 2, s - 4, s - 4);
        c.strokeStyle = 'rgba(218,178,102,0.12)';
        c.lineWidth = 1;
        c.strokeRect(x + 5, y + 5, s - 10, s - 10);
      }
    }
  }, 8, 5);

  // 藏传转经筒六字真言「嗡嘛呢叭咪吽」鎏金浮雕贴图
  const prayerWheelTex = makeTex(512, 256, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#8c5812');
    g.addColorStop(0.18, '#e3ad3b');
    g.addColorStop(0.5, '#b8291e');
    g.addColorStop(0.82, '#e3ad3b');
    g.addColorStop(1, '#8c5812');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    // 上下仰覆莲瓣纹带
    c.fillStyle = '#f8d36c';
    c.fillRect(0, 26, w, 8);
    c.fillRect(0, h - 34, w, 8);
    for (let x = 16; x < w; x += 32) {
      c.strokeStyle = '#633b05';
      c.lineWidth = 2;
      c.beginPath(); c.arc(x, 14, 12, 0, Math.PI); c.stroke();
      c.beginPath(); c.arc(x, h - 14, 12, Math.PI, Math.PI * 2); c.stroke();
      // 绿松石与珊瑚嵌宝点
      c.fillStyle = (x / 32) % 2 === 0 ? '#2ca6a4' : '#d63e2d';
      c.beginPath(); c.arc(x, 50, 4.5, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(x, h - 50, 4.5, 0, Math.PI * 2); c.fill();
    }
    // 中圈鎏金浮雕六字大明咒
    c.fillStyle = '#ffe58f';
    c.strokeStyle = '#4a120b';
    c.lineWidth = 3;
    c.font = 'bold 56px "Songti SC","STSong",serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    const mantra = ['嗡', '嘛', '呢', '叭', '咪', '吽'];
    for (let i = 0; i < 6; i++) {
      const mx = (i + 0.5) * (w / 6);
      c.strokeText(mantra[i], mx, h / 2 + 2);
      c.fillText(mantra[i], mx, h / 2 + 2);
    }
  });

  // 乾隆青铜宝鼎腹身「鱼龙变化 · 双龙戏珠」古铜浮雕贴图
  const dingReliefTex = makeTex(512, 256, (c, w, h) => {
    c.fillStyle = '#463a29';
    c.fillRect(0, 0, w, h);
    // 雷纹回纹底带
    c.strokeStyle = '#735f42';
    c.lineWidth = 3;
    for (let x = 8; x < w; x += 32) {
      c.strokeRect(x, 16, 22, 22);
      c.strokeRect(x, h - 38, 22, 22);
    }
    // 浮雕云雷纹与兽面夔龙纹
    c.strokeStyle = '#9c8257';
    c.lineWidth = 4;
    for (let x = 42; x < w; x += 85) {
      c.beginPath();
      c.arc(x, h / 2, 28, 0, Math.PI * 2);
      c.stroke();
      c.fillStyle = '#b89860';
      c.beginPath();
      c.arc(x - 10, h / 2 - 4, 4.5, 0, Math.PI * 2);
      c.arc(x + 10, h / 2 - 4, 4.5, 0, Math.PI * 2);
      c.fill();
    }
  });

  // 清代宫廷重彩描金藏传巨幅壁画（支持五殿主题 + 自动加载 assets/mural_main.png 写实高清壁画）
  function drawImperialThangkaMural(c, w, h, opts) {
    const cfg = opts || {};
    const bgTop = cfg.bgTop || '#162842';
    const bgMid = cfg.bgMid || '#5c1914';
    const bgBot = cfg.bgBot || '#24120e';

    // 1. 矿物颜料底色（青金石天穹 + 朱砂红殿堂 + 檀褐地基）
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, bgTop);
    g.addColorStop(0.38, bgMid);
    g.addColorStop(0.82, '#471510');
    g.addColorStop(1, bgBot);
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);

    // 壁画斑驳矿物肌理与金粉星点
    for (let i = 0; i < 2600; i++) {
      const px = (i * 173) % w;
      const py = (i * 251) % h;
      c.fillStyle = i % 5 === 0 ? 'rgba(255, 224, 140, 0.08)' : (i % 2 ? 'rgba(18, 8, 5, 0.09)' : 'rgba(255, 240, 210, 0.035)');
      c.fillRect(px, py, 2 + (i % 3), 2 + (i % 3));
    }

    // 2. 远景青绿山水须弥圣境（孔雀石绿与石青层峦 + 金线勾勒山脊）
    const mountLayers = [
      { yBase: h * 0.72, amp: 58, freq: 0.009, fill: 'rgba(24, 68, 62, 0.55)', stroke: 'rgba(238, 198, 104, 0.45)' },
      { yBase: h * 0.82, amp: 42, freq: 0.014, fill: 'rgba(32, 86, 68, 0.62)', stroke: 'rgba(246, 212, 118, 0.52)' }
    ];
    for (const ml of mountLayers) {
      c.beginPath();
      c.moveTo(0, h);
      for (let x = 0; x <= w; x += 8) {
        const y = ml.yBase - Math.abs(Math.sin(x * ml.freq)) * ml.amp - Math.cos(x * ml.freq * 2.3) * (ml.amp * 0.35);
        c.lineTo(x, y);
      }
      c.lineTo(w, h);
      c.closePath();
      c.fillStyle = ml.fill;
      c.fill();
      c.strokeStyle = ml.stroke;
      c.lineWidth = 2;
      c.stroke();
    }

    // 3. 顶部「千佛金龛带」（藏传寺院壁画经典规制：百尊小金佛端坐莲龛）
    c.fillStyle = 'rgba(22, 11, 9, 0.72)';
    c.fillRect(26, 24, w - 52, 54);
    c.strokeStyle = 'rgba(242, 202, 106, 0.65)';
    c.lineWidth = 2;
    c.strokeRect(26, 24, w - 52, 54);
    for (let x = 52; x < w - 42; x += 38) {
      // 尖拱佛龛
      c.fillStyle = 'rgba(138, 34, 24, 0.75)';
      c.beginPath();
      c.arc(x, 52, 13, Math.PI, 0);
      c.lineTo(x + 13, 72);
      c.lineTo(x - 13, 72);
      c.closePath();
      c.fill();
      c.strokeStyle = 'rgba(245, 208, 115, 0.75)';
      c.lineWidth = 1.4;
      c.stroke();
      // 龛内泥金小坐佛剪影
      c.fillStyle = '#f5cb68';
      c.beginPath(); c.arc(x, 47, 4.2, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(x, 59, 7.5, 6, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#2ca6a4';
      c.fillRect(x - 8, 66, 16, 3);
    }

    // 4. 泥金五彩祥云瑞霭（围绕佛光四周翻涌）
    const cloudCoords = [
      [120, 140, 1], [310, 125, 0.9], [714, 125, 0.9], [904, 140, 1],
      [95, 360, 1.05], [335, 375, 0.88], [689, 375, 0.88], [929, 360, 1.05],
      [255, 240, 0.82], [769, 240, 0.82]
    ];
    for (const [cx, cy, sc] of cloudCoords) {
      c.save();
      c.translate(cx, cy);
      c.scale(sc, sc);
      for (const [ox, oy, r, col] of [
        [-22, 6, 18, 'rgba(34, 96, 108, 0.72)'],
        [22, 6, 18, 'rgba(168, 48, 34, 0.72)'],
        [0, 0, 24, 'rgba(235, 190, 92, 0.35)']
      ]) {
        c.fillStyle = col;
        c.beginPath(); c.arc(ox, oy, r, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#f6d275';
        c.lineWidth = 2.2;
        c.stroke();
      }
      // 祥云拖尾金线
      c.strokeStyle = 'rgba(248, 214, 122, 0.78)';
      c.lineWidth = 2.5;
      c.beginPath();
      c.moveTo(-42, 14);
      c.bezierCurveTo(-18, 26, 18, 26, 46, 10);
      c.stroke();
      c.restore();
    }

    // 5. 藏传重彩描金「六拿具火焰曼荼罗背光坛城」绘制函数
    const drawSacredMandala = (cx, cy, r, isMain) => {
      c.save();
      // 外层佛光放射金晕
      const auraG = c.createRadialGradient(cx, cy, r * 0.15, cx, cy, r * 1.18);
      auraG.addColorStop(0, 'rgba(255, 232, 148, 0.42)');
      auraG.addColorStop(0.55, 'rgba(218, 92, 34, 0.36)');
      auraG.addColorStop(0.85, 'rgba(26, 78, 98, 0.32)');
      auraG.addColorStop(1, 'rgba(26, 12, 10, 0)');
      c.fillStyle = auraG;
      c.beginPath(); c.arc(cx, cy, r * 1.18, 0, Math.PI * 2); c.fill();

      // 外圈熊熊智慧火焰纹环（36 簇金红火舌）
      const flameCnt = isMain ? 40 : 28;
      for (let i = 0; i < flameCnt; i++) {
        const a = (i / flameCnt) * Math.PI * 2;
        const r0 = r * 0.94;
        const r1 = r * (1.12 + (i % 2) * 0.07);
        c.fillStyle = i % 2 === 0 ? 'rgba(232, 84, 34, 0.82)' : 'rgba(246, 196, 78, 0.85)';
        c.beginPath();
        c.moveTo(cx + Math.cos(a - 0.07) * r0, cy + Math.sin(a - 0.07) * r0);
        c.quadraticCurveTo(
          cx + Math.cos(a + 0.04) * ((r0 + r1) * 0.54),
          cy + Math.sin(a + 0.04) * ((r0 + r1) * 0.54),
          cx + Math.cos(a) * r1,
          cy + Math.sin(a) * r1
        );
        c.lineTo(cx + Math.cos(a + 0.07) * r0, cy + Math.sin(a + 0.07) * r0);
        c.closePath();
        c.fill();
      }

      // 五彩同心法界宝轮（青金石蓝 + 孔雀绿 + 朱砂红 + 泥金连珠圈）
      const rings = [
        [0.95, '#173e5e', '#f7d372', 4],
        [0.82, '#1f5e4b', '#f7d372', 3],
        [0.68, '#7a1c15', '#ffe28a', 3.5],
        [0.48, '#2b1612', '#f7d372', 2.5]
      ];
      for (const [ratio, fillCol, strokeCol, lw] of rings) {
        c.fillStyle = fillCol;
        c.beginPath(); c.arc(cx, cy, r * ratio, 0, Math.PI * 2); c.fill();
        c.strokeStyle = strokeCol;
        c.lineWidth = lw;
        c.stroke();
      }

      // 32 瓣重彩仰莲花瓣圈（位于 0.68..0.82 环带之间）
      const petalCnt = isMain ? 32 : 24;
      for (let i = 0; i < petalCnt; i++) {
        const a0 = (i / petalCnt) * Math.PI * 2;
        const a1 = ((i + 0.5) / petalCnt) * Math.PI * 2;
        const a2 = ((i + 1) / petalCnt) * Math.PI * 2;
        c.fillStyle = i % 2 === 0 ? '#d94b34' : '#28827a';
        c.strokeStyle = '#fbe08a';
        c.lineWidth = 1.6;
        c.beginPath();
        c.moveTo(cx + Math.cos(a0) * r * 0.68, cy + Math.sin(a0) * r * 0.68);
        c.quadraticCurveTo(cx + Math.cos(a1) * r * 0.85, cy + Math.sin(a1) * r * 0.85, cx + Math.cos(a2) * r * 0.68, cy + Math.sin(a2) * r * 0.68);
        c.closePath();
        c.fill();
        c.stroke();
      }

      // 细密泥金放射毫光（96 道金丝佛光）
      const rayCnt = isMain ? 72 : 48;
      c.strokeStyle = 'rgba(252, 220, 128, 0.62)';
      c.lineWidth = 1.3;
      for (let i = 0; i < rayCnt; i++) {
        const a = (i / rayCnt) * Math.PI * 2;
        c.beginPath();
        c.moveTo(cx + Math.cos(a) * r * 0.14, cy + Math.sin(a) * r * 0.14);
        c.lineTo(cx + Math.cos(a) * r * 0.67, cy + Math.sin(a) * r * 0.67);
        c.stroke();
      }

      // 连珠纹金钉圈（0.90 半径处）
      c.fillStyle = '#fff0b3';
      const pearlCnt = isMain ? 48 : 32;
      for (let i = 0; i < pearlCnt; i++) {
        const a = (i / pearlCnt) * Math.PI * 2;
        c.beginPath();
        c.arc(cx + Math.cos(a) * r * 0.885, cy + Math.sin(a) * r * 0.885, isMain ? 3.2 : 2.4, 0, Math.PI * 2);
        c.fill();
      }

      // 坛城顶部大鹏金翅鸟（琼鸟）徽印与底部莲台
      if (isMain) {
        c.fillStyle = '#f8d26a';
        c.beginPath();
        c.arc(cx, cy - r * 0.98, 16, 0, Math.PI * 2);
        c.fill();
        c.beginPath();
        c.moveTo(cx - 58, cy - r * 0.92);
        c.quadraticCurveTo(cx, cy - r * 1.12, cx + 58, cy - r * 0.92);
        c.lineWidth = 6;
        c.strokeStyle = '#f8d26a';
        c.stroke();
      }
      c.restore();
    };

    // 绘制中尊大坛城与左右胁侍坛城
    drawSacredMandala(w * 0.5, h * 0.52, 178, true);
    drawSacredMandala(w * 0.185, h * 0.56, 118, false);
    drawSacredMandala(w * 0.815, h * 0.56, 118, false);

    // 6. 四周皇家藏式织锦回纹与忍冬莲花金框
    c.strokeStyle = '#f0c45d';
    c.lineWidth = 12;
    c.strokeRect(10, 10, w - 20, h - 20);
    c.strokeStyle = '#1b4d5c';
    c.lineWidth = 5;
    c.strokeRect(20, 20, w - 40, h - 40);
    c.strokeStyle = 'rgba(252, 224, 138, 0.82)';
    c.lineWidth = 2;
    c.strokeRect(26, 26, w - 52, h - 52);
  }

  const muralTex = makeTex(1024, 512, (c, w, h) => drawImperialThangkaMural(c, w, h));
  const muralBumpTex = makeTex(512, 256, (c, w, h) => {
    drawImperialThangkaMural(c, w, h);
  }, 1, 1, false);

  // 若存在写实高清唐卡壁画图片 assets/mural_main.png，自动加载并融合凹凸质感
  {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const cv = muralTex.image;
      const ctx = cv.getContext('2d');
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
      muralTex.needsUpdate = true;
      const bCv = muralBumpTex.image;
      const bCtx2 = bCv.getContext('2d');
      bCtx2.drawImage(img, 0, 0, bCv.width, bCv.height);
      muralBumpTex.needsUpdate = true;
    };
    img.src = './assets/mural_main.png';
  }

  // 佛衣垂坠褶皱与织金暗纹凹凸贴图（赋予佛像袈裟真实立体衣褶与雕刻光影）
  const buddhaRobeBumpTex = makeTex(512, 512, (c, w, h) => {
    c.fillStyle = '#808080';
    c.fillRect(0, 0, w, h);
    // 垂坠弧形衣纹褶皱
    for (let i = 0; i < 18; i++) {
      const y = (i / 18) * h;
      const g = c.createLinearGradient(0, y, 0, y + h / 18);
      g.addColorStop(0, '#525252');
      g.addColorStop(0.45, '#e6e6e6');
      g.addColorStop(1, '#4a4a4a');
      c.fillStyle = g;
      c.fillRect(0, y, w, h / 18);
    }
    // 藏式织金团莲暗纹
    c.strokeStyle = 'rgba(255,255,255,0.35)';
    c.lineWidth = 3;
    for (let y = 32; y < h; y += 64) {
      for (let x = 32; x < w; x += 64) {
        c.beginPath(); c.arc(x, y, 16, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.arc(x, y, 7, 0, Math.PI * 2); c.stroke();
      }
    }
  }, 3, 3, false);

  // 宫廷泥金造像写实佛颜贴图（配合 3D 雕塑眉弓/眼睑/高鼻/慈唇/螺发，呈现庄严立体光影）
  const buddhaFaceTex = makeTex(512, 512, (c, w, h) => {
    const g = c.createRadialGradient(w * 0.5, h * 0.46, 24, w * 0.5, h * 0.5, w * 0.56);
    g.addColorStop(0, '#ffe694');
    g.addColorStop(0.48, '#ebb946');
    g.addColorStop(0.78, '#c99224');
    g.addColorStop(1, '#8f5e0d');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);

    // 眼窝、鼻翼两侧与面颊柔和立体晕染
    for (const sx of [-1, 1]) {
      const ex = w * (0.5 + sx * 0.088);
      const eg = c.createRadialGradient(ex, h * 0.465, 4, ex, h * 0.465, 42);
      eg.addColorStop(0, 'rgba(110, 64, 10, 0.36)');
      eg.addColorStop(1, 'rgba(110, 64, 10, 0)');
      c.fillStyle = eg;
      c.beginPath(); c.arc(ex, h * 0.465, 42, 0, Math.PI * 2); c.fill();
    }

    // 藏传泥金开脸：修长柳叶弯眉（石青底线 + 泥金描边）
    c.lineCap = 'round';
    for (const sx of [-1, 1]) {
      c.strokeStyle = '#2d1c0a';
      c.lineWidth = 6.5;
      c.beginPath();
      c.moveTo(w * (0.5 + sx * 0.024), h * 0.405);
      c.quadraticCurveTo(w * (0.5 + sx * 0.09), h * 0.352, w * (0.5 + sx * 0.165), h * 0.408);
      c.stroke();
    }

    // 眉间白毫相（珍珠光泽 + 金圈）
    const ug = c.createRadialGradient(w * 0.498, h * 0.382, 1, w * 0.5, h * 0.385, 9);
    ug.addColorStop(0, '#ffffff');
    ug.addColorStop(0.7, '#ffe8a8');
    ug.addColorStop(1, '#9c6510');
    c.fillStyle = ug;
    c.beginPath(); c.arc(w * 0.5, h * 0.385, 8.5, 0, Math.PI * 2); c.fill();

    // 慈悲半垂瑞凤佛眼（二分之一微睁俯视众生：含眼白、青黑瞳仁、金线重睑）
    for (const sx of [-1, 1]) {
      const cx = w * (0.5 + sx * 0.088);
      const cy = h * 0.472;
      // 重睑折线
      c.strokeStyle = 'rgba(92, 52, 8, 0.65)';
      c.lineWidth = 2.5;
      c.beginPath();
      c.moveTo(cx - sx * 26, cy - 8);
      c.quadraticCurveTo(cx, cy - 19, cx + sx * 30, cy - 6);
      c.stroke();

      // 半垂眼裂（瓷白眼白 + 深邃青黑牟尼珠瞳仁）
      c.save();
      c.beginPath();
      c.moveTo(cx - 28, cy);
      c.quadraticCurveTo(cx, cy - 8, cx + 28, cy);
      c.quadraticCurveTo(cx, cy + 13, cx - 28, cy);
      c.closePath();
      c.fillStyle = '#f8f2e4';
      c.fill();
      c.clip();
      c.fillStyle = '#1d242b';
      c.beginPath(); c.arc(cx, cy - 1, 9.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#fff6d6';
      c.beginPath(); c.arc(cx - 3, cy - 2, 2.4, 0, Math.PI * 2); c.fill();
      c.restore();

      // 上下眼线
      c.strokeStyle = '#261607';
      c.lineWidth = 4.2;
      c.beginPath();
      c.moveTo(cx - 29, cy);
      c.quadraticCurveTo(cx, cy - 8, cx + 30, cy + 1);
      c.stroke();
      c.strokeStyle = 'rgba(78, 45, 10, 0.72)';
      c.lineWidth = 2.2;
      c.beginPath();
      c.moveTo(cx - 26, cy + 1);
      c.quadraticCurveTo(cx, cy + 12, cx + 26, cy + 1);
      c.stroke();
    }

    // 鼻梁高光与鼻翼阴影
    const ng = c.createLinearGradient(w * 0.475, 0, w * 0.525, 0);
    ng.addColorStop(0, 'rgba(110, 68, 12, 0.35)');
    ng.addColorStop(0.5, 'rgba(255, 246, 200, 0.65)');
    ng.addColorStop(1, 'rgba(110, 68, 12, 0.38)');
    c.fillStyle = ng;
    c.fillRect(w * 0.482, h * 0.41, w * 0.036, h * 0.165);

    // 饱满朱砂仰月佛唇（上下唇瓣 + 嘴角微扬慈悲笑意）
    const ly = h * 0.642;
    const lipG = c.createLinearGradient(0, ly - 14, 0, ly + 18);
    lipG.addColorStop(0, '#c43e2b');
    lipG.addColorStop(0.5, '#962719');
    lipG.addColorStop(1, '#d6533e');
    c.fillStyle = lipG;
    c.beginPath();
    c.moveTo(w * 0.432, ly);
    c.quadraticCurveTo(w * 0.475, ly - 13, w * 0.5, ly - 8);
    c.quadraticCurveTo(w * 0.525, ly - 13, w * 0.568, ly);
    c.quadraticCurveTo(w * 0.5, ly + 19, w * 0.432, ly);
    c.closePath();
    c.fill();
    c.strokeStyle = '#5e1a0d';
    c.lineWidth = 2.2;
    c.beginPath();
    c.moveTo(w * 0.428, ly - 1);
    c.quadraticCurveTo(w * 0.5, ly + 4, w * 0.572, ly - 1);
    c.stroke();
  });

  // 写实真人面部与亚麻棉织纹理（默认人物用）
  const humanFaceTex = makeTex(512, 512, (c, w, h) => {
    const g = c.createRadialGradient(w * 0.5, h * 0.46, 20, w * 0.5, h * 0.5, w * 0.55);
    g.addColorStop(0, '#f2cdb0');
    g.addColorStop(0.7, '#dfb18d');
    g.addColorStop(1, '#c5926e');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(210,122,102,0.16)';
    c.beginPath(); c.arc(w * 0.37, h * 0.55, 34, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(w * 0.63, h * 0.55, 34, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#36271e';
    c.lineWidth = 6;
    c.lineCap = 'round';
    c.beginPath(); c.moveTo(w * 0.35, h * 0.42); c.quadraticCurveTo(w * 0.42, h * 0.395, w * 0.47, h * 0.42); c.stroke();
    c.beginPath(); c.moveTo(w * 0.53, h * 0.42); c.quadraticCurveTo(w * 0.58, h * 0.395, w * 0.65, h * 0.42); c.stroke();
    for (const ex of [w * 0.415, w * 0.585]) {
      c.fillStyle = '#fcf8f2';
      c.beginPath(); c.ellipse(ex, h * 0.48, 22, 11, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#2d2018';
      c.beginPath(); c.arc(ex, h * 0.48, 9, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#ffffff';
      c.beginPath(); c.arc(ex - 3, h * 0.472, 2.5, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#3b2920';
      c.lineWidth = 3;
      c.beginPath(); c.arc(ex, h * 0.485, 20, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
    }
    c.strokeStyle = 'rgba(138,94,68,0.42)';
    c.lineWidth = 3.5;
    c.beginPath(); c.moveTo(w * 0.5, h * 0.45); c.lineTo(w * 0.495, h * 0.56); c.quadraticCurveTo(w * 0.5, h * 0.58, w * 0.52, h * 0.565); c.stroke();
    c.fillStyle = '#b9695b';
    c.beginPath();
    c.moveTo(w * 0.44, h * 0.65);
    c.quadraticCurveTo(w * 0.5, h * 0.635, w * 0.56, h * 0.65);
    c.quadraticCurveTo(w * 0.5, h * 0.685, w * 0.44, h * 0.65);
    c.fill();
  });

  const linenTex = makeTex(256, 256, (c, w, h) => {
    c.fillStyle = '#e6e2da';
    c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 3) {
      c.fillStyle = y % 6 === 0 ? 'rgba(0,0,0,0.045)' : 'rgba(255,255,255,0.04)';
      c.fillRect(0, y, w, 1);
    }
    for (let x = 0; x < w; x += 3) {
      c.fillStyle = x % 6 === 0 ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)';
      c.fillRect(x, 0, 1, h);
    }
  }, 4, 4);

  function makeFoliageTex(colors) {
    return makeTex(256, 256, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      for (let i = 0; i < 95; i++) {
        const a = (i * 2.39996);
        const rad = Math.sqrt(i / 95) * 96;
        const x = w / 2 + Math.cos(a) * rad;
        const y = h / 2 + Math.sin(a) * rad;
        c.save();
        c.translate(x, y);
        c.rotate(a + i);
        c.fillStyle = colors[i % colors.length];
        c.beginPath();
        c.ellipse(0, 0, 18 + (i % 9), 11 + (i % 6), 0, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    });
  }
  const ginkgoLeafTex = makeFoliageTex(['#e6b32e', '#d69d1e', '#f2c84b', '#c98e18', '#ecc142']);
  const cypressLeafTex = makeFoliageTex(['#27422a', '#1e3621', '#315034', '#223b25', '#375838']);

  function makeNameSprite(label, isSelf) {
    const tex = makeTex(256, 64, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      const x = 22, y = 14, rw = w - 44, rh = h - 28, r = 18;
      c.fillStyle = isSelf ? 'rgba(255, 249, 236, 0.92)' : 'rgba(244, 239, 228, 0.82)';
      c.beginPath();
      c.moveTo(x + r, y); c.lineTo(x + rw - r, y); c.quadraticCurveTo(x + rw, y, x + rw, y + r);
      c.lineTo(x + rw, y + rh - r); c.quadraticCurveTo(x + rw, y + rh, x + rw - r, y + rh);
      c.lineTo(x + r, y + rh); c.quadraticCurveTo(x, y + rh, x, y + rh - r);
      c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
      c.fill();
      c.strokeStyle = isSelf ? 'rgba(176, 52, 36, 0.82)' : 'rgba(148, 122, 86, 0.45)';
      c.lineWidth = 2;
      c.stroke();
      c.fillStyle = isSelf ? '#661a12' : '#433228';
      c.font = 'bold 21px "PingFang SC","Songti SC",sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(label, w / 2, h / 2 + 1);
    });
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sp = new THREE.Sprite(mat);
    sp.scale.set(1.55, 0.38, 1);
    sp.position.y = 2.15;
    return sp;
  }

  /* ================= 4. Three.js 场景、物理金属环境反射 (IBL) 与光影 ================= */
  const canvas = document.getElementById('webgl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  if ('outputEncoding' in renderer && THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.2, 260);

  // 生成暖金大殿环境贴图 (IBL)，让鎏金大佛和导入的 .glb 写实金属/人物拥有真实高光反射
  try {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x3a2a1e);
    const panelGeo = new THREE.PlaneGeometry(14, 14);
    const panels = [
      { pos: [0, 10, 0], rot: [Math.PI / 2, 0, 0], col: 0xffe8b8, int: 2.2 },
      { pos: [12, 4, 8], rot: [0, -Math.PI / 2, 0], col: 0xffd280, int: 2.6 },
      { pos: [-12, 5, 6], rot: [0, Math.PI / 2, 0], col: 0xd9e8ff, int: 1.5 },
      { pos: [0, 3, 14], rot: [0, Math.PI, 0], col: 0xffefc8, int: 1.9 },
      { pos: [0, -8, 0], rot: [-Math.PI / 2, 0, 0], col: 0x5c3622, int: 0.9 }
    ];
    for (const p of panels) {
      const m = new THREE.Mesh(panelGeo, new THREE.MeshBasicMaterial({ color: p.col }));
      m.position.set(p.pos[0], p.pos[1], p.pos[2]);
      m.rotation.set(p.rot[0], p.rot[1], p.rot[2]);
      m.scale.setScalar(p.int * 0.55);
      envScene.add(m);
    }
    scene.environment = pmrem.fromScene(envScene, 0.04).texture;
    pmrem.dispose();
  } catch (e) {}

  const skyDome = new THREE.Mesh(
    new THREE.SphereGeometry(130, 32, 20),
    new THREE.MeshBasicMaterial({ side: THREE.BackSide, depthWrite: false })
  );
  scene.add(skyDome);

  const moonMesh = new THREE.Mesh(
    new THREE.SphereGeometry(3.4, 18, 16),
    new THREE.MeshBasicMaterial({ color: 0xfef4d8 })
  );
  moonMesh.position.set(-34, 46, -78);
  moonMesh.visible = false;
  scene.add(moonMesh);

  const ambLight = new THREE.HemisphereLight(0xc9d9e8, 0x5c4a3c, 0.72);
  scene.add(ambLight);

  const sunLight = new THREE.DirectionalLight(0xfff1d2, 1.85);
  sunLight.position.set(26, 36, 28);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.near = 4;
  sunLight.shadow.camera.far = 115;
  sunLight.shadow.camera.left = -40;
  sunLight.shadow.camera.right = 40;
  sunLight.shadow.camera.top = 40;
  sunLight.shadow.camera.bottom = -40;
  sunLight.shadow.bias = -0.0004;
  scene.add(sunLight);

  const hallLight = new THREE.PointLight(0xffcf72, 2.6, 32, 1.2);
  hallLight.position.set(0, 6.4, -16.5);
  scene.add(hallLight);

  const buddhaSpot = new THREE.SpotLight(0xffe4a0, 3.2, 26, Math.PI / 4, 0.55, 1.1);
  buddhaSpot.position.set(0, 8.6, -15.2);
  buddhaSpot.target.position.set(0, 4.2, -21.4);
  scene.add(buddhaSpot);
  scene.add(buddhaSpot.target);

  const lanternLights = [];

  /* ================= 5. 宏伟写实雍和宫中轴大院（约 56m x 68m） ================= */
  const clickableGround = [];
  const clickableProps = [];

  const marbleMat = new THREE.MeshStandardMaterial({ map: marbleTex, roughness: 0.58, metalness: 0.04 });
  const palaceRedMat = new THREE.MeshStandardMaterial({ map: redWallTex, roughness: 0.72, metalness: 0.04 });
  const pillarRedMat = new THREE.MeshStandardMaterial({ color: 0x841e16, roughness: 0.26, metalness: 0.14 });
  const goldRoofMat = new THREE.MeshStandardMaterial({
    map: goldRoofTex, bumpMap: goldRoofBump, bumpScale: 0.11,
    roughness: 0.2, metalness: 0.48
  });
  const hexieMat = new THREE.MeshStandardMaterial({ map: hexieTex, roughness: 0.58 });
  const darkEaveMat = new THREE.MeshStandardMaterial({ color: 0x1b3d3c, roughness: 0.7 });

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(140, 140),
    new THREE.MeshStandardMaterial({ map: brickDiffuse, bumpMap: brickBump, bumpScale: 0.04, roughness: 0.88 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.userData.walkSurface = 'courtyard';
  scene.add(ground);
  clickableGround.push(ground);

  const walkway = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.1, 34), marbleMat);
  walkway.position.set(0, 0.05, 11.5);
  walkway.receiveShadow = true;
  walkway.userData.walkSurface = 'courtyard';
  scene.add(walkway);
  clickableGround.push(walkway);

  // 真实清代官式反宇起翘黄琉璃瓦屋面（歇山/庑殿曲线坡面 + 翼角飞檐 + 斗拱 + 螭吻 + 脊兽）
  function makeCurvedRoofMesh(botW, botD, topW, topD, height, cornerLift) {
    const segX = 18, segY = 10;
    const geo = new THREE.BufferGeometry();
    const positions = [];
    const uvs = [];
    const indices = [];
    const sideSpecs = [
      { a0: [-botW / 2, botD / 2], a1: [botW / 2, botD / 2], b0: [-topW / 2, topD / 2], b1: [topW / 2, topD / 2] },
      { a0: [botW / 2, -botD / 2], a1: [-botW / 2, -botD / 2], b0: [topW / 2, -topD / 2], b1: [-topW / 2, -topD / 2] },
      { a0: [botW / 2, botD / 2], a1: [botW / 2, -botD / 2], b0: [topW / 2, topD / 2], b1: [topW / 2, -topD / 2] },
      { a0: [-botW / 2, -botD / 2], a1: [-botW / 2, botD / 2], b0: [-topW / 2, -topD / 2], b1: [-topW / 2, topD / 2] }
    ];
    let vertOffset = 0;
    for (const s of sideSpecs) {
      for (let iy = 0; iy <= segY; iy++) {
        const v = iy / segY;
        const curveY = height * (0.28 * v + 0.72 * v * v);
        const insetT = Math.pow(v, 0.92);
        for (let ix = 0; ix <= segX; ix++) {
          const u = ix / segX;
          const bx = s.a0[0] + (s.a1[0] - s.a0[0]) * u;
          const bz = s.a0[1] + (s.a1[1] - s.a0[1]) * u;
          const tx = s.b0[0] + (s.b1[0] - s.b0[0]) * u;
          const tz = s.b0[1] + (s.b1[1] - s.b0[1]) * u;
          let px = bx + (tx - bx) * insetT;
          let pz = bz + (tz - bz) * insetT;
          const edgeDist = Math.abs(u * 2 - 1);
          const lift = cornerLift * Math.pow(edgeDist, 3.2) * Math.pow(1 - v, 1.85);
          const flare = 1 + 0.045 * Math.pow(edgeDist, 3.0) * (1 - v);
          px *= flare;
          pz *= flare;
          positions.push(px, curveY + lift, pz);
          uvs.push(u * Math.max(1, Math.hypot(s.a1[0] - s.a0[0], s.a1[1] - s.a0[1]) / 12), v);
        }
      }
      for (let iy = 0; iy < segY; iy++) {
        for (let ix = 0; ix < segX; ix++) {
          const a = vertOffset + iy * (segX + 1) + ix;
          const b = a + 1;
          const c = a + (segX + 1);
          const d = c + 1;
          indices.push(a, b, d, a, d, c);
        }
      }
      vertOffset += (segX + 1) * (segY + 1);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, goldRoofMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  const ridgeGoldMat = new THREE.MeshStandardMaterial({ color: 0xeab93b, metalness: 0.55, roughness: 0.28 });
  const dgGreenMat = new THREE.MeshStandardMaterial({ color: 0x1d544c, roughness: 0.55 });
  const dgBlueMat = new THREE.MeshStandardMaterial({ color: 0x183d59, roughness: 0.55 });

  function addDougongRow(parent, width, depth, yPos) {
    const count = Math.max(4, Math.floor(width / 1.25));
    for (let i = 0; i <= count; i++) {
      const bx = -width / 2 + (width / count) * i;
      for (const sz of [depth / 2 + 0.48, -(depth / 2 + 0.48)]) {
        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.42), dgBlueMat);
        cap.position.set(bx, yPos - 0.14, sz * 0.96);
        parent.add(cap);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.22, 0.88), dgGreenMat);
        arm.position.set(bx, yPos + 0.08, sz);
        parent.add(arm);
      }
    }
  }

  function addCornerBeasts(parent, botW, botD, topW, topD, baseY, height, cornerLift) {
    const corners = [[-1, 1], [1, 1], [-1, -1], [1, -1]];
    for (const [sx, sz] of corners) {
      const p0 = new THREE.Vector3(sx * botW * 0.52, baseY + cornerLift * 0.92, sz * botD * 0.52);
      const p1 = new THREE.Vector3(sx * topW * 0.5, baseY + height, sz * topD * 0.5);
      const dist = p0.distanceTo(p1);
      const hip = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, dist), ridgeGoldMat);
      hip.position.copy(p0).lerp(p1, 0.5);
      hip.lookAt(p1);
      parent.add(hip);
      for (let k = 0; k < 5; k++) {
        const t = 0.04 + k * 0.055;
        const bp = new THREE.Vector3().lerpVectors(p0, p1, t);
        const beast = new THREE.Mesh(new THREE.ConeGeometry(0.11, k === 0 ? 0.46 : 0.3, 6), ridgeGoldMat);
        beast.position.set(bp.x, bp.y + (k === 0 ? 0.22 : 0.15), bp.z);
        parent.add(beast);
      }
    }
  }

  function buildImperialRoof(parent, width, depth, baseY, doubleEave) {
    const g = new THREE.Group();
    g.position.y = baseY;

    const eaveUnder = new THREE.Mesh(new THREE.BoxGeometry(width + 2.8, 0.38, depth + 2.6), darkEaveMat);
    eaveUnder.position.y = 0.2;
    eaveUnder.castShadow = true;
    g.add(eaveUnder);

    const dripFront = new THREE.Mesh(new THREE.BoxGeometry(width + 3.4, 0.16, 0.22), ridgeGoldMat);
    dripFront.position.set(0, 0.42, (depth + 3.0) / 2);
    g.add(dripFront);

    addDougongRow(g, width, depth, 0.08);

    const botW1 = width + 3.4, botD1 = depth + 3.2;
    const h1 = doubleEave ? 2.15 : 3.25;
    const topW1 = doubleEave ? width * 0.78 : width * 0.46;
    const topD1 = doubleEave ? depth * 0.76 : 0.42;
    const r1 = makeCurvedRoofMesh(botW1, botD1, topW1, topD1, h1, doubleEave ? 0.68 : 0.72);
    r1.position.y = 0.36;
    g.add(r1);
    addCornerBeasts(g, botW1, botD1, topW1, topD1, 0.36, h1, doubleEave ? 0.68 : 0.72);

    let topY = 0.36 + h1;
    let ridgeLen = topW1;

    if (doubleEave) {
      const midBand = new THREE.Mesh(new THREE.BoxGeometry(width * 0.76, 1.38, depth * 0.74), palaceRedMat);
      midBand.position.y = topY + 0.62;
      midBand.castShadow = true;
      g.add(midBand);

      const midFrieze = new THREE.Mesh(new THREE.BoxGeometry(width * 0.79, 0.44, depth * 0.77), hexieMat);
      midFrieze.position.y = topY + 1.32;
      g.add(midFrieze);

      addDougongRow(g, width * 0.74, depth * 0.72, topY + 1.48);

      const botW2 = width * 0.88 + 2.2, botD2 = depth * 0.86 + 2.0;
      const topW2 = width * 0.48, topD2 = 0.42;
      const h2 = 3.2;
      const r2 = makeCurvedRoofMesh(botW2, botD2, topW2, topD2, h2, 0.82);
      r2.position.y = topY + 1.56;
      g.add(r2);
      addCornerBeasts(g, botW2, botD2, topW2, topD2, topY + 1.56, h2, 0.82);
      topY = topY + 1.56 + h2;
      ridgeLen = topW2;
    }

    const ridge = new THREE.Mesh(new THREE.BoxGeometry(ridgeLen + 0.4, 0.56, 0.44), ridgeGoldMat);
    ridge.position.y = topY + 0.22;
    g.add(ridge);
    for (const sx of [-1, 1]) {
      const chiwen = new THREE.Group();
      chiwen.position.set(sx * (ridgeLen / 2 + 0.12), topY + 0.26, 0);
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.92, 0.48), ridgeGoldMat);
      body.position.y = 0.46;
      chiwen.add(body);
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.72, 6), ridgeGoldMat);
      tail.position.set(sx * 0.16, 1.05, 0);
      tail.rotation.z = -sx * 0.35;
      chiwen.add(tail);
      const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), ridgeGoldMat);
      jewel.position.set(-sx * 0.22, 0.88, 0);
      chiwen.add(jewel);
      g.add(chiwen);
    }
    parent.add(g);
  }

  const HALL_Y = 1.65;
  const HALL_Z = -16.5;

  const baseLower = new THREE.Mesh(new THREE.BoxGeometry(31.5, 0.85, 19.5), marbleMat);
  baseLower.position.set(0, 0.425, HALL_Z);
  baseLower.receiveShadow = true;
  baseLower.castShadow = true;
  scene.add(baseLower);

  const baseUpper = new THREE.Mesh(new THREE.BoxGeometry(29.2, 0.8, 17.6), marbleMat);
  baseUpper.position.set(0, 1.25, HALL_Z);
  baseUpper.receiveShadow = true;
  baseUpper.castShadow = true;
  scene.add(baseUpper);

  for (let i = 0; i < 8; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.21, 0.52), marbleMat);
    step.position.set(0, 0.105 + i * 0.205, -4.4 - i * 0.45);
    step.receiveShadow = true;
    step.castShadow = true;
    scene.add(step);
  }
  const dragonRamp = new THREE.Mesh(
    new THREE.BoxGeometry(2.38, 0.24, 4.18),
    new THREE.MeshStandardMaterial({
      map: dragonRampTex,
      bumpMap: dragonRampBump,
      bumpScale: 0.08,
      roughness: 0.48
    })
  );
  dragonRamp.position.set(0, 0.92, -5.95);
  dragonRamp.rotation.x = 0.42;
  dragonRamp.castShadow = true;
  dragonRamp.receiveShadow = true;
  scene.add(dragonRamp);

  // 丹陛踏跺两侧垂带石、斜栏板与望柱（还原皇家御路三出陛规制）
  for (const sx of [-4.2, -1.28, 1.28, 4.2]) {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.34, 4.28), marbleMat);
    curb.position.set(sx, 0.92, -5.95);
    curb.rotation.x = 0.42;
    curb.castShadow = true;
    curb.receiveShadow = true;
    scene.add(curb);
  }
  for (const sx of [-4.2, 4.2]) {
    const slopeRail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.58, 4.15), marbleMat);
    slopeRail.position.set(sx, 1.32, -5.95);
    slopeRail.rotation.x = 0.42;
    slopeRail.castShadow = true;
    scene.add(slopeRail);
    const footPost = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.05, 0.28), marbleMat);
    footPost.position.set(sx, 0.52, -4.08);
    footPost.castShadow = true;
    scene.add(footPost);
    const footLotus = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), marbleMat);
    footLotus.scale.set(0.9, 1.25, 0.9);
    footLotus.position.set(sx, 1.12, -4.08);
    scene.add(footLotus);
  }

  // 台基前檐与两侧汉白玉雕花勾栏、望柱与排水螭首（龙头吐水构件）
  for (const bx of [-14.2, -11.4, -8.6, -5.8, -4.2, 4.2, 5.8, 8.6, 11.4, 14.2]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.12, 0.28), marbleMat);
    post.position.set(bx, HALL_Y + 0.56, -7.85);
    post.castShadow = true;
    scene.add(post);
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.08, 10), marbleMat);
    collar.position.set(bx, HALL_Y + 1.14, -7.85);
    scene.add(collar);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), marbleMat);
    ball.scale.set(0.92, 1.25, 0.92);
    ball.position.set(bx, HALL_Y + 1.28, -7.85);
    scene.add(ball);
  }
  for (const [rx, rw] of [[-9.2, 10.0], [9.2, 10.0]]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(rw, 0.68, 0.15), marbleMat);
    rail.position.set(rx, HALL_Y + 0.42, -7.85);
    rail.castShadow = true;
    scene.add(rail);
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(rw, 0.12, 0.22), marbleMat);
    topBar.position.set(rx, HALL_Y + 0.82, -7.85);
    scene.add(topBar);
  }
  // 台基东西两侧护栏
  for (const side of [-1, 1]) {
    const sx = side * 14.2;
    const sRail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.68, 16.8), marbleMat);
    sRail.position.set(sx, HALL_Y + 0.42, HALL_Z);
    scene.add(sRail);
    for (let pz = -10.6; pz >= -24.6; pz -= 3.5) {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(0.26, 1.1, 0.26), marbleMat);
      sp.position.set(sx, HALL_Y + 0.55, pz);
      scene.add(sp);
    }
  }
  // 须弥座汉白玉排水螭首（台基前侧 6 尊）
  for (const cx of [-14.2, -10.0, -5.8, 5.8, 10.0, 14.2]) {
    const chishou = new THREE.Group();
    chishou.position.set(cx, HALL_Y - 0.14, -7.65);
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.24, 0.55), marbleMat);
    neck.position.z = 0.22;
    chishou.add(neck);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.28, 0.32), marbleMat);
    head.position.set(0, 0.04, 0.48);
    chishou.add(head);
    scene.add(chishou);
  }

  const hallFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(25.6, 14.6),
    new THREE.MeshStandardMaterial({ map: hallFloorTex, roughness: 0.36, metalness: 0.14 })
  );
  hallFloor.rotation.x = -Math.PI / 2;
  hallFloor.position.set(0, HALL_Y + 0.015, HALL_Z);
  hallFloor.receiveShadow = true;
  hallFloor.userData.walkSurface = 'hall';
  scene.add(hallFloor);
  clickableGround.push(hallFloor);

  const mainHallGroup = new THREE.Group();
  const frontXs = [-11.5, -7.6, -3.8, 3.8, 7.6, 11.5];
  for (const px of frontXs) {
    for (const pz of [-9.4, -23.6]) {
      const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.54, 0.34, 14), marbleMat);
      plinth.position.set(px, HALL_Y + 0.17, pz);
      mainHallGroup.add(plinth);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 6.6, 18), pillarRedMat);
      col.position.set(px, HALL_Y + 3.6, pz);
      col.castShadow = true;
      col.receiveShadow = true;
      mainHallGroup.add(col);
    }
  }
  for (const side of [-11.5, 11.5]) {
    const midCol = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 6.6, 18), pillarRedMat);
    midCol.position.set(side, HALL_Y + 3.6, HALL_Z);
    midCol.castShadow = true;
    mainHallGroup.add(midCol);
  }

  const frontFrieze = new THREE.Mesh(new THREE.BoxGeometry(24.6, 0.72, 0.45), hexieMat);
  frontFrieze.position.set(0, HALL_Y + 6.45, -9.4);
  mainHallGroup.add(frontFrieze);

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(24.4, 6.8, 0.45), palaceRedMat);
  backWall.position.set(0, HALL_Y + 3.4, -23.8);
  backWall.receiveShadow = true;
  mainHallGroup.add(backWall);

  const mural = new THREE.Mesh(
    new THREE.PlaneGeometry(18.5, 5.8),
    new THREE.MeshStandardMaterial({ map: muralTex, roughness: 0.58 })
  );
  mural.position.set(0, HALL_Y + 3.45, -23.52);
  mainHallGroup.add(mural);

  for (const side of [-1, 1]) {
    const x = side * 12.1;
    const lowW = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.2, 14.2), palaceRedMat);
    lowW.position.set(x, HALL_Y + 1.1, HALL_Z);
    mainHallGroup.add(lowW);
    for (let i = 0; i < 8; i++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.4, 0.12), pillarRedMat);
      bar.position.set(x, HALL_Y + 4.4, -22.8 + i * 1.9);
      mainHallGroup.add(bar);
    }
  }

  const roofPivot = new THREE.Group();
  roofPivot.position.set(0, 0, HALL_Z);
  buildImperialRoof(roofPivot, 25.4, 15.0, HALL_Y + 6.85, true);
  mainHallGroup.add(roofPivot);

  const plaque = new THREE.Mesh(
    new THREE.BoxGeometry(4.6, 1.85, 0.22),
    new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.46 })
  );
  plaque.position.set(0, HALL_Y + 5.75, -9.1);
  mainHallGroup.add(plaque);

  for (const lx of [-5.8, 5.8]) {
    const bulb = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.32, 0.66, 8),
      new THREE.MeshStandardMaterial({ color: 0xffd785, emissive: 0xe66524, emissiveIntensity: 0.95, roughness: 0.4 })
    );
    bulb.position.set(lx, HALL_Y + 5.3, -9.05);
    mainHallGroup.add(bulb);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.24, 8), pillarRedMat);
    cap.position.set(lx, HALL_Y + 5.74, -9.05);
    mainHallGroup.add(cap);
    const pt = new THREE.PointLight(0xffaa44, 0.4, 15);
    pt.position.set(lx, HALL_Y + 4.9, -9.05);
    mainHallGroup.add(pt);
    lanternLights.push(pt);
  }

  // 大殿丁达尔圣光柱（斜洒在主佛金身之上）
  const sunBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 3.6, 8.8, 24, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xffe49e, transparent: true, opacity: 0.085,
      side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending
    })
  );
  sunBeam.position.set(0, HALL_Y + 4.4, -19.2);
  sunBeam.rotation.x = 0.26;
  mainHallGroup.add(sunBeam);

  scene.add(mainHallGroup);

  function buildSideHall(side) {
    const g = new THREE.Group();
    const x = side * 21.5, z = 4.5;
    g.position.set(x, 0, z);
    g.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;

    const base = new THREE.Mesh(new THREE.BoxGeometry(18.5, 0.9, 8.2), marbleMat);
    base.position.y = 0.45;
    base.receiveShadow = true;
    g.add(base);

    const body = new THREE.Mesh(new THREE.BoxGeometry(16.6, 4.6, 6.4), palaceRedMat);
    body.position.y = 0.9 + 2.3;
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);

    const frieze = new THREE.Mesh(new THREE.BoxGeometry(16.8, 0.55, 6.6), hexieMat);
    frieze.position.y = 0.9 + 4.65;
    g.add(frieze);

    for (let i = -3; i <= 3; i++) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.27, 4.7, 12), pillarRedMat);
      col.position.set(i * 2.5, 0.9 + 2.35, 3.35);
      col.castShadow = true;
      g.add(col);
    }
    buildImperialRoof(g, 17.4, 7.2, 0.9 + 4.9, false);
    scene.add(g);
  }
  buildSideHall(-1);
  buildSideHall(1);

  for (const side of [-1, 1]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.85, 4.6, 68), palaceRedMat);
    wall.position.set(side * 27.5, 2.3, -2);
    wall.receiveShadow = true;
    scene.add(wall);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.45, 68.4), goldRoofMat);
    cap.position.set(side * 27.5, 4.82, -2);
    scene.add(cap);
  }
  const rearWall = new THREE.Mesh(new THREE.BoxGeometry(56, 5.2, 0.9), palaceRedMat);
  rearWall.position.set(0, 2.6, -34);
  scene.add(rearWall);
  const rearCap = new THREE.Mesh(new THREE.BoxGeometry(56.6, 0.5, 1.4), goldRoofMat);
  rearCap.position.set(0, 5.45, -34);
  scene.add(rearCap);

  /* ================= 6. 殿内 3D 雕塑鎏金大佛 + 可热替换 .glb 主佛基座 ================= */
  const altar = new THREE.Mesh(new THREE.BoxGeometry(11.4, 1.35, 3.4), pillarRedMat);
  altar.position.set(0, HALL_Y + 0.675, -21.2);
  altar.castShadow = true;
  altar.receiveShadow = true;
  scene.add(altar);

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf4c852, metalness: 0.9, roughness: 0.2,
    emissive: 0x5c3804, emissiveIntensity: 0.22
  });
  const antiqueGoldMat = new THREE.MeshStandardMaterial({
    color: 0xd9a234, metalness: 0.85, roughness: 0.3,
    emissive: 0x472a04, emissiveIntensity: 0.16
  });
  const buddhaFaceMat = new THREE.MeshStandardMaterial({
    map: buddhaFaceTex, metalness: 0.65, roughness: 0.28,
    emissive: 0x452b05, emissiveIntensity: 0.18
  });
  const turquoiseMat = new THREE.MeshStandardMaterial({
    color: 0x2ca6a4, metalness: 0.25, roughness: 0.22, emissive: 0x0b3a3a, emissiveIntensity: 0.25
  });

  function buildBuddha(scale, x, z, isMain) {
    const anchor = new THREE.Group();
    anchor.position.set(x, HALL_Y + 1.35, z);
    scene.add(anchor);

    const builtIn = new THREE.Group();
    builtIn.scale.setScalar(scale);
    anchor.add(builtIn);

    const sumeruPts = [
      new THREE.Vector2(1.48, 0), new THREE.Vector2(1.42, 0.14),
      new THREE.Vector2(1.12, 0.26), new THREE.Vector2(0.96, 0.42),
      new THREE.Vector2(1.18, 0.56), new THREE.Vector2(1.32, 0.66)
    ];
    const sumeru = new THREE.Mesh(new THREE.LatheGeometry(sumeruPts, 32), antiqueGoldMat);
    builtIn.add(sumeru);

    const petalGeo = new THREE.SphereGeometry(0.24, 12, 10);
    petalGeo.scale(0.82, 1.35, 0.36);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const up = new THREE.Mesh(petalGeo, goldMat);
      up.position.set(Math.cos(a) * 1.14, 0.78, Math.sin(a) * 1.14);
      up.rotation.y = -a + Math.PI / 2;
      up.rotation.x = 0.46;
      builtIn.add(up);

      const dn = new THREE.Mesh(petalGeo, antiqueGoldMat);
      dn.scale.set(0.95, 0.9, 0.9);
      dn.position.set(Math.cos(a + 0.17) * 1.24, 0.46, Math.sin(a + 0.17) * 1.24);
      dn.rotation.y = -(a + 0.17) + Math.PI / 2;
      dn.rotation.x = -0.58;
      builtIn.add(dn);
    }

    const legRing = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.25, 14, 28), goldMat);
    legRing.rotation.x = Math.PI / 2;
    legRing.scale.set(1.22, 0.95, 0.85);
    legRing.position.set(0, 1.06, 0.08);
    builtIn.add(legRing);

    const lap = new THREE.Mesh(new THREE.SphereGeometry(0.76, 20, 14), goldMat);
    lap.scale.set(1.25, 0.44, 0.92);
    lap.position.set(0, 1.05, 0.04);
    builtIn.add(lap);

    const torsoPts = [
      new THREE.Vector2(0.74, 1.1), new THREE.Vector2(0.56, 1.5),
      new THREE.Vector2(0.48, 1.78), new THREE.Vector2(0.64, 2.26),
      new THREE.Vector2(0.54, 2.48), new THREE.Vector2(0.24, 2.58)
    ];
    const torso = new THREE.Mesh(new THREE.LatheGeometry(torsoPts, 28), goldMat);
    builtIn.add(torso);

    const kasaya = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.085, 10, 28), antiqueGoldMat);
    kasaya.position.set(0, 1.88, 0.05);
    kasaya.rotation.set(0.32, 0.2, 0.72);
    builtIn.add(kasaya);

    for (const side of [-1, 1]) {
      const sh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 12), goldMat);
      sh.position.set(side * 0.66, 2.28, 0.02);
      builtIn.add(sh);
      const uArm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.78, 12), goldMat);
      uArm.position.set(side * 0.72, 1.86, 0.08);
      uArm.rotation.z = side * 0.18;
      uArm.rotation.x = -0.22;
      builtIn.add(uArm);
      const fArm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.095, 0.68, 12), goldMat);
      fArm.position.set(side * 0.42, 1.42, 0.34);
      fArm.rotation.z = side * 1.15;
      fArm.rotation.y = -side * 0.35;
      builtIn.add(fArm);
    }
    const hands = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 12), goldMat);
    hands.scale.set(1.4, 0.55, 1.0);
    hands.position.set(0, 1.35, 0.54);
    builtIn.add(hands);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.24, 16), goldMat);
    neck.position.y = 2.66;
    builtIn.add(neck);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.41, 28, 24), buddhaFaceMat);
    head.scale.set(0.92, 1.08, 0.96);
    head.rotation.y = -Math.PI / 2;
    head.position.set(0, 3.06, 0.03);
    builtIn.add(head);

    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.28, 6, 8), goldMat);
      ear.position.set(side * 0.4, 2.98, -0.02);
      builtIn.add(ear);
    }

    const ushnisha = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 14), antiqueGoldMat);
    ushnisha.position.set(0, 3.52, -0.02);
    builtIn.add(ushnisha);
    const jewel = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), turquoiseMat);
    jewel.position.set(0, 3.74, -0.02);
    builtIn.add(jewel);

    for (let i = -2; i <= 2; i++) {
      const ang = i * 0.34;
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.11, i === 0 ? 0.36 : 0.27, 5), goldMat);
      leaf.position.set(Math.sin(ang) * 0.36, 3.44 - Math.abs(i) * 0.03, Math.cos(ang) * 0.36);
      leaf.rotation.x = 0.16;
      leaf.rotation.z = -ang * 0.5;
      builtIn.add(leaf);
      const gem = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), turquoiseMat);
      gem.position.set(Math.sin(ang) * 0.4, 3.34 - Math.abs(i) * 0.02, Math.cos(ang) * 0.4);
      builtIn.add(gem);
    }

    const halo1 = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.06, 12, 40), goldMat);
    halo1.position.set(0, 3.06, -0.32);
    builtIn.add(halo1);
    const halo2 = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.065, 12, 48), antiqueGoldMat);
    halo2.position.set(0, 2.25, -0.38);
    builtIn.add(halo2);

    builtIn.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });

    if (isMain) {
      const glbMount = new THREE.Group();
      anchor.add(glbMount);
      return { anchor, builtIn, glbMount };
    }
    return { anchor, builtIn };
  }

  const mainBuddhaSlot = buildBuddha(1.42, 0, -21.4, true);
  const sideBuddhaL = buildBuddha(0.86, -3.85, -21.4, false);
  const sideBuddhaR = buildBuddha(0.86, 3.85, -21.4, false);

  for (const fx of [-6.2, 6.2]) {
    const banner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 3.8, 12),
      new THREE.MeshStandardMaterial({ color: 0xb02e1f, roughness: 0.72 })
    );
    banner.position.set(fx, HALL_Y + 4.4, -17.5);
    scene.add(banner);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.04, 8, 16), goldMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(fx, HALL_Y + 6.3, -17.5);
    scene.add(ring);
  }

  const cushions = [];
  const cushionMat = new THREE.MeshStandardMaterial({ color: 0x82231b, roughness: 0.88 });
  const cushionTrimMat = new THREE.MeshStandardMaterial({ color: 0xdba948, roughness: 0.65 });
  for (const cz of [-11.8, -14.2, -16.6]) {
    for (const cx of [-6.0, -3.6, -1.2, 1.2, 3.6, 6.0]) {
      const pad = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.12, 1.05), cushionMat);
      pad.position.set(cx, HALL_Y + 0.06, cz);
      pad.receiveShadow = true;
      pad.castShadow = true;
      pad.userData.cushion = { x: cx, y: HALL_Y + 0.12, z: cz };
      scene.add(pad);
      const trim = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.03, 1.1), cushionTrimMat);
      trim.position.set(cx, HALL_Y + 0.02, cz);
      scene.add(trim);
      cushions.push(pad.userData.cushion);
      clickableProps.push(pad);
    }
  }

  /* ================= 7. 青铜宝鼎、转经筒、事业签台与写实银杏林 ================= */
  const burnerGroup = new THREE.Group();
  burnerGroup.position.set(0, 0, 2.2);
  const bronzeMat = new THREE.MeshStandardMaterial({ color: 0x4b3f2d, metalness: 0.78, roughness: 0.32 });
  const bronzeReliefMat = new THREE.MeshStandardMaterial({ map: dingReliefTex, metalness: 0.76, roughness: 0.34 });

  // 汉白玉雕花须弥底座（上中下三层束腰）
  const burnerBase = new THREE.Mesh(new THREE.CylinderGeometry(1.42, 1.62, 0.42, 24), marbleMat);
  burnerBase.position.y = 0.21;
  burnerGroup.add(burnerBase);
  const burnerWaist = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.18, 0.32, 20), marbleMat);
  burnerWaist.position.y = 0.56;
  burnerGroup.add(burnerWaist);
  const burnerTopSlab = new THREE.Mesh(new THREE.CylinderGeometry(1.36, 1.24, 0.22, 24), marbleMat);
  burnerTopSlab.position.y = 0.82;
  burnerGroup.add(burnerTopSlab);

  // 乾隆御制鱼龙变化铜鼎腹身
  const burnerBowl = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 0.96, 1.18, 28), bronzeReliefMat);
  burnerBowl.position.y = 1.52;
  burnerBowl.userData.propAction = 'incense';
  burnerGroup.add(burnerBowl);
  clickableProps.push(burnerBowl);

  // 鼎口双层回纹折沿
  const burnerLip = new THREE.Mesh(new THREE.TorusGeometry(1.24, 0.065, 10, 32), bronzeMat);
  burnerLip.rotation.x = Math.PI / 2;
  burnerLip.position.y = 2.11;
  burnerGroup.add(burnerLip);

  // 左右镂空立耳与盘龙耳饰
  for (const ex of [-1.25, 1.25]) {
    const ear = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.075, 10, 18), bronzeMat);
    ear.position.set(ex, 2.02, 0);
    burnerGroup.add(ear);
    const earCrest = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), antiqueGoldMat);
    earCrest.position.set(ex * 1.12, 2.28, 0);
    burnerGroup.add(earCrest);
  }

  // 香灰层与暗红香火微光
  const ash = new THREE.Mesh(
    new THREE.CylinderGeometry(1.12, 1.12, 0.1, 24),
    new THREE.MeshStandardMaterial({ color: 0xc8bfb0, roughness: 0.95 })
  );
  ash.position.y = 2.08;
  burnerGroup.add(ash);

  const emberLight = new THREE.PointLight(0xff6b24, 0.85, 4.5);
  emberLight.position.set(0, 2.38, 0);
  burnerGroup.add(emberLight);

  // 炉内众香客敬奉的错落香束 + 玩家敬香动态插香组
  const incenseStickMat = new THREE.MeshStandardMaterial({ color: 0x9e5426, roughness: 0.75 });
  const incenseCrimsonMat = new THREE.MeshStandardMaterial({ color: 0x8f1d14, roughness: 0.8 });
  const emberTipMat = new THREE.MeshBasicMaterial({ color: 0xff6e26 });
  const emberTips = [];

  function addIncenseCluster(cx, cz, tiltScale) {
    for (const sx of [-0.055, 0, 0.055]) {
      const st = new THREE.Group();
      st.position.set(cx + sx, 2.1, cz);
      st.rotation.z = -sx * 0.9 * (tiltScale || 1);
      st.rotation.x = (cz * 0.08);
      const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.22, 6), incenseCrimsonMat);
      lower.position.y = 0.11;
      st.add(lower);
      const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.42, 6), incenseStickMat);
      upper.position.y = 0.42;
      st.add(upper);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.026, 6, 6), emberTipMat);
      tip.position.y = 0.64;
      st.add(tip);
      emberTips.push({ mesh: tip, phase: Math.random() * 6.28 });
      burnerGroup.add(st);
    }
  }
  addIncenseCluster(0, 0, 1);
  addIncenseCluster(-0.38, -0.22, 1.2);
  addIncenseCluster(0.42, -0.18, 1.2);
  addIncenseCluster(-0.22, 0.32, 0.8);
  addIncenseCluster(0.28, 0.26, 0.9);

  // 玩家敬香时新插入的前排三炷高香（带缓入升烟反馈）
  const playerOfferIncenseGroup = new THREE.Group();
  playerOfferIncenseGroup.position.set(0, 2.1, 0.46);
  for (const sx of [-0.07, 0, 0.07]) {
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.68, 8), incenseStickMat);
    stick.position.set(sx, 0.34, 0);
    playerOfferIncenseGroup.add(stick);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), emberTipMat);
    tip.position.set(sx, 0.69, 0);
    playerOfferIncenseGroup.add(tip);
    emberTips.push({ mesh: tip, phase: sx * 10 });
  }
  burnerGroup.add(playerOfferIncenseGroup);
  let incenseFlareUntil = 0;

  burnerGroup.traverse(m => { if (m.isMesh) m.castShadow = true; });
  scene.add(burnerGroup);

  const smokeParticles = [];
  const smokeGeo = new THREE.SphereGeometry(0.18, 10, 10);
  for (let i = 0; i < 18; i++) {
    const s = new THREE.Mesh(
      smokeGeo,
      new THREE.MeshBasicMaterial({ color: 0xf6efe0, transparent: true, opacity: 0.26, depthWrite: false })
    );
    s.position.set(0, 2.75 + i * 0.24, 2.2);
    scene.add(s);
    smokeParticles.push({ mesh: s, phase: i / 18, lane: (i % 3) - 1 });
  }

  // 藏传六字真言鎏金转经筒长廊架
  const prayerWheels = [];
  const wheelRack = new THREE.Group();
  wheelRack.position.set(7.8, 0, 0.6);
  const wheelBase = new THREE.Mesh(new THREE.BoxGeometry(3.55, 0.28, 0.86), marbleMat);
  wheelBase.position.y = 0.14;
  wheelRack.add(wheelBase);
  const rackBottomBeam = new THREE.Mesh(new THREE.BoxGeometry(3.15, 0.12, 0.36), pillarRedMat);
  rackBottomBeam.position.y = 0.68;
  wheelRack.add(rackBottomBeam);
  const rackFrame = new THREE.Mesh(new THREE.BoxGeometry(3.35, 0.22, 0.56), hexieMat);
  rackFrame.position.y = 2.08;
  wheelRack.add(rackFrame);
  // 转经筒廊架黄琉璃瓦顶檐
  const rackRoof = new THREE.Mesh(new THREE.ConeGeometry(2.35, 0.52, 4), goldRoofMat);
  rackRoof.rotation.y = Math.PI / 4;
  rackRoof.scale.set(1.12, 1, 0.42);
  rackRoof.position.y = 2.42;
  wheelRack.add(rackRoof);

  for (const rx of [-1.48, 1.48]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 2.05, 12), pillarRedMat);
    post.position.set(rx, 1.12, 0);
    wheelRack.add(post);
  }
  const wheelMantraMat = new THREE.MeshStandardMaterial({
    map: prayerWheelTex, metalness: 0.72, roughness: 0.26, emissive: 0x3d2204, emissiveIntensity: 0.15
  });
  for (const wx of [-0.92, 0, 0.92]) {
    const wGroup = new THREE.Group();
    wGroup.position.set(wx, 1.36, 0);
    const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 1.38, 10), antiqueGoldMat);
    wGroup.add(spindle);
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.88, 24), wheelMantraMat);
    drum.userData.propAction = 'wheel';
    wGroup.add(drum);
    clickableProps.push(drum);
    for (const sy of [-0.45, 0.45]) {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.285, 0.032, 8, 24), goldMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = sy;
      wGroup.add(rim);
    }
    const topCap = new THREE.Mesh(new THREE.ConeGeometry(0.29, 0.16, 16), goldMat);
    topCap.position.y = 0.53;
    wGroup.add(topCap);
    wheelRack.add(wGroup);
    prayerWheels.push({ mesh: wGroup, vel: 0 });
  }
  wheelRack.traverse(m => { if (m.isMesh) m.castShadow = true; });
  scene.add(wheelRack);

  // 雍和宫灵签祈愿案台（织锦桌旗 + 朱砂签筒 + 供烛小炉 + 灵签立牌）
  const lotGroup = new THREE.Group();
  lotGroup.position.set(-7.6, 0, 0.6);
  const lotBase = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.18, 1.18), marbleMat);
  lotBase.position.y = 0.09;
  lotGroup.add(lotBase);
  const lotStand = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.84, 0.95), pillarRedMat);
  lotStand.position.y = 0.58;
  lotGroup.add(lotStand);
  const lotTableTop = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.08, 1.06), pillarRedMat);
  lotTableTop.position.y = 1.02;
  lotGroup.add(lotTableTop);
  const lotRunner = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.88, 1.09),
    new THREE.MeshStandardMaterial({ color: 0xd99e2b, roughness: 0.55, metalness: 0.2 })
  );
  lotRunner.position.y = 0.61;
  lotGroup.add(lotRunner);

  const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.21, 0.18, 0.64, 20),
    new THREE.MeshStandardMaterial({ color: 0x8c4a1d, roughness: 0.42, metalness: 0.12 })
  );
  cylinder.position.y = 1.36;
  cylinder.userData.propAction = 'lot';
  lotGroup.add(cylinder);
  clickableProps.push(cylinder);
  for (const ry of [1.14, 1.56]) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.018, 8, 20), goldMat);
    band.rotation.x = Math.PI / 2;
    band.position.y = ry;
    lotGroup.add(band);
  }
  const bambooMat = new THREE.MeshStandardMaterial({ color: 0xe8cb82, roughness: 0.55 });
  const redTipMat = new THREE.MeshStandardMaterial({ color: 0xb8251a, roughness: 0.5 });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r = 0.06 + (i % 3) * 0.032;
    const stick = new THREE.Group();
    stick.position.set(Math.cos(a) * r, 1.66, Math.sin(a) * r);
    stick.rotation.z = Math.cos(a) * 0.14;
    stick.rotation.x = Math.sin(a) * 0.14;
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.38, 0.014), bambooMat);
    stick.add(body);
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.09, 0.016), redTipMat);
    tip.position.y = 0.21;
    stick.add(tip);
    lotGroup.add(stick);
  }
  // 案台两侧祈愿红烛
  for (const cx of [-0.52, 0.52]) {
    const holder = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.16, 10), goldMat);
    holder.position.set(cx, 1.14, 0.12);
    lotGroup.add(holder);
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.038, 0.24, 10), redTipMat);
    candle.position.set(cx, 1.32, 0.12);
    lotGroup.add(candle);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.09, 6), new THREE.MeshBasicMaterial({ color: 0xffd268 }));
    flame.position.set(cx, 1.48, 0.12);
    lotGroup.add(flame);
  }
  lotGroup.traverse(m => { if (m.isMesh) m.castShadow = true; });
  scene.add(lotGroup);

  const barkMat = new THREE.MeshStandardMaterial({ color: 0x4b3b2e, roughness: 0.94 });
  const ginkgoCardMat = new THREE.MeshStandardMaterial({ map: ginkgoLeafTex, alphaTest: 0.32, side: THREE.DoubleSide, roughness: 0.85 });
  const cypressCardMat = new THREE.MeshStandardMaterial({ map: cypressLeafTex, alphaTest: 0.32, side: THREE.DoubleSide, roughness: 0.9 });
  const fallenGinkgoMat = new THREE.MeshStandardMaterial({
    map: ginkgoLeafTex, alphaTest: 0.25, transparent: true, opacity: 0.88, roughness: 0.9
  });

  function addRealisticTree(x, z, scale, isGinkgo) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.scale.setScalar(scale);

    // 树根抓地盘根与主干
    const rootFlare = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.62, 0.55, 10), barkMat);
    rootFlare.position.y = 0.275;
    g.add(rootFlare);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.44, 4.6, 10), barkMat);
    trunk.position.y = 2.3;
    trunk.castShadow = true;
    g.add(trunk);

    const branches = [
      [0.9, 4.6, 0.4, 0.45, 0.2],
      [-1.0, 4.4, -0.3, -0.48, -0.15],
      [0.2, 5.0, -0.9, 0.15, -0.45],
      [-0.3, 5.2, 0.95, -0.15, 0.42]
    ];
    for (const [bx, by, bz, rz, rx] of branches) {
      const br = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.2, 2.6, 7), barkMat);
      br.position.set(bx * 0.5, by, bz * 0.5);
      br.rotation.set(rx, 0, rz);
      br.castShadow = true;
      g.add(br);
    }

    const cardMat = isGinkgo ? ginkgoCardMat : cypressCardMat;
    const clusters = [
      [0, 6.8, 0, 4.6], [-1.7, 5.7, 0.9, 3.6], [1.8, 5.8, -0.7, 3.8],
      [-1.2, 5.9, -1.4, 3.5], [1.4, 5.6, 1.3, 3.5], [0, 8.2, 0, 3.2]
    ];
    for (const [cx, cy, cz, sz] of clusters) {
      for (let k = 0; k < 3; k++) {
        const card = new THREE.Mesh(new THREE.PlaneGeometry(sz, sz), cardMat);
        card.position.set(cx, cy, cz);
        card.rotation.y = (k * Math.PI) / 3 + (x + z) * 0.2;
        card.rotation.x = (k - 1) * 0.22;
        card.castShadow = true;
        g.add(card);
      }
    }

    // 银杏古树下铺满金黄落叶地毯
    if (isGinkgo) {
      for (let m = 0; m < 4; m++) {
        const patch = new THREE.Mesh(new THREE.CircleGeometry(1.45 - m * 0.2, 14), fallenGinkgoMat);
        patch.rotation.x = -Math.PI / 2;
        patch.rotation.z = m * 1.3;
        patch.position.set(Math.cos(m * 1.7) * 0.65, 0.015 + m * 0.003, Math.sin(m * 1.7) * 0.65);
        patch.receiveShadow = true;
        g.add(patch);
      }
    }
    scene.add(g);
  }

  addRealisticTree(-11.2, 5.5, 1.15, true);
  addRealisticTree(11.2, 5.5, 1.18, true);
  addRealisticTree(-11.6, 14.5, 1.1, true);
  addRealisticTree(11.6, 14.5, 1.12, true);
  addRealisticTree(-16.5, -5.0, 1.22, false);
  addRealisticTree(16.5, -5.0, 1.22, false);
  addRealisticTree(-18.5, -24.0, 1.32, false);
  addRealisticTree(18.5, -24.0, 1.32, false);

  for (const [lx, lz] of [[-6.8, 6.2], [6.8, 6.2], [-6.8, 15.2], [6.8, 15.2]]) {
    const g = new THREE.Group();
    g.position.set(lx, 0, lz);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.35, 0.42), marbleMat);
    post.position.y = 0.675;
    post.castShadow = true;
    g.add(post);
    const glow = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.38, 0.36),
      new THREE.MeshStandardMaterial({ color: 0xffe4a8, emissive: 0xff9b38, emissiveIntensity: 0.95 })
    );
    glow.position.y = 1.56;
    g.add(glow);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.52, 0.34, 4), goldRoofMat);
    cap.rotation.y = Math.PI / 4;
    cap.position.y = 1.92;
    g.add(cap);
    const pl = new THREE.PointLight(0xffb154, 0.3, 10);
    pl.position.y = 1.56;
    g.add(pl);
    lanternLights.push(pl);
    scene.add(g);
  }

  const airParticles = [];
  for (let i = 0; i < 36; i++) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.16),
      new THREE.MeshBasicMaterial({ color: i % 2 ? 0xf2c144 : 0xe5a528, side: THREE.DoubleSide, transparent: true, opacity: 0.82 })
    );
    m.position.set((Math.random() - 0.5) * 32, 1 + Math.random() * 11, -12 + Math.random() * 32);
    scene.add(m);
    airParticles.push({ mesh: m, seed: Math.random() * 100, speed: 0.35 + Math.random() * 0.42 });
  }

  const rippleMesh = new THREE.Mesh(
    new THREE.RingGeometry(0.22, 0.38, 28),
    new THREE.MeshBasicMaterial({ color: 0xfae198, transparent: true, opacity: 0, side: THREE.DoubleSide })
  );
  rippleMesh.rotation.x = -Math.PI / 2;
  scene.add(rippleMesh);
  let rippleTime = -10;

  /* ================= 8. 清雅国风 3D 雕塑小沙弥 / 香客模型（支持 .glb 真人热替换） ================= */
  function createMonkMesh(label, isSelf, robeId, hasBun) {
    const root = new THREE.Group();
    const rb = ROBES.find(r => r.id === robeId) || ROBES[0];

    const builtInGroup = new THREE.Group();
    root.add(builtInGroup);

    const bodyPivot = new THREE.Group();
    builtInGroup.add(bodyPivot);

    const glbPivot = new THREE.Group();
    root.add(glbPivot);

    const robeMat = new THREE.MeshStandardMaterial({ color: rb.robe, map: linenTex, roughness: 0.82 });
    const sashMat = new THREE.MeshStandardMaterial({ color: rb.sash, roughness: 0.52, metalness: 0.16 });
    const innerCollarMat = new THREE.MeshStandardMaterial({ color: 0xf6f1e6, roughness: 0.78 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf4ceb2, roughness: 0.56 });
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xe88b7c, transparent: true, opacity: 0.42 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x1d1917, roughness: 0.68 });
    const scalpMat = new THREE.MeshStandardMaterial({ color: 0x6b7075, roughness: 0.82, transparent: true, opacity: 0.24 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x221f1c, roughness: 0.86 });
    const sockMat = new THREE.MeshStandardMaterial({ color: 0xf2ece0, roughness: 0.85 });
    const beadWoodMat = new THREE.MeshStandardMaterial({ color: 0x6e3a1f, roughness: 0.42, metalness: 0.08 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1f1713, roughness: 0.16, metalness: 0.15 });
    const catchlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const browMat = new THREE.MeshStandardMaterial({ color: 0x3b2a20, roughness: 0.7 });
    const lipMat = new THREE.MeshStandardMaterial({ color: 0xc96f62, roughness: 0.55 });

    // 白布袜 + 罗汉布鞋
    const legL = new THREE.Group();
    legL.position.set(-0.105, 0.34, 0);
    const sockL = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.052, 0.24, 12), sockMat);
    sockL.position.y = -0.14;
    legL.add(sockL);
    const shoeL = new THREE.Mesh(new THREE.SphereGeometry(0.074, 12, 10), shoeMat);
    shoeL.scale.set(0.92, 0.58, 1.52);
    shoeL.position.set(0, -0.29, 0.045);
    shoeL.castShadow = true;
    legL.add(shoeL);
    builtInGroup.add(legL);

    const legR = legL.clone();
    legR.position.x = 0.105;
    builtInGroup.add(legR);

    // 流畅垂坠海青僧袍 (LatheGeometry)
    const robePts = [
      new THREE.Vector2(0.37, 0.18), new THREE.Vector2(0.32, 0.46),
      new THREE.Vector2(0.26, 0.76), new THREE.Vector2(0.22, 0.96),
      new THREE.Vector2(0.25, 1.18), new THREE.Vector2(0.16, 1.29),
      new THREE.Vector2(0.095, 1.33)
    ];
    const robeMesh = new THREE.Mesh(new THREE.LatheGeometry(robePts, 28), robeMat);
    robeMesh.scale.set(1.04, 1, 0.86);
    robeMesh.castShadow = true;
    robeMesh.receiveShadow = true;
    bodyPivot.add(robeMesh);

    // 交领右衽白色中衣领 + 束腰带
    const collarL = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.22, 0.025), innerCollarMat);
    collarL.position.set(-0.048, 1.24, 0.145);
    collarL.rotation.z = -0.46;
    collarL.rotation.x = -0.18;
    bodyPivot.add(collarL);
    const collarR = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.22, 0.025), innerCollarMat);
    collarR.position.set(0.048, 1.24, 0.148);
    collarR.rotation.z = 0.46;
    collarR.rotation.x = -0.18;
    bodyPivot.add(collarR);

    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.225, 0.024, 10, 28), sashMat);
    belt.rotation.x = Math.PI / 2;
    belt.scale.set(1.04, 0.86, 1);
    belt.position.y = 0.92;
    bodyPivot.add(belt);

    // 斜披袈裟 / 缦衣（随福德解锁配色）
    const kasaya = new THREE.Mesh(new THREE.TorusGeometry(0.255, 0.046, 10, 28), sashMat);
    kasaya.position.set(0.01, 1.08, 0.015);
    kasaya.rotation.set(0.26, 0.18, 0.72);
    kasaya.scale.set(1.05, 1.15, 0.72);
    bodyPivot.add(kasaya);

    // 挂脖老山檀木佛珠（14 颗立体珠子）
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const bx = Math.sin(a) * 0.115;
      const by = 1.27 - Math.max(0, Math.cos(a)) * 0.14;
      const bz = Math.cos(a) * 0.145 + 0.025;
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), beadWoodMat);
      bead.position.set(bx, by, bz);
      bodyPivot.add(bead);
    }

    // 颈部 + 温润立体圆润头颅（无球面 UV 拉伸）
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.072, 0.11, 14), skinMat);
    neck.position.y = 1.36;
    bodyPivot.add(neck);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.545, 0.01);
    bodyPivot.add(headGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.175, 28, 24), skinMat);
    head.scale.set(0.96, 1.02, 0.95);
    head.castShadow = true;
    headGroup.add(head);

    // 立体双耳
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 10), skinMat);
      ear.scale.set(0.55, 1.28, 0.85);
      ear.position.set(side * 0.168, -0.012, -0.01);
      headGroup.add(ear);
    }

    // 立体眉眼 + 高光眼神 + 腮红 + 微笑
    function makeEye(side) {
      const g = new THREE.Group();
      g.position.set(side * 0.058, 0.008, 0.152);
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 10), eyeMat);
      ball.scale.set(1.05, 1.12, 0.6);
      g.add(ball);
      const hi = new THREE.Mesh(new THREE.SphereGeometry(0.0065, 8, 8), catchlightMat);
      hi.position.set(-0.006, 0.007, 0.011);
      g.add(hi);
      return g;
    }
    const eyeL = makeEye(-1);
    const eyeR = makeEye(1);
    headGroup.add(eyeL);
    headGroup.add(eyeR);

    for (const side of [-1, 1]) {
      const brow = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.0045, 6, 12, Math.PI * 0.72), browMat);
      brow.position.set(side * 0.058, 0.036, 0.152);
      brow.rotation.z = Math.PI * 0.14;
      headGroup.add(brow);

      const blush = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 8), blushMat);
      blush.scale.set(1.25, 0.65, 0.28);
      blush.position.set(side * 0.088, -0.024, 0.142);
      headGroup.add(blush);
    }

    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 8), skinMat);
    nose.scale.set(0.95, 0.85, 1.1);
    nose.position.set(0, -0.015, 0.168);
    headGroup.add(nose);

    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.0045, 6, 14, Math.PI * 0.75), lipMat);
    smile.position.set(0, -0.044, 0.156);
    smile.rotation.z = Math.PI + Math.PI * 0.125;
    headGroup.add(smile);

    if (hasBun) {
      // 国风女香客发髻 + 金红发簪
      const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.181, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.6), hairMat);
      hairCap.scale.set(0.97, 1.03, 0.98);
      hairCap.position.set(0, 0.012, -0.01);
      hairCap.rotation.x = -0.2;
      hairCap.castShadow = true;
      headGroup.add(hairCap);
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.072, 14, 12), hairMat);
      bun.position.set(0, 0.03, -0.175);
      headGroup.add(bun);
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.22, 8), sashMat);
      pin.rotation.z = 1.25;
      pin.position.set(0, 0.04, -0.178);
      headGroup.add(pin);
    } else {
      // 清雅小沙弥：淡青剃度发茬 + 六点清净戒点
      const scalp = new THREE.Mesh(new THREE.SphereGeometry(0.177, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.46), scalpMat);
      scalp.scale.set(0.96, 1.02, 0.95);
      scalp.rotation.x = -0.12;
      headGroup.add(scalp);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x997352 });
      for (const r of [0, 1]) {
        for (const c of [-1, 0, 1]) {
          const dot = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 6, 6), dotMat);
          dot.position.set(c * 0.022, 0.1 + r * 0.022, 0.145 - r * 0.016);
          headGroup.add(dot);
        }
      }
    }

    // 飘逸广袖双臂 + 圆润小手
    function makeArm(side) {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.255, 1.22, 0.01);
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.115, 0.48, 14), robeMat);
      sleeve.position.y = -0.23;
      sleeve.castShadow = true;
      pivot.add(sleeve);
      const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.108, 0.012, 8, 16), innerCollarMat);
      cuff.rotation.x = Math.PI / 2;
      cuff.position.y = -0.46;
      pivot.add(cuff);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 10), skinMat);
      hand.scale.set(0.92, 1.12, 0.78);
      hand.position.y = -0.5;
      pivot.add(hand);
      return pivot;
    }
    const armL = makeArm(-1);
    const armR = makeArm(1);
    bodyPivot.add(armL);
    bodyPivot.add(armR);

    // 右手木鱼槌（敲木鱼时显现）
    const woodfishStriker = new THREE.Group();
    woodfishStriker.position.set(0, -0.5, 0.06);
    woodfishStriker.rotation.x = Math.PI / 2;
    const strikerStick = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.22, 8), beadWoodMat);
    strikerStick.position.y = 0.08;
    woodfishStriker.add(strikerStick);
    const strikerHead = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), sashMat);
    strikerHead.position.y = 0.2;
    woodfishStriker.add(strikerHead);
    woodfishStriker.visible = false;
    armR.add(woodfishStriker);

    // 敬香时双手间恭敬持握的三炷清香（含暗红香火头）
    const handIncense = new THREE.Group();
    handIncense.position.set(0, 1.18, 0.34);
    handIncense.rotation.x = 0.25;
    for (const sx of [-0.025, 0, 0.025]) {
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.42, 6), beadWoodMat);
      st.position.set(sx, 0.16, 0);
      st.rotation.z = -sx * 0.6;
      handIncense.add(st);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.011, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff6e26 }));
      tip.position.set(sx * 1.12, 0.38, 0);
      handIncense.add(tip);
    }
    handIncense.visible = false;
    bodyPivot.add(handIncense);

    // 雕花紫檀木鱼 + 红锦软垫
    const woodfish = new THREE.Group();
    woodfish.position.set(0, 0.92, 0.36);
    const wfPad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.13, 0.04, 14),
      new THREE.MeshStandardMaterial({ color: 0x8f2219, roughness: 0.78 })
    );
    wfPad.position.y = -0.06;
    woodfish.add(wfPad);
    const wfBody = new THREE.Mesh(
      new THREE.SphereGeometry(0.115, 14, 12),
      new THREE.MeshStandardMaterial({ color: 0x8c4c27, roughness: 0.46, metalness: 0.08 })
    );
    wfBody.scale.set(1.18, 0.84, 1.02);
    woodfish.add(wfBody);
    woodfish.visible = false;
    root.add(woodfish);

    // 脚底柔和接触阴影（消除浮空感）
    const shadowTex = makeTex(64, 64, (c, w, h) => {
      const g = c.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
      g.addColorStop(0, 'rgba(18, 10, 6, 0.48)');
      g.addColorStop(0.65, 'rgba(18, 10, 6, 0.18)');
      g.addColorStop(1, 'rgba(18, 10, 6, 0)');
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
    });
    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.82, 0.82),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.012;
    root.add(contactShadow);

    const aura = new THREE.Mesh(
      new THREE.RingGeometry(0.42, 0.52, 24),
      new THREE.MeshBasicMaterial({ color: 0xffe4a0, transparent: true, opacity: 0, side: THREE.DoubleSide })
    );
    aura.rotation.x = -Math.PI / 2;
    aura.position.y = 0.04;
    root.add(aura);

    const nameSprite = makeNameSprite(label, isSelf);
    nameSprite.position.y = 2.08;
    root.add(nameSprite);

    scene.add(root);
    return {
      root, builtInGroup, bodyPivot, glbPivot, headGroup,
      legL, legR, armL, armR, eyeL, eyeR,
      robeMat, sashMat, woodfish, woodfishStriker, handIncense, aura, nameSprite,
      glbState: null
    };
  }

  function applyRobeToMonk(meshObj, robeId) {
    const rb = ROBES.find(r => r.id === robeId) || ROBES[0];
    meshObj.robeMat.color.set(rb.robe);
    meshObj.sashMat.color.set(rb.sash);
  }

  function surfaceYAt(x, z) {
    if (z <= -7.8 && Math.abs(x) <= 13.8) return HALL_Y;
    if (z > -7.8 && z < -4.2 && Math.abs(x) <= 4.3) {
      const f = THREE.MathUtils.clamp((-4.2 - z) / 3.6, 0, 1);
      return f * HALL_Y;
    }
    return 0.08;
  }

  /* ================= 9. 玩家、师兄与大殿同修 ================= */
  const player = {
    x: 0, z: 12.6, y: 0.08, rotY: Math.PI,
    pose: 'idle', poseUntil: 0, pulse: 0, target: null,
    mesh: createMonkMesh('我 · 祈愿客', true, journal.robe, false)
  };
  player.mesh.root.position.set(player.x, player.y, player.z);
  player.mesh.root.rotation.y = player.rotY;

  const companion = {
    x: -1.2, z: -11.8, y: HALL_Y + 0.12, rotY: Math.PI,
    pose: 'sit', until: 8, stepIdx: 0, target: null, pulse: 0,
    mesh: createMonkMesh('清风师兄', false, 'crimson', true)
  };
  companion.mesh.root.position.set(companion.x, companion.y, companion.z);
  companion.mesh.root.rotation.y = companion.rotY;

  const companionPlan = [
    { x: -1.2, z: -11.8, pose: 'sit', dur: 10, rotY: Math.PI },
    { x: -1.2, z: -11.8, pose: 'bow', dur: 3.5, rotY: Math.PI },
    { x: 0, z: 4.6, pose: 'incense', dur: 5.0, rotY: Math.PI },
    { x: 7.8, z: 2.2, pose: 'hands', dur: 4.5, rotY: Math.PI },
    { x: 1.2, z: -11.8, pose: 'wood', dur: 6.5, rotY: Math.PI },
    { x: 1.2, z: -11.8, pose: 'sit', dur: 10, rotY: Math.PI }
  ];

  let crowdMode = false;
  const extraMonks = [];
  const extraSpecs = [
    { name: '明心', x: -3.6, z: -14.2, robe: 'saffron', bun: true },
    { name: '青云', x: -1.2, z: -16.6, robe: 'gold', bun: false },
    { name: '云水', x: 3.6, z: -14.2, robe: 'bamboo', bun: true },
    { name: '无尘', x: 1.2, z: -16.6, robe: 'crimson', bun: false },
    { name: '听松', x: -6.0, z: -14.2, robe: 'saffron', bun: false },
    { name: '知止', x: 6.0, z: -11.8, robe: 'ink', bun: true }
  ];
  for (let i = 0; i < extraSpecs.length; i++) {
    const sp = extraSpecs[i];
    const m = createMonkMesh(sp.name, false, sp.robe, sp.bun);
    m.root.position.set(sp.x, HALL_Y + 0.12, sp.z);
    m.root.rotation.y = Math.PI;
    m.root.visible = false;
    extraMonks.push({ x: sp.x, y: HALL_Y + 0.12, z: sp.z, rotY: Math.PI, pose: 'sit', nextBow: 4 + i * 3.1, bowUntil: 0, mesh: m });
  }

  /* ================= 10. 写实 .glb 3D 模型加载与骨骼动画系统（路线 B 核心） ================= */
  let gltfLoaderPromise = null;
  function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('加载失败: ' + src));
      document.head.appendChild(s);
    });
  }

  function ensureGltfLoader() {
    if (gltfLoaderPromise) return gltfLoaderPromise;
    gltfLoaderPromise = (async () => {
      const base = 'https://cdn.jsdelivr.net/npm/three@0.148.0/examples/js/loaders/';
      if (typeof THREE.DRACOLoader !== 'function') {
        try { await loadScriptOnce(base + 'DRACOLoader.js'); } catch (e) {}
      }
      if (typeof THREE.GLTFLoader !== 'function') {
        await loadScriptOnce(base + 'GLTFLoader.js');
      }
      const loader = new THREE.GLTFLoader();
      if (typeof THREE.DRACOLoader === 'function') {
        const draco = new THREE.DRACOLoader();
        draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        loader.setDRACOLoader(draco);
      }
      return loader;
    })();
    return gltfLoaderPromise;
  }

  const glbSlots = {
    buddha: { model: null, baseScale: 1, userScale: 1, rotY: 0, gilded: false, origMats: new Map() },
    visitor: { model: null, baseScale: 1, userScale: 1, rotY: 0 },
    companion: { model: null, baseScale: 1, userScale: 1, rotY: 0 }
  };

  function normalizeModelToHeight(model, targetHeight) {
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const h = Math.max(size.y, 0.001);
    const scale = targetHeight / h;
    const wrapper = new THREE.Group();
    model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    model.scale.setScalar(scale);
    model.traverse(obj => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.material && obj.material.map) setTexSRGB(obj.material.map);
      }
    });
    wrapper.add(model);
    return wrapper;
  }

  function applyBuddhaGilding(enabled) {
    const st = glbSlots.buddha;
    st.gilded = enabled;
    const btn = document.getElementById('gild-buddha');
    if (btn) {
      btn.textContent = '鎏金铜质：' + (enabled ? '开' : '关');
      btn.classList.toggle('active', enabled);
    }
    if (!st.model) return;
    st.model.traverse(obj => {
      if (!obj.isMesh) return;
      if (enabled) {
        if (!st.origMats.has(obj)) st.origMats.set(obj, obj.material);
        const orig = st.origMats.get(obj);
        const normalMap = orig && orig.normalMap ? orig.normalMap : null;
        obj.material = new THREE.MeshStandardMaterial({
          color: 0xf4c852, metalness: 0.9, roughness: 0.22,
          emissive: 0x5c3804, emissiveIntensity: 0.2,
          normalMap: normalMap
        });
      } else if (st.origMats.has(obj)) {
        obj.material = st.origMats.get(obj);
      }
    });
  }

  function bindGlbCharacter(entity, gltf, filename, slotKey) {
    const m = entity.mesh;
    m.glbPivot.clear();
    const wrapper = normalizeModelToHeight(gltf.scene, 1.72);
    m.glbPivot.add(wrapper);
    m.builtInGroup.visible = false;
    m.glbPivot.visible = true;

    let mixer = null;
    const actions = {};
    const clipNames = [];
    if (gltf.animations && gltf.animations.length) {
      mixer = new THREE.AnimationMixer(gltf.scene);
      for (const clip of gltf.animations) {
        clipNames.push(clip.name || 'Clip');
        const act = mixer.clipAction(clip);
        const nm = (clip.name || '').toLowerCase();
        if (!actions.idle && /idle|stand|breath|rest/.test(nm)) actions.idle = act;
        if (!actions.walk && /walk|run|move|stride/.test(nm)) actions.walk = act;
        if (!actions.bow && /bow|pray|salute|kneel/.test(nm)) actions.bow = act;
        if (!actions.sit && /sit|meditat|lotus/.test(nm)) actions.sit = act;
      }
      if (!actions.idle) actions.idle = mixer.clipAction(gltf.animations[0]);
      if (actions.idle) actions.idle.play();
    }

    m.glbState = { wrapper, mixer, actions, currentAction: actions.idle || null, clipNames };
    glbSlots[slotKey].model = wrapper;
    glbSlots[slotKey].rotY = 0;
    glbSlots[slotKey].userScale = 1;
    wrapper.rotation.y = 0;
    wrapper.scale.setScalar(1);

    const statusEl = document.getElementById('status-' + slotKey);
    if (statusEl) statusEl.textContent = '已加载写实模型：' + filename;
    if (slotKey === 'visitor') {
      const animEl = document.getElementById('anim-visitor');
      if (animEl) {
        animEl.textContent = clipNames.length
          ? '已识别骨骼动画：' + clipNames.slice(0, 5).join(' / ')
          : '静态真人模型（已自动启用礼佛/行走姿态联动）';
      }
      const slider = document.getElementById('scale-visitor');
      if (slider) slider.value = '1';
    }
  }

  async function loadGlbIntoSlot(slotKey, source, filename, silent) {
    try {
      const loader = await ensureGltfLoader();
      const gltf = await new Promise((resolve, reject) => {
        if (source instanceof ArrayBuffer) {
          loader.parse(source, '', resolve, reject);
        } else {
          loader.load(source, resolve, undefined, reject);
        }
      });

      if (slotKey === 'buddha') {
        mainBuddhaSlot.glbMount.clear();
        glbSlots.buddha.origMats.clear();
        const wrapper = normalizeModelToHeight(gltf.scene, 4.95);
        mainBuddhaSlot.glbMount.add(wrapper);
        mainBuddhaSlot.builtIn.visible = false;
        mainBuddhaSlot.glbMount.visible = true;
        glbSlots.buddha.model = wrapper;
        glbSlots.buddha.rotY = 0;
        glbSlots.buddha.userScale = 1;
        const slider = document.getElementById('scale-buddha');
        if (slider) slider.value = '1';
        if (glbSlots.buddha.gilded) applyBuddhaGilding(true);
        const stEl = document.getElementById('status-buddha');
        if (stEl) stEl.textContent = '已加载写实大佛：' + filename;
        if (!silent) {
          showToast('已替换正殿写实 3D 大佛：' + filename, 3000);
          camState.inHallView = true;
          document.getElementById('view-txt').textContent = '出庭院';
          walkPlayerTo(0, -11.8, '', HALL_Y + 0.12);
        }
      } else if (slotKey === 'visitor') {
        bindGlbCharacter(player, gltf, filename, 'visitor');
        if (!silent) showToast('已替换我的写实真人形象：' + filename, 3000);
      } else if (slotKey === 'companion') {
        bindGlbCharacter(companion, gltf, filename, 'companion');
        if (!silent) showToast('已替换清风师兄写实形象：' + filename, 3000);
      }
    } catch (err) {
      if (!silent) showToast('模型加载失败，请确认是有效的 .glb 文件', 3200);
    }
  }

  function resetGlbSlot(slotKey) {
    if (slotKey === 'buddha') {
      mainBuddhaSlot.glbMount.clear();
      mainBuddhaSlot.builtIn.visible = true;
      glbSlots.buddha.model = null;
      glbSlots.buddha.origMats.clear();
      document.getElementById('status-buddha').textContent = '当前：内置 3D 雕塑鎏金佛';
      showToast('已恢复内置 3D 雕塑鎏金大佛');
    } else if (slotKey === 'visitor') {
      player.mesh.glbPivot.clear();
      player.mesh.glbState = null;
      player.mesh.builtInGroup.visible = true;
      glbSlots.visitor.model = null;
      document.getElementById('status-visitor').textContent = '当前：内置写实新中式香客';
      document.getElementById('anim-visitor').textContent = '骨骼动画：自动适配 Idle / Walk / Bow / Sit';
      showToast('已恢复内置写实香客形象');
    } else if (slotKey === 'companion') {
      companion.mesh.glbPivot.clear();
      companion.mesh.glbState = null;
      companion.mesh.builtInGroup.visible = true;
      glbSlots.companion.model = null;
      document.getElementById('status-companion').textContent = '当前：内置写实宫红锦衫';
      showToast('已恢复清风师兄默认形象');
    }
  }

  // 若通过本地 http 服务访问，自动探测 models/ 目录下的写实 .glb 模型
  if (location.protocol === 'http:' || location.protocol === 'https:') {
    [
      ['buddha', './models/buddha.glb', 'models/buddha.glb'],
      ['visitor', './models/visitor.glb', 'models/visitor.glb'],
      ['companion', './models/companion.glb', 'models/companion.glb']
    ].forEach(([slot, url, label]) => {
      fetch(url, { method: 'HEAD' }).then(res => {
        if (res.ok) loadGlbIntoSlot(slot, url, label, true);
      }).catch(() => {});
    });
  }

  /* ================= 11. 低仰角宏伟电影相机 ================= */
  const camState = {
    yaw: 0, pitch: 0.22, dist: 16.5,
    target: new THREE.Vector3(0, 2.2, 7.2),
    inHallView: false
  };
  const camSmooth = { yaw: 0, pitch: 0.22, dist: 16.5 };

  function updateCamera(dt) {
    const goalX = player.x;
    const goalY = player.y + (camState.inHallView ? 2.1 : 2.6);
    const goalZ = player.z - (camState.inHallView ? 2.5 : 4.2);
    const k = 1 - Math.exp(-dt * 5.5);
    const rk = 1 - Math.exp(-dt * 7.2);
    camState.target.x += (goalX - camState.target.x) * k;
    camState.target.y += (goalY - camState.target.y) * k;
    camState.target.z += (goalZ - camState.target.z) * k;
    camSmooth.yaw += (camState.yaw - camSmooth.yaw) * rk;
    camSmooth.pitch += (camState.pitch - camSmooth.pitch) * rk;
    camSmooth.dist += (camState.dist - camSmooth.dist) * rk;

    const r = camSmooth.dist;
    const cx = camState.target.x + Math.sin(camSmooth.yaw) * Math.cos(camSmooth.pitch) * r;
    const cy = Math.max(1.5, camState.target.y + Math.sin(camSmooth.pitch) * r);
    const cz = camState.target.z + Math.cos(camSmooth.yaw) * Math.cos(camSmooth.pitch) * r;
    camera.position.set(cx, cy, cz);
    camera.lookAt(camState.target.x, camState.target.y + (camState.inHallView ? 0.8 : 1.5), camState.target.z - 4.0);
  }

  /* ================= 12. 角色动画（内置关节 + .glb 骨骼动画融合） ================= */
  function playGlbClip(gs, pose) {
    if (!gs || !gs.mixer) return;
    let targetAct = gs.actions.idle;
    if (pose === 'walk' && gs.actions.walk) targetAct = gs.actions.walk;
    else if ((pose === 'bow' || pose === 'hands' || pose === 'incense' || pose === 'wheel') && gs.actions.bow) targetAct = gs.actions.bow;
    else if (pose === 'sit' && gs.actions.sit) targetAct = gs.actions.sit;
    if (targetAct && targetAct !== gs.currentAction) {
      targetAct.reset().fadeIn(0.24).play();
      if (gs.currentAction) gs.currentAction.fadeOut(0.24);
      gs.currentAction = targetAct;
    }
  }

  function animateMonk(entity, t, dt) {
    const m = entity.mesh;
    m.woodfish.visible = entity.pose === 'wood';
    if (m.woodfishStriker) m.woodfishStriker.visible = entity.pose === 'wood';
    if (m.handIncense) m.handIncense.visible = entity.pose === 'incense';
    m.aura.material.opacity = 0;

    if (m.glbState) {
      const gs = m.glbState;
      if (gs.mixer) {
        playGlbClip(gs, entity.pose);
        gs.mixer.update(dt);
      }
      m.glbPivot.position.y = 0;
      m.glbPivot.rotation.x = 0;
      if (entity.pose === 'walk' && (!gs.actions || !gs.actions.walk)) {
        m.glbPivot.position.y = Math.abs(Math.sin(t * 9.5)) * 0.05;
      } else if (entity.pose === 'sit') {
        if (!gs.actions || !gs.actions.sit) m.glbPivot.position.y = -0.35;
        m.aura.material.opacity = 0.28 + 0.18 * Math.sin(t * 2.2);
      } else if (entity.pose === 'hands' || entity.pose === 'incense' || entity.pose === 'wheel') {
        if (!gs.actions || !gs.actions.bow) m.glbPivot.rotation.x = 0.12;
        m.aura.material.opacity = 0.42;
      } else if (entity.pose === 'bow') {
        const bend = Math.sin(Math.min(1, entity.pulse) * Math.PI);
        if (!gs.actions || !gs.actions.bow) m.glbPivot.rotation.x = 0.65 * bend;
        m.aura.material.opacity = 0.56 * bend;
      }
    } else {
      if (m.eyeL && m.eyeR) {
        const blink = entity.pose === 'sit' || entity.pose === 'bow' || ((t + (entity.x || 0) * 0.7) % 4.6 < 0.14);
        m.eyeL.scale.y = blink ? 0.12 : 1;
        m.eyeR.scale.y = blink ? 0.12 : 1;
      }
      if (m.headGroup) {
        m.headGroup.rotation.y = entity.pose === 'idle' ? Math.sin(t * 0.75 + (entity.x || 0)) * 0.08 : 0;
        m.headGroup.rotation.x = entity.pose === 'hands' || entity.pose === 'incense' ? 0.14 : (entity.pose === 'sit' ? 0.06 : 0);
      }
      m.bodyPivot.position.y = 0;
      m.bodyPivot.rotation.x = 0;
      m.bodyPivot.scale.set(1, 1, 1);
      m.armL.rotation.set(0, 0, 0.1);
      m.armR.rotation.set(0, 0, -0.1);
      m.legL.rotation.x = 0;
      m.legR.rotation.x = 0;
      m.legL.visible = true;
      m.legR.visible = true;

      if (entity.pose === 'walk') {
        const s = Math.sin(t * 9.2);
        m.bodyPivot.position.y = Math.abs(s) * 0.04;
        m.bodyPivot.rotation.z = s * 0.025;
        m.armL.rotation.x = s * 0.48;
        m.armR.rotation.x = -s * 0.48;
        m.legL.rotation.x = -s * 0.52;
        m.legR.rotation.x = s * 0.52;
      } else if (entity.pose === 'sit') {
        const breath = Math.sin(t * 1.6);
        m.bodyPivot.position.y = -0.46 + breath * 0.01;
        m.bodyPivot.scale.set(1 + breath * 0.012, 1 + breath * 0.008, 1 + breath * 0.012);
        m.legL.visible = false;
        m.legR.visible = false;
        m.armL.rotation.set(-0.62, 0.32, -0.16);
        m.armR.rotation.set(-0.62, -0.32, 0.16);
        m.aura.material.opacity = 0.28 + 0.2 * Math.sin(t * 2.2);
        const sc = 1 + 0.2 * ((t * 0.35) % 1);
        m.aura.scale.set(sc, sc, 1);
      } else if (entity.pose === 'incense') {
        // 举香齐眉，三拜敬香
        const bowWave = Math.sin(t * 3.6) * 0.14;
        m.bodyPivot.rotation.x = 0.16 + Math.max(0, bowWave);
        m.armL.rotation.set(-1.32 - bowWave * 0.5, 0.42, -0.22);
        m.armR.rotation.set(-1.32 - bowWave * 0.5, -0.42, 0.22);
        m.aura.material.opacity = 0.48;
      } else if (entity.pose === 'hands' || entity.pose === 'wheel') {
        m.bodyPivot.rotation.x = 0.1 + Math.sin(t * 3) * 0.02;
        m.armL.rotation.set(-1.12, 0.38, -0.2);
        m.armR.rotation.set(-1.12, -0.38, 0.2);
        m.aura.material.opacity = 0.42;
      } else if (entity.pose === 'bow') {
        const bend = Math.sin(Math.min(1, entity.pulse) * Math.PI);
        m.bodyPivot.position.y = -0.22 * bend;
        m.bodyPivot.rotation.x = 0.78 * bend;
        m.armL.rotation.set(-1.15, 0.38, -0.2);
        m.armR.rotation.set(-1.15, -0.38, 0.2);
        m.aura.material.opacity = 0.56 * bend;
      } else if (entity.pose === 'wood') {
        const wave = Math.sin(t * 9.5);
        const hit = wave * 0.26;
        m.armR.rotation.set(-0.84 + hit, -0.28, 0.14);
        m.armL.rotation.set(-0.68, 0.28, -0.14);
        const pop = 1 + Math.max(0, -wave) * 0.08;
        m.woodfish.scale.set(pop, 2 - pop, pop);
      } else {
        const breath = Math.sin(t * 1.9);
        m.bodyPivot.position.y = breath * 0.01;
        m.bodyPivot.scale.set(1 + breath * 0.01, 1 + breath * 0.006, 1 + breath * 0.01);
        m.bodyPivot.rotation.z = 0;
      }
    }

    m.root.position.set(entity.x, entity.y, entity.z);
    let diff = entity.rotY - m.root.rotation.y;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    m.root.rotation.y += diff * Math.min(1, dt * 10);
  }

  /* ================= 13. UI 提示、飘字与交互动作 ================= */
  const toastEl = document.getElementById('toast');
  const hintBar = document.getElementById('hint-bar');
  let toastTimer = null;
  function showToast(msg, ms) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms || 2400);
  }
  function fadeHint() { if (hintBar) hintBar.classList.add('faded'); }

  const floatWrap = document.getElementById('float-words');
  let wordIdx = 0;
  function spawnZenWord(act) {
    const pool = ZEN_WORDS[act] || ZEN_WORDS.wood;
    const text = pool[wordIdx++ % pool.length];
    const v = new THREE.Vector3(player.x, player.y + 2.35, player.z).project(camera);
    const sx = (v.x * 0.5 + 0.5) * window.innerWidth + (Math.random() - 0.5) * 40;
    const sy = (-v.y * 0.5 + 0.5) * window.innerHeight;
    const el = document.createElement('div');
    el.className = 'float-word';
    el.textContent = text;
    el.style.left = sx + 'px';
    el.style.top = sy + 'px';
    floatWrap.appendChild(el);
    setTimeout(() => el.remove(), 1550);
  }

  function walkPlayerTo(x, z, arrival, customY) {
    fadeHint();
    const clampedX = THREE.MathUtils.clamp(x, -22, 22);
    const clampedZ = THREE.MathUtils.clamp(z, -19.5, 24);
    player.target = { x: clampedX, z: clampedZ, arrival: arrival || '', customY: customY };
    player.pose = 'walk';
    player.poseUntil = 0;
    const ry = customY != null ? customY : surfaceYAt(clampedX, clampedZ);
    rippleMesh.position.set(clampedX, ry + 0.05, clampedZ);
    rippleTime = clockTime;
    updateDockActive();
  }

  function doAction(act) {
    fadeHint();
    if (act === 'beads') {
      openBeadsModal();
      player.pose = 'hands';
      player.poseUntil = clockTime + 1.8;
      updateDockActive();
      return;
    }
    if (act === 'lot') { walkPlayerTo(-7.6, 2.2, 'lot_arrive'); return; }
    if (act === 'incense') { walkPlayerTo(0, 4.6, 'incense_arrive'); return; }
    if (act === 'wheel') { walkPlayerTo(7.8, 2.2, 'wheel_arrive'); return; }
    if (customActions[act]) { customActions[act](); return; }
    if (act === 'sit') {
      if (player.pose === 'sit') {
        player.pose = 'idle';
        showToast('起身漫步 · 随时可再静坐');
        updateDockActive();
        return;
      }
      let best = cushions[2], bestD = Infinity;
      for (const c of cushions) {
        const d = Math.hypot(c.x - player.x, c.z - player.z);
        if (d < bestD && Math.hypot(c.x - companion.x, c.z - companion.z) > 0.8) {
          bestD = d; best = c;
        }
      }
      walkPlayerTo(best.x, best.z, 'sit_arrive', best.y);
      return;
    }

    player.target = null;
    if (act === 'hands') {
      journal.hands++;
      player.pose = 'hands';
      player.poseUntil = clockTime + 1.8;
      playSound('bow');
      spawnZenWord('hands');
      showToast('恭敬合掌 · 愿事业顺遂、诸事圆满');
    } else if (act === 'bow') {
      journal.bow++;
      player.pose = 'bow';
      player.pulse = 0.01;
      player.poseUntil = clockTime + 1.9;
      playSound('bow');
      spawnZenWord('bow');
      showToast('礼佛一拜 · 累计已拜 ' + journal.bow + ' 次');
    } else if (act === 'wood') {
      journal.wood++;
      player.pose = 'wood';
      player.poseUntil = clockTime + 1.1;
      playSound('wood');
      spawnZenWord('wood');
    }
    saveJournal();
    updateDockActive();
  }

  function completeArrival(arrival) {
    if (arrival === 'sit_arrive') {
      player.pose = 'sit';
      player.rotY = Math.PI;
      playSound('bell');
      spawnZenWord('sit');
      showToast('已在雍和宫正殿入定 · 再点「静坐」或地面起身');
      camState.inHallView = true;
      document.getElementById('view-txt').textContent = '出庭院';
    } else if (arrival === 'incense_arrive') {
      journal.incense++;
      saveJournal();
      player.pose = 'incense';
      player.rotY = Math.PI;
      player.poseUntil = clockTime + 2.4;
      incenseFlareUntil = clockTime + 4.5;
      playSound('incense');
      spawnZenWord('incense');
      showToast('乾隆宝鼎敬奉三炷高香 · 愿事业顺遂、贵人常伴');
    } else if (arrival === 'wheel_arrive') {
      journal.wheel++;
      saveJournal();
      player.pose = 'wheel';
      player.rotY = Math.PI;
      player.poseUntil = clockTime + 1.8;
      prayerWheels.forEach((w, idx) => { w.vel = 10.5 - idx * 0.8; });
      playSound('bell');
      spawnZenWord('wheel');
      showToast('轻转六字真言经筒 · 福运流转、万事顺遂');
    } else if (arrival === 'lot_arrive') {
      player.pose = 'hands';
      player.rotY = Math.PI;
      player.poseUntil = clockTime + 1.4;
      playSound('lot');
      spawnZenWord('lot');
      openLotModal();
    } else if (customArrivals[arrival]) {
      customArrivals[arrival]();
    }
    updateDockActive();
  }

  function updateDockActive() {
    document.querySelectorAll('.dock-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.act === player.pose);
    });
  }

  /* ================= 14. 弹窗与 3D 模型中心交互 ================= */
  const beadsOverlay = document.getElementById('beads-overlay');
  const lotOverlay = document.getElementById('lot-overlay');
  const journalOverlay = document.getElementById('journal-overlay');
  const templeOverlay = document.getElementById('temple-overlay');
  const modelsOverlay = document.getElementById('models-overlay');
  const allOverlays = [beadsOverlay, lotOverlay, journalOverlay, templeOverlay, modelsOverlay];
  allOverlays.forEach(ov => {
    if (!ov) return;
    ov.addEventListener('click', e => { if (e.target === ov) ov.classList.add('hidden'); });
  });

  document.getElementById('btn-models').onclick = () => modelsOverlay.classList.remove('hidden');
  document.getElementById('close-models').onclick = () => modelsOverlay.classList.add('hidden');

  ['buddha', 'visitor', 'companion'].forEach(slotKey => {
    const fileInput = document.getElementById('file-' + slotKey);
    if (fileInput) {
      fileInput.addEventListener('change', async e => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const buf = await file.arrayBuffer();
        loadGlbIntoSlot(slotKey, buf, file.name, false);
        fileInput.value = '';
      });
    }
    const rotBtn = document.getElementById('rot-' + slotKey);
    if (rotBtn) {
      rotBtn.onclick = () => {
        const st = glbSlots[slotKey];
        if (!st.model) { showToast('请先导入该位置的 .glb 模型'); return; }
        st.rotY = (st.rotY + Math.PI / 2) % (Math.PI * 2);
        st.model.rotation.y = st.rotY;
      };
    }
    const resetBtn = document.getElementById('reset-' + slotKey);
    if (resetBtn) resetBtn.onclick = () => resetGlbSlot(slotKey);
  });

  const scaleBuddha = document.getElementById('scale-buddha');
  if (scaleBuddha) {
    scaleBuddha.addEventListener('input', e => {
      const v = parseFloat(e.target.value) || 1;
      glbSlots.buddha.userScale = v;
      if (glbSlots.buddha.model) glbSlots.buddha.model.scale.setScalar(v);
    });
  }
  const scaleVisitor = document.getElementById('scale-visitor');
  if (scaleVisitor) {
    scaleVisitor.addEventListener('input', e => {
      const v = parseFloat(e.target.value) || 1;
      glbSlots.visitor.userScale = v;
      if (glbSlots.visitor.model) glbSlots.visitor.model.scale.setScalar(v);
    });
  }
  const gildBtn = document.getElementById('gild-buddha');
  if (gildBtn) {
    gildBtn.onclick = () => applyBuddhaGilding(!glbSlots.buddha.gilded);
  }

  // 全屏拖放 .glb 文件即时替换
  const dropBanner = document.getElementById('drop-banner');
  let dragDepth = 0;
  window.addEventListener('dragenter', e => {
    e.preventDefault();
    dragDepth++;
    if (dropBanner) dropBanner.classList.remove('hidden');
  });
  window.addEventListener('dragover', e => e.preventDefault());
  window.addEventListener('dragleave', () => {
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0 && dropBanner) dropBanner.classList.add('hidden');
  });
  window.addEventListener('drop', async e => {
    e.preventDefault();
    dragDepth = 0;
    if (dropBanner) dropBanner.classList.add('hidden');
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (!file || !/\.(glb|gltf)$/i.test(file.name)) {
      showToast('请拖入 .glb 或 .gltf 格式的 3D 模型文件');
      return;
    }
    const nm = file.name.toLowerCase();
    let slot = 'visitor';
    if (/buddha|fo|statue|佛|如来|弥勒/.test(nm)) slot = 'buddha';
    else if (/companion|monk|师兄|npc/.test(nm)) slot = 'companion';
    const buf = await file.arrayBuffer();
    loadGlbIntoSlot(slot, buf, file.name, false);
  });

  const beadCanvas = document.getElementById('bead-canvas');
  const bCtx = beadCanvas.getContext('2d');
  let beadAngle = 0;
  let tasselSwing = 0;

  function drawBeadRing() {
    const w = beadCanvas.width, h = beadCanvas.height;
    bCtx.clearRect(0, 0, w, h);
    const mat = BEAD_MATERIALS.find(m => m.id === journal.beadMat) || BEAD_MATERIALS[0];
    const cx = w / 2, cy = h / 2 - 8, rx = 104, ry = 66;

    // 锦缎托盘底纹暗影与禅意莲纹
    const trayG = bCtx.createRadialGradient(cx, cy, 18, cx, cy, 130);
    trayG.addColorStop(0, 'rgba(236, 199, 116, 0.1)');
    trayG.addColorStop(1, 'rgba(18, 8, 6, 0)');
    bCtx.fillStyle = trayG;
    bCtx.beginPath(); bCtx.ellipse(cx, cy, 128, 86, 0, 0, Math.PI * 2); bCtx.fill();

    // 双股丝绦穿绳（底层阴影 + 金红穿绳）
    bCtx.strokeStyle = 'rgba(15, 7, 5, 0.55)';
    bCtx.lineWidth = 4.2;
    bCtx.beginPath(); bCtx.ellipse(cx, cy + 3, rx, ry, 0, 0, Math.PI * 2); bCtx.stroke();
    bCtx.strokeStyle = '#b83728';
    bCtx.lineWidth = 2.4;
    bCtx.beginPath(); bCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); bCtx.stroke();

    // 计算母珠（三通佛头，i=0）坐标，先绘制佛塔、背云、记子留与丝穗流苏
    const guruA = beadAngle + Math.PI * 0.5;
    const gx = cx + Math.cos(guruA) * rx;
    const gy = cy + Math.sin(guruA) * ry;
    const outDx = Math.cos(guruA), outDy = Math.sin(guruA);
    const sway = Math.sin(tasselSwing) * 6;

    // 佛塔（三通外延葫芦塔头）+ 背云 + 朱红丝穗流苏
    const stupaX = gx + outDx * 18, stupaY = gy + outDy * 16;
    const tasselX = stupaX + outDx * 12 + sway * 0.5;
    const tasselY = Math.min(h - 14, stupaY + Math.max(12, outDy * 18) + 18);

    // 双侧「记子留」计数器支线（各5颗鎏金小计数珠）
    for (const side of [-1, 1]) {
      const branchA = guruA + side * 0.55;
      const bx0 = cx + Math.cos(branchA) * rx;
      const by0 = cy + Math.sin(branchA) * ry;
      bCtx.strokeStyle = '#9e2b1f';
      bCtx.lineWidth = 1.5;
      bCtx.beginPath();
      bCtx.moveTo(bx0, by0);
      bCtx.quadraticCurveTo(bx0 + side * 18, by0 + 18, bx0 + side * 22 + sway * 0.3, by0 + 36);
      bCtx.stroke();
      for (let k = 1; k <= 4; k++) {
        const t = k / 4.5;
        const kx = bx0 + side * 20 * t + sway * 0.2 * t;
        const ky = by0 + 32 * t;
        bCtx.fillStyle = k === 4 ? '#2ca6a4' : '#e5b84b';
        bCtx.beginPath(); bCtx.arc(kx, ky, 3.2, 0, Math.PI * 2); bCtx.fill();
      }
    }

    // 流苏丝线束与背云牌
    bCtx.strokeStyle = '#a8291d';
    bCtx.lineWidth = 2.2;
    bCtx.beginPath(); bCtx.moveTo(gx, gy); bCtx.lineTo(stupaX, stupaY); bCtx.stroke();
    for (let s = -4; s <= 4; s++) {
      bCtx.strokeStyle = s % 2 === 0 ? '#c93326' : '#a12116';
      bCtx.lineWidth = 1.3;
      bCtx.beginPath();
      bCtx.moveTo(stupaX, stupaY + 4);
      bCtx.quadraticCurveTo(stupaX + s * 1.6 + sway * 0.4, (stupaY + tasselY) * 0.5, tasselX + s * 2.4, tasselY);
      bCtx.stroke();
    }
    // 佛塔椎体与绿松石背云珠
    bCtx.fillStyle = '#e5b84b';
    bCtx.beginPath(); bCtx.arc(stupaX, stupaY, 6.2, 0, Math.PI * 2); bCtx.fill();
    bCtx.fillStyle = '#2ca6a4';
    bCtx.beginPath(); bCtx.arc((stupaX + tasselX) * 0.5, (stupaY + tasselY) * 0.5 - 3, 4.8, 0, Math.PI * 2); bCtx.fill();

    // 按 Y 轴深度排序绘制 18 颗代表珠（含三通母珠 + 隔珠 + 子珠包浆纹理）
    const order = Array.from({ length: 18 }, (_, i) => i);
    order.sort((a, b) => Math.sin(a * Math.PI * 2 / 18 + guruA) - Math.sin(b * Math.PI * 2 / 18 + guruA));

    for (const i of order) {
      const a = i * Math.PI * 2 / 18 + guruA;
      const bx = cx + Math.cos(a) * rx;
      const by = cy + Math.sin(a) * ry;
      const isGuru = i === 0;
      const isSpacer = i === 6 || i === 12;
      const r = isGuru ? 15.8 : (isSpacer ? 13.6 : 12.6);

      // 珠体接触投影
      bCtx.fillStyle = 'rgba(12, 5, 3, 0.45)';
      bCtx.beginPath(); bCtx.arc(bx + 1.5, by + 3.5, r, 0, Math.PI * 2); bCtx.fill();

      // 珠体立体球面渐变
      const grad = bCtx.createRadialGradient(bx - r * 0.35, by - r * 0.35, 1.8, bx, by, r);
      if (isGuru) {
        grad.addColorStop(0, '#ffe79e');
        grad.addColorStop(0.55, '#c93828');
        grad.addColorStop(1, '#5e140d');
      } else if (isSpacer) {
        grad.addColorStop(0, '#a6f0ea');
        grad.addColorStop(0.55, '#2ca6a4');
        grad.addColorStop(1, '#104948');
      } else {
        grad.addColorStop(0, mat.hi);
        grad.addColorStop(0.65, mat.fill);
        grad.addColorStop(1, '#261510');
      }
      bCtx.fillStyle = grad;
      bCtx.beginPath(); bCtx.arc(bx, by, r, 0, Math.PI * 2); bCtx.fill();

      // 材质纹理细节：木质年轮金星 / 香灰琉璃冰裂纹 / 玉石润泽内光
      bCtx.save();
      bCtx.beginPath(); bCtx.arc(bx, by, r - 0.8, 0, Math.PI * 2); bCtx.clip();
      if (!isGuru && !isSpacer) {
        if (mat.id === 'sandal' || mat.id === 'rosewood') {
          bCtx.strokeStyle = mat.id === 'rosewood' ? 'rgba(245,198,118,0.28)' : 'rgba(58,28,12,0.28)';
          bCtx.lineWidth = 1.1;
          for (let g = -2; g <= 2; g++) {
            bCtx.beginPath();
            bCtx.arc(bx + g * 4, by, r * 0.85, -0.8, 0.8);
            bCtx.stroke();
          }
        } else if (mat.id === 'ash') {
          // 香灰琉璃细微金砂与冰裂纹理
          bCtx.fillStyle = 'rgba(255, 232, 168, 0.45)';
          bCtx.fillRect(bx - 3 + (i % 3), by - 2, 1.6, 1.6);
          bCtx.fillRect(bx + 2, by + 3 - (i % 2), 1.4, 1.4);
        }
      }
      // 温润包浆高光点
      bCtx.fillStyle = 'rgba(255, 255, 255, 0.48)';
      bCtx.beginPath();
      bCtx.ellipse(bx - r * 0.34, by - r * 0.36, r * 0.24, r * 0.13, -0.6, 0, Math.PI * 2);
      bCtx.fill();
      bCtx.restore();

      bCtx.strokeStyle = isGuru ? 'rgba(245, 206, 116, 0.7)' : 'rgba(28, 16, 10, 0.6)';
      bCtx.lineWidth = isGuru ? 1.5 : 1.1;
      bCtx.beginPath(); bCtx.arc(bx, by, r, 0, Math.PI * 2); bCtx.stroke();
    }

    const cur = journal.beads === 0 ? 0 : ((journal.beads - 1) % 108) + 1;
    const rounds = Math.floor(journal.beads / 108);
    document.getElementById('bead-count-txt').textContent = cur + ' / 108 颗';
    document.getElementById('bead-round-txt').textContent = '已满 ' + rounds + ' 圈（累计 ' + journal.beads + '）';
    document.getElementById('bead-sub').textContent = mat.name + ' · 三通佛塔 · 轻点或滑动盘珠';
  }

  function renderBeadMats() {
    const row = document.getElementById('bead-mats');
    row.replaceChildren();
    BEAD_MATERIALS.forEach(m => {
      const unlocked = journal.beads >= m.req;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mat-chip' + (journal.beadMat === m.id ? ' active' : '') + (unlocked ? '' : ' locked');
      btn.innerHTML = `<span class="mat-dot" style="background:${m.fill}"></span><span>${unlocked ? m.name.slice(0, 2) : m.req + '颗'}</span>`;
      btn.onclick = () => {
        if (!unlocked) { showToast(m.name + ' · ' + m.hint); return; }
        journal.beadMat = m.id;
        saveJournal();
        playSound(m.sound);
        renderBeadMats();
        drawBeadRing();
        showToast('已换「' + m.name + '」手串');
      };
      row.appendChild(btn);
    });
  }

  function rollOneBead() {
    const prev = journal.beads;
    journal.beads++;
    beadAngle -= Math.PI * 2 / 18;
    tasselSwing += 1.35;
    saveJournal();
    const mat = BEAD_MATERIALS.find(m => m.id === journal.beadMat) || BEAD_MATERIALS[0];
    playSound(mat.sound);
    drawBeadRing();
    const newly = BEAD_MATERIALS.find(m => m.req > 0 && prev < m.req && journal.beads >= m.req);
    if (newly) {
      renderBeadMats();
      showToast('解锁雍和宫手串「' + newly.name + '」', 3200);
    } else if (Math.floor(journal.beads / 108) > Math.floor(prev / 108)) {
      playSound('bell');
      showToast('圆满一圈 108 颗 · 诸事顺遂', 3000);
    }
  }

  function openBeadsModal() { renderBeadMats(); drawBeadRing(); beadsOverlay.classList.remove('hidden'); }
  document.getElementById('close-beads').onclick = () => beadsOverlay.classList.add('hidden');
  let beadDragDist = 0, beadLast = null;
  const beadStage = document.getElementById('bead-stage');
  beadStage.addEventListener('pointerdown', e => { beadLast = { x: e.clientX, y: e.clientY, moved: false }; beadDragDist = 0; });
  beadStage.addEventListener('pointermove', e => {
    if (!beadLast) return;
    beadDragDist += Math.hypot(e.clientX - beadLast.x, e.clientY - beadLast.y);
    beadLast.x = e.clientX; beadLast.y = e.clientY;
    if (beadDragDist >= 28) { beadDragDist %= 28; beadLast.moved = true; rollOneBead(); }
  });
  beadStage.addEventListener('pointerup', () => {
    if (beadLast && !beadLast.moved) rollOneBead();
    beadLast = null;
  });

  let lotSalt = 0;
  function renderLotByWish(wishKey, reshake) {
    journal.wishType = wishKey;
    saveJournal();
    document.querySelectorAll('.wish-tab').forEach(tb => {
      tb.classList.toggle('active', tb.dataset.wish === wishKey);
    });
    if (reshake) lotSalt++;
    const pool = WISH_LOTS[wishKey] || WISH_LOTS.career;
    const idx = (new Date().getDate() + journal.incense + journal.bow + lotSalt) % pool.length;
    const lot = pool[idx];
    const noEl = document.getElementById('lot-no');
    if (noEl) noEl.textContent = lot.no || '第一签 · 乾宫';
    document.getElementById('lot-seal').textContent = lot.rank.slice(0, 1);
    document.getElementById('lot-rank').textContent = lot.rank + ' · ' + lot.title;
    document.getElementById('lot-poem').innerHTML = lot.lines.join('<br>');
    const decEl = document.getElementById('lot-decode');
    if (decEl) decEl.textContent = lot.decode || '';
    document.getElementById('lot-advice').textContent = lot.advice;

    if (reshake) {
      const slipEl = document.querySelector('.lot-card');
      if (slipEl) {
        slipEl.classList.remove('lot-shaking');
        void slipEl.offsetWidth;
        slipEl.classList.add('lot-shaking');
      }
    }
  }
  function openLotModal() { renderLotByWish(journal.wishType || 'career', false); lotOverlay.classList.remove('hidden'); }
  document.querySelectorAll('.wish-tab').forEach(tb => { tb.onclick = () => { playSound('lot'); renderLotByWish(tb.dataset.wish, true); }; });
  const reshakeBtn = document.getElementById('reshake-lot');
  if (reshakeBtn) {
    reshakeBtn.onclick = () => {
      playSound('lot');
      renderLotByWish(journal.wishType || 'career', true);
      showToast('诚心重摇签筒 · 新签已落');
    };
  }
  document.getElementById('close-lot').onclick = () => lotOverlay.classList.add('hidden');
  document.getElementById('ok-lot').onclick = () => {
    lotOverlay.classList.add('hidden');
    playSound('jade');
    showToast('已敬受吉签 · 愿所求皆如愿');
  };

  function openJournalModal() {
    const merit = calcMerit();
    document.getElementById('journal-merit').textContent = '累计福德：' + merit;
    const stats = [
      ['敬香', journal.incense + ' 炷'], ['礼佛', journal.bow + ' 次'], ['转经', journal.wheel + ' 次'],
      ['手串', journal.beads + ' 颗'], ['木鱼', journal.wood + ' 声'], ['静坐', Math.floor(journal.sit) + ' 秒']
    ];
    const grid = document.getElementById('stat-grid');
    grid.replaceChildren();
    for (const [k, v] of stats) {
      const box = document.createElement('div');
      box.className = 'stat-box';
      box.innerHTML = `<div class="k">${k}</div><div class="v">${v}</div>`;
      grid.appendChild(box);
    }
    const robeGrid = document.getElementById('robe-grid');
    robeGrid.replaceChildren();
    ROBES.forEach(rb => {
      const unlocked = merit >= rb.req;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'robe-btn' + (journal.robe === rb.id ? ' active' : '') + (unlocked ? '' : ' locked');
      btn.innerHTML = `<span class="robe-swatch" style="background:linear-gradient(135deg,${rb.robe} 55%,${rb.sash} 55%)"></span><span>${unlocked ? rb.name.slice(0, 2) : rb.req + '德'}</span>`;
      btn.onclick = () => {
        if (!unlocked) { showToast(rb.name + ' · ' + rb.hint); return; }
        journal.robe = rb.id;
        saveJournal();
        applyRobeToMonk(player.mesh, rb.id);
        openJournalModal();
        showToast('已换上「' + rb.name + '」');
      };
      robeGrid.appendChild(btn);
    });
    journalOverlay.classList.remove('hidden');
  }
  document.getElementById('close-journal').onclick = () => journalOverlay.classList.add('hidden');
  document.getElementById('btn-temple').onclick = () => templeOverlay.classList.remove('hidden');
  document.getElementById('close-temple').onclick = () => templeOverlay.classList.add('hidden');

  /* ================= 15. 天色、视角与人数切换 ================= */
  function applyMood(moodId) {
    const m = MOODS.find(x => x.id === moodId) || MOODS[0];
    journal.mood = m.id;
    saveJournal();
    const skyTex = makeTex(32, 256, (c, w, h) => {
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, m.skyTop);
      g.addColorStop(0.45, m.skyMid);
      g.addColorStop(0.65, m.skyBot);
      g.addColorStop(1, m.skyBot);
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
    });
    if (skyDome.material.map) skyDome.material.map.dispose();
    skyDome.material.map = skyTex;
    skyDome.material.needsUpdate = true;
    moonMesh.visible = m.id === 'night';
    scene.fog = new THREE.FogExp2(m.fog, m.fogDensity);
    sunLight.color.setHex(m.sunColor);
    sunLight.intensity = m.sunInt;
    sunLight.position.set(m.sunPos[0], m.sunPos[1], m.sunPos[2]);
    ambLight.color.setHex(m.ambSky);
    ambLight.groundColor.setHex(m.ambGnd);
    ambLight.intensity = m.ambInt;
    hallLight.intensity = m.hallInt;
    sunBeam.material.opacity = m.id === 'night' ? 0.045 : 0.085;
    lanternLights.forEach(l => { l.intensity = m.lanternInt; });
    airParticles.forEach((ap, i) => {
      ap.mesh.material.color.setHex(m.id === 'night' ? 0xffe699 : (i % 2 ? 0xf2c144 : 0xe5a528));
    });
    document.getElementById('mood-txt').textContent = m.label;
    if (typeof onMoodChange !== 'undefined') onMoodChange.forEach(fn => fn(m));
  }
  applyMood(journal.mood);

  document.getElementById('btn-mood').onclick = () => {
    const idx = MOODS.findIndex(m => m.id === journal.mood);
    const next = MOODS[(idx + 1) % MOODS.length];
    applyMood(next.id);
    showToast('已切换天色：' + next.label);
  };

  document.getElementById('sound-txt').textContent = journal.sound ? '有声' : '静音';
  document.getElementById('btn-sound').onclick = () => {
    journal.sound = !journal.sound;
    saveJournal();
    document.getElementById('sound-txt').textContent = journal.sound ? '有声' : '静音';
    showToast(journal.sound ? '已开启交互音效' : '已静音');
  };

  document.getElementById('btn-journal').onclick = openJournalModal;

  document.getElementById('btn-view').onclick = () => {
    camState.inHallView = !camState.inHallView;
    if (camState.inHallView) {
      walkPlayerTo(1.2, -11.8, 'sit_arrive', HALL_Y + 0.12);
      camState.dist = 10.5; camState.pitch = 0.2; camState.yaw = 0.22;
      document.getElementById('view-txt').textContent = '出庭院';
    } else {
      walkPlayerTo(0, 12.6, '');
      camState.dist = 16.5; camState.pitch = 0.22; camState.yaw = 0;
      document.getElementById('view-txt').textContent = '进大殿';
    }
  };

  function toggleCrowd() {
    crowdMode = !crowdMode;
    extraMonks.forEach(em => { em.mesh.root.visible = crowdMode; });
    const count = crowdMode ? 2 + extraMonks.length : 2;
    document.getElementById('peer-count').textContent = count + ' / 100';
    document.getElementById('crowd-txt').textContent = count + '人共修';
    showToast(crowdMode ? '雍和宫正殿已聚 ' + count + ' 位香客共拜' : '已切换为 2 人清静共修');
  }
  document.getElementById('btn-crowd').onclick = toggleCrowd;
  document.getElementById('room-pill').onclick = toggleCrowd;

  document.querySelectorAll('.dock-btn').forEach(btn => {
    btn.onclick = () => doAction(btn.dataset.act);
  });

  /* ================= 16. 鼠标/触控/键盘交互 ================= */
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let drag = null;

  canvas.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    canvas.setPointerCapture(e.pointerId);
    drag = { id: e.pointerId, startX: e.clientX, startY: e.clientY, lastX: e.clientX, lastY: e.clientY, moved: false };
  });

  canvas.addEventListener('pointermove', e => {
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.lastX, dy = e.clientY - drag.lastY;
    if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 6) drag.moved = true;
    if (drag.moved) {
      fadeHint();
      camState.yaw -= dx * 0.0024;
      camState.pitch = THREE.MathUtils.clamp(camState.pitch + dy * 0.002, 0.08, 0.88);
    }
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
  });

  canvas.addEventListener('pointerup', e => {
    if (!drag || drag.id !== e.pointerId) return;
    const wasMoved = drag.moved;
    drag = null;
    if (wasMoved) return;

    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const propHits = raycaster.intersectObjects(clickableProps, false);
    if (propHits.length) {
      const obj = propHits[0].object;
      if (obj.userData.cushion) {
        const c = obj.userData.cushion;
        walkPlayerTo(c.x, c.z, 'sit_arrive', c.y);
        return;
      }
      if (obj.userData.propAction) { doAction(obj.userData.propAction); return; }
    }

    const groundHits = raycaster.intersectObjects(clickableGround, false);
    if (groundHits.length) {
      const pt = groundHits[0].point;
      walkPlayerTo(pt.x, pt.z, '');
    }
  });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    camState.dist = THREE.MathUtils.clamp(camState.dist + e.deltaY * 0.0085, 6.0, 34);
  }, { passive: false });

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      allOverlays.forEach(ov => { if (ov) ov.classList.add('hidden'); });
      return;
    }
    if (!allOverlays.every(ov => !ov || ov.classList.contains('hidden'))) return;
    const map = { '1': 'hands', '2': 'bow', '3': 'incense', '4': 'wheel', '5': 'beads', '6': 'wood', '7': 'sit', '8': 'lot' };
    if (map[e.key]) doAction(map[e.key]);
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ================= 17. 主循环 ================= */
  let clockTime = 0, lastNow = performance.now();

  function tick() {
    requestAnimationFrame(tick);
    const now = performance.now();
    const dt = Math.min(0.08, (now - lastNow) / 1000);
    lastNow = now;
    clockTime += dt;

    if (player.target) {
      const dx = player.target.x - player.x;
      const dz = player.target.z - player.z;
      const d = Math.hypot(dx, dz);
      const speed = 4.4 * dt;
      if (d <= speed) {
        player.x = player.target.x;
        player.z = player.target.z;
        player.y = player.target.customY != null ? player.target.customY : surfaceYAt(player.x, player.z);
        const arrival = player.target.arrival;
        player.target = null;
        player.pose = 'idle';
        if (arrival) completeArrival(arrival);
      } else {
        player.x += dx / d * speed;
        player.z += dz / d * speed;
        player.y = surfaceYAt(player.x, player.z);
        player.rotY = Math.atan2(dx, dz);
      }
    } else if (player.poseUntil && clockTime >= player.poseUntil) {
      player.pose = 'idle';
      player.poseUntil = 0;
      updateDockActive();
    }
    if (player.pose === 'bow') player.pulse = Math.min(1, player.pulse + dt * 0.65);
    if (player.pose === 'sit') journal.sit += dt;

    if (companion.target) {
      const dx = companion.target.x - companion.x;
      const dz = companion.target.z - companion.z;
      const d = Math.hypot(dx, dz);
      const step = 3.0 * dt;
      if (d <= step) {
        companion.x = companion.target.x;
        companion.z = companion.target.z;
        companion.y = companion.target.pose === 'sit' ? HALL_Y + 0.12 : surfaceYAt(companion.x, companion.z);
        companion.pose = companion.target.pose;
        companion.rotY = companion.target.rotY;
        companion.until = clockTime + companion.target.dur;
        companion.pulse = 0.01;
        companion.target = null;
      } else {
        companion.x += dx / d * step;
        companion.z += dz / d * step;
        companion.y = surfaceYAt(companion.x, companion.z);
        companion.rotY = Math.atan2(dx, dz);
      }
    } else if (clockTime >= companion.until) {
      companion.stepIdx = (companion.stepIdx + 1) % companionPlan.length;
      companion.target = companionPlan[companion.stepIdx];
      companion.pose = 'walk';
    }
    if (companion.pose === 'bow') companion.pulse = (companion.pulse + dt * 0.55) % 1;

    if (crowdMode) {
      for (const em of extraMonks) {
        if (clockTime >= em.nextBow) {
          em.pose = 'bow'; em.pulse = 0.01; em.bowUntil = clockTime + 2.0;
          em.nextBow = clockTime + 11 + Math.random() * 9;
        }
        if (em.pose === 'bow') {
          em.pulse = Math.min(1, em.pulse + dt * 0.55);
          if (clockTime >= em.bowUntil) em.pose = 'sit';
        }
        animateMonk(em, clockTime, dt);
      }
    }

    for (const pw of prayerWheels) {
      if (pw.vel > 0.05) {
        pw.mesh.rotation.y += pw.vel * dt;
        pw.vel *= Math.exp(-dt * 1.4);
      }
    }

    const incenseActive = clockTime < incenseFlareUntil;
    emberLight.intensity = (incenseActive ? 1.65 : 0.78) + Math.sin(clockTime * 6.5) * 0.18;
    for (const et of emberTips) {
      const s = 0.88 + Math.sin(clockTime * 7.2 + et.phase) * 0.22 + (incenseActive ? 0.25 : 0);
      et.mesh.scale.setScalar(s);
    }

    for (const sp of smokeParticles) {
      const speed = incenseActive ? 0.32 : 0.22;
      const f = (clockTime * speed + sp.phase) % 1;
      const laneX = (sp.lane || 0) * 0.22;
      sp.mesh.position.y = 2.72 + f * 4.2;
      sp.mesh.position.x = laneX + Math.sin(clockTime * 1.3 + sp.phase * 6.2) * (0.14 + 0.36 * f);
      sp.mesh.position.z = 2.2 + Math.cos(clockTime * 1.1 + sp.phase * 5.4) * (0.12 * f);
      sp.mesh.scale.setScalar(0.65 + f * (incenseActive ? 2.6 : 2.1));
      sp.mesh.material.opacity = Math.sin(f * Math.PI) * (incenseActive ? 0.44 : 0.31);
    }

    const isNight = journal.mood === 'night';
    for (const ap of airParticles) {
      const m = ap.mesh;
      if (isNight) {
        m.position.y += Math.sin(clockTime * 1.8 + ap.seed) * dt * 0.25;
        m.position.x += Math.cos(clockTime * 1.1 + ap.seed) * dt * 0.2;
        m.material.opacity = 0.25 + 0.65 * Math.max(0, Math.sin(clockTime * 2.8 + ap.seed));
      } else {
        m.position.y -= ap.speed * dt;
        m.position.x += Math.sin(clockTime + ap.seed) * dt * 0.42;
        m.rotation.x += dt * 1.2;
        m.rotation.z += dt * 0.9;
        if (m.position.y < 0.2) m.position.y = 11.5;
        m.material.opacity = 0.8;
      }
    }

    const rAge = clockTime - rippleTime;
    if (rAge >= 0 && rAge < 0.9) {
      const k = rAge / 0.9;
      rippleMesh.scale.setScalar(0.8 + k * 2.4);
      rippleMesh.material.opacity = (1 - k) * 0.85;
    } else {
      rippleMesh.material.opacity = 0;
    }

    animateMonk(player, clockTime, dt);
    animateMonk(companion, clockTime, dt);
    for (const fn of extOnTick) fn(clockTime, dt);
    updateCamera(dt);
    renderer.render(scene, camera);
  }

  const customActions = {};
  const customArrivals = {};
  const extOnTick = [];
  const onMoodChange = [];
  window.YHG3D = {
    renderer, scene, camera, skyDome, sunLight, ambLight, smokeParticles, MOODS,
    clickableProps, player, camState, journal,
    HALL_Y, HALL_Z, plaque, mainHallGroup, mainBuddhaSlot, sideBuddhas: [sideBuddhaL, sideBuddhaR],
    marbleMat, palaceRedMat, pillarRedMat, goldRoofMat, hexieMat, darkEaveMat, bronzeMat,
    goldMat, antiqueGoldMat, buddhaFaceMat, turquoiseMat, hallLight, buddhaSpot, lanternLights,
    buildImperialRoof, createMonkMesh, applyRobeToMonk, animateMonk, walkPlayerTo, doAction,
    playSound, showToast, spawnZenWord, surfaceYAt, makeTex, allOverlays,
    onTick: extOnTick,
    onMoodChange,
    getClockTime: () => clockTime,
    registerAction: (name, fn) => { customActions[name] = fn; },
    registerArrival: (name, fn) => { customArrivals[name] = fn; }
  };

  tick();
})();
