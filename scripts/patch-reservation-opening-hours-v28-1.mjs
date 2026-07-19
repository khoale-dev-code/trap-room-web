import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pagePath =
  "src/pages/ReservationPage.jsx";
const cssPath =
  "src/styles/reservation-page-v28.css";

function absolute(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  const target = absolute(relativePath);

  if (!fs.existsSync(target)) {
    throw new Error(
      `Required file is missing: ${relativePath}`
    );
  }

  return fs
    .readFileSync(target, "utf8")
    .replaceAll("\r\n", "\n");
}

function write(relativePath, source) {
  fs.writeFileSync(
    absolute(relativePath),
    source,
    "utf8"
  );

  console.log(`Updated ${relativePath}`);
}

function insertBefore(
  source,
  marker,
  addition,
  label
) {
  if (source.includes(addition.trim())) {
    return source;
  }

  const index = source.indexOf(marker);

  if (index < 0) {
    throw new Error(
      `Could not locate ${label}.`
    );
  }

  return (
    source.slice(0, index) +
    addition +
    source.slice(index)
  );
}

let page = read(pagePath);

if (
  !page.includes(
    'data-reservation-page="v28"'
  )
) {
  throw new Error(
    "Reservation Page V28 was not found. Run V28 before V28.1."
  );
}

const helpers = `
function formatOpeningTime(value) {
  const source =
    String(value || "").trim();

  if (!/^([01]\\d|2[0-3]):[0-5]\\d$/.test(source)) {
    return source;
  }

  const [hoursText, minutes] =
    source.split(":");

  const hours = Number(hoursText);
  const suffix =
    hours >= 12 ? "PM" : "AM";
  const displayHours =
    hours % 12 || 12;

  return \`\${displayHours}:\${minutes} \${suffix}\`;
}

function getOpeningHoursRows(shop) {
  const schedule =
    shop?.openingHoursSchedule;

  if (
    schedule &&
    typeof schedule === "object"
  ) {
    const rows = [
      schedule.weekdays,
      schedule.weekend,
    ]
      .filter(Boolean)
      .map((period, index) => ({
        label:
          String(
            period.label ||
            (
              index === 0
                ? "Mon - Fri"
                : "Sat - Sun"
            )
          ).trim(),
        value:
          period.closed === true
            ? "Closed"
            : [
                formatOpeningTime(
                  period.open
                ),
                formatOpeningTime(
                  period.close
                ),
              ]
                .filter(Boolean)
                .join(" – "),
      }))
      .filter(
        (item) =>
          item.label &&
          item.value
      );

    if (rows.length) {
      return rows;
    }
  }

  const legacy =
    String(
      shop?.openingHours || ""
    ).trim();

  if (legacy) {
    return legacy
      .split(/\\r?\\n/)
      .map((line) => {
        const separator =
          line.indexOf(":");

        if (separator < 0) {
          return {
            label:
              "Opening hours",
            value:
              line.trim(),
          };
        }

        return {
          label:
            line
              .slice(0, separator)
              .trim(),
          value:
            line
              .slice(separator + 1)
              .trim(),
        };
      })
      .filter(
        (item) =>
          item.label &&
          item.value
      );
  }

  return [
    {
      label: "Opening hours",
      value:
        "Opening hours are being updated.",
    },
  ];
}

`;

page = insertBefore(
  page,
  "export default function ReservationPage()",
  helpers,
  "ReservationPage export"
);

const todayBlock = `  const today =
    useMemo(
      () => getTodayInputValue(),
      []
    );
`;

const openingHoursBlock = `
  const openingHoursRows =
    useMemo(
      () =>
        getOpeningHoursRows(shop),
      [
        shop.openingHoursSchedule,
        shop.openingHours,
      ]
    );
`;

if (
  !page.includes(
    "const openingHoursRows ="
  )
) {
  const todayIndex =
    page.indexOf(todayBlock);

  if (todayIndex < 0) {
    throw new Error(
      "Could not locate the V28 today useMemo block."
    );
  }

  const insertAt =
    todayIndex + todayBlock.length;

  page =
    page.slice(0, insertAt) +
    openingHoursBlock +
    page.slice(insertAt);
}

const oldHoursBlock = `                <VisitItem
                  icon={Clock3}
                  label="Opening hours"
                  value={
                    shop.openingHours ||
                    "Opening hours are being updated."
                  }
                />
`;

const newHoursBlock = `                <OpeningHoursDetails
                  rows={openingHoursRows}
                />
`;

if (
  !page.includes(
    "<OpeningHoursDetails"
  )
) {
  const oldIndex =
    page.indexOf(oldHoursBlock);

  if (oldIndex < 0) {
    throw new Error(
      "Could not locate the V28 Opening hours VisitItem."
    );
  }

  page =
    page.slice(0, oldIndex) +
    newHoursBlock +
    page.slice(
      oldIndex + oldHoursBlock.length
    );
}

const component = `
function OpeningHoursDetails({
  rows,
}) {
  return (
    <div className="reservation-opening-hours">
      <span className="reservation-visit-icon">
        <Clock3 size={18} />
      </span>

      <span className="reservation-opening-hours-copy">
        <small>Opening hours</small>

        <span className="reservation-opening-hours-list">
          {rows.map((row) => (
            <span
              key={\`\${row.label}-\${row.value}\`}
              className="reservation-opening-hours-row"
            >
              <b>{row.label}</b>
              <strong>{row.value}</strong>
            </span>
          ))}
        </span>
      </span>
    </div>
  );
}

`;

page = insertBefore(
  page,
  "function VisitItem({",
  component,
  "VisitItem component"
);

write(pagePath, page);

let css = read(cssPath);

const styles = `
.reservation-opening-hours {
  display: grid;
  grid-template-columns:
    auto minmax(0, 1fr);
  gap: 0.8rem;
  align-items: start;
  border:
    1px solid
    rgba(255, 255, 255, 0.11);
  border-radius: 18px;
  background:
    rgba(255, 255, 255, 0.075);
  padding: 0.85rem;
}

.reservation-opening-hours-copy {
  min-width: 0;
}

.reservation-opening-hours-copy > small {
  display: block;
  margin-bottom: 0.45rem;
  color:
    rgba(255, 255, 255, 0.48);
  font-size: 0.6rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.reservation-opening-hours-list {
  display: grid;
  gap: 0.42rem;
}

.reservation-opening-hours-row {
  display: grid;
  grid-template-columns:
    minmax(72px, auto)
    minmax(0, 1fr);
  gap: 0.65rem;
  align-items: baseline;
}

.reservation-opening-hours-row b {
  color:
    var(--reservation-yellow);
  font-size: 0.7rem;
  font-weight: 850;
}

.reservation-opening-hours-row strong {
  color: #ffffff;
  font-size: 0.76rem;
  font-weight: 750;
  line-height: 1.45;
}

@media (max-width: 420px) {
  .reservation-opening-hours-row {
    grid-template-columns: 1fr;
    gap: 0.12rem;
  }
}
`;

if (
  !css.includes(
    ".reservation-opening-hours {"
  )
) {
  css =
    css.trimEnd() +
    "\n\n" +
    styles.trim() +
    "\n";
}

write(cssPath, css);

console.log(
  "TRAP Reservation Opening Hours V28.1 patch completed."
);
