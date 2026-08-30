# AGENTS.MD — METRO AGENTS SOVEREIGN SYSTEM ARCHITECTURE & PERSISTENCE SPECIFICATION

## System Overview
- **Application Name**: Metro Agents: Autonomous AI City & Treasury
- **Core Visual Engine**: 3D Isometric Metropolis Game Grid with full HUD, building inspection, and interactive audio/weather.
- **Autonomous Sniper Daemon**: On-chain Solana token snipers, trailing profit ratchets, 1-token-1-slot diversity rules, and Sinking Fund buybacks (94% $OTC).
- **Overwatch Truth Sentinel**: Real-time auditing for on-chain proof verification and zero-hallucination guarantees.

## Master File Mapping & Backups
- `/public/assets/index-BtFoKkKm.js`: Master Production Bundle (2.2MB).
- `/public/assets/index-DohxfPgg.css`: Master Global Styling.
- `/server.ts`: Express backend handling Jupiter, Overwatch, Solana balances, and Autonomous Sniper endpoints.
- `/server/autonomousSniperEngine.ts`: The background autonomous trading daemon.
- `/backups/`: Contains permanent frozen backup snapshots of all critical files.
