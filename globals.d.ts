// TypeScript 6 requires type declarations for side-effect imports (TS2882).
// The Payload admin layout imports its stylesheet as a bare package subpath
// ('@payloadcms/next/css'), which ships no types - declare it as a side-effect module.
declare module '@payloadcms/next/css'
