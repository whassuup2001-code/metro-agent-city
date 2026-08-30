export interface SniperPosition {
  id: string;
  tokenMint: string;
  tokenSymbol: string;
  tokenName: string;
  entryPriceUsd: number;
  currentPriceUsd: number;
  currentPnlPercent: number;
  allocatedUsdc: number;
  status: "OPEN" | "CLOSED" | "TAKE_PROFIT" | "STOP_LOSS";
  openedAt: number;
  txSignature?: string;
  highestPnlSeen: number;
}

export interface HotVaultState {
  solBalance: number;
  usdcBalance: number;
  reservedBufferUsdc: number;
  freeLiquidityUsdc: number;
  sinkingFundReservesUsdc: number;
  totalProfitsHarvestedUsdc: number;
  otcBuybacksUsdc: number;
  activeRunnersCount: number;
  maxSlots: number;
  lastExecutionTime: number;
}

export interface CityAgent {
  id: string;
  name: string;
  role: "Sniper Engine" | "Treasury Arbiter" | "Urban Architect" | "Governor" | "Liquidity Provider" | "Sinking Fund Guardian";
  avatar: string;
  balanceUsdc: number;
  status: "Active Surveillance" | "Executing Snipe" | "Compounding Profit" | "Autonomous Survey";
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export interface TradeReceipt {
  id: string;
  type: "SNIPE_BUY" | "TAKE_PROFIT_HARVEST" | "SINKING_FUND_SWEEP" | "STAGNANT_RECYCLE";
  tokenSymbol: string;
  amountUsdc: number;
  pnlPercent?: number;
  profitUsdc?: number;
  timestamp: number;
  txHash: string;
}
