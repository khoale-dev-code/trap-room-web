# TRAP Room Journal Client Responsive V24.2

## Image presentation

- Images use `object-contain`, never `object-cover`, so the original image is
  not cropped.
- A blurred low-opacity backdrop fills empty space without altering the main
  image.
- Cards use responsive 4:3 and 16:11 frames.
- Article media uses a touch-friendly horizontal carousel.
- Fullscreen viewing respects iPhone safe areas and dynamic viewport height.

## Mobile compatibility

- Uses `svh` instead of fixed `vh`.
- Uses `env(safe-area-inset-top/bottom)` in fullscreen mode.
- Enables `-webkit-overflow-scrolling: touch`.
- Uses CSS scroll snap and `touch-pan-x`.
- Hides the scrollbar in both Chrome and Safari.
- Keeps navigation buttons at least 44px high.

## Layout

- New editorial hero on `/posts`.
- Larger priority story.
- Cleaner story cards.
- Compact article header.
- Full-width media before the article body.
- Related stories remain responsive.
