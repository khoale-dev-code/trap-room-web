
import {
  buildStatistics,
  extractCollection,
  filterForCurrentUi,
} from "../src/admin/features/live-statistics/utils/statistics.js";

const errors = [];

const categories =
  extractCollection(
    {
      data: {
        categories: [
          {
            _id: "1",
            isActive: false,
          },
        ],
      },
    },
    ["categories"]
  );

if (categories.length !== 1) {
  errors.push(
    "Nested category extraction failed."
  );
}

const categoryStats =
  buildStatistics(
    "categories",
    categories
  );

if (
  categoryStats.total !== 1 ||
  categoryStats.visible !== 0 ||
  categoryStats.hidden !== 1
) {
  errors.push(
    "Category statistics failed."
  );
}

const posts = [
  {
    title: "Post one",
    isPublished: true,
    isPinned: true,
    media: [
      {
        url: "image.jpg",
      },
    ],
  },
  {
    title: "Post two",
    isPublished: false,
    media: [],
  },
];

const postStats =
  buildStatistics(
    "journal",
    posts
  );

if (
  postStats.total !== 2 ||
  postStats.published !== 1 ||
  postStats.hidden !== 1 ||
  postStats.pinned !== 1 ||
  postStats.media !== 1
) {
  errors.push(
    "Journal statistics failed."
  );
}

const bookings = [
  {
    status: "pending",
    customerName: "A",
  },
  {
    bookingStatus: "cancelled",
    customerName: "B",
  },
];

const bookingStats =
  buildStatistics(
    "bookings",
    bookings
  );

if (
  bookingStats.total !== 2 ||
  bookingStats.pending !== 1 ||
  bookingStats.cancelled !== 1
) {
  errors.push(
    "Booking statistics failed."
  );
}

const filtered =
  filterForCurrentUi(
    "bookings",
    bookings,
    "B",
    "all"
  );

if (
  filtered.length !== 1
) {
  errors.push(
    "Showing count filter failed."
  );
}

if (errors.length) {
  console.error(
    "Admin Live Statistics V20.2 tests failed:\n"
  );

  errors.forEach(
    (error) =>
      console.error(
        `- ${error}`
      )
  );

  process.exit(1);
}

console.log(
  "Admin Live Statistics V20.2 tests passed."
);
