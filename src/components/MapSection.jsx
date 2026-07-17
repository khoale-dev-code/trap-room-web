import { Clock3, ExternalLink, MapPin } from "lucide-react";
import GoogleMapFrame from "./maps/GoogleMapFrame.jsx";

export default function MapSection({ shop }) {
  return (
    <section
      id="location"
      className="border-t-[3px] border-trap-blue bg-trap-yellow px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
    >
      <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[.78fr_1.22fr]">
        <div className="flex flex-col justify-between gap-8">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.2em]">
              Find your way
            </p>
            <h2 className="mt-4 font-display text-5xl lowercase leading-[0.9] tracking-[-0.07em] sm:text-7xl">
              ghé trap.
            </h2>
          </div>

          <div className="space-y-4 text-trap-ink">
            <InfoRow icon={MapPin} title="Địa chỉ" value={shop.address} />
            <InfoRow
              icon={Clock3}
              title="Giờ mở cửa"
              value={shop.openingHours}
            />
          </div>

          <a
            href={shop.googleMapsUrl || "#location"}
            target={shop.googleMapsUrl ? "_blank" : undefined}
            rel={shop.googleMapsUrl ? "noreferrer" : undefined}
            className="trap-button inline-flex h-14 w-fit items-center gap-3 bg-trap-orange px-6 font-extrabold uppercase tracking-[0.12em] text-white"
          >
            Mở Google Maps
            <ExternalLink size={19} />
          </a>
        </div>

        <div className="trap-card min-h-[430px] overflow-hidden bg-trap-paper">
          {(shop.googleMapsEmbedUrl || shop.googleMapsUrl || shop.address) ? (
            <GoogleMapFrame shop={shop} className="h-full min-h-[440px] w-full lg:min-h-full" />
          ) : (
            <div className="grid min-h-[430px] place-items-center p-8 text-center">
              <div>
                <MapPin className="mx-auto" size={52} strokeWidth={2.3} />
                <p className="mt-5 max-w-md text-lg font-extrabold">
                  Thêm Google Maps Embed URL vào MongoDB để bản đồ xuất hiện ở
                  đây.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function InfoRow({ icon: Icon, title, value }) {
  return (
    <div className="flex gap-4 border-t-[3px] border-trap-blue pt-4">
      <Icon className="mt-1 shrink-0" size={23} />
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-trap-blue">
          {title}
        </p>
        <p className="mt-1 text-base font-bold leading-7">{value}</p>
      </div>
    </div>
  );
}
