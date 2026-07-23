# CONTEXT7 — Manga App Architecture & State

## Project Identity
- **Name:** MangaTools
- **Domain:** Mobile App for Manga Catalog & Reading Tracker
- **Target OS:** Android / iOS (via Expo)

## Tech Stack Constraints
- **Framework:** React Native (Expo SDK 51+)
- **Language:** Strict TypeScript (No `any`, interface-first approach)
- **Styling:** React Native `StyleSheet` with centralized token values

## Architectural Pattern
- Functional Components with React Hooks (`useState`).
- Dumb UI components in `src/components/`, Smart Screens in `src/screens/`.
- Single source of truth for design tokens in `src/theme/colors.ts`.

## Agent Guidelines
1. Always check existing types in `src/types/` before creating new ones.
2. Ensure high contrast and manga-inspired aesthetic (dark backgrounds, vibrant accent colors).
3. Always include visual feedback states for user actions (press states, error outlines, success modals).