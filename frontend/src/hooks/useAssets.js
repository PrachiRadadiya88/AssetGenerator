/**
 * useAssets.js — Custom hook for managing asset generation state.
 * 
 * Handles all state related to generated assets, loading states,
 * errors, and provides actions for generating and adding assets.
 */

import { useReducer, useCallback } from 'react';
import { generateAssets as apiGenerateAssets, addAsset as apiAddAsset } from '../services/api';

// ─────────────────────────────────────────────
// State Shape & Actions
// ─────────────────────────────────────────────

const initialState = {
  sessionId: null,
  assets: [],
  isGenerating: false,
  isAddingMore: false,
  error: null,
  appDetails: null, // Store app details for "add more" calls
};

const ActionTypes = {
  SET_APP_DETAILS: 'SET_APP_DETAILS',
  GENERATE_START: 'GENERATE_START',
  GENERATE_SUCCESS: 'GENERATE_SUCCESS',
  GENERATE_ERROR: 'GENERATE_ERROR',
  ADD_START: 'ADD_START',
  ADD_SUCCESS: 'ADD_SUCCESS',
  ADD_ERROR: 'ADD_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET: 'RESET',
};

function reducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_APP_DETAILS:
      return { ...state, appDetails: action.payload };

    case ActionTypes.GENERATE_START:
      return {
        ...state,
        isGenerating: true,
        error: null,
        assets: [],
        sessionId: null,
      };

    case ActionTypes.GENERATE_SUCCESS:
      return {
        ...state,
        isGenerating: false,
        sessionId: action.payload.session_id,
        assets: action.payload.assets,
      };

    case ActionTypes.GENERATE_ERROR:
      return {
        ...state,
        isGenerating: false,
        error: action.payload,
      };

    case ActionTypes.ADD_START:
      return { ...state, isAddingMore: true, error: null };

    case ActionTypes.ADD_SUCCESS:
      return {
        ...state,
        isAddingMore: false,
        assets: [...state.assets, action.payload],
      };

    case ActionTypes.ADD_ERROR:
      return { ...state, isAddingMore: false, error: action.payload };

    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };

    case ActionTypes.RESET:
      return initialState;

    default:
      return state;
  }
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useAssets() {
  const [state, dispatch] = useReducer(reducer, initialState);

  /**
   * Generate initial batch of assets.
   */
  const generate = useCallback(async (formData) => {
    dispatch({ type: ActionTypes.SET_APP_DETAILS, payload: formData });
    dispatch({ type: ActionTypes.GENERATE_START });

    try {
      const result = await apiGenerateAssets(formData);
      dispatch({ type: ActionTypes.GENERATE_SUCCESS, payload: result });
      return result;
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Failed to generate assets';
      dispatch({ type: ActionTypes.GENERATE_ERROR, payload: message });
      throw err;
    }
  }, []);

  /**
   * Add one more unique asset.
   */
  const addMore = useCallback(async () => {
    if (!state.sessionId || !state.appDetails) return;

    dispatch({ type: ActionTypes.ADD_START });

    try {
      // Cycle through features based on current asset count
      const features = state.appDetails.features || [];
      const nextFeatureIndex = state.assets.length % (features.length || 1);
      const targetFeature = features[nextFeatureIndex] || 'Core Feature';

      const result = await apiAddAsset({
        sessionId: state.sessionId,
        appName: state.appDetails.appName,
        targetAudience: state.appDetails.targetAudience || '',
        brandStyle: state.appDetails.brandStyle || '',
        appCategory: state.appDetails.appCategory,
        colorTheme: state.appDetails.colorTheme,
        orientation: state.appDetails.orientation,
        targetFeature: targetFeature,
      });
      dispatch({ type: ActionTypes.ADD_SUCCESS, payload: result.asset });
      return result.asset;
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Failed to add asset';
      dispatch({ type: ActionTypes.ADD_ERROR, payload: message });
      throw err;
    }
  }, [state.sessionId, state.appDetails, state.assets]);

  /**
   * Clear error state.
   */
  const clearError = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  }, []);

  /**
   * Reset everything.
   */
  const reset = useCallback(() => {
    dispatch({ type: ActionTypes.RESET });
  }, []);

  return {
    ...state,
    generate,
    addMore,
    clearError,
    reset,
  };
}
