"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { audioSamples, type DialectKey } from "@/lib/product";

type PlayerState = "idle" | "loading" | "playing" | "error";

export function AudioDemo() {
  const [selectedId, setSelectedId] = useState<DialectKey>("msa");
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selected =
    audioSamples.find((sample) => sample.id === selectedId) ?? audioSamples[0];

  const stopPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    }
    setPlayerState("idle");
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) stopPlayback();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const node = demoRef.current;
    const observer = node
      ? new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) stopPlayback();
          },
          { threshold: 0.08 },
        )
      : null;
    if (node) observer?.observe(node);

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, [stopPlayback]);

  const selectSample = (id: DialectKey) => {
    stopPlayback();
    setSelectedId(id);
  };

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % audioSamples.length;
    if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + audioSamples.length) % audioSamples.length;
    }
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = audioSamples.length - 1;
    selectSample(audioSamples[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  const togglePlayback = () => {
    if (playerState === "playing" || playerState === "loading") {
      stopPlayback();
      return;
    }

    stopPlayback();
    const audio = new Audio(selected.audioSrc);
    audio.preload = "none";
    audioRef.current = audio;
    setPlayerState("loading");

    audio.addEventListener("playing", () => setPlayerState("playing"), {
      once: true,
    });
    audio.addEventListener(
      "ended",
      () => {
        audioRef.current = null;
        setPlayerState("idle");
      },
      { once: true },
    );
    audio.addEventListener(
      "error",
      () => {
        audioRef.current = null;
        setPlayerState("error");
      },
      { once: true },
    );
    void audio.play().catch(() => {
      audioRef.current = null;
      setPlayerState("error");
    });
  };

  const playLabel =
    playerState === "loading"
      ? "Loading audio"
      : playerState === "playing"
        ? `Stop ${selected.label} sample`
        : `Play ${selected.label} sample`;

  return (
    <div className="audio-demo" ref={demoRef}>
      <div aria-label="Choose an Arabic variety" className="audio-tabs" role="tablist">
        {audioSamples.map((sample, index) => (
          <button
            aria-controls={`audio-panel-${sample.id}`}
            aria-selected={sample.id === selected.id}
            id={`audio-tab-${sample.id}`}
            key={sample.id}
            onClick={() => selectSample(sample.id)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            role="tab"
            tabIndex={sample.id === selected.id ? 0 : -1}
            type="button"
          >
            {sample.shortLabel}
          </button>
        ))}
      </div>

      <div
        aria-labelledby={`audio-tab-${selected.id}`}
        className="audio-panel"
        id={`audio-panel-${selected.id}`}
        role="tabpanel"
      >
        <div className="audio-panel__copy">
          <p className="audio-panel__variety">{selected.label}</p>
          <p className="audio-panel__arabic" dir="rtl" lang="ar">
            {selected.arabic}
          </p>
          <p className="audio-panel__pronunciation">
            <span>Pronunciation guide</span>
            {selected.pronunciation}
          </p>
          <p className="audio-panel__meaning">“{selected.english}”</p>
        </div>

        <div className="audio-panel__control">
          <button
            aria-label={playLabel}
            className="audio-play"
            disabled={playerState === "loading"}
            onClick={togglePlayback}
            type="button"
          >
            <span className="audio-play__icon" aria-hidden="true">
              {playerState === "playing" ? (
                <svg viewBox="0 0 24 24"><path d="M8 7h3v10H8zM13 7h3v10h-3z" /></svg>
              ) : (
                <svg viewBox="0 0 24 24"><path d="m9 7 8 5-8 5V7Z" /></svg>
              )}
            </span>
            <span>
              {playerState === "loading"
                ? "Loading…"
                : playerState === "playing"
                  ? "Stop audio"
                  : "Hear the phrase"}
            </span>
          </button>
          <div className="waveform" aria-hidden="true">
            {[2, 5, 8, 4, 10, 6, 3, 7, 4, 9, 5, 2].map((height, index) => (
              <span key={index} style={{ height: `${height * 3}px` }} />
            ))}
          </div>
        </div>
        <p aria-live="polite" className="audio-status" role="status">
          {playerState === "error"
            ? "The sample could not be played. Please try again."
            : playerState === "playing"
              ? `Playing ${selected.label}.`
              : ""}
        </p>
      </div>
      <p className="audio-demo__note">
        Website sample · Tap to play · Audio stops when you change variety or leave this section.
      </p>
    </div>
  );
}
