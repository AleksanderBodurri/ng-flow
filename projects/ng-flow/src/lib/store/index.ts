export { FlowStore } from './flow-store';
export { createFlowStore, type CreateFlowStoreOptions } from './create-store';
export { getInitialState, type GetInitialStateOptions } from './initial-state';

// shallow equality helper for `FlowStore.select(selector, shallow)` (mirrors React's `zustand/shallow`)
export { shallow } from 'zustand/shallow';
