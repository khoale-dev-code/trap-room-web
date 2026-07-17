import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const appPath = path.join(
  root,
  "src/App.jsx"
);

if (!fs.existsSync(appPath)) {
  throw new Error(
    "Missing src/App.jsx"
  );
}

let source =
  fs.readFileSync(
    appPath,
    "utf8"
  );

const detailImport =
  'import PostDetailPage from "./pages/PostDetailPage.jsx";';

if (
  !source.includes(
    detailImport
  )
) {
  const postsImport =
    'import PostsPage from "./pages/PostsPage.jsx";';

  if (
    !source.includes(
      postsImport
    )
  ) {
    throw new Error(
      "Could not locate the PostsPage import in src/App.jsx."
    );
  }

  source = source.replace(
    postsImport,
    `${postsImport}\n${detailImport}`
  );
}

const detailRoute =
  '<Route path="/posts/:id" element={<PostDetailPage />} />';

if (
  !source.includes(
    detailRoute
  )
) {
  const postsRoute =
    '<Route path="/posts" element={<PostsPage />} />';

  if (
    !source.includes(
      postsRoute
    )
  ) {
    throw new Error(
      "Could not locate the /posts route in src/App.jsx."
    );
  }

  source = source.replace(
    postsRoute,
    `${postsRoute}\n        ${detailRoute}`
  );
}

fs.writeFileSync(
  appPath,
  source,
  "utf8"
);

console.log(
  "Connected /posts/:id to PostDetailPage."
);
