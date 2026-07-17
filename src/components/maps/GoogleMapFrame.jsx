import { resolveGoogleMapsEmbedUrl } from "../../lib/googleMapsEmbed.js";
import {
  ExternalLink,
  Loader2,
  MapPin,
  RefreshCw,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsEmbedUrl,
  getGoogleMapsResolveSource,
  hasUsableAddress,
} from "../../lib/googleMaps.js";

export default function GoogleMapFrame({
  shop = {},
  className = "",
  fallbackImage = "",
}) {
  const safeEmbedUrl = resolveGoogleMapsEmbedUrl(shop);

  const immediateEmbedUrl = useMemo(
    () => buildGoogleMapsEmbedUrl(shop),
    [
      shop.googleMapsEmbedUrl,
      shop.googleMapEmbedUrl,
      shop.mapEmbedUrl,
      shop.googleMapsUrl,
      shop.address,
    ]
  );

  const resolveSource = useMemo(
    () => getGoogleMapsResolveSource(shop),
    [
      shop.googleMapsEmbedUrl,
      shop.googleMapEmbedUrl,
      shop.mapEmbedUrl,
      shop.googleMapsUrl,
    ]
  );

  const directionsUrl = useMemo(
    () =>
      buildGoogleMapsDirectionsUrl(shop),
    [
      shop.googleMapsEmbedUrl,
      shop.googleMapEmbedUrl,
      shop.mapEmbedUrl,
      shop.googleMapsUrl,
      shop.address,
    ]
  );

  const [embedUrl, setEmbedUrl] = useState(
    immediateEmbedUrl
  );
  const [status, setStatus] = useState(
    immediateEmbedUrl
      ? "ready"
      : resolveSource
        ? "loading"
        : "empty"
  );
  const [retryToken, setRetryToken] =
    useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller =
      new AbortController();

    if (immediateEmbedUrl) {
      setEmbedUrl(immediateEmbedUrl);
      setStatus("ready");

      return () => {
        controller.abort();
      };
    }

    if (!resolveSource) {
      setEmbedUrl("");
      setStatus("empty");

      return () => {
        controller.abort();
      };
    }

    setEmbedUrl("");
    setStatus("loading");

    const params = new URLSearchParams({
      url: resolveSource,
    });

    if (hasUsableAddress(shop.address)) {
      params.set(
        "address",
        String(shop.address).trim()
      );
    }

    fetch(
      `/api/maps/resolve?${params.toString()}`,
      {
        credentials: "include",
        cache: "no-store",
        signal: controller.signal,
      }
    )
      .then(async (response) => {
        const data = await response
          .json()
          .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to resolve the Google Maps link."
          );
        }

        return data;
      })
      .then((data) => {
        if (cancelled) return;

        if (data.embedUrl) {
          setEmbedUrl(data.embedUrl);
          setStatus("ready");
        } else {
          setStatus("error");
        }
      })
      .catch((error) => {
        if (
          cancelled ||
          error.name === "AbortError"
        ) {
          return;
        }

        setStatus("error");
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    immediateEmbedUrl,
    resolveSource,
    shop.address,
    retryToken,
  ]);

  if (status === "ready" && embedUrl) {
    return (
      <iframe
        key={embedUrl}
        title={`${shop.name || "TRAP Room"} map`}
        src={embedUrl}
        className={[
          "block h-full min-h-[440px] w-full border-0",
          className,
        ].join(" ")}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    );
  }

  if (status === "loading") {
    return (
      <MapState
        className={className}
        fallbackImage={fallbackImage}
        icon={
          <Loader2
            className="animate-spin"
            size={28}
          />
        }
        title="Loading map..."
        description="The Google Maps share link is being converted into a safe embed."
      />
    );
  }

  return (
    <MapState
      className={className}
      fallbackImage={fallbackImage}
      icon={<MapPin size={30} />}
      title={
        status === "error"
          ? "Map preview is unavailable."
          : "Map location is not ready."
      }
      description={
        status === "error"
          ? "The directions link still works. You can also add a full address or a Google Maps Embed URL in Admin."
          : "Add a real address or Google Maps link in Admin → Store settings."
      }
      actions={
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {status === "error" &&
            resolveSource && (
              <button
                type="button"
                onClick={() =>
                  setRetryToken(
                    (value) => value + 1
                  )
                }
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-trap-blue/20 bg-white px-4 text-[9px] font-extrabold uppercase tracking-[0.11em] text-trap-blue"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            )}

          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-trap-blue px-4 text-[9px] font-extrabold uppercase tracking-[0.11em] text-trap-yellow"
            >
              Open Google Maps
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      }
    />
  );
}

function MapState({
  icon,
  title,
  description,
  actions,
  fallbackImage,
  className = "",
}) {
  return (
    <div
      className={[
        "relative grid h-full min-h-[440px] place-items-center overflow-hidden bg-[#eef1f4] p-8 text-center text-trap-blue",
        className,
      ].join(" ")}
    >
      {fallbackImage && (
        <>
          <img
            src={fallbackImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-20 grayscale"
          />

          <span className="absolute inset-0 bg-white/72 backdrop-blur-sm" />
        </>
      )}

      <div className="relative z-10 max-w-md">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white shadow-sm">
          {icon}
        </span>

        <h3 className="mt-5 text-xl font-extrabold text-trap-blue">
          {title}
        </h3>

        <p className="mt-2 text-sm font-medium leading-6 text-trap-ink/55">
          {description}
        </p>

        {actions}
      </div>
    </div>
  );
}
