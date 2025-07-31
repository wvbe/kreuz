# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Dev server**: `npm run dev` - Start Vite development server
- **Build**: `npm run build` - TypeScript build followed by Vite production build with `/kreuz/` base path
- **Tests**: `npm test` - Run Jest test suite
- **Test watch**: `npm run test:watch` - Run tests in watch mode
- **Test coverage**: `npm run test:coverage` - Generate test coverage report
- **Storybook**: `npm run storybook` - Start Storybook dev server on port 6006
- **Build Storybook**: `npm run build-storybook` - Build static Storybook

## Architecture Overview

This is a browser-based game simulation built with React, TypeScript, and Vite. The core architecture follows an Entity-Component-System (ECS) pattern for game logic with React for UI presentation.

### Core Game Architecture

- **Game Class** (`src/game/core/Game.ts`): Central game world coordinator that manages entities, time, jobs, and terrain
- **ECS System**: Entity-Component-System architecture located in `src/game/core/ecs/`
  - **Entities**: Game objects with unique IDs and component data
  - **Components**: Data containers (behavior, inventory, location, pathing, production, etc.)
  - **Systems**: Logic processors (behaviorTreeSystem, logisticsSystem, productionSystem, etc.)
  - **Archetypes**: Entity templates (personArchetype, marketArchetype, etc.)

### Key Systems

- **Time Management** (`src/game/core/time/`): Game time progression with Time class handling events and timeouts
- **Terrain System** (`src/game/core/terrain/`): Grid-based world geography with nested terrain support
- **Job System** (`src/game/core/classes/JobBoard.ts`): Task assignment and management for entities
- **Behavior Trees** (`src/game/assets/behavior/`): AI decision-making using behavior tree nodes
- **Logistics & Production**: Economic simulation with materials, vendors, and supply chains

### Driver Pattern

The game uses a Driver pattern (`src/game/core/drivers/`) to abstract game execution:
- **BrowserDriver**: Hooks game time to requestAnimationFrame, handles focus/blur events
- **TestDriver**: Simplified driver for testing scenarios

### UI Architecture

- **React Frontend**: UI components in `src/ui/` with contexts for game state management
- **PanZoom Interface**: Zoomable/pannable game map with tile-based rendering
- **Component-based**: Reusable UI atoms in `src/ui/hud/atoms/`
- **Storybook Integration**: UI component documentation and testing

### Test Configuration

- **Jest**: Unit testing with ts-jest preset
- **Test Pattern**: `(test|spec).(js|jsx|ts|tsx)` files
- **Node Environment**: Tests run in Node.js environment

### Build Configuration

- **TypeScript**: Strict mode enabled, targeting ES2017
- **Vite**: Modern build tool with React plugin
- **Base Path**: Production builds use `/kreuz/` base path for deployment

## Key Patterns

- ECS entities are managed through `game.entities` KeyedCollection
- Game time progression drives all simulation through `game.time`
- Scenarios (like `basement.ts`) define initial game states and entity placement
- Components use evented values for reactive state management
- Behavior trees define entity AI using composable nodes (Selector, Sequence, etc.)