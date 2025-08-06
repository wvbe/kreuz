# React Components with CSS Stylesheets

This checklist contains all React components in the project that use CSS stylesheets.

## UI Components

### Main UI

-   [x] `src/ui/Ui.tsx` - imports `./hud/variables.css` (kept as global) ✅

### Game UI Components

-   [x] `src/ui/game/GameClock.tsx` - imports `./game-ui.module.css` ✅

### HUD Components

-   [x] `src/ui/hud/ContextMenu.tsx` - imports `./ContextMenu.module.css` ✅
-   [x] `src/ui/hud/EntityBadge.tsx` - imports `./EntityBadge.module.css` ✅
-   [x] `src/ui/hud/EntityControls.tsx` - imports `./EntityControls.module.css` ✅
-   [x] `src/ui/hud/EntityPath.tsx` - imports `./EntityPath.module.css` ✅
-   [ ] `src/ui/hud/Gauge.tsx` - imports `./Gauge.module.css`
-   [x] `src/ui/hud/InventoryStack.tsx` - imports `./InventoryStack.module.css` ✅

### HUD Atoms (Basic UI Components)

-   [x] `src/ui/hud/atoms/Button.tsx` - imports `./Button.module.css` ✅
-   [x] `src/ui/hud/atoms/FancyClock.tsx` - imports `./FancyClock.module.css` ✅
-   [x] `src/ui/hud/atoms/Panel.tsx` - imports `./Panel.module.css` ✅
-   [x] `src/ui/hud/atoms/Popover.tsx` - imports `./Popover.module.css` ✅
-   [x] `src/ui/hud/atoms/RoundGlass.tsx` - imports `./RoundGlass.module.css` ✅
-   [x] `src/ui/hud/atoms/Spinner.tsx` - imports `./Spinner.module.css` ✅

### Utility Components

-   [x] `src/ui/util/DefinitionTable.tsx` - imports `./DefinitionTable.module.css` ✅
-   [x] `src/ui/util/TabbedSlider.tsx` - imports `./TabbedSlider.module.css` ✅

## Summary

**Total Components Refactored**: 14 components (1 kept as global)

-   **HUD Atoms**: 6 components
-   **HUD Components**: 6 components
-   **Game UI**: 1 component
-   **Utility**: 2 components
-   **Main UI**: 1 component (kept as global)

## CSS Files Overview

### Regular CSS Files

-   `src/ui/hud/variables.css` - CSS variables
-   `src/ui/game/game-ui.css` - Game UI styles
-   `src/ui/hud/ContextMenu.css`
-   `src/ui/hud/EntityBadge.css`
-   `src/ui/hud/EntityControls.css`
-   `src/ui/hud/EntityPath.css`
-   `src/ui/hud/InventoryStack.css`
-   `src/ui/hud/atoms/Button.css`
-   `src/ui/hud/atoms/FancyClock.css`
-   `src/ui/hud/atoms/Panel.css`
-   `src/ui/hud/atoms/Popover.css`
-   `src/ui/hud/atoms/RoundGlass.css`
-   `src/ui/hud/atoms/Spinner.css`
-   `src/ui/util/DefinitionTable.css`
-   `src/ui/util/TabbedSlider.css`

### CSS Module Files

-   `src/ui/hud/Gauge.module.css` - Used by Gauge.tsx with CSS modules

## Notes

-   ✅ **All components now use CSS modules** (except variables.css which remains global)
-   All CSS files have been renamed to `.module.css` format
-   Components now import styles as `import styles from './Component.module.css'`
-   CSS class names are now accessed via `styles['class-name']` or `styles.className`
-   The `variables.css` file remains as a global import since it contains CSS custom properties
-   All components have corresponding Storybook stories as per the project's code style guidelines

## Refactoring Complete ✅

**14 components** successfully refactored to use CSS modules:

-   6 HUD Components
-   6 HUD Atoms
-   1 Game UI Component
-   2 Utility Components

**1 component** kept as global import (variables.css for CSS custom properties)
