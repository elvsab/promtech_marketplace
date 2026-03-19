import { Product, Category } from '../models';

export class ShopPresenter {
  static getCategoryTitle(
    selectedCategory: string | null, 
    selectedSubcategory: string | null,
    categories: Category[]
  ): string {
    if (!selectedCategory && !selectedSubcategory) {
      return 'Популярное оборудование';
    }
    
    if (selectedSubcategory) {
      return selectedSubcategory;
    }
    
    if (selectedCategory) {
      const category = categories.find(cat => cat.id === selectedCategory);
      return category ? category.name : 'Выбрано';
    }
    
    return 'Популярное оборудование';
  }

  static formatPrice(price: number): string {
    return price.toLocaleString('ru-RU') + ' ₽';
  }
}

