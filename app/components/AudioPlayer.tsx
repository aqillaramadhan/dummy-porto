// components/AudioPlayer.tsx
import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Font styles copied from global context for consistency
const FM = { fontFamily: "'Space Mono', monospace" };

// A PREMIUM PUBLIC DOMAIN INSTRUMENTAL TRACK (Classic/Orchestral Renaissance vibe)
// You can replace this URL with your own .mp3 file later!
const AUDIO_SOURCE = "c:\Users\aqill\Downloads\The_Alchemist_s_Waltz.mp3"; 

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false); // Browser needs user interaction

  useEffect(() => {
    // Attempt to load and prepare the audio on mount
    if (audioRef.current) {
      audioRef.current.volume = 0.5; // Set a default comfortable volume
      audioRef.current.load();
    }
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // If first interaction, play from start and handle autoplay block
      if (!hasInteracted) {
        audioRef.current.play().then(() => {
          setHasInteracted(true);
        }).catch(error => {
          console.log("Autoplay blocked by browser. User must click first.", error);
        });
      } else {
        audioRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      {/* Hidden Audio Element */}
      <audio ref={audioRef} loop preload="auto">
        <source src={AUDIO_SOURCE} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* --- PREMIUM IGLOO.INC STYLE TOGGLE --- */}
      <motion.div
        style={{
          position: "fixed", bottom: 20, left: 20, zIndex: 300,
          background: "rgba(5, 5, 8, 0.45)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.06)", borderRadius: 100,
          padding: "10px 18px", display: "flex", alignItems: "center", gap: 10,
          cursor: "pointer", ...FM, fontSize: 10, letterSpacing: "0.15em", color: "rgba(255,255,255,0.45)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.15)", textTransform: "uppercase",
        }}
        whileHover={{ background: "rgba(12, 12, 20, 0.65)", borderColor: "rgba(201,168,76,0.22)", color: "#FFFFFF" }}
        whileTap={{ scale: 0.97 }}
        onClick={togglePlay}
      >
        Sound:
        <AnimatePresence mode="wait" initial={false}>
          {isPlaying ? (
            <motion.span
              key="on"
              style={{ color: "#c9a84c", fontWeight: 700 }}
              initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }}
              transition={{ duration: 0.15 }}
            >
              On
            </motion.span>
          ) : (
            <motion.span
              key="off"
              style={{ color: "rgba(255,255,255,0.45)" }}
              initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }}
              transition={{ duration: 0.15 }}
            >
              Off
            </motion.span>
          )
        }
        </AnimatePresence>

        {/* Dynamic Sound Icon */}
        <div style={{ display: "flex", alignItems: "center", gap: 3, position: "relative", top: -1 }}>
          {[1, 2, 3].map((bar) => (
            <motion.div
              key={bar}
              style={{ width: 1.5, height: 6, background: "currentColor", borderRadius: 10 }}
              animate={isPlaying ? { height: [6, 12, 6] } : { height: 6 }}
              transition={isPlaying ? { duration: 1.2, repeat: Infinity, delay: bar * 0.2, ease: "easeInOut" } : { duration: 0.15 }}
            />
          ))}
        </div>
      </motion.div>
    </>
  );
}