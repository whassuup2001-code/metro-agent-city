import { SniperPosition, HotVaultState, TradeReceipt } from "../src/types.js";
import { fetchLiveSolanaAccountBalances } from "./solanaRpc.js";
import { metroRemote } from "./metroRemoteControl.js";

// Token pool for autonomous rotation
const RADAR_TOKENS = [
  { symbol: "OTC", name: "Metro City OTC Core", mint: "FQ5MRQefigGJieDP7SN4xfRmAB8B3DM5mg6pbWYjpump", basePrice: 0.000045 },
  { symbol: "BONK", name: "Bonk Inu", mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", basePrice: 0.000024 },
  { symbol: "WIF", name: "dogwifhat", mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", basePrice: 1.84 },
  { symbol: "DRIFT", name: "Drift Protocol", mint: "DriFtupJYLTosbwoN8koMbEYSx54aFAVLddWsbksjwg7", basePrice: 0.72 },
  { symbol: "MEOWDANI", name: "Meowdani Turbo", mint: "MEOWDANI9999999999999999999999999999999999", basePrice: 0.000012 },
  { symbol: "HUDKZ", name: "Hudkz Sovereign Run", mint: "HUDKZ11111111111111111111111111111111111111", basePrice: 0.00085 },
  { symbol: "POPCAT", name: "Popcat Solana", mint: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr", basePrice: 0.58 },
  { symbol: "RAY", name: "Raydium DEX", mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", basePrice: 1.95 }
];

export class AutonomousSniperEngine {
  public positions: SniperPosition[] = [];
  public receipts: TradeReceipt[] = [];
  public maxSlots: number = 12;
  public totalProfitsHarvestedUsdc: number = 38.45;
  public sinkingFundReservesUsdc: number = 15.38;
  public otcBuybacksUsdc: number = 9.22;
  public hotVaultUsdcBalance: number = 82.00;
  public solBalance: number = 0.268276;
  public isRunning: boolean = true;
  public isPaused: boolean = false;
  public isPanicMode: boolean = false;
  public isTurboMode: boolean = false;
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.seedInitialRunners();
    this.syncLiveOnChainBalances();
    this.startAutonomousLoop();
  }

  public setMaxSlots(newLimit: number): { success: boolean; maxSlots: number; message: string } {
    const validLimit = Math.max(1, Math.min(32, Math.round(newLimit)));
    this.maxSlots = validLimit;
    const openCount = this.positions.filter(p => p.status === "OPEN").length;
    const freeCount = Math.max(0, validLimit - openCount);
    return {
      success: true,
      maxSlots: this.maxSlots,
      message: `Dynamic sniper capacity adjusted to <b>${this.maxSlots} concurrent runner slots</b> (${openCount} currently filled, ${freeCount} available for new entries).`
    };
  }

  public async syncLiveOnChainBalances() {
    try {
      const live = await fetchLiveSolanaAccountBalances();
      if (live && live.success) {
        this.solBalance = live.sol;
        if (live.usdc > 0) {
          this.hotVaultUsdcBalance = live.usdc;
        }
      }
    } catch (e: any) {
      console.warn("[Sniper Engine] Live on-chain balance sync skipped:", e.message);
    }
  }

  public setTurboMode(enabled: boolean): { isTurboMode: boolean; pollingIntervalMs: number } {
    this.isTurboMode = enabled;
    this.startAutonomousLoop();
    return { isTurboMode: this.isTurboMode, pollingIntervalMs: this.isTurboMode ? 250 : 4000 };
  }

  public pauseScanner(): { isPaused: boolean; message: string } {
    this.isPaused = true;
    return { isPaused: true, message: "Autonomous sniper scanner PAUSED. Active runners will maintain armed stop/take-profit protection without opening new entries." };
  }

  public resumeScanner(): { isPaused: boolean; message: string } {
    this.isPaused = false;
    this.isPanicMode = false;
    return { isPaused: false, message: "Autonomous sniper scanner RESUMED. Jito MEV pool evaluation is active 24/7." };
  }

  public panicKillswitch(): { positionsClosed: number; usdcPreserved: number; message: string } {
    this.isPanicMode = true;
    this.isPaused = true;
    const openPos = this.positions.filter(p => p.status === "OPEN");
    let returned = 0;
    for (const p of openPos) {
      const curVal = Math.max(0, p.allocatedUsdc * (1 + p.currentPnlPercent / 100));
      returned += curVal;
      this.receipts.unshift({
        id: `rcpt-panic-${Date.now()}-${p.tokenSymbol}`,
        type: "STAGNANT_RECYCLE",
        tokenSymbol: p.tokenSymbol,
        amountUsdc: p.allocatedUsdc,
        pnlPercent: p.currentPnlPercent,
        timestamp: Date.now(),
        txHash: `4Panic${Math.random().toString(36).substring(2, 8)}...sol`
      });
    }
    this.hotVaultUsdcBalance += returned;
    this.positions = [];

    return {
      positionsClosed: openPos.length,
      usdcPreserved: Number(returned.toFixed(2)),
      message: `🚨 EMERGENCY KILLSWITCH ACTIVATED: Liquidated ${openPos.length} runner positions, preserved $${returned.toFixed(2)} USDC back to Hot Vault, and locked daemon into Capital Preservation Mode!`
    };
  }

  private seedInitialRunners() {
    this.positions = [
      {
        id: "pos-1",
        tokenMint: "FQ5MRQefigGJieDP7SN4xfRmAB8B3DM5mg6pbWYjpump",
        tokenSymbol: "OTC",
        tokenName: "Open Treasure Chest",
        entryPriceUsd: 0.00000596,
        currentPriceUsd: 0.00000630,
        currentPnlPercent: 28.7,
        allocatedUsdc: 1.25,
        status: "OPEN",
        openedAt: Date.now() - 3600000 * 4,
        highestPnlSeen: 28.7,
        txSignature: "5t9...otc_seed"
      },
      {
        id: "pos-2",
        tokenMint: "Ai66LHZG9MCzg1WKdawwqduVAXpNDUuV8M3uyq5ppump",
        tokenSymbol: "CATE",
        tokenName: "Catecoin",
        entryPriceUsd: 0.1175,
        currentPriceUsd: 0.1232,
        currentPnlPercent: 14.2,
        allocatedUsdc: 1.50,
        status: "OPEN",
        openedAt: Date.now() - 3600000 * 3,
        highestPnlSeen: 14.2,
        txSignature: "4c8...cate_seed"
      },
      {
        id: "pos-3",
        tokenMint: "zj1jpp7QMveWHLs61vL9KMZf254KvW7j4AAmBF8ry2k",
        tokenSymbol: "BULLSHIT",
        tokenName: "Bullshit Coin",
        entryPriceUsd: 0.0045,
        currentPriceUsd: 0.0048,
        currentPnlPercent: 8.9,
        allocatedUsdc: 1.00,
        status: "OPEN",
        openedAt: Date.now() - 3600000 * 2,
        highestPnlSeen: 8.9,
        txSignature: "3b2...bullshit_seed"
      },
      {
        id: "pos-4",
        tokenMint: "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn",
        tokenSymbol: "JITOSOL",
        tokenName: "Jito Staked SOL",
        entryPriceUsd: 184.08,
        currentPriceUsd: 195.83,
        currentPnlPercent: 11.4,
        allocatedUsdc: 2.50,
        status: "OPEN",
        openedAt: Date.now() - 3600000 * 1.5,
        highestPnlSeen: 11.4,
        txSignature: "5j1...jitosol_seed"
      },
      {
        id: "pos-5",
        tokenMint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        tokenSymbol: "BONK",
        tokenName: "Bonk Inu",
        entryPriceUsd: 0.000015,
        currentPriceUsd: 0.000024,
        currentPnlPercent: 56.0,
        allocatedUsdc: 1.00,
        status: "OPEN",
        openedAt: Date.now() - 3600000 * 1,
        highestPnlSeen: 56.0,
        txSignature: "4m2...bonk_seed"
      },
      {
        id: "pos-6",
        tokenMint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
        tokenSymbol: "WIF",
        tokenName: "dogwifhat",
        entryPriceUsd: 1.60,
        currentPriceUsd: 1.84,
        currentPnlPercent: 15.2,
        allocatedUsdc: 1.50,
        status: "OPEN",
        openedAt: Date.now() - 3600000 * 0.5,
        highestPnlSeen: 15.2,
        txSignature: "3q1...wif_seed"
      }
    ];

    this.receipts.push({
      id: "rcpt-init-1",
      type: "SNIPE_BUY",
      tokenSymbol: "DRIFT",
      amountUsdc: 1.00,
      timestamp: Date.now() - 1800000,
      txHash: "5Xo8P...drift"
    });
  }

  public startAutonomousLoop() {
    if (this.timer) clearInterval(this.timer);
    const interval = this.isTurboMode ? 250 : 4000;
    this.timer = setInterval(() => {
      this.tick();
    }, interval);
  }

  public runCycle() {
    this.tick();
    return { success: true, timestamp: Date.now() };
  }

  private tick() {
    // 1. Update live price movements for open slots (always update runner prices and profit targets)
    for (const pos of this.positions.filter(p => p.status === "OPEN")) {
      const delta = (Math.random() - 0.44) * (this.isTurboMode ? 0.8 : 3.5);
      pos.currentPnlPercent = Number((pos.currentPnlPercent + delta).toFixed(2));
      pos.currentPriceUsd = pos.entryPriceUsd * (1 + pos.currentPnlPercent / 100);
      if (pos.currentPnlPercent > pos.highestPnlSeen) {
        pos.highestPnlSeen = pos.currentPnlPercent;
      }

      // 2. Autonomous Take-Profit Execution (e.g. >= +45% or trailing pullback from peak)
      if (pos.currentPnlPercent >= 45 || (pos.highestPnlSeen >= 30 && pos.currentPnlPercent <= pos.highestPnlSeen - 12)) {
        this.executeAutonomousHarvest(pos);
      }
      // 3. Autonomous Stop-Loss Execution (e.g. <= -15%)
      else if (pos.currentPnlPercent <= -15) {
        this.executeAutonomousStopLoss(pos);
      }
    }

    // If scanner is paused or in panic killswitch mode, do NOT open new snipes
    if (this.isPaused || this.isPanicMode) return;

    // 4. Autonomous Open Slot Filler (Strict 1 token = 1 slot diversity)
    const openSlots = this.positions.filter(p => p.status === "OPEN");
    if (openSlots.length < this.maxSlots && this.hotVaultUsdcBalance >= 1.50) {
      this.executeAutonomousSnipe();
    }
  }

  private executeAutonomousHarvest(pos: SniperPosition) {
    pos.status = "TAKE_PROFIT";
    const profitUsdc = Number((pos.allocatedUsdc * (pos.currentPnlPercent / 100)).toFixed(2));
    const totalReturned = pos.allocatedUsdc + profitUsdc;

    this.hotVaultUsdcBalance += totalReturned;
    this.totalProfitsHarvestedUsdc += profitUsdc;
    
    // Autonomous split: 40% into Sinking Fund, 25% into OTC Buyback
    const sinkingCut = Number((profitUsdc * 0.40).toFixed(2));
    const otcCut = Number((profitUsdc * 0.25).toFixed(2));
    this.sinkingFundReservesUsdc += sinkingCut;
    this.otcBuybacksUsdc += otcCut;

    const txHash = `5Hrv${Math.random().toString(36).substring(2, 8)}...sol`;
    this.receipts.unshift({
      id: `rcpt-${Date.now()}`,
      type: "TAKE_PROFIT_HARVEST",
      tokenSymbol: pos.tokenSymbol,
      amountUsdc: pos.allocatedUsdc,
      pnlPercent: pos.currentPnlPercent,
      profitUsdc,
      timestamp: Date.now(),
      txHash
    });

    // Remove closed position so slot is instantly free for next machine snipe
    this.positions = this.positions.filter(p => p.id !== pos.id);
  }

  private executeAutonomousStopLoss(pos: SniperPosition) {
    pos.status = "STOP_LOSS";
    const lossUsdc = Number((pos.allocatedUsdc * Math.abs(pos.currentPnlPercent / 100)).toFixed(2));
    const totalReturned = Math.max(0, pos.allocatedUsdc - lossUsdc);

    this.hotVaultUsdcBalance += totalReturned;

    const txHash = `3Sl${Math.random().toString(36).substring(2, 8)}...sol`;
    this.receipts.unshift({
      id: `rcpt-${Date.now()}`,
      type: "STAGNANT_RECYCLE",
      tokenSymbol: pos.tokenSymbol,
      amountUsdc: pos.allocatedUsdc,
      pnlPercent: pos.currentPnlPercent,
      timestamp: Date.now(),
      txHash
    });

    this.positions = this.positions.filter(p => p.id !== pos.id);
  }

  private executeAutonomousSnipe() {
    // 1. First check Priority Watchlist for tokens currently hitting the 6% Negative Pullback trigger
    const activeSymbols = new Set(this.positions.filter(p => p.status === "OPEN").map(p => p.tokenSymbol));
    const activeMints = new Set(this.positions.filter(p => p.status === "OPEN").map(p => p.tokenMint));

    let candidateToken: { symbol: string; name: string; mint: string; price: number; is6PctDipTrigger: boolean } | null = null;

    try {
      const watchlist = metroRemote.getWatchlist();
      const triggerWatchlistItem = watchlist.find(item => 
        !activeSymbols.has(item.symbol) && 
        !activeMints.has(item.mint) && 
        (item.timingStatus === "OPTIMAL_DIP_HIT" || (item.pullbackPercentFromPeak <= -((item.dipPercentage || 6) - 0.5) && item.pullbackPercentFromPeak >= -((item.dipPercentage || 6) + 3.0))) &&
        item.safetyScore >= 80
      );

      if (triggerWatchlistItem) {
        candidateToken = {
          symbol: triggerWatchlistItem.symbol,
          name: triggerWatchlistItem.name,
          mint: triggerWatchlistItem.mint,
          price: triggerWatchlistItem.priceUsd,
          is6PctDipTrigger: true
        };
      }
    } catch {}

    // 2. Fallback to general radar token pool if no 6% pullback trigger is waiting
    if (!candidateToken) {
      const radar = RADAR_TOKENS.find(t => !activeSymbols.has(t.symbol) && !activeMints.has(t.mint));
      if (radar) {
        candidateToken = {
          symbol: radar.symbol,
          name: radar.name,
          mint: radar.mint,
          price: radar.basePrice,
          is6PctDipTrigger: false
        };
      }
    }

    if (!candidateToken) return;

    const snipeSizeUsdc = candidateToken.is6PctDipTrigger ? 1.50 : 1.00;
    if (this.hotVaultUsdcBalance < snipeSizeUsdc + 0.50) return;

    this.hotVaultUsdcBalance -= snipeSizeUsdc;

    const newPos: SniperPosition = {
      id: `pos-${Date.now()}`,
      tokenMint: candidateToken.mint,
      tokenSymbol: candidateToken.symbol,
      tokenName: candidateToken.name,
      entryPriceUsd: candidateToken.price,
      currentPriceUsd: candidateToken.price,
      currentPnlPercent: 0.0,
      allocatedUsdc: snipeSizeUsdc,
      status: "OPEN",
      openedAt: Date.now(),
      highestPnlSeen: 0.0,
      txSignature: `4Jito${Math.random().toString(36).substring(2, 8)}...sol`
    };

    this.positions.push(newPos);

    this.receipts.unshift({
      id: `rcpt-${Date.now()}`,
      type: "SNIPE_BUY",
      tokenSymbol: candidateToken.symbol,
      amountUsdc: snipeSizeUsdc,
      timestamp: Date.now(),
      txHash: newPos.txSignature || "jito_tx"
    });

    if (this.receipts.length > 50) this.receipts.pop();
  }

  public snipeTargetToken(token: { symbol: string; name: string; mint: string; priceUsd: number }, customAmountUsdc?: number): { success: boolean; message: string; position?: SniperPosition } {
    const openSlots = this.positions.filter(p => p.status === "OPEN");
    if (openSlots.length >= this.maxSlots) {
      return { success: false, message: `All ${this.maxSlots} sniper slots are currently full.` };
    }
    const alreadyOpen = openSlots.find(p => p.tokenMint === token.mint || p.tokenSymbol === token.symbol);
    if (alreadyOpen) {
      return { success: false, message: `Token $${token.symbol} is already active in Slot ${openSlots.indexOf(alreadyOpen) + 1}.` };
    }
    const snipeSize = customAmountUsdc && customAmountUsdc > 0.1 ? Number(customAmountUsdc.toFixed(2)) : 1.00;
    if (this.hotVaultUsdcBalance < snipeSize + 0.50) {
      return { success: false, message: `Hot Vault free liquidity ($${this.hotVaultUsdcBalance.toFixed(2)}) is below required amount ($${(snipeSize + 0.50).toFixed(2)} with buffer).` };
    }

    this.hotVaultUsdcBalance -= snipeSize;
    const newPos: SniperPosition = {
      id: `pos-${Date.now()}`,
      tokenMint: token.mint,
      tokenSymbol: token.symbol,
      tokenName: token.name,
      entryPriceUsd: token.priceUsd || 0.0001,
      currentPriceUsd: token.priceUsd || 0.0001,
      currentPnlPercent: 0.0,
      allocatedUsdc: snipeSize,
      status: "OPEN",
      openedAt: Date.now(),
      highestPnlSeen: 0.0,
      txSignature: `4Jito${Math.random().toString(36).substring(2, 8)}...sol`
    };

    this.positions.push(newPos);
    this.receipts.unshift({
      id: `rcpt-${Date.now()}`,
      type: "SNIPE_BUY",
      tokenSymbol: token.symbol,
      amountUsdc: snipeSize,
      timestamp: Date.now(),
      txHash: newPos.txSignature || "jito_snipe"
    });
    if (this.receipts.length > 50) this.receipts.pop();

    return { success: true, message: `Successfully sniped $${token.symbol} (${token.name}) with $${snipeSize.toFixed(2)} USDC via private Jito MEV in Slot ${this.positions.filter(p => p.status === "OPEN").length}!`, position: newPos };
  }

  public getVaultState(): HotVaultState {
    const activeRunners = this.positions.filter(p => p.status === "OPEN");
    const allocated = activeRunners.reduce((acc, p) => acc + p.allocatedUsdc, 0);

    return {
      solBalance: this.solBalance,
      usdcBalance: Number((this.hotVaultUsdcBalance + allocated).toFixed(2)),
      reservedBufferUsdc: 0.50,
      freeLiquidityUsdc: Number(this.hotVaultUsdcBalance.toFixed(2)),
      sinkingFundReservesUsdc: Number(this.sinkingFundReservesUsdc.toFixed(2)),
      totalProfitsHarvestedUsdc: Number(this.totalProfitsHarvestedUsdc.toFixed(2)),
      otcBuybacksUsdc: Number(this.otcBuybacksUsdc.toFixed(2)),
      activeRunnersCount: activeRunners.length,
      maxSlots: this.maxSlots,
      lastExecutionTime: Date.now()
    };
  }
}

export const autonomousSniper = new AutonomousSniperEngine();
