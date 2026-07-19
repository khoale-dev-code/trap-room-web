import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

function read(relativePath) {
  const absolutePath =
    path.join(root, relativePath);

  if (!fs.existsSync(absolutePath)) {
    errors.push(
      `Missing file: ${relativePath}`
    );
    return "";
  }

  return fs.readFileSync(
    absolutePath,
    "utf8"
  );
}

const page = read(
  "src/pages/ReservationPage.jsx"
);

const styles = read(
  "src/styles/reservation-page-v28.css"
);

for (const marker of [
  'data-reservation-page="v28"',
  "GuestCounter",
  "changeGuestCount",
  "getTodayInputValue",
  "api.reservations.create",
  "Confirmation by phone",
  "reservation-page-v28.css",
]) {
  if (!page.includes(marker)) {
    errors.push(
      `ReservationPage missing: ${marker}`
    );
  }
}

for (const marker of [
  ".reservation-layout",
  ".reservation-story-card",
  ".reservation-form-shell",
  ".reservation-guest-stepper",
  "min-height: 58px",
  "env(safe-area-inset-bottom)",
  "@media (max-width: 680px)",
]) {
  if (!styles.includes(marker)) {
    errors.push(
      `Reservation stylesheet missing: ${marker}`
    );
  }
}

if (
  page.includes(
    "MutationObserver"
  ) ||
  page.includes(
    "document."
  )
) {
  errors.push(
    "ReservationPage contains unsupported direct DOM logic."
  );
}

if (errors.length) {
  console.error(
    "TRAP Reservation Page V28 check failed:"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "TRAP Reservation Page V28 check passed."
);
