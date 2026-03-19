import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductGroup } from '../models';

interface ProductGroupsState {
  groups: ProductGroup[];
  selectedGroupId: string | null;
  isLoading: boolean;
  error: string | null;
}

// Загрузка групп из localStorage
const loadGroupsFromStorage = (): ProductGroup[] => {
  try {
    const stored = localStorage.getItem('productGroups');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load groups from localStorage:', error);
  }
  return [];
};

// Сохранение групп в localStorage
const saveGroupsToStorage = (groups: ProductGroup[]) => {
  try {
    localStorage.setItem('productGroups', JSON.stringify(groups));
  } catch (error) {
    console.error('Failed to save groups to localStorage:', error);
  }
};

const initialState: ProductGroupsState = {
  groups: loadGroupsFromStorage(),
  selectedGroupId: null,
  isLoading: false,
  error: null,
};

const productGroupsSlice = createSlice({
  name: 'productGroups',
  initialState,
  reducers: {
    // Загрузка групп для конкретного продавца
    loadGroupsForSeller: (state, action: PayloadAction<string>) => {
      const sellerId = action.payload;
      state.groups = state.groups.filter(g => g.sellerId === sellerId);
    },
    
    // Добавление новой группы
    addGroup: (state, action: PayloadAction<Omit<ProductGroup, 'id' | 'createdAt' | 'updatedAt' | 'productIds'>>) => {
      const newGroup: ProductGroup = {
        ...action.payload,
        id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        productIds: [],
      };
      state.groups.push(newGroup);
      saveGroupsToStorage(state.groups);
    },
    
    // Обновление группы
    updateGroup: (state, action: PayloadAction<{ id: string; updates: Partial<Omit<ProductGroup, 'id' | 'sellerId' | 'createdAt'>> }>) => {
      const index = state.groups.findIndex(g => g.id === action.payload.id);
      if (index >= 0) {
        state.groups[index] = {
          ...state.groups[index],
          ...action.payload.updates,
          updatedAt: new Date().toISOString(),
        };
        saveGroupsToStorage(state.groups);
      }
    },
    
    // Удаление группы
    deleteGroup: (state, action: PayloadAction<string>) => {
      state.groups = state.groups.filter(g => g.id !== action.payload);
      if (state.selectedGroupId === action.payload) {
        state.selectedGroupId = null;
      }
      saveGroupsToStorage(state.groups);
    },
    
    // Выбор группы
    selectGroup: (state, action: PayloadAction<string | null>) => {
      state.selectedGroupId = action.payload;
    },
    
    // Добавление товара в группу
    addProductToGroup: (state, action: PayloadAction<{ groupId: string; productId: string }>) => {
      const group = state.groups.find(g => g.id === action.payload.groupId);
      if (group && !group.productIds.includes(action.payload.productId)) {
        group.productIds.push(action.payload.productId);
        group.updatedAt = new Date().toISOString();
        saveGroupsToStorage(state.groups);
      }
    },
    
    // Удаление товара из группы
    removeProductFromGroup: (state, action: PayloadAction<{ groupId: string; productId: string }>) => {
      const group = state.groups.find(g => g.id === action.payload.groupId);
      if (group) {
        group.productIds = group.productIds.filter(id => id !== action.payload.productId);
        group.updatedAt = new Date().toISOString();
        saveGroupsToStorage(state.groups);
      }
    },
    
    // Перемещение товара между группами
    moveProductToGroup: (state, action: PayloadAction<{ productId: string; fromGroupId: string | null; toGroupId: string | null }>) => {
      const { productId, fromGroupId, toGroupId } = action.payload;
      
      // Удаляем из старой группы
      if (fromGroupId) {
        const fromGroup = state.groups.find(g => g.id === fromGroupId);
        if (fromGroup) {
          fromGroup.productIds = fromGroup.productIds.filter(id => id !== productId);
          fromGroup.updatedAt = new Date().toISOString();
        }
      }
      
      // Добавляем в новую группу
      if (toGroupId) {
        const toGroup = state.groups.find(g => g.id === toGroupId);
        if (toGroup && !toGroup.productIds.includes(productId)) {
          toGroup.productIds.push(productId);
          toGroup.updatedAt = new Date().toISOString();
        }
      }
      
      saveGroupsToStorage(state.groups);
    },
    
    // Очистка всех групп
    clearGroups: (state) => {
      state.groups = [];
      state.selectedGroupId = null;
      saveGroupsToStorage(state.groups);
    },
    
    // Инициализация с корневой группой
    initializeWithRootGroup: (state, action: PayloadAction<string>) => {
      const sellerId = action.payload;
      const rootGroupExists = state.groups.some(g => g.sellerId === sellerId && g.id === 'root');
      
      if (!rootGroupExists) {
        const rootGroup: ProductGroup = {
          id: 'root',
          name: 'Корневая группа',
          description: 'Все товары без группы',
          sellerId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          productIds: [],
        };
        state.groups.push(rootGroup);
        saveGroupsToStorage(state.groups);
      }
    },
  },
});

export const {
  loadGroupsForSeller,
  addGroup,
  updateGroup,
  deleteGroup,
  selectGroup,
  addProductToGroup,
  removeProductFromGroup,
  moveProductToGroup,
  clearGroups,
  initializeWithRootGroup,
} = productGroupsSlice.actions;

export default productGroupsSlice.reducer;

