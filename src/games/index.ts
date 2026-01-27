import { lazy } from 'react';
import type { GameName } from '@/types';

// Lazy loading for code splitting
export const ReactionTime = lazy(() => import('./ReactionTime'));
export const PeripheralVision = lazy(() => import('./PeripheralVision'));
export const Concentration = lazy(() => import('./Concentration'));
export const Judgment = lazy(() => import('./Judgment'));
export const Coordination = lazy(() => import('./Coordination'));

// 게임 순서
export const GAME_ORDER: GameName[] = [
  'reactionTime',
  'peripheralVision',
  'concentration',
  'judgment',
  'coordination',
];

// 게임 컴포넌트 맵
export const GAME_COMPONENTS = {
  reactionTime: ReactionTime,
  peripheralVision: PeripheralVision,
  concentration: Concentration,
  judgment: Judgment,
  coordination: Coordination,
};
