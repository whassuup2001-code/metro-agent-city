import fs from "fs";

const bundlePath = "./public/assets/index-BtFoKkKm.js";
let bundle = fs.readFileSync(bundlePath, "utf8");

// 1. Add state & useEffect inside XJ
const targetState = '[devTab,setDevTab]=ee.useState("SNIPER_BOT");';
const replacementState = '[devTab,setDevTab]=ee.useState("SNIPER_BOT"),[txFeedEvents,setTxFeedEvents]=ee.useState([]),[txFeedMinimized,setTxFeedMinimized]=ee.useState(false),[txFeedFilter,setTxFeedFilter]=ee.useState("ALL"),[txFeedStats,setTxFeedStats]=ee.useState({sol:0.2683,usdc:82,otc:10922463});ee.useEffect(()=>{if(!e)return;let K=true;const H=async()=>{try{const G=await fetch("/api/solana/tx-feed");if(G.ok){const Y=await G.json();if(K&&Y&&Y.success){if(Array.isArray(Y.events))setTxFeedEvents(Y.events);if(Y.wallet)setTxFeedStats({sol:Y.wallet.sol,usdc:Y.wallet.usdc,otc:Y.wallet.otc});}}}catch{}};H();const re=setInterval(H,3000);return()=>{K=false;clearInterval(re);};},[e]);';

if (!bundle.includes(targetState)) {
  console.error("Target state not found in bundle!");
  process.exit(1);
}

bundle = bundle.replace(targetState, replacementState);

// 2. Find target footer inside XJ
const footerIdx = bundle.indexOf("/* FOOTER */");
const nextCompIdx = bundle.indexOf("eZ=({isOpen:");

if (footerIdx === -1 || nextCompIdx === -1) {
  console.error("Footer or next component not found in bundle!");
  process.exit(1);
}

const originalFooterChunk = bundle.slice(footerIdx, nextCompIdx);

const replacementFooterChunk = `/* FOOTER */
        s.jsxs("div",{
          className:"p-4 border-t border-white/10 bg-[#06080d] flex items-center justify-between text-xs text-slate-400 shrink-0",
          children:[
            s.jsxs("div",{className:"flex items-center gap-2 font-mono",children:[s.jsx(yl,{className:"w-4 h-4 text-cyan-400"}),s.jsx("span",{children:"Metropolis Sovereign Autonomous Engine"})]}),
            s.jsx("button",{onClick:t,className:"px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors",children:"Close"})
          ]
        }),
        /* CORNER TRANSACTION FEED WINDOW */
        txFeedMinimized ? 
        s.jsxs("button",{
          onClick:()=>setTxFeedMinimized(false),
          className:"absolute bottom-16 right-4 z-40 px-3 py-1.5 rounded-xl bg-[#080d1a]/95 border border-cyan-500/60 shadow-[0_0_25px_rgba(6,182,212,0.4)] text-slate-200 text-xs flex items-center gap-2 hover:border-cyan-400 cursor-pointer backdrop-blur-md transition-all hover:scale-105",
          children:[
            s.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-400 animate-pulse"}),
            s.jsx("span",{className:"font-bold text-cyan-300",children:"LIVE TX FEED"}),
            s.jsxs("span",{className:"text-[10px] text-slate-400",children:["(",txFeedEvents.length,")"]}),
            s.jsx("span",{className:"text-[10px] text-emerald-400 font-mono",children:"4piN...7SGX"})
          ]
        }) : 
        s.jsxs("div",{
          className:"absolute bottom-14 sm:bottom-16 right-2 sm:right-4 z-40 w-[92%] sm:w-96 max-h-[380px] bg-[#070b14]/95 border border-cyan-500/60 rounded-xl shadow-[0_0_35px_rgba(6,182,212,0.35)] text-slate-200 flex flex-col font-mono backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-150",
          children:[
            /* HEADER */
            s.jsxs("div",{
              className:"px-3 py-2 bg-gradient-to-r from-cyan-950/80 via-[#0a1220] to-[#080e18] border-b border-cyan-500/30 flex items-center justify-between shrink-0",
              children:[
                s.jsxs("div",{
                  className:"flex items-center gap-2",
                  children:[
                    s.jsxs("div",{className:"relative flex items-center justify-center",children:[
                      s.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute"}),
                      s.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-400 relative"})
                    ]}),
                    s.jsx("span",{className:"font-black text-[11px] text-cyan-300 tracking-wider",children:"LIVE SNIPER TX FEED"}),
                    s.jsxs("a",{
                      href:"https://solscan.io/account/4piNL4sJM8EyNuUHQcGanNjxdqWbyd3hdiVfHFYo7SGX",
                      target:"_blank",
                      rel:"noreferrer",
                      className:"text-[10px] text-slate-400 hover:text-cyan-300 underline font-mono flex items-center gap-0.5",
                      children:[
                        s.jsx("span",{children:"4piN...7SGX"}),
                        s.jsx(Jn,{className:"w-2.5 h-2.5"})
                      ]
                    })
                  ]
                }),
                s.jsxs("div",{
                  className:"flex items-center gap-1",
                  children:[
                    s.jsx("button",{
                      onClick:()=>setTxFeedMinimized(true),
                      title:"Minimize Feed",
                      className:"px-1.5 py-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-white text-xs cursor-pointer font-bold",
                      children:"—"
                    })
                  ]
                })
              ]
            }),
            /* FILTER TABS */
            s.jsxs("div",{
              className:"px-2.5 py-1.5 bg-[#050810] border-b border-white/5 flex items-center justify-between text-[10px] shrink-0",
              children:[
                s.jsx("div",{
                  className:"flex items-center gap-1",
                  children:["ALL","BUY","SELL","ONCHAIN"].map(fil=>s.jsx("button",{
                    key:fil,
                    onClick:()=>setTxFeedFilter(fil),
                    className:\`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors \${txFeedFilter===fil?"bg-cyan-500/30 border border-cyan-500/60 text-cyan-300":"bg-white/5 text-slate-400 hover:text-slate-200"}\`,
                    children:fil==="ONCHAIN"?"ON-CHAIN":fil
                  }))
                }),
                s.jsxs("span",{className:"text-[9px] text-emerald-400/80 font-mono",children:["● Polling 3s"]})
              ]
            }),
            /* EVENT STREAM LIST */
            s.jsx("div",{
              className:"p-2 space-y-1.5 overflow-y-auto max-h-[220px] divide-y divide-white/5",
              children:(txFeedFilter==="ALL"?txFeedEvents:txFeedFilter==="BUY"?txFeedEvents.filter(ev=>ev.action==="BUY"||(ev.type&&ev.type.includes("BUY"))):txFeedFilter==="SELL"?txFeedEvents.filter(ev=>ev.action==="SELL"||(ev.type&&(ev.type.includes("TAKE_PROFIT")||ev.type.includes("STOP_LOSS")))):txFeedEvents.filter(ev=>ev.isRealOnChain)).length===0?
              s.jsx("div",{className:"py-6 text-center text-slate-500 text-[11px]",children:"No recent events matching filter"}):
              (txFeedFilter==="ALL"?txFeedEvents:txFeedFilter==="BUY"?txFeedEvents.filter(ev=>ev.action==="BUY"||(ev.type&&ev.type.includes("BUY"))):txFeedFilter==="SELL"?txFeedEvents.filter(ev=>ev.action==="SELL"||(ev.type&&(ev.type.includes("TAKE_PROFIT")||ev.type.includes("STOP_LOSS")))):txFeedEvents.filter(ev=>ev.isRealOnChain)).map((ev,idx)=>{
                const secAgo=Math.max(0,Math.floor((Date.now()-(ev.timestamp||Date.now()))/1000));
                const timeLabel=secAgo<60?\`\${secAgo}s ago\`:secAgo<3600?\`\${Math.floor(secAgo/60)}m ago\`:secAgo<86400?\`\${Math.floor(secAgo/3600)}h ago\`:\`\${Math.floor(secAgo/86400)}d ago\`;
                return s.jsxs("div",{
                  key:ev.id||idx,
                  className:"pt-1.5 first:pt-0 flex items-start justify-between gap-2 text-[11px]",
                  children:[
                    s.jsxs("div",{
                      className:"flex items-start gap-1.5 flex-1 min-w-0",
                      children:[
                        s.jsx("span",{
                          className:\`px-1.5 py-0.5 rounded text-[9px] font-black shrink-0 \${ev.action==="BUY"||ev.type==="SNIPE_BUY"||ev.type==="SWAP_BUY"?"bg-emerald-500/20 border border-emerald-500/40 text-emerald-300":ev.type==="TAKE_PROFIT_HARVEST"?"bg-cyan-500/20 border border-cyan-500/40 text-cyan-300":ev.isRealOnChain?"bg-amber-500/20 border border-amber-500/40 text-amber-300":"bg-rose-500/20 border border-rose-500/40 text-rose-300"}\`,
                          children:ev.action==="BUY"?"BUY":ev.type==="TAKE_PROFIT_HARVEST"?"HARVEST":ev.isRealOnChain?"ON-CHAIN":"SELL"
                        }),
                        s.jsxs("div",{
                          className:"flex-1 min-w-0",
                          children:[
                            s.jsxs("div",{
                              className:"flex items-center gap-1.5 flex-wrap",
                              children:[
                                s.jsxs("span",{className:"font-black text-slate-100",children:["$",ev.tokenSymbol]}),
                                s.jsx("span",{className:"text-emerald-400 font-bold",children:ev.amount}),
                                ev.pnlPercent!==null&&ev.pnlPercent!==undefined&&s.jsxs("span",{className:\`text-[10px] font-bold \${ev.pnlPercent>=0?"text-emerald-400":"text-rose-400"}\`,children:[ev.pnlPercent>=0?"+":"",Number(ev.pnlPercent).toFixed(1),"%"]})
                              ]
                            }),
                            s.jsx("div",{className:"text-[10px] text-slate-400 truncate",children:ev.description})
                          ]
                        })
                      ]
                    }),
                    s.jsxs("div",{
                      className:"text-right shrink-0 flex flex-col items-end",
                      children:[
                        s.jsxs("a",{
                          href:ev.solscanUrl,
                          target:"_blank",
                          rel:"noreferrer",
                          className:"text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 underline font-mono",
                          children:[
                            s.jsx("span",{children:ev.shortSig||"Solscan"}),
                            s.jsx(Jn,{className:"w-2 h-2"})
                          ]
                        }),
                        s.jsx("span",{className:"text-[9px] text-slate-500",children:timeLabel})
                      ]
                    })
                  ]
                });
              })
            }),
            /* FOOTER VAULT HOLDINGS BAR */
            s.jsxs("div",{
              className:"px-3 py-1.5 bg-[#050810] border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 shrink-0",
              children:[
                s.jsxs("span",{className:"text-emerald-400 font-bold font-mono",children:[txFeedStats.sol.toFixed(4)," SOL • $",txFeedStats.usdc.toFixed(2)," USDC"]}),
                s.jsxs("span",{className:"text-amber-400 font-bold font-mono",children:[Number(txFeedStats.otc).toLocaleString()," $OTC"]})
              ]
            })
          ]
        })
      ]
    })
  });
},`;

bundle = bundle.slice(0, footerIdx) + replacementFooterChunk + bundle.slice(nextCompIdx + "eZ=({isOpen:".length - "eZ=({isOpen:".length);

fs.writeFileSync(bundlePath, bundle);
console.log("Successfully updated index-BtFoKkKm.js with corner transaction feed window!");
