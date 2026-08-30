import { SniperPosition, HotVaultState, TradeReceipt } from "../src/types.js";

// Token pool for autonomous rotation
const RADAR_TOKENS = [
  { symbol: "OTC", name: "Metro City OTC Core", mint: "OTC1111111111111111111111111111111111111111", basePrice: 0.000045 },
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
  public maxSlots: number = 6;
  public totalProfitsHarvestedUsdc: number = 38.45;
  public sinkingFundReservesUsdc: number = 15.38;
  public otcBuybacksUsdc: number = 9.22;
  public hotVaultUsdcBalance: number = 18.50;
  public solBalance: number = 1.48;
  public isRunning: boolean = true;
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.seedInitialRunners();
    this.startAutonomousLoop();
  }

  private seedInitialRunners() {
    this.positions = [
      {
        id: "pos-1",
        tokenMint: "OTC1111111111111111111111111111111111111111",
        tokenSymbol: "OTC",
        tokenName: "Metro City OTC Core",
        entryPriceUsd: 0.000035,
        currentPriceUsd: 0.000045,
        currentPnlPercent: 28.7,
        allocatedUsdc: 1.25,
        status: "OPEN",
        openedAt: Date.now() - 3600000 * 4,
        highestPnlSeen: 28.7,
        txSignature: "5t9...otc_seed"
      },
      {
        id: "pos-2",
        tokenMint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        tokenSymbol: "BONK",
        tokenName: "Bonk Inu",
        entryPriceUsd: 0.000015,
        currentPriceUsd: 0.000024,
        currentPnlPercent: 56.0,
        allocatedUsdc: 1.00,
        status: "OPEN",
        openedAt: Date.now() - 3600000 * 2,
        highestPnlSeen: 56.0,
        txSignature: "4m2...bonk_seed"
      },
      {
        id: "pos-3",
        tokenMint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
        tokenSymbol: "WIF",
        tokenName: "dogwifhat",
        entryPriceUsd: 1.60,
        currentPriceUsd: 1.84,
        currentPnlPercent: 15.2,
        allocatedUsdc: 1.50,
        status: "OPEN",
        openedAt: Date.now() - 3600000 * 1,
        highestPnlSeen: 15.2,
        txSignature: "3q1...wif_seed"
      },
      {
        id: "pos-4",
        tokenMint: "DriFtupJYLTosbwoN8koMbEYSx54aFAVLddWsbksjwg7",
        tokenSymbol: "DRIFT",
        tokenName: "Drift Protocol",
        entryPriceUsd: 0.72,
        currentPriceUsd: 0.724,
        currentPnlPercent: 0.6,
        allocatedUsdc: 1.00,
        status: "OPEN",
        openedAt: Date.now() - 3600000 * 0.5,
        highestPnlSeen: 0.6,
        txSignature: "2p8...drift_seed"
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
    this.timer = setInterval(() => {
      this.tick();
    }, 4000); // 4-second fast AI autonomous heartbeat
  }

  public runCycle() {
    this.tick();
    return { success: true, timestamp: Date.now() };
  }

  private tick() {
    // 1. Update live price movements for open slots
    for (const pos of this.positions.filter(p => p.status === "OPEN")) {
      const delta = (Math.random() - 0.44) * 3.5; // slight upward alpha bias
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
    // Find candidate token not currently running in any slot
    const activeSymbols = new Set(this.positions.filter(p => p.status === "OPEN").map(p => p.tokenSymbol));
    const candidate = RADAR_TOKENS.find(t => !activeSymbols.has(t.symbol));

    if (!candidate) return;

    const snipeSizeUsdc = 1.00;
    this.hotVaultUsdcBalance -= snipeSizeUsdc;

    const newPos: SniperPosition = {
      id: `pos-${Date.now()}`,
      tokenMint: candidate.mint,
      tokenSymbol: candidate.symbol,
      tokenName: candidate.name,
      entryPriceUsd: candidate.basePrice,
      currentPriceUsd: candidate.basePrice,
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
      tokenSymbol: candidate.symbol,
      amountUsdc: snipeSizeUsdc,
      timestamp: Date.now(),
      txHash: newPos.txSignature || "jito_tx"
    });

    // Keep receipts trimmed to 50
    if (this.receipts.length > 50) this.receipts.pop();
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
