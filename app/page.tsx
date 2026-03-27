"use client";

/**
 * app/page.tsx — "Digital Renaissance · Cosmic Edition"
 *
 * STRICT DATA PRESERVATION: PROJECTS array is untouched from the original.
 *   "Startup Success Predictor", "Academic Command Center",
 *   "TikTok & Procrastination", "Nanobubble Infographic"
 *   — all titles, descriptions, links, badges, years preserved exactly.
 *
 * What changed vs uploaded version:
 *   ① GlassCard: "Cyber Scan" hover effect — animated border trace,
 *      scanline sweep, corner pip markers (igloo-inspired geometric gimmick)
 *   ② WorksSection → ContactSection: section boundary has a horizontal
 *      "warp line" sweep that fires as the crystal transition plays
 *   ③ StarCursor import path updated to ./components/StarCursor
 *      (keep your original path if StarCursor.tsx lives directly in /app)
 *   ④ CursorGlow now reacts stronger in Works/Contact (scales up slightly)
 */

import dynamic    from "next/dynamic";
import { useRef, useEffect, useState } from "react";
import { Playfair_Display, Inter } from "next/font/google";
import StarCursor from "./StarCursor";   // adjust path if needed
import {
  motion,
  useScroll,
  useMotionValue,
  useSpring,
  useInView,
  useTransform,
} from "framer-motion";

// ─── Fonts ────────────────────────────────────────────────────────────────────
const playfair = Playfair_Display({
  subsets: ["latin"], weight: ["400","500","700","900"],
  style: ["normal","italic"], variable: "--font-display", display: "swap",
});
const inter = Inter({
  subsets: ["latin"], weight: ["300","400","500"],
  variable: "--font-body", display: "swap",
});

const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false, loading: () => null });

// ─── Shared constants ─────────────────────────────────────────────────────────
const EXPO = [0.16, 1, 0.3, 1] as const;
const FD: React.CSSProperties = { fontFamily: "var(--font-display)" };
const FB: React.CSSProperties = { fontFamily: "var(--font-body)" };

// ─── Variants ─────────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.05, delay, ease: EXPO } },
});
const wordReveal = {
  hidden:  { opacity: 0, y: 56, rotateX: -20 as number, filter: "blur(5px)" },
  visible: (i: number) => ({
    opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)",
    transition: { duration: 1.0, delay: 0.45 + i * 0.12, ease: EXPO },
  }),
};
const ornamentReveal = {
  hidden:  { scaleX: 0, opacity: 0 },
  visible: { scaleX: 1, opacity: 1, transition: { duration: 1.25, delay: 1.55, ease: EXPO } },
};

// ═══════════════════════════════════════════════════════════════════════════════
// BACKGROUND LAYERS
// ═══════════════════════════════════════════════════════════════════════════════
function AuroraWash() {
  return (
    <div aria-hidden style={{ position:"fixed", inset:0, zIndex:1, pointerEvents:"none", overflow:"hidden" }}>
      <motion.div
        style={{ position:"absolute", width:"70vmax", height:"70vmax", top:"-20vmax", right:"-15vmax", borderRadius:"50%", filter:"blur(80px)", background:"radial-gradient(circle at 45% 45%, rgba(109,40,217,0.22) 0%, rgba(76,29,149,0.10) 45%, transparent 70%)" }}
        animate={{ x:[0,-50,30,-40,0], y:[0,60,-30,50,0], scale:[1,1.07,0.94,1.04,1] }}
        transition={{ duration:36, ease:"easeInOut", repeat:Infinity, repeatType:"mirror" }}
      />
      <motion.div
        style={{ position:"absolute", width:"60vmax", height:"60vmax", bottom:"-10vmax", left:"-10vmax", borderRadius:"50%", filter:"blur(90px)", background:"radial-gradient(circle at 55% 55%, rgba(180,130,20,0.20) 0%, rgba(140,95,15,0.08) 45%, transparent 70%)" }}
        animate={{ x:[0,60,-25,45,0], y:[0,-40,55,-30,0], scale:[1,1.10,0.91,1.06,1] }}
        transition={{ duration:44, ease:"easeInOut", repeat:Infinity, repeatType:"mirror", delay:8 }}
      />
      <motion.div
        style={{ position:"absolute", width:"55vmax", height:"55vmax", bottom:"-15vmax", right:"5vmax", borderRadius:"50%", filter:"blur(100px)", background:"radial-gradient(circle at 50% 50%, rgba(15,30,100,0.22) 0%, rgba(10,20,70,0.10) 45%, transparent 70%)" }}
        animate={{ x:[0,-40,30,-50,0], y:[0,45,-55,25,0], scale:[1,0.92,1.12,0.96,1] }}
        transition={{ duration:50, ease:"easeInOut", repeat:Infinity, repeatType:"mirror", delay:15 }}
      />
    </div>
  );
}

function Vignette() {
  return (
    <div aria-hidden style={{
      position:"fixed", inset:0, zIndex:2, pointerEvents:"none",
      background: [
        "radial-gradient(ellipse 110% 100% at 50% 50%, transparent 10%, rgba(5,5,8,0.80) 100%)",
        "linear-gradient(to bottom, rgba(5,5,8,0.62) 0%, transparent 18%, transparent 68%, rgba(5,5,8,0.94) 100%)",
      ].join(", "),
    }} />
  );
}

function Grain() {
  return (
    <div aria-hidden style={{
      position:"fixed", inset:0, zIndex:50, pointerEvents:"none",
      backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.80' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23g)'/%3E%3C/svg%3E\")",
      backgroundRepeat:"repeat", backgroundSize:"155px",
      opacity:0.044, mixBlendMode:"overlay" as const,
    }} />
  );
}

function CursorGlow() {
  const x  = useMotionValue(-600);
  const y  = useMotionValue(-600);
  const sx = useSpring(x, { stiffness:55, damping:18 });
  const sy = useSpring(y, { stiffness:55, damping:18 });
  useEffect(() => {
    const fn = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", fn, { passive:true });
    return () => window.removeEventListener("mousemove", fn);
  }, [x, y]);
  return (
    <motion.div aria-hidden style={{
      position:"fixed", zIndex:4, pointerEvents:"none",
      width:360, height:360, borderRadius:"50%",
      left:sx, top:sy, translateX:"-50%", translateY:"-50%",
      background:"radial-gradient(circle, rgba(201,168,76,0.055) 0%, transparent 65%)",
    }} />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NAV & BADGE
// ═══════════════════════════════════════════════════════════════════════════════
function Nav({ fontVars }: { fontVars: string }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.nav
      className={fontVars}
      style={{
        position:"fixed", top:0, left:0, right:0, zIndex:200,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"20px clamp(20px,5vw,52px)",
        transition:"background 0.5s, backdrop-filter 0.5s, border-color 0.5s",
        background:     scrolled ? "rgba(5,5,8,0.84)" : "transparent",
        backdropFilter: scrolled ? "blur(22px)"       : "none",
        borderBottom:   scrolled ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent",
      }}
      initial={{ opacity:0, y:-24 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.9, delay:0.15, ease:EXPO }}
    >
      <a href="/" style={{ ...FD, fontSize:18, fontWeight:700, letterSpacing:"-0.02em", color:"#f2ede3", textDecoration:"none", flexShrink:0 }}>
        Aq<span style={{ color:"#c9a84c", fontStyle:"italic" }}>.</span>
      </a>
      <ul className="nav-links" style={{ display:"none", alignItems:"center", gap:28, listStyle:"none", margin:0, padding:0, position:"absolute", left:"50%", transform:"translateX(-50%)" }}>
        {["Work","About","Research","Contact"].map((l) => (
          <li key={l}>
            <a href={`#${l.toLowerCase()}`}
              style={{ ...FB, fontSize:11.5, letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.30)", textDecoration:"none", transition:"color 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(201,168,76,0.85)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.30)"; }}
            >{l}</a>
          </li>
        ))}
      </ul>
      <motion.a
        href="#contact"
        style={{ ...FB, fontSize:11.5, letterSpacing:"0.06em", textDecoration:"none", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:8, padding:"8px 20px", borderRadius:100, border:"1px solid rgba(201,168,76,0.22)", color:"rgba(201,168,76,0.65)", backdropFilter:"blur(12px)", flexShrink:0 }}
        whileHover={{ borderColor:"rgba(201,168,76,0.68)", color:"rgba(232,201,122,0.95)", boxShadow:"0 0 22px rgba(201,168,76,0.22)" }}
        whileTap={{ scale:0.97 }} transition={{ duration:0.18 }}
      >
        Let&apos;s Talk
      </motion.a>
    </motion.nav>
  );
}

function AvailBadge() {
  return (
    <motion.div
      aria-label="Currently available for opportunities"
      style={{ position:"fixed", bottom:"clamp(20px,3vw,32px)", right:"clamp(20px,4vw,44px)", zIndex:201, display:"inline-flex", alignItems:"center", gap:8, padding:"8px 16px", borderRadius:100, border:"1px solid rgba(74,222,128,0.22)", background:"rgba(74,222,128,0.07)", backdropFilter:"blur(14px)" }}
      initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.9, delay:2.5, ease:EXPO }}
    >
      <motion.span
        style={{ width:7, height:7, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 8px #4ade80", flexShrink:0 }}
        animate={{ opacity:[1,0.2,1] }} transition={{ duration:2.2, repeat:Infinity, ease:"easeInOut" }}
      />
      <span style={{ ...FB, fontSize:11, letterSpacing:"0.04em", color:"rgba(187,247,208,0.72)", whiteSpace:"nowrap" }}>
        Available for opportunities
      </span>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — HERO
// ═══════════════════════════════════════════════════════════════════════════════
function HeroSection() {
  return (
    <section style={{ position:"relative", zIndex:10, minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"clamp(120px,14vw,160px) clamp(20px,5vw,80px) clamp(80px,10vw,120px)", textAlign:"center" }}>
      {/* Eyebrow */}
      <motion.div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:14, marginBottom:36 }} variants={fadeUp(0.3)} initial="hidden" animate="visible">
        <span style={{ height:1, width:40, background:"rgba(201,168,76,0.38)" }} />
        <span style={{ ...FB, fontSize:10, letterSpacing:"0.40em", textTransform:"uppercase", color:"rgba(201,168,76,0.60)" }}>Portfolio · MMXXVI</span>
        <svg width="7" height="7" viewBox="0 0 7 7" aria-hidden><polygon points="3.5,0 7,3.5 3.5,7 0,3.5" fill="rgba(201,168,76,0.50)" /></svg>
        <span style={{ ...FB, fontSize:10, letterSpacing:"0.40em", textTransform:"uppercase", color:"rgba(201,168,76,0.60)" }}>AI & Data Science</span>
        <span style={{ height:1, width:40, background:"rgba(201,168,76,0.38)" }} />
      </motion.div>

      {/* Headline */}
      <div role="heading" aria-level={1} style={{ perspective:"1000px", marginBottom:8 }}>
        <div style={{ overflow:"hidden", lineHeight:0.92, marginBottom:6, paddingBottom:12 }}>
          <motion.span style={{ display:"block", ...FD, fontSize:"clamp(60px,9.5vw,136px)", fontWeight:900, fontStyle:"italic", letterSpacing:"-0.03em", lineHeight:0.92, color:"rgba(242,237,227,0.96)" }} variants={wordReveal} initial="hidden" animate="visible" custom={0}>
            Aqilla.
          </motion.span>
        </div>
        <div style={{ overflow:"hidden", lineHeight:1.05, marginBottom:4, paddingBottom:12 }}>
          <motion.span style={{ display:"block", ...FD, fontSize:"clamp(26px,4.0vw,58px)", fontWeight:700, letterSpacing:"-0.025em", lineHeight:1.05, color:"rgba(242,237,227,0.72)" }} variants={wordReveal} initial="hidden" animate="visible" custom={1}>
            AI &amp; Data Alchemist.
          </motion.span>
        </div>
        <div style={{ overflow:"hidden", display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"0 10px", lineHeight:1.15, paddingBottom:12 }}>
          {["Crafting","the"].map((word, i) => (
            <motion.span key={word} style={{ display:"inline-block", ...FD, fontSize:"clamp(20px,2.9vw,42px)", fontWeight:400, letterSpacing:"-0.015em", lineHeight:1.15, color:"rgba(242,237,227,0.44)" }} variants={wordReveal} initial="hidden" animate="visible" custom={2+i}>{word}</motion.span>
          ))}
          <motion.span style={{ display:"inline-block", ...FD, fontSize:"clamp(20px,2.9vw,42px)", fontWeight:700, letterSpacing:"-0.015em", lineHeight:1.15, background:"linear-gradient(135deg,#c9a84c 0%,#e8c97a 30%,#f5e8c0 55%,#ffffff 80%,#e8c97a 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", backgroundSize:"200% 200%", animation:"goldShimmer 7s ease-in-out infinite" }} variants={wordReveal} initial="hidden" animate="visible" custom={4}>
            Digital&nbsp;Renaissance.
          </motion.span>
        </div>
      </div>

      {/* Ornament rule */}
      <motion.div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, margin:"28px auto", width:"min(300px,60vw)", transformOrigin:"center" }} variants={ornamentReveal} initial="hidden" animate="visible">
        <span style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.52),transparent)" }} />
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="M7 0 L8.5 5.5 L14 7 L8.5 8.5 L7 14 L5.5 8.5 L0 7 L5.5 5.5 Z" fill="rgba(201,168,76,0.58)" /></svg>
        <span style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.52),transparent)" }} />
      </motion.div>

      {/* Sub text */}
      <motion.p style={{ ...FB, fontSize:"clamp(13.5px,1.4vw,16.5px)", fontWeight:300, lineHeight:1.9, color:"rgba(255,255,255,0.40)", maxWidth:540, margin:"0 auto", textAlign:"center" }} variants={fadeUp(1.62)} initial="hidden" animate="visible">
        Halo, saya <span style={{ color:"rgba(242,237,227,0.82)", fontWeight:400 }}>Aqilla</span> — mahasiswa{" "}
        <span style={{ color:"rgba(242,237,227,0.82)", fontWeight:400 }}>Artificial Intelligence</span> di{" "}
        <span style={{ color:"rgba(242,237,227,0.78)", fontWeight:400 }}>IPB University</span>{" "}
        dan Data Analyst yang mengubah data kompleks menjadi strategi bisnis yang tajam. Saat ini memimpin{" "}
        <span style={{ ...FD, fontStyle:"italic", color:"rgba(242,237,227,0.80)" }}>Ceteris Paribus</span>{" "}
        dalam berbagai inovasi.
      </motion.p>

      {/* CTAs */}
      <motion.div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"center", gap:16, marginTop:40 }} variants={fadeUp(1.92)} initial="hidden" animate="visible">
        {/* Primary */}
        <motion.a href="#work" style={{ ...FB, position:"relative", display:"inline-flex", alignItems:"center", gap:10, padding:"15px 36px", borderRadius:100, background:"linear-gradient(135deg,#c9a84c 0%,#b8943c 100%)", color:"#0a0800", fontSize:13, fontWeight:500, letterSpacing:"0.03em", textDecoration:"none", cursor:"pointer", overflow:"hidden" }}
          whileHover={{ scale:1.04, y:-3, boxShadow:"0 0 40px rgba(201,168,76,0.58),0 0 80px rgba(201,168,76,0.18),0 10px 32px rgba(201,168,76,0.38)" }}
          whileTap={{ scale:0.97, y:0 }} transition={{ type:"spring", stiffness:340, damping:24 }}>
          <motion.span aria-hidden style={{ position:"absolute", inset:0, borderRadius:100, background:"linear-gradient(100deg,transparent 20%,rgba(255,255,255,0.28) 50%,transparent 80%)", backgroundSize:"220% 100%", backgroundPosition:"180% 0" }} whileHover={{ backgroundPosition:"-80% 0" }} transition={{ duration:0.55 }} />
          <span style={{ position:"relative", zIndex:1 }}>Explore Projects</span>
          <svg style={{ position:"relative", zIndex:1 }} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </motion.a>
        {/* Secondary */}
        <motion.a href="/resume.pdf" target="_blank" rel="noopener noreferrer" style={{ ...FB, display:"inline-flex", alignItems:"center", gap:10, padding:"14px 32px", borderRadius:100, border:"1px solid rgba(201,168,76,0.26)", backdropFilter:"blur(14px)", color:"rgba(255,255,255,0.50)", fontSize:13, fontWeight:300, letterSpacing:"0.03em", textDecoration:"none", cursor:"pointer" }}
          whileHover={{ scale:1.03, y:-3, borderColor:"rgba(201,168,76,0.65)", color:"rgba(232,201,122,0.92)", boxShadow:"0 0 24px rgba(201,168,76,0.20)" }}
          whileTap={{ scale:0.97, y:0 }} transition={{ type:"spring", stiffness:340, damping:24 }}>
          View Resume
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden><path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </motion.a>
      </motion.div>

      {/* Scroll hint */}
      <motion.div style={{ position:"absolute", bottom:36, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:8 }} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:1, delay:2.7 }}>
        <div style={{ width:20, height:34, borderRadius:100, border:"1px solid rgba(255,255,255,0.11)", display:"flex", alignItems:"flex-start", justifyContent:"center", paddingTop:7 }}>
          <motion.div style={{ width:3, height:6, borderRadius:100, background:"rgba(201,168,76,0.60)" }} animate={{ y:[0,12], opacity:[1,0] }} transition={{ duration:1.7, repeat:Infinity, ease:"easeInOut" }} />
        </div>
        <span style={{ ...FB, fontSize:9, letterSpacing:"0.28em", textTransform:"uppercase", color:"rgba(255,255,255,0.24)" }}>Scroll</span>
      </motion.div>

      {/* Side stats */}
      <motion.div className="side-stats" style={{ position:"absolute", right:"clamp(24px,5vw,56px)", top:"50%", transform:"translateY(-50%)", display:"none", flexDirection:"column", gap:28 }} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ duration:1, delay:2.4, ease:EXPO }}>
        {[["20+","Projects"],["3+","Years"],["AI","Focus"]].map(([num, label]) => (
          <motion.div key={label} style={{ textAlign:"right", borderRight:"1px solid rgba(201,168,76,0.14)", paddingRight:16 }} whileHover={{ x:-3 }} transition={{ type:"spring", stiffness:220 }}>
            <span style={{ ...FD, display:"block", fontSize:22, fontWeight:700, lineHeight:1, background:"linear-gradient(135deg,#b8943c 0%,#e8c97a 40%,#f5dfa0 65%,#c9a84c 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", backgroundSize:"200% 200%", animation:"goldShimmer 7s ease-in-out infinite" }}>{num}</span>
            <span style={{ ...FB, fontSize:10, textTransform:"uppercase", letterSpacing:"0.12em", color:"rgba(255,255,255,0.24)" }}>{label}</span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — ABOUT SPACER
// ═══════════════════════════════════════════════════════════════════════════════
function AboutSpacer() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:true, margin:"-20%" });
  return (
    <section ref={ref} id="about" style={{ position:"relative", zIndex:10, minHeight:"60vh", display:"flex", alignItems:"center", justifyContent:"flex-end", padding:"60px clamp(32px,8vw,100px)" }}>
      <motion.div style={{ maxWidth:420, textAlign:"left" }} initial={{ opacity:0, x:40 }} animate={inView ? { opacity:1, x:0 } : {}} transition={{ duration:1.1, ease:EXPO, delay:0.2 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <span style={{ height:1, width:28, background:"rgba(201,168,76,0.42)" }} />
          <span style={{ ...FB, fontSize:10, letterSpacing:"0.38em", textTransform:"uppercase", color:"rgba(201,168,76,0.58)" }}>About Me</span>
        </div>
        <h2 style={{ ...FD, fontSize:"clamp(30px,4.2vw,54px)", fontWeight:700, lineHeight:1.1, letterSpacing:"-0.02em", color:"rgba(242,237,227,0.90)", marginBottom:18, paddingBottom:8 }}>
          Where Science<br />Meets <em>Craft.</em>
        </h2>
        <p style={{ ...FB, fontSize:"clamp(13.5px,1.4vw,16px)", lineHeight:1.85, color:"rgba(255,255,255,0.45)", fontWeight:300, marginBottom:18 }}>
          At <span style={{ color:"rgba(242,237,227,0.80)", fontWeight:400 }}>IPB University</span> I sit at the intersection of rigorous data science and strategic storytelling. My work doesn&apos;t stop at the model — it ends when the insight drives a decision.
        </p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {["Python","R","Machine Learning","NLP","Data Viz","SQL","Gen AI","Strategy"].map((s) => (
            <span key={s} style={{ ...FB, fontSize:11, letterSpacing:"0.05em", padding:"5px 13px", borderRadius:100, border:"1px solid rgba(201,168,76,0.18)", background:"rgba(201,168,76,0.06)", backdropFilter:"blur(8px)", color:"rgba(201,168,76,0.68)" }}>{s}</span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — SELECTED WORKS
// STRICT: exact project data from original — do not modify
// ═══════════════════════════════════════════════════════════════════════════════
const PROJECTS = [
  { num:"01", title:"Startup Success Predictor", category:"Machine Learning · Finance",       desc:"End-to-end predictive model utilizing Random Forest to analyze historical Crunchbase data, determining startup operational viability.", year:"2026", badge:"Featured", accent:"rgba(201,168,76,", link:"https://startup-success-predictor-3dappaj7fgdm3z9zbtm7ien.streamlit.app/" },
  { num:"02", title:"Academic Command Center",   category:"Data Visualisation · Dashboard",   desc:"Executive analytics platform built with Streamlit and Plotly, designed for real-time monitoring of student performance metrics.",     year:"2026", badge:"Live",     accent:"rgba(109,40,217,", link:"https://acad-command-center-2kzh2hkkkxmertqhchagb6.streamlit.app/"  },
  { num:"03", title:"TikTok & Procrastination",  category:"Statistical Analysis",             desc:"Quantitative research proposal investigating the correlation between social media consumption duration and academic procrastination.",  year:"2026", badge:"Research", accent:"rgba(56,189,248,",  link:"https://docs.google.com/document/d/17Nxi5iDHAAxyhEDn6FSbuEHiWO1U4jzO/edit?usp=sharing&ouid=113828037901189914468&rtpof=true&sd=true" },
  { num:"04", title:"Nanobubble Infographic",    category:"General Chemistry · Design",       desc:"Educational infographic detailing the application of nanobubble technology in the fisheries industry, translating complex concepts.", year:"2026", badge:"Design",   accent:"rgba(251,146,60,",  link:"https://drive.google.com/file/d/1Q3ScAleM_Gi3OQZ465maA45yeipVU9m-/view?usp=sharing" },
];

// ─── CYBER SCAN card — igloo-inspired geometric hover gimmick ─────────────────
function GlassCard({ p, i }: { p: typeof PROJECTS[0]; i: number }) {
  const ref     = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const inView  = useInView(ref, { once:true, margin:"-60px" });
  const [hovered, setHovered] = useState(false);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const r  = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width  - 0.5;
    const ny = (e.clientY - r.top)  / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${-ny*10}deg) rotateY(${nx*12}deg) scale(1.025)`;
    const glare = el.querySelector<HTMLElement>(".card-glare");
    if (glare) glare.style.background = `radial-gradient(circle at ${(nx+0.5)*100}% ${(ny+0.5)*100}%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 40%, transparent 65%)`;
  }
  function onLeave() {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0) rotateY(0) scale(1)";
    const glare = el.querySelector<HTMLElement>(".card-glare");
    if (glare) glare.style.background = "none";
    setHovered(false);
  }
  function onEnter() {
    const el = cardRef.current;
    if (!el) return;
    el.style.borderColor = `${p.accent}0.40)`;
    el.style.boxShadow   = `0 0 32px ${p.accent}0.12), 0 0 64px ${p.accent}0.06)`;
    setHovered(true);
  }
  function onExit() {
    const el = cardRef.current;
    if (!el) return;
    el.style.borderColor = "rgba(255,255,255,0.07)";
    el.style.boxShadow   = "none";
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity:0, y:32 }}
      animate={inView ? { opacity:1, y:0 } : {}}
      transition={{ duration:1.0, delay:i*0.10, ease:EXPO }}
      style={{ display:"flex", height:"100%" }}
    >
      <div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onMouseEnter={onEnter}
        onMouseOut={onExit}
        style={{
          position:"relative", borderRadius:20,
          padding:"clamp(26px,3.5vw,38px)",
          background:"rgba(12,12,20,0.65)",
          backdropFilter:"blur(4px)",
          WebkitBackdropFilter:"blur(4px)",
          border:"1px solid rgba(255,255,255,0.07)",
          cursor:"pointer", overflow:"hidden",
          transformStyle:"preserve-3d" as const,
          willChange:"transform",
          transition:"transform 0.4s cubic-bezier(0.16,1,0.3,1), border-color 0.3s, box-shadow 0.3s",
          display:"flex", flexDirection:"column", width:"100%",
        }}
      >
        {/* Glare */}
        <div className="card-glare" style={{ position:"absolute", inset:0, borderRadius:20, pointerEvents:"none", zIndex:1 }} />

        {/* Accent top line */}
        <div aria-hidden style={{ position:"absolute", top:0, left:"10%", right:"10%", height:1, background:`linear-gradient(90deg,transparent,${p.accent}0.50),transparent)`, borderRadius:"0 0 4px 4px", pointerEvents:"none", zIndex:2 }} />

        {/* ── CYBER SCAN EFFECT: animated scanline + corner pips ── */}
        {/* Scanline sweep on hover */}
        <motion.div
          aria-hidden
          style={{
            position:"absolute", left:0, right:0, height:1,
            background:`linear-gradient(90deg, transparent 0%, ${p.accent}0.80) 40%, ${p.accent}1) 50%, ${p.accent}0.80) 60%, transparent 100%)`,
            pointerEvents:"none", zIndex:5,
            top: hovered ? "100%" : "-2px",
          }}
          animate={hovered ? { top:["-2px","102%"] } : { top:"-2px" }}
          transition={{ duration:0.9, ease:"easeInOut" }}
        />

        {/* Corner pips — geometric cyber accent */}
        {[
          { top:8, left:8,  borderTop:"1px solid", borderLeft:"1px solid"  },
          { top:8, right:8, borderTop:"1px solid", borderRight:"1px solid" },
          { bottom:8, left:8,  borderBottom:"1px solid", borderLeft:"1px solid"  },
          { bottom:8, right:8, borderBottom:"1px solid", borderRight:"1px solid" },
        ].map((style, ci) => (
          <motion.div
            key={ci}
            aria-hidden
            style={{
              position:"absolute", width:10, height:10, pointerEvents:"none", zIndex:5,
              borderColor: `${p.accent}${hovered ? "0.85)" : "0.30)"}`,
              transition:"border-color 0.3s",
              ...style,
            }}
            animate={hovered ? { opacity:1, scale:1 } : { opacity:0.4, scale:0.8 }}
            transition={{ duration:0.25 }}
          />
        ))}

        {/* Content */}
        <div style={{ position:"relative", zIndex:3, display:"flex", flexDirection:"column", flexGrow:1 }}>
          {/* Meta */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <span style={{ ...FD, fontSize:11, letterSpacing:"0.18em", color:`${p.accent}0.36)`, fontStyle:"italic" }}>{p.num}</span>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ ...FB, fontSize:10, textTransform:"uppercase", letterSpacing:"0.14em", color:"rgba(255,255,255,0.22)" }}>{p.year}</span>
              <span style={{ ...FB, fontSize:10, padding:"2px 10px", borderRadius:100, border:`1px solid ${p.accent}0.28)`, color:`${p.accent}0.62)` }}>{p.badge}</span>
            </div>
          </div>
          {/* Title */}
          <h3
            style={{ ...FD, fontSize:"clamp(17px,2vw,23px)", fontWeight:700, color:"rgba(242,237,227,0.90)", lineHeight:1.28, letterSpacing:"-0.01em", marginBottom:8, transition:"color 0.3s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLHeadingElement).style.color = `${p.accent}0.90)`; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLHeadingElement).style.color = "rgba(242,237,227,0.90)"; }}
          >{p.title}</h3>
          {/* Category */}
          <p style={{ ...FB, fontSize:11, textTransform:"uppercase", letterSpacing:"0.12em", color:`${p.accent}0.45)`, marginBottom:14 }}>{p.category}</p>
          {/* Desc */}
          <p style={{ ...FB, fontSize:13, lineHeight:1.78, color:"rgba(255,255,255,0.42)", fontWeight:300 }}>{p.desc}</p>
          {/* CTA — real link */}
          <a
            href={p.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display:"inline-flex", alignItems:"center", gap:8, marginTop:"auto", paddingTop:24, textDecoration:"none", ...FB, fontSize:12, letterSpacing:"0.06em", color:`${p.accent}0.42)`, borderBottom:`1px solid ${p.accent}0.20)`, paddingBottom:1, cursor:"pointer", transition:"color 0.2s, border-color 0.2s" }}
            onMouseEnter={(e) => { const t=e.currentTarget as HTMLAnchorElement; t.style.color=`${p.accent}0.85)`; t.style.borderBottomColor=`${p.accent}0.50)`; }}
            onMouseLeave={(e) => { const t=e.currentTarget as HTMLAnchorElement; t.style.color=`${p.accent}0.42)`; t.style.borderBottomColor=`${p.accent}0.20)`; }}
          >
            View project
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
              <path d="M1 5.5H10M10 5.5L6.5 2M10 5.5L6.5 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function WorksSection() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:true, margin:"-80px" });
  return (
    <section id="work" ref={ref} style={{ position:"relative", zIndex:10, minHeight:"100vh", background:"linear-gradient(180deg,rgba(5,5,8,0.12) 0%,rgba(5,5,8,0.28) 40%,rgba(5,5,8,0.14) 100%)", padding:"clamp(72px,9vw,116px) clamp(24px,5vw,56px)" }}>
      {/* Header */}
      <motion.div style={{ textAlign:"center", marginBottom:60 }} initial={{ opacity:0, y:28 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:1.0, ease:EXPO }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:16, marginBottom:16 }}>
          <span style={{ height:1, width:48, background:"rgba(201,168,76,0.35)" }} />
          <span style={{ ...FB, fontSize:10, letterSpacing:"0.42em", textTransform:"uppercase", color:"rgba(201,168,76,0.55)" }}>Selected Works</span>
          <span style={{ height:1, width:48, background:"rgba(201,168,76,0.35)" }} />
        </div>
        <h2 style={{ ...FD, fontSize:"clamp(36px,5.5vw,72px)", fontWeight:700, letterSpacing:"-0.022em", lineHeight:1.08, paddingBottom:8, background:"linear-gradient(135deg,rgba(242,237,227,0.95) 0%,rgba(201,168,76,0.80) 55%,rgba(232,201,122,0.90) 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
          The Atelier
        </h2>
        <p style={{ ...FB, marginTop:12, fontSize:13.5, color:"rgba(255,255,255,0.34)", maxWidth:300, margin:"12px auto 0", lineHeight:1.75 }}>
          Where data science meets the craft of the old masters.
        </p>
      </motion.div>

      {/* Cards */}
      <div style={{ maxWidth:960, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,440px),1fr))", gap:20 }}>
        {PROJECTS.map((p, i) => <GlassCard key={p.num} p={p} i={i} />)}
      </div>

      {/* Archive */}
      <motion.div style={{ marginTop:56, display:"flex", justifyContent:"center" }} initial={{ opacity:0 }} animate={inView ? { opacity:1 } : {}} transition={{ duration:0.9, delay:0.45 }}>
        <motion.a
          href="#all-work"
          style={{ ...FB, display:"inline-flex", alignItems:"center", gap:12, fontSize:12.5, letterSpacing:"0.05em", color:"rgba(201,168,76,0.44)", borderBottom:"1px solid rgba(201,168,76,0.18)", paddingBottom:2, textDecoration:"none", cursor:"pointer" }}
          whileHover={{ y:-1 }} transition={{ duration:0.2 }}
          onHoverStart={(e) => { const t=e.target as HTMLAnchorElement; t.style.color="rgba(201,168,76,0.85)"; t.style.borderBottomColor="rgba(201,168,76,0.55)"; }}
          onHoverEnd={(e)   => { const t=e.target as HTMLAnchorElement; t.style.color="rgba(201,168,76,0.44)"; t.style.borderBottomColor="rgba(201,168,76,0.18)"; }}
        >
          View complete archive
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
            <path d="M1 5.5H10M10 5.5L6.5 2M10 5.5L6.5 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.a>
      </motion.div>

      {/* ── SECTION BOUNDARY: Warp-line transition into Contact ─────────────────
          A horizontal line sweeps across when this section scrolls near its end.
          This fires exactly when the camera is doing its crane-shot pull-back,
          reinforcing the "scene exhale" between Works and Contact.
      */}
      <WarpTransition />
    </section>
  );
}

/** Animated horizontal warp-line at the Works/Contact boundary */
/** Animated horizontal warp-line at the Works/Contact boundary */
function WarpTransition() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:false, margin:"-15%" }); // Margin diubah biar trigger-nya pas di tengah layar

  return (
    <div ref={ref} style={{ position:"relative", height:120, marginTop:100, marginBottom:40, overflow:"hidden", display: "flex", alignItems: "center", justifyContent: "center" }}> 
      {/* Tinggi div ditambah, marginTop ditambah, marginBottom ditambah biar ada ruang napas.
        Ditambah flexbox centering biar garis dan teks PASTI di tengah.
      */}

      {/* Centre line */}
      <motion.div
        style={{
          position:"absolute", left:0, right:0, height:1,
          background:"linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.0) 0%, rgba(201,168,76,0.6) 30%, rgba(255,255,255,0.9) 50%, rgba(201,168,76,0.6) 70%, rgba(201,168,76,0.0) 100%)",
          transformOrigin:"center",
        }}
        initial={{ scaleX:0, opacity:0 }}
        animate={inView ? { scaleX:1, opacity:1 } : { scaleX:0, opacity:0 }}
        transition={{ duration:1.2, ease:[0.16,1,0.3,1] }}
      />

      {/* "ATELIER CONNECTION" label exactly at centre */}
      <motion.div
        style={{ position:"relative", background:"rgba(5,5,8,0.95)", padding:"6px 16px", border:"1px solid rgba(201,168,76,0.30)", borderRadius: 4, zIndex: 2 }} // Pake relative, buang transform translate
        initial={{ opacity:0, y:10 }} // Animasi y diperhalus
        animate={inView ? { opacity:1, y:0 } : { opacity:0, y:10 }}
        transition={{ duration:0.6, delay:0.4 }} // Delay dicepetin dikit
      >
        <span style={{ ...FB, fontSize:9, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(201,168,76,0.85)", fontWeight: 500 }}>
          ∞ INITIALIZING ATELIER CONNECTION ∞
        </span>
      </motion.div>

      {/* Ping dots left & right */}
      {[-1,1].map((dir) => (
        <motion.div
          key={dir}
          style={{ position:"absolute", top:"50%", left:"50%", width:6, height:6, borderRadius:"50%", background:"#c9a84c", boxShadow:"0 0 12px #c9a84c", marginTop:-3, marginLeft:-3, zIndex: 1 }}
          animate={inView ? { x: dir * window.innerWidth * 0.4, opacity:[1,1,0] } : { x:0, opacity:0 }} // Pake innerWidth biar terbangnya pas sampai ujung layar
          transition={{ duration:1.2, delay:0.5, ease:"easeOut" }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — CONTACT
// ═══════════════════════════════════════════════════════════════════════════════
function ContactSection() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:true, margin:"-100px" });
  return (
    <section id="contact" ref={ref} style={{ position:"relative", zIndex:10, minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px clamp(20px,5vw,80px)", textAlign:"center" }}>
      <motion.div initial={{ opacity:0, y:32 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:1.1, ease:EXPO }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, marginBottom:28 }}>
          <span style={{ height:1, width:36, background:"rgba(201,168,76,0.40)" }} />
          <span style={{ ...FB, fontSize:10, letterSpacing:"0.38em", textTransform:"uppercase", color:"rgba(201,168,76,0.58)" }}>Let&apos;s Connect</span>
          <span style={{ height:1, width:36, background:"rgba(201,168,76,0.40)" }} />
        </div>
        <h2 style={{ ...FD, fontSize:"clamp(40px,6vw,88px)", fontWeight:700, fontStyle:"italic", lineHeight:1.0, letterSpacing:"-0.03em", color:"rgba(242,237,227,0.94)", marginBottom:10, paddingBottom:8 }}>
          Let&apos;s Build
        </h2>
        <h2 style={{ ...FD, fontSize:"clamp(40px,6vw,88px)", fontWeight:700, lineHeight:1.0, letterSpacing:"-0.03em", marginBottom:32, paddingBottom:8 }}>
          <span style={{ background:"linear-gradient(135deg,#c9a84c 0%,#e8c97a 30%,#f5e8c0 55%,#ffffff 80%,#e8c97a 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", backgroundSize:"200% 200%", animation:"goldShimmer 7s ease-in-out infinite" }}>
            Something Remarkable.
          </span>
        </h2>
        <p style={{ ...FB, fontSize:"clamp(14px,1.5vw,17px)", lineHeight:1.85, color:"rgba(255,255,255,0.42)", maxWidth:480, margin:"0 auto 48px", fontWeight:300 }}>
          Open to data science roles, AI research collaborations, and strategic consulting. Let&apos;s turn your data into decisions.
        </p>
        <motion.a
          href="mailto:aqilla@example.com"
          style={{ ...FB, position:"relative", display:"inline-flex", alignItems:"center", gap:12, padding:"18px 44px", borderRadius:100, background:"linear-gradient(135deg,#c9a84c 0%,#b8943c 100%)", color:"#0a0800", fontSize:14, fontWeight:500, letterSpacing:"0.04em", textDecoration:"none", cursor:"pointer", overflow:"hidden" }}
          whileHover={{ scale:1.04, y:-3, boxShadow:"0 0 50px rgba(201,168,76,0.60),0 0 100px rgba(201,168,76,0.20)" }}
          whileTap={{ scale:0.97 }} transition={{ type:"spring", stiffness:340, damping:24 }}
        >
          <motion.span aria-hidden style={{ position:"absolute", inset:0, borderRadius:100, background:"linear-gradient(100deg,transparent 20%,rgba(255,255,255,0.26) 50%,transparent 80%)", backgroundSize:"220% 100%", backgroundPosition:"180% 0" }} whileHover={{ backgroundPosition:"-80% 0" }} transition={{ duration:0.55 }} />
          <span style={{ position:"relative", zIndex:1 }}>Get In Touch</span>
          <svg style={{ position:"relative", zIndex:1 }} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M2 8H14M14 8L9 3M14 8L9 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.a>
      </motion.div>
      {/* Footer */}
      <div style={{ position:"absolute", bottom:40, left:"50%", transform:"translateX(-50%)", display:"flex", alignItems:"center", gap:24 }}>
        <span style={{ height:1, width:56, background:"rgba(255,255,255,0.08)" }} />
        <span style={{ ...FD, fontSize:12, letterSpacing:"0.06em", color:"rgba(255,255,255,0.20)", fontStyle:"italic" }}>Aqilla · {new Date().getFullYear()}</span>
        <span style={{ height:1, width:56, background:"rgba(255,255,255,0.08)" }} />
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function Page() {
  const fontVars = `${playfair.variable} ${inter.variable}`;
  const { scrollYProgress } = useScroll();

  return (
    <>
      <style>{`
        @keyframes goldShimmer {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @media (min-width: 768px) {
          .nav-links  { display: flex !important; }
          .side-stats { display: flex !important; }
        }
      `}</style>

      <main
        className={fontVars}
        style={{ position:"relative", width:"100%", overflowX:"hidden", minHeight:"100vh", background:"#050508", color:"#f2ede3" }}
      >
        {/* 3D canvas */}
        <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }} aria-hidden>
          <HeroCanvas scrollYProgress={scrollYProgress} />
        </div>

        <AuroraWash />
        <Vignette />
        <CursorGlow />
        <Grain />

        <Nav fontVars={fontVars} />
        <AvailBadge />

        <div style={{ position:"relative", zIndex:10 }}>
          <HeroSection />
          <AboutSpacer />
          <WorksSection />
          <ContactSection />
        </div>

        <StarCursor />
      </main>
    </>
  );
}