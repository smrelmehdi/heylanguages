import Image from "next/image";
import {
  siteConfig,
  type PlatformAvailability,
  type PlatformKey,
} from "@/lib/site";

export function Availability({ compact = false }: { compact?: boolean }) {
  const platforms = Object.entries(siteConfig.availability) as Array<
    [PlatformKey, PlatformAvailability]
  >;

  return (
    <div className={`availability ${compact ? "availability--compact" : ""}`}>
      {!compact ? <p className="availability__label">App availability</p> : null}
      <div className="availability__platforms">
        {platforms.map(([key, platform]) => {
          const available = platform.state === "available";
          const storeName = key === "android" ? "Google Play" : "the App Store";

          return available && platform.storeUrl ? (
            <a
              aria-label={`Get HeyYusuf on ${storeName}`}
              className={platform.badgeSrc ? "availability__store-link" : "availability__status"}
              href={platform.storeUrl}
              key={key}
              rel="noreferrer"
            >
              {platform.badgeSrc ? (
                <Image
                  alt={`Get HeyYusuf on ${storeName}`}
                  height={48}
                  src={platform.badgeSrc}
                  width={162}
                />
              ) : (
                <>
                  <span aria-hidden="true" />
                  Get it on {storeName}
                </>
              )}
            </a>
          ) : (
            <span className="availability__status" key={key}>
              <span aria-hidden="true" />
              {platform.name} · {available ? "Available now" : "Coming soon"}
            </span>
          );
        })}
      </div>
    </div>
  );
}
