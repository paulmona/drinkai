export interface DrinkItem {
  id: string;
  name: string;
  category: 'spirit' | 'mixer' | 'garnish';
  subcategory?: string;
}

export const drinkItems: DrinkItem[] = [
  // Spirits
  { id: 'vodka', name: 'Vodka', category: 'spirit' },
  { id: 'gin', name: 'Gin', category: 'spirit' },
  { id: 'rum-white', name: 'White Rum', category: 'spirit', subcategory: 'rum' },
  { id: 'rum-dark', name: 'Dark Rum', category: 'spirit', subcategory: 'rum' },
  { id: 'tequila', name: 'Tequila', category: 'spirit' },
  { id: 'whiskey', name: 'Whiskey', category: 'spirit' },
  { id: 'bourbon', name: 'Bourbon', category: 'spirit' },
  { id: 'scotch', name: 'Scotch', category: 'spirit' },
  { id: 'cognac', name: 'Cognac', category: 'spirit' },
  { id: 'brandy', name: 'Brandy', category: 'spirit' },
  { id: 'absinthe', name: 'Absinthe', category: 'spirit' },
  { id: 'amaretto', name: 'Amaretto', category: 'spirit' },
  { id: 'baileys', name: 'Baileys Irish Cream', category: 'spirit' },
  { id: 'campari', name: 'Campari', category: 'spirit' },
  { id: 'cointreau', name: 'Cointreau', category: 'spirit' },
  { id: 'kahlua', name: 'Kahlúa', category: 'spirit' },
  { id: 'malibu', name: 'Malibu', category: 'spirit' },
  { id: 'midori', name: 'Midori', category: 'spirit' },
  { id: 'sambuca', name: 'Sambuca', category: 'spirit' },
  { id: 'southern-comfort', name: 'Southern Comfort', category: 'spirit' },
  { id: 'triple-sec', name: 'Triple Sec', category: 'spirit' },

  // Mixers
  { id: 'coke', name: 'Coca-Cola', category: 'mixer' },
  { id: 'diet-coke', name: 'Diet Coke', category: 'mixer' },
  { id: 'tonic', name: 'Tonic Water', category: 'mixer' },
  { id: 'soda-water', name: 'Soda Water', category: 'mixer' },
  { id: 'ginger-ale', name: 'Ginger Ale', category: 'mixer' },
  { id: 'ginger-beer', name: 'Ginger Beer', category: 'mixer' },
  { id: 'orange-juice', name: 'Orange Juice', category: 'mixer' },
  { id: 'cranberry-juice', name: 'Cranberry Juice', category: 'mixer' },
  { id: 'pineapple-juice', name: 'Pineapple Juice', category: 'mixer' },
  { id: 'lime-juice', name: 'Lime Juice', category: 'mixer' },
  { id: 'lemon-juice', name: 'Lemon Juice', category: 'mixer' },
  { id: 'grapefruit-juice', name: 'Grapefruit Juice', category: 'mixer' },
  { id: 'tomato-juice', name: 'Tomato Juice', category: 'mixer' },
  { id: 'coffee', name: 'Coffee', category: 'mixer' },
  { id: 'cream', name: 'Cream', category: 'mixer' },
  { id: 'milk', name: 'Milk', category: 'mixer' },
  { id: 'ice-cream', name: 'Ice Cream', category: 'mixer' },
  { id: 'simple-syrup', name: 'Simple Syrup', category: 'mixer' },
  { id: 'grenadine', name: 'Grenadine', category: 'mixer' },
  { id: 'bitters', name: 'Angostura Bitters', category: 'mixer' },
  { id: 'orange-bitters', name: 'Orange Bitters', category: 'mixer' },
  { id: 'peychauds-bitters', name: 'Peychaud\'s Bitters', category: 'mixer' },
  { id: 'vermouth-sweet', name: 'Sweet Vermouth', category: 'mixer' },
  { id: 'vermouth-dry', name: 'Dry Vermouth', category: 'mixer' },
  { id: 'prosecco', name: 'Prosecco', category: 'mixer' },
  { id: 'champagne', name: 'Champagne', category: 'mixer' },
  { id: 'red-wine', name: 'Red Wine', category: 'mixer' },
  { id: 'white-wine', name: 'White Wine', category: 'mixer' },

  // Garnishes
  { id: 'lime-wedge', name: 'Lime Wedge', category: 'garnish' },
  { id: 'lemon-wedge', name: 'Lemon Wedge', category: 'garnish' },
  { id: 'orange-wedge', name: 'Orange Wedge', category: 'garnish' },
  { id: 'mint-leaves', name: 'Mint Leaves', category: 'garnish' },
  { id: 'olive', name: 'Olive', category: 'garnish' },
  { id: 'cherry', name: 'Cherry', category: 'garnish' },
  { id: 'celery-stick', name: 'Celery Stick', category: 'garnish' },
  { id: 'cucumber-slice', name: 'Cucumber Slice', category: 'garnish' },
  { id: 'basil-leaves', name: 'Basil Leaves', category: 'garnish' },
  { id: 'rosemary-sprig', name: 'Rosemary Sprig', category: 'garnish' },
  { id: 'thyme-sprig', name: 'Thyme Sprig', category: 'garnish' },
  { id: 'cinnamon-stick', name: 'Cinnamon Stick', category: 'garnish' },
  { id: 'star-anise', name: 'Star Anise', category: 'garnish' },
  { id: 'salt-rim', name: 'Salt Rim', category: 'garnish' },
  { id: 'sugar-rim', name: 'Sugar Rim', category: 'garnish' },
]; 