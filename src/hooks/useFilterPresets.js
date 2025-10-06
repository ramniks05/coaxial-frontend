import { useCallback, useEffect, useState } from 'react';

const PRESETS_STORAGE_KEY = 'question_filter_presets';
const MAX_PRESETS = 10;

export const useFilterPresets = () => {
  const [savedPresets, setSavedPresets] = useState([]);

  // Load presets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (stored) {
        const presets = JSON.parse(stored);
        setSavedPresets(Array.isArray(presets) ? presets : []);
      }
    } catch (error) {
      console.error('Error loading filter presets:', error);
      setSavedPresets([]);
    }
  }, []);

  // Save presets to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(savedPresets));
    } catch (error) {
      console.error('Error saving filter presets:', error);
    }
  }, [savedPresets]);

  // Save a new preset
  const savePreset = useCallback((name, filters) => {
    try {
      // Check if name already exists
      const existingPreset = savedPresets.find(preset => preset.name.toLowerCase() === name.toLowerCase());
      if (existingPreset) {
        return false; // Name already exists
      }

      // Check if we've reached the maximum number of presets
      if (savedPresets.length >= MAX_PRESETS) {
        return false; // Too many presets
      }

      const newPreset = {
        id: Date.now().toString(),
        name: name.trim(),
        filters: JSON.parse(JSON.stringify(filters)), // Deep clone
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setSavedPresets(prev => [...prev, newPreset]);
      return true;
    } catch (error) {
      console.error('Error saving preset:', error);
      return false;
    }
  }, [savedPresets]);

  // Load a preset by ID
  const loadPreset = useCallback((presetId) => {
    try {
      const preset = savedPresets.find(p => p.id === presetId);
      return preset ? preset.filters : null;
    } catch (error) {
      console.error('Error loading preset:', error);
      return null;
    }
  }, [savedPresets]);

  // Update an existing preset
  const updatePreset = useCallback((presetId, filters) => {
    try {
      setSavedPresets(prev => prev.map(preset => 
        preset.id === presetId 
          ? { 
              ...preset, 
              filters: JSON.parse(JSON.stringify(filters)),
              updatedAt: new Date().toISOString()
            }
          : preset
      ));
      return true;
    } catch (error) {
      console.error('Error updating preset:', error);
      return false;
    }
  }, []);

  // Delete a preset
  const deletePreset = useCallback((presetId) => {
    try {
      setSavedPresets(prev => prev.filter(preset => preset.id !== presetId));
      return true;
    } catch (error) {
      console.error('Error deleting preset:', error);
      return false;
    }
  }, []);

  // Duplicate a preset
  const duplicatePreset = useCallback((presetId, newName) => {
    try {
      const originalPreset = savedPresets.find(p => p.id === presetId);
      if (!originalPreset) {
        return false;
      }

      // Check if new name already exists
      const existingPreset = savedPresets.find(preset => preset.name.toLowerCase() === newName.toLowerCase());
      if (existingPreset) {
        return false; // Name already exists
      }

      // Check if we've reached the maximum number of presets
      if (savedPresets.length >= MAX_PRESETS) {
        return false; // Too many presets
      }

      const newPreset = {
        id: Date.now().toString(),
        name: newName.trim(),
        filters: JSON.parse(JSON.stringify(originalPreset.filters)),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setSavedPresets(prev => [...prev, newPreset]);
      return true;
    } catch (error) {
      console.error('Error duplicating preset:', error);
      return false;
    }
  }, [savedPresets]);

  // Rename a preset
  const renamePreset = useCallback((presetId, newName) => {
    try {
      // Check if new name already exists
      const existingPreset = savedPresets.find(preset => 
        preset.name.toLowerCase() === newName.toLowerCase() && preset.id !== presetId
      );
      if (existingPreset) {
        return false; // Name already exists
      }

      setSavedPresets(prev => prev.map(preset => 
        preset.id === presetId 
          ? { 
              ...preset, 
              name: newName.trim(),
              updatedAt: new Date().toISOString()
            }
          : preset
      ));
      return true;
    } catch (error) {
      console.error('Error renaming preset:', error);
      return false;
    }
  }, [savedPresets]);

  // Clear all presets
  const clearAllPresets = useCallback(() => {
    try {
      setSavedPresets([]);
      return true;
    } catch (error) {
      console.error('Error clearing presets:', error);
      return false;
    }
  }, []);

  // Export presets
  const exportPresets = useCallback(() => {
    try {
      const dataStr = JSON.stringify(savedPresets, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `question-filter-presets-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error exporting presets:', error);
      return false;
    }
  }, [savedPresets]);

  // Import presets
  const importPresets = useCallback((file) => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedPresets = JSON.parse(e.target.result);
            
            if (!Array.isArray(importedPresets)) {
              reject(new Error('Invalid preset file format'));
              return;
            }

            // Validate preset structure
            const validPresets = importedPresets.filter(preset => 
              preset.id && preset.name && preset.filters && preset.createdAt
            );

            if (validPresets.length === 0) {
              reject(new Error('No valid presets found in file'));
              return;
            }

            // Check if importing would exceed the limit
            if (savedPresets.length + validPresets.length > MAX_PRESETS) {
              reject(new Error(`Import would exceed maximum of ${MAX_PRESETS} presets`));
              return;
            }

            // Add unique IDs to imported presets to avoid conflicts
            const presetsWithNewIds = validPresets.map(preset => ({
              ...preset,
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              updatedAt: new Date().toISOString()
            }));

            setSavedPresets(prev => [...prev, ...presetsWithNewIds]);
            resolve(validPresets.length);
          } catch (parseError) {
            reject(new Error('Invalid JSON in preset file'));
          }
        };
        reader.onerror = () => {
          reject(new Error('Error reading file'));
        };
        reader.readAsText(file);
      } catch (error) {
        reject(error);
      }
    });
  }, [savedPresets]);

  // Get preset statistics
  const getPresetStats = useCallback(() => {
    return {
      total: savedPresets.length,
      maxAllowed: MAX_PRESETS,
      canAddMore: savedPresets.length < MAX_PRESETS,
      oldestPreset: savedPresets.length > 0 ? Math.min(...savedPresets.map(p => new Date(p.createdAt).getTime())) : null,
      newestPreset: savedPresets.length > 0 ? Math.max(...savedPresets.map(p => new Date(p.createdAt).getTime())) : null
    };
  }, [savedPresets]);

  return {
    savedPresets,
    savePreset,
    loadPreset,
    updatePreset,
    deletePreset,
    duplicatePreset,
    renamePreset,
    clearAllPresets,
    exportPresets,
    importPresets,
    getPresetStats
  };
};
