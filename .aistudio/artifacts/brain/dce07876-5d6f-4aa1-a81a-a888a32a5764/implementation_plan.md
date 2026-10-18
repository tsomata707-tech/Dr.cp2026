# Implementation Plan - Admin Question Edits Real-Time Persistence & Student Sync

## Problem Statement
When the administrator edits, adds, or deletes questions in the Pre-Test, Post-Test, or Game Levels via `AdminTestsSettingsManager`, these modifications sometimes do not persist or sync instantly to students' online sessions due to missing real-time Firebase RTDB synchronization triggers and state re-fetching listeners.

## Proposed Changes
1. **Enhance `realtimeService.ts`**:
   - Add robust Firebase RTDB and localStorage sync functions for pre-test, post-test, and game levels (`syncGlobalQuestionsAndLevels`, `subscribeToGlobalQuestions`).
2. **Update `preTestData.ts` & `gameLevelsData.ts`**:
   - Ensure `savePreTestQuestions`, `savePostTestQuestions`, and level question savers dispatch custom window events and push updates to Firebase RTDB instantly.
3. **Update `PreTestGameView.tsx` & `EducationalGameView.tsx`**:
   - Listen to real-time custom events (`pretest-questions-updated`, `posttest-questions-updated`, `game-levels-updated`) so that student views instantly reload latest admin changes without needing a hard browser refresh.
4. **Update `AdminTestsSettingsManager.tsx`**:
   - Ensure every save/delete/edit action explicitly triggers both local storage updates, custom window events, and Firebase RTDB global sync.

## Verification Plan
- Compile applet with `compile_applet`.
- Verify linting with `lint_applet`.
- Test admin modification of a test question and verify instant student view reflection.
