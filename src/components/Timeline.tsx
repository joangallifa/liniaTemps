import { useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Entry } from "../types";
import { TimelineCard } from "./TimelineCard";
import { EntryModal } from "./EntryModal";
import { ADMIN_EMAIL } from "../lib/supabase";
import { ERA_LABELS, ERA_COLORS, type Era } from "../lib/era";
import { formatYear } from "../lib/entryDisplay";

type Segment = { era: Era; entries: Entry[] };

function buildSegments(entries: Entry[]): Segment[] {
  const segments: Segment[] = [];
  for (const entry of entries) {
    const last = segments[segments.length - 1];
    if (last && last.era === entry.era) {
      last.entries.push(entry);
    } else {
      segments.push({ era: entry.era, entries: [entry] });
    }
  }
  return segments;
}

const MAX_VISIBLE_OFFSET = 4;

export function Timeline({
  entries,
  session,
  readOnly = false,
  onDelete,
  onEdit,
}: {
  entries: Entry[];
  session: Session | null;
  readOnly?: boolean;
  onDelete: (entry: Entry) => Promise<void>;
  onEdit: (entry: Entry) => void;
}) {
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<Entry | null>(null);
  const [stageWidth, setStageWidth] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const lastWheel = useRef(0);
  const touchStartX = useRef<number | null>(null);

  const count = entries.length;
  const current = Math.min(active, Math.max(count - 1, 0));

  useEffect(() => {
    if (active !== current) setActive(current);
  }, [active, current]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => setStageWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [count, isFullscreen]);

  useEffect(() => {
    const handleChange = () =>
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await containerRef.current?.requestFullscreen();
    }
  }

  const step = useCallback(
    (delta: number) => {
      setActive((i) => Math.min(Math.max(i + delta, 0), count - 1));
    },
    [count]
  );

  useEffect(() => {
    if (selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, selected]);

  if (count === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
        <p className="text-sm text-slate-500">
          Encara no hi ha cap tecnologia afegida. Sigues el primer a
          compartir-ne una!
        </p>
      </div>
    );
  }

  const isAdmin = session?.user.email === ADMIN_EMAIL;
  const activeEntry = entries[current];
  const activeColors = ERA_COLORS[activeEntry.era];
  const segments = buildSegments(entries);
  const spacing = Math.max(150, Math.min(250, stageWidth * 0.32));

  const cardWidth = isFullscreen ? 400 : 320;
  const cardHeight = isFullscreen ? 520 : 420;
  const stageHeight = isFullscreen ? "min(680px, 72vh)" : "480px";

  function handleWheel(e: React.WheelEvent) {
    const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    const delta = horizontal ? e.deltaX : e.shiftKey ? e.deltaY : 0;
    if (Math.abs(delta) < 20) return;
    const now = Date.now();
    if (now - lastWheel.current < 350) return;
    lastWheel.current = now;
    step(delta > 0 ? 1 : -1);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
  }

  return (
    <div
      ref={containerRef}
      className={
        isFullscreen
          ? "flex h-screen w-screen select-none flex-col justify-center bg-[#f7f8fb] px-6 py-8"
          : "select-none"
      }
    >
      {/* Capçalera de l'entrada activa */}
      <div className="mb-4 flex items-center justify-center gap-3">
        <span
          className={`rounded-full ${activeColors.pill} px-3 py-1 text-xs font-semibold text-white shadow-sm`}
        >
          {ERA_LABELS[activeEntry.era]}
        </span>
        <span className="text-sm font-semibold text-slate-700">
          {formatYear(activeEntry.year)}
        </span>
        <span className="text-xs text-slate-400">
          {current + 1} / {count}
        </span>
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Sortir de pantalla completa" : "Pantalla completa"}
          className="ml-1 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          {isFullscreen ? "⤡" : "⤢"}
        </button>
      </div>

      {/* Escenari 3D */}
      <div
        ref={stageRef}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full overflow-hidden rounded-3xl"
        style={{ perspective: "1100px", height: stageHeight }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(51,87,255,0.10), transparent 62%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-5 left-1/2 h-5 w-72 -translate-x-1/2 rounded-full bg-slate-900/10 blur-md"
        />

        {entries.map((entry, index) => {
          const offset = index - current;
          const abs = Math.abs(offset);
          const dir = Math.sign(offset);
          const visible = abs <= MAX_VISIBLE_OFFSET;
          const isActive = offset === 0;
          const rotateY = isActive ? 0 : -dir * 42;
          const translateZ = isActive ? 0 : -80 - abs * 60;
          const scale = isActive ? 1 : 0.86;
          const opacity = abs > 3 ? 0 : 1 - abs * 0.12;
          const canManage =
            isActive &&
            !readOnly &&
            (isAdmin || session?.user.id === entry.author_id);

          return (
            <div
              key={entry.id}
              className="absolute left-1/2 top-1/2"
              style={{
                width: cardWidth,
                height: cardHeight,
                zIndex: 100 - abs,
                opacity: visible ? opacity : 0,
                pointerEvents: visible && abs <= 3 ? "auto" : "none",
                transform: `translate(-50%, -50%) translateX(${offset * spacing}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                transition:
                  "transform 550ms cubic-bezier(0.22, 1, 0.36, 1), opacity 400ms ease",
                willChange: "transform, opacity",
              }}
            >
              <TimelineCard
                entry={entry}
                canDelete={canManage}
                canEdit={canManage}
                onDelete={onDelete}
                onEdit={onEdit}
                onOpen={(e) => (isActive ? setSelected(e) : setActive(index))}
              />
            </div>
          );
        })}

        <button
          onClick={() => step(-1)}
          disabled={current === 0}
          aria-label="Anterior"
          className="absolute left-3 top-1/2 z-[200] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-slate-700 shadow-md transition hover:bg-white disabled:opacity-30"
        >
          ‹
        </button>
        <button
          onClick={() => step(1)}
          disabled={current === count - 1}
          aria-label="Següent"
          className="absolute right-3 top-1/2 z-[200] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-slate-700 shadow-md transition hover:bg-white disabled:opacity-30"
        >
          ›
        </button>
      </div>

      {/* Barra d'èpoques i punts de navegació */}
      <div className="mt-6">
        <div className="flex h-2 w-full overflow-hidden rounded-full">
          {segments.map((segment, i) => (
            <div
              key={`${segment.era}-${i}`}
              style={{ flex: segment.entries.length }}
              className={`${ERA_COLORS[segment.era].pill} transition-opacity ${
                segment.era === activeEntry.era ? "" : "opacity-30"
              }`}
            />
          ))}
        </div>
        <div className="mt-1.5 flex w-full">
          {segments.map((segment, i) => (
            <div
              key={`${segment.era}-label-${i}`}
              style={{ flex: segment.entries.length }}
              className={`truncate px-1 text-center text-[10px] font-medium ${
                segment.era === activeEntry.era
                  ? "text-slate-700"
                  : "text-slate-400"
              }`}
            >
              {ERA_LABELS[segment.era]}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {entries.map((entry, index) => (
            <button
              key={entry.id}
              onClick={() => setActive(index)}
              aria-label={entry.title}
              title={`${entry.title} (${formatYear(entry.year)})`}
              className={`h-2 rounded-full transition-all ${ERA_COLORS[entry.era].pill} ${
                index === current ? "w-6" : "w-2 opacity-40 hover:opacity-80"
              }`}
            />
          ))}
        </div>
      </div>

      {selected && (
        <EntryModal
          entry={selected}
          session={session}
          readOnly={readOnly}
          onClose={() => setSelected(null)}
          canEdit={
            !readOnly && (isAdmin || session?.user.id === selected.author_id)
          }
          onEdit={(entry) => {
            setSelected(null);
            onEdit(entry);
          }}
        />
      )}
    </div>
  );
}
