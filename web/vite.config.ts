import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    // Output into the root dist/web/ so server JS and browser assets
    // live together in a single dist/ directory for npm publishing.
    outDir: '../dist/web',
    emptyOutDir: true,
  },
});
