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

const app = read("src/App.jsx");
const adminPage = read(
  "src/admin/features/journal/JournalPostsPage.jsx"
);
const adminEditor = read(
  "src/admin/features/journal/components/JournalPostEditor.jsx"
);
const adminHook = read(
  "src/admin/features/journal/hooks/useJournalPosts.js"
);
const postsPage = read(
  "src/pages/PostsPage.jsx"
);
const detailPage = read(
  "src/pages/PostDetailPage.jsx"
);
const preview = read(
  "src/features/home/JournalPreview.jsx"
);

for (const marker of [
  'import PostDetailPage from "./pages/PostDetailPage.jsx";',
  '<Route path="/posts/:id" element={<PostDetailPage />} />',
]) {
  if (!app.includes(marker)) {
    errors.push(
      `App route missing: ${marker}`
    );
  }
}

for (const marker of [
  'data-admin-responsive-page="JournalPostsManager"',
  "Showing",
  "JournalPostEditor",
  "JournalPostList",
  "filterJournalPosts",
]) {
  if (!adminPage.includes(marker)) {
    errors.push(
      `Admin Journal page missing: ${marker}`
    );
  }
}

for (const marker of [
  "Client preview",
  "Story media",
  "Visible on client",
  "Pin as priority story",
]) {
  if (!adminEditor.includes(marker)) {
    errors.push(
      `Journal editor missing: ${marker}`
    );
  }
}

for (const marker of [
  "normalizeJournalCollection",
  "normalizeJournalEntity",
  "uploadJournalMedia",
]) {
  if (!adminHook.includes(marker)) {
    errors.push(
      `Journal data hook missing: ${marker}`
    );
  }
}

for (const marker of [
  "featuredPost",
  "searchJournalPosts",
  "JournalCard",
]) {
  if (!postsPage.includes(marker)) {
    errors.push(
      `Client Journal list missing: ${marker}`
    );
  }
}

for (const marker of [
  "JournalMediaGallery",
  "related",
  "splitJournalContent",
]) {
  if (!detailPage.includes(marker)) {
    errors.push(
      `Client Journal detail missing: ${marker}`
    );
  }
}

if (
  !preview.includes(
    "JournalCard"
  ) ||
  !preview.includes(
    "sortJournalPosts"
  )
) {
  errors.push(
    "Homepage JournalPreview is not connected to the shared Journal feature."
  );
}

for (const source of [
  adminPage,
  adminEditor,
  postsPage,
  detailPage,
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
      "Journal V24 must not mutate React-managed DOM."
    );
  }
}

if (errors.length) {
  console.error(
    "Journal Admin + Client V24 check failed:\n"
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(
  "Journal Admin + Client V24 check passed."
);
