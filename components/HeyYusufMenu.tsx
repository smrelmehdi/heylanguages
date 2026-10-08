"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { heyYusufNavItems } from "@/lib/navigation";

export function HeyYusufMenu({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const groupRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open || mobile) return;
    const dismiss = (event: PointerEvent) => {
      if (!groupRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const breakpoint = window.matchMedia("(max-width: 900px)");
    const onResize = () => setOpen(false);
    document.addEventListener("pointerdown", dismiss);
    breakpoint.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      breakpoint.removeEventListener("change", onResize);
    };
  }, [open, mobile]);

  return (
    <div
      className={`heyyusuf-menu${mobile ? " heyyusuf-menu--mobile" : ""}`}
      ref={groupRef}
      onBlur={(event) => {
        if (!mobile && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          triggerRef.current?.focus();
        }
      }}
    >
      <button
        type="button"
        className="heyyusuf-menu__trigger"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        ref={triggerRef}
      >
        {mobile ? <span className="heyyusuf-menu__number" aria-hidden="true">01</span> : null}
        HeyYusuf
        <svg className="heyyusuf-menu__chevron" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
          <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      <ul className="heyyusuf-menu__links" id={listId} hidden={!open}>
        {heyYusufNavItems.map((item) => (
          <li key={item.href}>
            <Link href={item.href} onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
