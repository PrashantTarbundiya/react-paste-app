import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

// Helper function to safely parse localStorage data
const getStoredPastes = () => {
  try {
    const stored = localStorage.getItem("pastes");
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    
    // Validate that parsed data is an array
    if (!Array.isArray(parsed)) {
      console.warn("Invalid pastes data in localStorage, resetting to empty array");
      localStorage.removeItem("pastes");
      return [];
    }
    
    // Validate each paste object
    return parsed.filter(paste => {
      if (!paste || typeof paste !== 'object') return false;
      if (!paste._id || !paste.title) return false;
      return true;
    });
  } catch (error) {
    console.error("Error parsing pastes from localStorage:", error);
    localStorage.removeItem("pastes");
    return [];
  }
};

// Helper function to safely save to localStorage
const savePastesToStorage = (pastes) => {
  try {
    // Validate data before saving
    if (!Array.isArray(pastes)) {
      throw new Error("Pastes must be an array");
    }
    
    // Filter out invalid pastes
    const validPastes = pastes.filter(paste =>
      paste &&
      typeof paste === 'object' &&
      paste._id &&
      paste.title !== undefined &&
      paste.content !== undefined
    );
    
    localStorage.setItem("pastes", JSON.stringify(validPastes));
    return true;
  } catch (error) {
    console.error("Error saving pastes to localStorage:", error);
    toast.error("Failed to save data");
    return false;
  }
};

const initialState = {
  pastes: getStoredPastes(),
  isLoading: false,
  error: null,
  lastModified: null,
};

const pasteSlice = createSlice({
  name: "paste",
  initialState,
  reducers: {
    addToPaste: (state, action) => {
      const paste = action.payload;
      
      // Validate paste data
      if (!paste || !paste._id || !paste.title) {
        state.error = "Invalid paste data";
        toast.error("Invalid paste data");
        return;
      }
      
      // Check for duplicate IDs
      const existingIndex = state.pastes.findIndex(item => item._id === paste._id);
      if (existingIndex >= 0) {
        state.error = "Paste with this ID already exists";
        toast.error("Paste with this ID already exists");
        return;
      }
      
      // Check for duplicate titles
      const duplicateTitle = state.pastes.find(
        item => item.title.toLowerCase().trim() === paste.title.toLowerCase().trim()
      );
      if (duplicateTitle) {
        state.error = "Paste with this title already exists";
        toast.error("Paste with this title already exists");
        return;
      }
      
      try {
        // Add paste to state
        state.pastes.unshift(paste); // Add to beginning for newest first
        state.lastModified = new Date().toISOString();
        state.error = null;
        
        // Save to localStorage
        if (savePastesToStorage(state.pastes)) {
          toast.success("Paste created successfully!");
        }
      } catch (error) {
        state.error = "Failed to create paste";
        toast.error("Failed to create paste");
        console.error("Error creating paste:", error);
      }
    },
    
    updateToPaste: (state, action) => {
      const paste = action.payload;
      
      // Validate paste data
      if (!paste || !paste._id) {
        state.error = "Invalid paste data for update";
        toast.error("Invalid paste data");
        return;
      }
      
      const index = state.pastes.findIndex((item) => item._id === paste._id);
      
      if (index >= 0) {
        try {
          // Check for duplicate titles (excluding current paste)
          const duplicateTitle = state.pastes.find(
            (item, idx) =>
              idx !== index &&
              item.title.toLowerCase().trim() === paste.title.toLowerCase().trim()
          );
          
          if (duplicateTitle) {
            state.error = "Another paste with this title already exists";
            toast.error("Another paste with this title already exists");
            return;
          }
          
          // Update paste
          state.pastes[index] = {
            ...state.pastes[index],
            ...paste,
            updatedAt: new Date().toISOString()
          };
          state.lastModified = new Date().toISOString();
          state.error = null;
          
          // Save to localStorage
          if (savePastesToStorage(state.pastes)) {
            toast.success("Paste updated successfully!");
          }
        } catch (error) {
          state.error = "Failed to update paste";
          toast.error("Failed to update paste");
          console.error("Error updating paste:", error);
        }
      } else {
        state.error = "Paste not found for update";
        toast.error("Paste not found");
      }
    },
    
    removeFromPaste: (state, action) => {
      const pasteId = action.payload;
      
      if (!pasteId) {
        state.error = "Invalid paste ID for deletion";
        toast.error("Invalid paste ID");
        return;
      }
      
      const index = state.pastes.findIndex((item) => item._id === pasteId);
      
      if (index >= 0) {
        try {
          const removedPaste = state.pastes[index];
          state.pastes.splice(index, 1);
          state.lastModified = new Date().toISOString();
          state.error = null;
          
          // Save to localStorage
          if (savePastesToStorage(state.pastes)) {
            toast.success(`"${removedPaste.title}" deleted successfully`);
          }
        } catch (error) {
          state.error = "Failed to delete paste";
          toast.error("Failed to delete paste");
          console.error("Error deleting paste:", error);
        }
      } else {
        state.error = "Paste not found for deletion";
        toast.error("Paste not found");
      }
    },
    
    resetToPaste: (state) => {
      try {
        state.pastes = [];
        state.lastModified = new Date().toISOString();
        state.error = null;
        localStorage.removeItem("pastes");
        toast.success("All pastes cleared");
      } catch (error) {
        state.error = "Failed to reset pastes";
        toast.error("Failed to reset pastes");
        console.error("Error resetting pastes:", error);
      }
    },
    
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Bulk operations
    importPastes: (state, action) => {
      const importedPastes = action.payload;
      
      if (!Array.isArray(importedPastes)) {
        state.error = "Invalid import data";
        toast.error("Invalid import data");
        return;
      }
      
      try {
        let importCount = 0;
        let skipCount = 0;
        
        importedPastes.forEach(paste => {
          if (paste && paste._id && paste.title) {
            const existingIndex = state.pastes.findIndex(item => item._id === paste._id);
            if (existingIndex === -1) {
              state.pastes.push({
                ...paste,
                importedAt: new Date().toISOString()
              });
              importCount++;
            } else {
              skipCount++;
            }
          }
        });
        
        state.lastModified = new Date().toISOString();
        state.error = null;
        
        if (savePastesToStorage(state.pastes)) {
          toast.success(`Imported ${importCount} pastes, skipped ${skipCount} duplicates`);
        }
      } catch (error) {
        state.error = "Failed to import pastes";
        toast.error("Failed to import pastes");
        console.error("Error importing pastes:", error);
      }
    },
    
    // Search and filter utilities
    searchPastes: (state, action) => {
      // This is handled in components, but we could cache search results here
      state.lastSearchTerm = action.payload;
    }
  },
});

export const {
  addToPaste,
  updateToPaste,
  removeFromPaste,
  resetToPaste,
  setLoading,
  setError,
  clearError,
  importPastes,
  searchPastes
} = pasteSlice.actions;

export default pasteSlice.reducer;
