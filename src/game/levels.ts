import { Brick, BrickType, LevelConfig, PowerUpType } from '../types/game';

export const BRICK_COLORS: Record<BrickType, { fill: string; stroke: string; glow: string; text?: string }> = {
  normal: {
    fill: '#06b6d4',      // Cyan (1 HP)
    stroke: '#67e8f9',
    glow: 'rgba(6, 182, 212, 0.4)'
  },
  tough: {
    fill: '#a855f7',      // Purple (2 HP)
    stroke: '#d8b4fe',
    glow: 'rgba(168, 85, 247, 0.45)'
  },
  hardened: {
    fill: '#f43f5e',      // Rose / Crimson (3 HP)
    stroke: '#fda4af',
    glow: 'rgba(244, 63, 94, 0.5)'
  },
  unbreakable: {
    fill: '#334155',      // Titanium Steel
    stroke: '#94a3b8',
    glow: 'rgba(148, 163, 184, 0.3)'
  },
  tnt: {
    fill: '#ea580c',      // Fiery Orange
    stroke: '#fdba74',
    glow: 'rgba(234, 88, 12, 0.65)'
  },
  powerup: {
    fill: '#eab308',      // Gold / Electric Yellow
    stroke: '#fef08a',
    glow: 'rgba(234, 179, 8, 0.6)'
  },
  bumper: {
    fill: '#ec4899',      // Neon Magenta Bumper
    stroke: '#f472b6',
    glow: 'rgba(236, 72, 153, 0.7)'
  },
  glitch: {
    fill: '#10b981',      // Quantum Emerald Glitch
    stroke: '#6ee7b7',
    glow: 'rgba(16, 185, 129, 0.6)'
  },
  regen: {
    fill: '#84cc16',      // Nanite Lime Green
    stroke: '#bef264',
    glow: 'rgba(132, 204, 22, 0.65)'
  },
  moving: {
    fill: '#6366f1',      // Cyber Indigo Patrol
    stroke: '#a5b4fc',
    glow: 'rgba(99, 102, 241, 0.6)'
  }
};

export const POWER_UP_CONFIG: Record<PowerUpType, { label: string; symbol: string; color: string; desc: string }> = {
  multiball: {
    label: '多重球',
    symbol: '⚡3',
    color: '#06b6d4',
    desc: '球體分裂為 3 顆高速球'
  },
  laser: {
    label: '雷射砲',
    symbol: '🔫',
    color: '#f43f5e',
    desc: '擋板配備雙聯裝脈衝雷射 (空白鍵/點擊射擊)'
  },
  fireball: {
    label: '烈焰貫穿',
    symbol: '🔥',
    color: '#f97316',
    desc: '球體燃燒烈焰，不彈跳直接貫穿所有磚塊'
  },
  expand: {
    label: '加寬護板',
    symbol: '⬌',
    color: '#10b981',
    desc: '擴展擋板 40% 寬度，接球更容易'
  },
  sticky: {
    label: '磁力吸附',
    symbol: '🧲',
    color: '#8b5cf6',
    desc: '球觸碰擋板時吸附，自主瞄準再發射'
  },
  barrier: {
    label: '底層護盾',
    symbol: '🛡️',
    color: '#3b82f6',
    desc: '在底部生成高能防護力場，彈回失足的球'
  },
  slow: {
    label: '子彈時間',
    symbol: '⏱️',
    color: '#06b6d4',
    desc: '球速降低 30%，提供充裕瞄準反應時間'
  },
  life: {
    label: '額外生命',
    symbol: '❤️',
    color: '#ec4899',
    desc: '恢復 1 點生命值'
  },
  megaball: {
    label: '電漿巨球',
    symbol: '☄️',
    color: '#a855f7',
    desc: '球體膨脹為 2 倍巨型電漿球，衝撞判定範圍翻倍'
  }
};

// Shorthands for cleaner level grids
const _N: BrickType = 'normal';
const _T: BrickType = 'tough';
const _H: BrickType = 'hardened';
const _U: BrickType = 'unbreakable';
const _B: BrickType = 'tnt';
const _P: BrickType = 'powerup';
const _M: BrickType = 'bumper';
const _G: BrickType = 'glitch';
const _R: BrickType = 'regen';
const _V: BrickType = 'moving';
const __ = null;

// Level 1: 霓虹初升 (Classic Layered Neon)
const LEVEL_1: LevelConfig = {
  id: 'lvl-1',
  name: '第 1 關 · 霓虹初升',
  description: '經典層疊結構，熟悉手感與彈射物理',
  theme: 'cyan',
  cols: 10,
  rows: 8,
  grid: [
    [_N, _N, _N, _N, _P, _P, _N, _N, _N, _N],
    [_N, _T, _N, _N, _N, _N, _N, _N, _T, _N],
    [_T, _T, _T, _T, _B, _B, _T, _T, _T, _T],
    [__, _N, _P, _N, _N, _N, _N, _P, _N, __],
    [_N, _N, _N, _T, _T, _T, _T, _N, _N, _N],
    [__, _N, _N, _N, _N, _N, _N, _N, _N, __],
    [__, __, _P, _N, _N, _N, _N, _P, __, __],
    [__, __, __, __, __, __, __, __, __, __],
  ]
};

// Level 2: 太空入侵者 (Space Invader Pixel Art)
const LEVEL_2: LevelConfig = {
  id: 'lvl-2',
  name: '第 2 關 · 太空入侵者',
  description: '復古外星入侵者造型，內藏高爆 TNT 能源核心',
  theme: 'cyan',
  cols: 10,
  rows: 9,
  grid: [
    [__, __, _H, __, __, __, __, _H, __, __],
    [__, __, __, _H, __, __, _H, __, __, __],
    [__, __, _T, _T, _T, _T, _T, _T, __, __],
    [__, _T, _T, _U, _T, _T, _U, _T, _T, __],
    [_T, _T, _T, _B, _P, _P, _B, _T, _T, _T],
    [_N, _N, _T, _T, _T, _T, _T, _T, _N, _N],
    [_N, __, _N, __, __, __, __, _N, __, _N],
    [__, _N, __, _P, __, __, _P, __, _N, __],
    [__, __, __, __, __, __, __, __, __, __],
  ]
};

// Level 3: 彈珠彈跳樂園 (Pinball Bumper Arena)
const LEVEL_3: LevelConfig = {
  id: 'lvl-3',
  name: '第 3 關 · 彈珠彈跳樂園',
  description: '中央配備超彈力霓虹彈簧核心，享受極速彈射連擊',
  theme: 'inferno',
  cols: 10,
  rows: 9,
  grid: [
    [_T, _N, _P, _N, _H, _H, _N, _P, _N, _T],
    [_N, _T, _N, __, __, __, __, _N, _T, _N],
    [_P, _N, __, _M, __, __, _M, __, _N, _P],
    [_N, __, __, __, _B, _B, __, __, __, _N],
    [_H, __, _M, __, _P, _P, __, _M, __, _H],
    [_T, __, __, __, _B, _B, __, __, __, _T],
    [_N, _T, __, _M, __, __, _M, __, _T, _N],
    [__, _N, _N, _N, _N, _N, _N, _N, _N, __],
    [__, __, __, __, __, __, __, __, __, __],
  ]
};

// Level 4: 鑽石之眼 (Diamond Vault)
const LEVEL_4: LevelConfig = {
  id: 'lvl-4',
  name: '第 4 關 · 鑽石之眼',
  description: '菱形幾何護甲，需突破重裝外圍直搗核心',
  theme: 'galaxy',
  cols: 10,
  rows: 10,
  grid: [
    [__, __, __, __, _U, _U, __, __, __, __],
    [__, __, __, _H, _P, _P, _H, __, __, __],
    [__, __, _H, _T, _B, _B, _T, _H, __, __],
    [__, _H, _T, _N, _P, _P, _N, _T, _H, __],
    [_U, _P, _B, _P, _H, _H, _P, _B, _P, _U],
    [_U, _P, _B, _P, _H, _H, _P, _B, _P, _U],
    [__, _H, _T, _N, _P, _P, _N, _T, _H, __],
    [__, __, _H, _T, _B, _B, _T, _H, __, __],
    [__, __, __, _H, _T, _T, _H, __, __, __],
    [__, __, __, __, _U, _U, __, __, __, __],
  ]
};

// Level 5: 量子迷霧 (Quantum Glitch Portal)
const LEVEL_5: LevelConfig = {
  id: 'lvl-5',
  name: '第 5 關 · 量子迷霧',
  description: '虛位磚塊週期性閃爍穿透，抓住實體瞬間一擊必殺',
  theme: 'matrix',
  cols: 10,
  rows: 9,
  grid: [
    [_G, _G, _T, _H, _P, _P, _H, _T, _G, _G],
    [_G, _N, _G, _N, _B, _B, _N, _G, _N, _G],
    [_H, _G, _H, _G, _T, _T, _G, _H, _G, _H],
    [__, _V, __, _G, _P, _P, _G, __, _V, __],
    [_U, _T, _G, _T, _H, _H, _T, _G, _T, _U],
    [__, _G, _B, _G, _M, _M, _G, _B, _G, __],
    [_N, _N, _G, _N, _N, _N, _N, _G, _N, _N],
    [__, _P, __, _T, _T, _T, _T, __, _P, __],
    [__, __, __, __, __, __, __, __, __, __],
  ]
};

// Level 6: 像素幽靈 (Pac-Ghost Tribute)
const LEVEL_6: LevelConfig = {
  id: 'lvl-6',
  name: '第 6 關 · 像素幽靈',
  description: '致敬街機經典！外圍重裝護衛，靈動的紅色小鬼矩陣',
  theme: 'inferno',
  cols: 10,
  rows: 10,
  grid: [
    [__, __, _H, _H, _H, _H, _H, _H, __, __],
    [__, _H, _H, _H, _H, _H, _H, _H, _H, __],
    [_H, _H, _U, _U, _H, _H, _U, _U, _H, _H],
    [_H, _H, _P, _U, _H, _H, _P, _U, _H, _H],
    [_H, _H, _H, _H, _B, _B, _H, _H, _H, _H],
    [_H, _T, _T, _T, _T, _T, _T, _T, _T, _H],
    [_T, _N, _P, _N, _P, _N, _P, _N, _P, _T],
    [_H, _N, __, _H, __, __, _H, __, _N, _H],
    [_H, __, __, _H, __, __, _H, __, __, _H],
    [__, __, __, __, __, __, __, __, __, __],
  ]
};

// Level 7: 賽博蝴蝶 (Cyber Butterfly)
const LEVEL_7: LevelConfig = {
  id: 'lvl-7',
  name: '第 7 關 · 賽博蝴蝶',
  description: '華麗對稱的光翼矩陣，巡邏無人機穿梭於雙翼之間',
  theme: 'galaxy',
  cols: 10,
  rows: 10,
  grid: [
    [_T, _H, __, __, _P, _P, __, __, _H, _T],
    [_H, _B, _T, __, _U, _U, __, _T, _B, _H],
    [_P, _T, _N, _T, _H, _H, _T, _N, _T, _P],
    [_H, _N, _N, _B, _T, _T, _B, _N, _N, _H],
    [__, _V, _P, _T, _M, _M, _T, _P, _V, __],
    [_T, _N, _T, _B, _P, _P, _B, _T, _N, _T],
    [_H, _T, __, _N, _H, _H, _N, __, _T, _H],
    [_P, __, __, __, _T, _T, __, __, __, _P],
    [__, __, __, __, _N, _N, __, __, __, __],
    [__, __, __, __, __, __, __, __, __, __],
  ]
};

// Level 8: 旋轉銀河 (Spiral Galaxy Vortex)
const LEVEL_8: LevelConfig = {
  id: 'lvl-8',
  name: '第 8 關 · 旋轉銀河',
  description: '螺旋狀星系引力臂，深層藏有高密度能量核心',
  theme: 'galaxy',
  cols: 10,
  rows: 10,
  grid: [
    [_H, _T, _N, _N, _N, _N, _N, _N, _N, _N],
    [__, __, __, __, __, __, __, __, _T, _H],
    [_N, _N, _T, _H, _B, _P, _N, __, _N, _P],
    [_N, _T, _P, __, _M, _T, _H, __, _N, _B],
    [_N, _H, _B, _T, _U, _U, _P, __, _N, _T],
    [_N, _P, _T, _M, _U, _U, _B, __, _N, _N],
    [_N, _N, _H, _B, _P, _H, _T, __, __, __],
    [_T, __, __, __, __, __, __, _T, _H, _P],
    [_H, _N, _N, _N, _N, _N, _N, _N, _T, _H],
    [__, __, __, __, __, __, __, __, __, __],
  ]
};

// Level 9: 奈米生化堡壘 (Nanite Citadel)
const LEVEL_9: LevelConfig = {
  id: 'lvl-9',
  name: '第 9 關 · 奈米生化堡壘',
  description: '綠色奈米磚若不及時摧毀將自我修復，需集中火力攻克',
  theme: 'matrix',
  cols: 10,
  rows: 10,
  grid: [
    [_U, _R, _R, _B, _H, _H, _B, _R, _R, _U],
    [_R, _H, _P, _R, _U, _U, _R, _P, _H, _R],
    [_R, _P, _R, _T, _V, _V, _T, _R, _P, _R],
    [_B, _R, _T, _N, _P, _P, _N, _T, _R, _B],
    [_U, _U, _H, _P, _M, _M, _P, _H, _U, _U],
    [__, _R, _R, _B, _T, _T, _B, _R, _R, __],
    [__, _H, _P, _R, _N, _N, _R, _P, _H, __],
    [_T, _N, _T, _R, _H, _H, _R, _T, _N, _T],
    [_N, _N, _N, _N, _N, _N, _N, _N, _N, _N],
    [__, __, __, __, __, __, __, __, __, __],
  ]
};

// Level 10: 終極魔王：機甲巨神 (Mecha Titan Boss Battle)
const LEVEL_10: LevelConfig = {
  id: 'lvl-10',
  name: '第 10 關 · 終極魔王：機甲巨神',
  description: '終局決戰！巨大的機甲頭部、移動巡邏護衛艦與高爆彈簧防禦矩陣',
  theme: 'boss',
  bossName: 'MECHA TITAN OVERLORD',
  cols: 10,
  rows: 11,
  grid: [
    [_U, _H, _B, _H, _U, _U, _H, _B, _H, _U],
    [_H, _B, _P, _B, _H, _H, _B, _P, _B, _H],
    [_H, _T, _U, _U, _M, _M, _U, _U, _T, _H],
    [_H, _P, _U, _H, _B, _B, _H, _U, _P, _H],
    [_V, _B, _T, _R, _P, _P, _R, _T, _B, _V],
    [_U, _H, _M, _G, _H, _H, _G, _M, _H, _U],
    [__, _H, _T, _N, _P, _P, _N, _T, _H, __],
    [__, _U, _B, _T, _M, _M, _T, _B, _U, __],
    [__, __, _H, _N, _P, _P, _N, _H, __, __],
    [__, __, __, _V, _T, _T, _V, __, __, __],
    [__, __, __, __, __, __, __, __, __, __],
  ]
};

export const BUILTIN_LEVELS: LevelConfig[] = [
  LEVEL_1,
  LEVEL_2,
  LEVEL_3,
  LEVEL_4,
  LEVEL_5,
  LEVEL_6,
  LEVEL_7,
  LEVEL_8,
  LEVEL_9,
  LEVEL_10,
];

// Helper to instantiate bricks for a canvas width/height
export function createBricksFromConfig(
  config: LevelConfig,
  arenaWidth: number,
  _arenaHeight: number
): Brick[] {
  const bricks: Brick[] = [];
  const paddingX = 40;
  const marginTop = 50;
  const gap = 6;

  const cols = config.cols;
  const rows = config.rows;
  const availableWidth = arenaWidth - paddingX * 2 - (cols - 1) * gap;
  const brickWidth = Math.floor(availableWidth / cols);
  const brickHeight = 22;

  const powerupChoices: PowerUpType[] = [
    'multiball',
    'laser',
    'fireball',
    'expand',
    'sticky',
    'barrier',
    'slow',
    'life',
    'megaball'
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const type = config.grid[r]?.[c];
      if (!type) continue;

      const x = paddingX + c * (brickWidth + gap);
      const y = marginTop + r * (brickHeight + gap);

      let maxHp = 1;
      let points = 50;
      let isPatrol = false;

      if (type === 'tough') {
        maxHp = 2;
        points = 100;
      } else if (type === 'hardened') {
        maxHp = 3;
        points = 200;
      } else if (type === 'unbreakable') {
        maxHp = Infinity;
        points = 0;
      } else if (type === 'tnt') {
        maxHp = 1;
        points = 150;
      } else if (type === 'powerup') {
        maxHp = 1;
        points = 120;
      } else if (type === 'bumper') {
        maxHp = 4; // High durability bumper
        points = 180;
      } else if (type === 'glitch') {
        maxHp = 1;
        points = 160;
      } else if (type === 'regen') {
        maxHp = 3;
        points = 220;
      } else if (type === 'moving') {
        maxHp = 2;
        points = 180;
        isPatrol = true;
      }

      // Determine powerup drop
      let assignedPowerUp: PowerUpType | undefined = undefined;
      if (type === 'powerup') {
        assignedPowerUp = powerupChoices[Math.floor(Math.random() * powerupChoices.length)];
      } else if (type !== 'unbreakable') {
        // 13% random drop chance for standard bricks
        if (Math.random() < 0.13) {
          assignedPowerUp = powerupChoices[Math.floor(Math.random() * powerupChoices.length)];
        }
      }

      bricks.push({
        id: `brick-${r}-${c}-${Math.random().toString(36).substring(2, 7)}`,
        x,
        y,
        width: brickWidth,
        height: brickHeight,
        type,
        maxHp,
        hp: maxHp,
        color: BRICK_COLORS[type].fill,
        points,
        powerUp: assignedPowerUp,
        vx: isPatrol ? (Math.random() > 0.5 ? 1.5 : -1.5) : 0,
        minX: Math.max(20, x - 80),
        maxX: Math.min(arenaWidth - brickWidth - 20, x + 80),
        regenTimer: 0,
        phaseTimer: Math.random() * 3,
        isPhasedOut: false
      });
    }
  }

  return bricks;
}
