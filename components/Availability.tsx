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
          const available =
            platform.state === "available" &&
            Boolean(platform.storeUrl) &&
            Boolean(platform.badgeSrc);

          return available ? (
            <a
              aria-label={`Get HeyYusuf for ${platform.name}`}
              className="availability__store-link"
              href={platform.storeUrl ?? undefined}
              key={key}
              rel="noreferrer"
            >
              <Image
                alt={`Get HeyYusuf for ${platform.name}`}
                height={48}
                src={platform.badgeSrc ?? ""}
                width={162}
              />
            </a>
          ) : (
            <span className="availability__status" key={key}>
              <span aria-hidden="true" />
              {platform.name} · Coming soon
            </span>
          );
        })}
      </div>
    </div>
  );
}
