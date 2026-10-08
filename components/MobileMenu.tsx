"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { HeyYusufMenu } from "./HeyYusufMenu";
import { siteConfig } from "@/lib/site";

const items = [
  { href: siteConfig.routes.approach, label: "Our approach" },
  { href: siteConfig.routes.blog, label: "Blog" },
  { href: siteConfig.routes.support, label: "Support" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const getFocusable = () => Array.from(panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])',
    ) ?? []).filter((element) => element.getClientRects().length > 0);
    getFocusable()[0]?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const breakpoint = window.matchMedia("(min-width: 901px)");
    const onResize = () => setOpen(false);
    breakpoint.addEventListener("change", onResize);

    return () => {
      breakpoint.removeEventListener("change", onResize);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="mobile-menu">
      <button
        aria-controls={panelId}
        aria-expanded={open}
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        className="mobile-menu__trigger"
        onClick={() => setOpen((value) => !value)}
        ref={triggerRef}
        type="button"
      >
        <span />
        <span />
        <span />
      </button>

      {open ? (
        <>
          <button
            aria-label="Close navigation menu"
            className="mobile-menu__scrim"
            onClick={() => {
              setOpen(false);
              triggerRef.current?.focus();
            }}
            tabIndex={-1}
            type="button"
          />
          <div
            aria-label="Mobile navigation"
            aria-modal="true"
            className="mobile-menu__panel"
            id={panelId}
            ref={panelRef}
            role="dialog"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                setOpen(false);
                triggerRef.current?.focus();
                return;
              }
              if (event.key !== "Tab") return;
              const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled])',
              )).filter((element) => element.getClientRects().length > 0);
              const first = focusable[0];
              const last = focusable[focusable.length - 1];
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
              }
            }}
          >
            <div className="mobile-menu__heading">
              <span>Navigate</span>
              <button
                aria-label="Close navigation menu"
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                type="button"
              >
                Close
              </button>
            </div>
            <nav aria-label="Mobile navigation links">
              <HeyYusufMenu mobile onNavigate={() => setOpen(false)} />
              {items.map((item, index) => (
                <Link href={item.href} key={item.href} onClick={() => setOpen(false)}>
                  <span aria-hidden="true">0{index + 2}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link
              className="mobile-menu__cta"
              href={siteConfig.routes.heyyusuf}
              onClick={() => setOpen(false)}
            >
              Explore HeyYusuf
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
