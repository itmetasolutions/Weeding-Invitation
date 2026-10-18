"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AmbientMusic } from "@/lib/audio";
import { currentUrl, shareInvitation } from "@/lib/share";

/**
 * Shared state machine for an invitation: intro → opened, music, replay, share.
 * Each invitation renders its own visuals on top of this.
 */
export function useInvitationShell(opts: { voice: "royal" | "pearl"; shareTitle: string; shareText: string }) {
  const [opened, setOpened] = useState(false);
  const [run, setRun] = useState(0); // bump to remount and replay all animations
  const [musicOn, setMusicOn] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const music = useRef<AmbientMusic | null>(null);

  useEffect(() => {
    music.current = new AmbientMusic(opts.voice);
    return () => music.current?.dispose();
  }, [opts.voice]);

  // Lock page scroll while the intro is on screen.
  useEffect(() => {
    const el = document.documentElement;
    el.style.overflow = opened ? "" : "hidden";
    return () => {
      el.style.overflow = "";
    };
  }, [opened]);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  /** Called from the user's tap on "Open", so audio is allowed to start. */
  const open = useCallback(
    (withMusic = true) => {
      setOpened(true);
      if (withMusic && music.current) {
        music.current.start().then(() => setMusicOn(true)).catch(() => setMusicOn(false));
      }
    },
    [],
  );

  const toggleMusic = useCallback(() => {
    const m = music.current;
    if (!m) return;
    if (m.playing) {
      m.stop();
      setMusicOn(false);
    } else {
      m.start().then(() => setMusicOn(true));
    }
  }, []);

  const replay = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    setOpened(false);
    setRun((r) => r + 1);
  }, []);

  const share = useCallback(async () => {
    const res = await shareInvitation({ title: opts.shareTitle, text: opts.shareText, url: currentUrl() });
    if (res === "copied") flash("Invitation link copied");
    else if (res === "failed") flash("Could not share — copy the address bar link");
  }, [opts.shareTitle, opts.shareText, flash]);

  return { opened, open, run, replay, musicOn, toggleMusic, share, toast, flash };
}
