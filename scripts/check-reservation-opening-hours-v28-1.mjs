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

const page = read(
  "src/pages/ReservationPage.jsx"
);

const css = read(
  "src/styles/reservation-page-v28.css"
);

for (const marker of [
  "getOpeningHoursRows(shop)",
  "shop.openingHoursSchedule",
  "shop.openingHours",
  "formatOpeningTime(",
  "<OpeningHoursDetails",
  "reservation-opening-hours-row",
]) {
  if (!page.includes(marker)) {
    errors.push(
      `ReservationPage missing: ${marker}`
    );
  }
}

for (const marker of [
  ".reservation-opening-hours {",
  ".reservation-opening-hours-row",
  "var(--reservation-yellow)",
  "@media (max-width: 420px)",
]) {
  if (!css.includes(marker)) {
    errors.push(
      `Reservation CSS missing: ${marker}`
    );
  }
}

if (
  page.includes(
    'label="Opening hours"\n                  value={\n                    shop.openingHours'
  )
) {
  errors.push(
    "The old single-line Opening hours block still exists."
  );
}

if (errors.length) {
  console.error(
    "TRAP Reservation Opening Hours V28.1 check failed:"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "TRAP Reservation Opening Hours V28.1 check passed."
);
