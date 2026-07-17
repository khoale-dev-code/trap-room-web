import { MapPin } from "lucide-react";
import InstagramIcon from "./icons/InstagramIcon.jsx";
import Logo from "./Logo.jsx";

export default function Header({ shop }) {
  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-trap-blue bg-trap-yellow">
      <div className="mx-auto flex min-h-20 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <a href="#top" aria-label="Về đầu trang">
          <Logo className="h-14 w-14 rounded-xl border-2 border-trap-blue" />
        </a>

        <nav className="hidden items-center gap-8 text-sm font-extrabold uppercase tracking-[0.12em] md:flex">
          <a
            className="transition-colors hover:text-trap-orange"
            href="#about"
          >
            Giới thiệu
          </a>

          <a
            className="transition-colors hover:text-trap-orange"
            href="#menu"
          >
            Menu
          </a>

          <a
            className="transition-colors hover:text-trap-orange"
            href="#location"
          >
            Địa chỉ
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={shop.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="trap-button grid h-11 w-11 place-items-center bg-trap-orange text-white"
            aria-label="Mở Instagram của TRAP Room"
          >
            <InstagramIcon size={19} strokeWidth={2.4} />
          </a>

          <a
            href="#location"
            className="trap-button hidden h-11 items-center gap-2 bg-trap-paper px-4 text-sm font-extrabold uppercase sm:inline-flex"
          >
            <MapPin size={18} />
            Tìm quán
          </a>
        </div>
      </div>
    </header>
  );
}
