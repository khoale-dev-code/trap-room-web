import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

function read(relativePath) {
  const target =
    path.join(root, relativePath);

  if (!fs.existsSync(target)) {
    errors.push(
      `Missing file: ${relativePath}`
    );
    return "";
  }

  return fs.readFileSync(
    target,
    "utf8"
  );
}

const media = read(
  "src/features/journal/components/JournalMedia.jsx"
);
const card = read(
  "src/features/journal/components/JournalCard.jsx"
);
const list = read(
  "src/pages/PostsPage.jsx"
);
const detail = read(
  "src/pages/PostDetailPage.jsx"
);

for (const marker of [
  "object-contain",
  "snap-x",
  "touch-pan-x",
  "[-webkit-overflow-scrolling:touch]",
  "100svh",
  "env(safe-area-inset-bottom)",
  "setLightboxOpen",
]) {
  if (!media.includes(marker)) {
    errors.push(
      `Responsive media viewer is missing: ${marker}`
    );
  }
}

for (const forbidden of [
  "object-cover transition duration-700",
  "h-full w-full object-cover",
]) {
  if (media.includes(forbidden)) {
    errors.push(
      `Journal media still contains a crop-prone presentation: ${forbidden}`
    );
  }
}

for (const marker of [
  "aspect-[4/3]",
  "sm:aspect-[16/11]",
  "shadow-[0_18px_60px",
]) {
  if (!card.includes(marker)) {
    errors.push(
      `Journal card is missing: ${marker}`
    );
  }
}

for (const marker of [
  "stories from the room.",
  "Latest stories",
  "Search stories...",
]) {
  if (!list.includes(marker)) {
    errors.push(
      `Journal list page is missing: ${marker}`
    );
  }
}

for (const marker of [
  "JournalMediaGallery",
  "overflow-x-hidden",
  "Keep reading",
]) {
  if (!detail.includes(marker)) {
    errors.push(
      `Journal detail page is missing: ${marker}`
    );
  }
}

for (const source of [
  media,
  card,
  list,
  detail,
]) {
  if (
    source.includes(
      "MutationObserver"
    ) ||
    source.includes(
      "textContent ="
    )
  ) {
    errors.push(
      "Journal client V24.2 must not mutate React-managed DOM."
    );
  }
}

if (errors.length) {
  console.error(
    "Journal Client Responsive V24.2 check failed:\n"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "Journal Client Responsive V24.2 check passed."
);
