import React from 'react';
import { X, Gamepad2 } from 'lucide-react';
import { POWER_UP_CONFIG } from '../game/levels';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(6,182,212,0.25)] text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Gamepad2 className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-bold font-['Chakra_Petch'] tracking-wide text-white">
              遊戲指南與十代關卡機關圖鑑
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-6 text-sm">
          {/* Controls */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-cyan-400 mb-3 flex items-center gap-1.5">
              <span>🎮 操作方式</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-1">左右移動擋板</span>
                <p className="text-slate-400">
                  滑鼠左右滑動、手機/平板螢幕觸控拖曳，或使用鍵盤 <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-cyan-300 font-mono">A</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-cyan-300 font-mono">D</kbd> 及方向鍵。發球前具有<strong>虛線瞄準輔助線</strong>！
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-1">發射球體 / 雷射砲</span>
                <p className="text-slate-400">
                  按 <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-cyan-300 font-mono">空白鍵</kbd> 或點擊滑鼠/輕觸右下角 FIRE 鈕；獲得雷射道具後可高速連續射擊！
                </p>
              </div>
            </div>
          </div>

          {/* Bricks Guide */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-purple-400 mb-3 flex items-center gap-1.5">
              <span>🧱 特殊磚塊與動態機關</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-cyan-500/30 flex items-center gap-2.5">
                <div className="w-5 h-4 rounded bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                <div>
                  <div className="font-bold text-xs text-cyan-300">普通磚 (1 HP)</div>
                  <div className="text-[11px] text-slate-400">50 分 · 易擊破</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-purple-500/30 flex items-center gap-2.5">
                <div className="w-5 h-4 rounded bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                <div>
                  <div className="font-bold text-xs text-purple-300">強韌磚 (2 HP)</div>
                  <div className="text-[11px] text-slate-400">100 分 · 受損裂痕</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-rose-500/30 flex items-center gap-2.5">
                <div className="w-5 h-4 rounded bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                <div>
                  <div className="font-bold text-xs text-rose-300">重裝磚 (3 HP)</div>
                  <div className="text-[11px] text-slate-400">200 分 · 耐受度高</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-orange-500/30 flex items-center gap-2.5">
                <div className="w-5 h-4 rounded bg-orange-600 flex items-center justify-center text-[9px] font-black text-white shadow-[0_0_8px_rgba(234,88,12,0.8)]">
                  TNT
                </div>
                <div>
                  <div className="font-bold text-xs text-orange-400">爆破 TNT</div>
                  <div className="text-[11px] text-slate-400">引發 3x3 連鎖大爆炸</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-pink-500/30 flex items-center gap-2.5">
                <div className="w-5 h-4 rounded bg-pink-500 flex items-center justify-center text-[10px] text-white font-bold shadow-[0_0_8px_rgba(236,72,153,0.8)]">
                  🌀
                </div>
                <div>
                  <div className="font-bold text-xs text-pink-300">彈珠彈跳核心</div>
                  <div className="text-[11px] text-slate-400">高衝量反彈 +150 分</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-emerald-500/30 flex items-center gap-2.5">
                <div className="w-5 h-4 rounded bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold shadow-[0_0_8px_rgba(16,185,129,0.8)]">
                  ⚡
                </div>
                <div>
                  <div className="font-bold text-xs text-emerald-300">量子虛位磚</div>
                  <div className="text-[11px] text-slate-400">週期性實體/虛化穿透</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-lime-500/30 flex items-center gap-2.5">
                <div className="w-5 h-4 rounded bg-lime-500 flex items-center justify-center text-[10px] text-slate-950 font-bold shadow-[0_0_8px_rgba(132,204,22,0.8)]">
                  🧪
                </div>
                <div>
                  <div className="font-bold text-xs text-lime-400">奈米修復磚</div>
                  <div className="text-[11px] text-slate-400">若未擊毀將持續自我修復</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-indigo-500/30 flex items-center gap-2.5">
                <div className="w-5 h-4 rounded bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold shadow-[0_0_8px_rgba(99,102,241,0.8)]">
                  ⬌
                </div>
                <div>
                  <div className="font-bold text-xs text-indigo-300">巡邏無人磚</div>
                  <div className="text-[11px] text-slate-400">左右水平動態平移巡邏</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-700 flex items-center gap-2.5">
                <div className="w-5 h-4 rounded bg-slate-700 flex items-center justify-center text-[10px] text-slate-300">
                  🛡️
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-300">金屬鋼甲</div>
                  <div className="text-[11px] text-slate-400">不可破壞 · 考驗反彈角度</div>
                </div>
              </div>
            </div>
          </div>

          {/* Power-ups Guide */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-3 flex items-center gap-1.5">
              <span>⚡ 9 種能量道具</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.entries(POWER_UP_CONFIG).map(([key, item]) => (
                <div
                  key={key}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
                    style={{ backgroundColor: `${item.color}25`, color: item.color, border: `1px solid ${item.color}60` }}
                  >
                    {item.symbol}
                  </div>
                  <div>
                    <div className="font-bold text-xs" style={{ color: item.color }}>
                      {item.label}
                    </div>
                    <div className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fever Mode System */}
          <div className="p-3.5 bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-slate-950/40 rounded-xl border border-yellow-500/30 text-xs">
            <span className="font-bold text-yellow-300 block mb-1">⚡ FEVER MODE 狂熱時間機制</span>
            <p className="text-slate-300 leading-relaxed">
              當連擊達到 <span className="text-yellow-400 font-bold">5 COMBO 以上</span>時，全場將進入狂熱時間！周圍散發金色能量光環，擊破所有磚塊獲得 <span className="text-amber-300 font-bold">200% 雙倍分數倍率</span>！
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors shadow-lg shadow-cyan-500/20"
          >
            返回遊戲挑戰！
          </button>
        </div>
      </div>
    </div>
  );
};
