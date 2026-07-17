import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

const FALLBACK_SHOP = {
  name: "TRAP Room",
  tagline: "CAFE · MATCHA · HOMEBAKED",
  description:
    "Một không gian có màu sắc mạnh, trẻ và vui — nơi đồ uống, bánh và trải nghiệm gặp nhau.",
  instagramUrl: "https://www.instagram.com/trapart.room/",
  address: "Địa chỉ sẽ được cập nhật từ MongoDB",
  openingHours: "Cập nhật giờ mở cửa",
  googleMapsEmbedUrl: "",
  logoUrl: "/trap-logo.png",
};

export function useShop() {
  const [shop, setShop] = useState(FALLBACK_SHOP);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    api
      .getShop({ signal: controller.signal })
      .then((payload) => {
        setShop({
          ...FALLBACK_SHOP,
          ...(payload?.shop || {}),
        });
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return { shop, loading, error };
}
