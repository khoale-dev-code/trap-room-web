
import express from "express";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { Shop } from "../models/Shop.js";

const router =
  express.Router();

router.patch(
  "/",
  requireAdmin,
  async (req, res, next) => {
    try {
      const slot =
        String(
          req.body?.slot || ""
        ).trim();

      const url =
        normalizeImageUrl(
          req.body?.url
        );

      if (
        ![
          "hero",
          "story",
        ].includes(slot)
      ) {
        return res
          .status(400)
          .json({
            message:
              "Homepage image slot is invalid.",
          });
      }

      let shop =
        await Shop.findOne({});

      if (!shop) {
        shop =
          new Shop({});
      }

      const existing =
        normalizeHeroImages(
          shop.heroImages
        );

      if (
        slot === "hero"
      ) {
        shop.homeHeroImageUrl =
          url;

        shop.heroImageUrl =
          url;

        shop.homeHeroObjectPosition =
          shop.homeHeroObjectPosition ||
          "center center";

        setHeroIndex(
          existing,
          0,
          url,
          "Homepage hero",
          shop.homeHeroObjectPosition
        );
      }

      if (
        slot === "story"
      ) {
        shop.ourStoryImageUrl =
          url;

        shop.storyImageUrl =
          url;

        shop.ourStoryObjectPosition =
          shop.ourStoryObjectPosition ||
          "center center";

        setHeroIndex(
          existing,
          1,
          url,
          "Our Story",
          shop.ourStoryObjectPosition
        );
      }

      shop.heroImages =
        existing
          .filter(
            (item) =>
              Boolean(item?.url)
          )
          .map(
            (
              item,
              index
            ) => ({
              ...item,
              sortOrder:
                index + 1,
            })
          );

      shop.homepageMediaConfigured =
        true;

      await shop.save();

      const fresh =
        await Shop.findById(
          shop._id
        ).lean();

      res.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate"
      );

      return res.json({
        ok: true,
        shop: fresh,
      });
    } catch (error) {
      return next(error);
    }
  }
);

function normalizeImageUrl(value) {
  const url =
    String(
      value || ""
    ).trim();

  if (!url) {
    return "";
  }

  if (
    !/^https?:\/\//i.test(
      url
    )
  ) {
    const error =
      new Error(
        "Image URL must start with http:// or https://."
      );

    error.status = 400;
    throw error;
  }

  return url;
}

function normalizeHeroImages(value) {
  return (
    Array.isArray(value)
      ? value
      : []
  )
    .map(
      (
        item,
        index
      ) => {
        const url =
          String(
            item?.url ||
              item?.secureUrl ||
              item?.secure_url ||
              ""
          ).trim();

        if (!url) {
          return null;
        }

        return {
          url,
          secureUrl:
            item?.secureUrl ||
            item?.secure_url ||
            url,
          publicId:
            item?.publicId ||
            "",
          resourceType:
            item?.resourceType ||
            "image",
          alt:
            item?.alt ||
            "",
          objectPosition:
            item?.objectPosition ||
            "center center",
          sortOrder:
            Number(
              item?.sortOrder ??
                index + 1
            ),
        };
      }
    )
    .filter(Boolean)
    .sort(
      (a, b) =>
        Number(
          a.sortOrder || 999
        ) -
        Number(
          b.sortOrder || 999
        )
    );
}

function setHeroIndex(
  items,
  index,
  url,
  alt,
  objectPosition
) {
  while (
    items.length <= index
  ) {
    items.push({
      url: "",
      secureUrl: "",
      publicId: "",
      resourceType: "image",
      alt: "",
      objectPosition:
        "center center",
      sortOrder:
        items.length + 1,
    });
  }

  items[index] = {
    ...items[index],
    url,
    secureUrl: url,
    resourceType: "image",
    alt,
    objectPosition:
      objectPosition ||
      "center center",
    sortOrder:
      index + 1,
  };
}

export default router;
