import ShopCard from './ShopCard';

const shops = [
  // Food Shops
  { name: 'Al-Madina Restaurant', cuisine: 'Pakistani', rating: 4.5, deliveryTime: 40, category: 'Food', address: 'Club Road, Vehari' },
  { name: 'Pizza N Pizza', cuisine: 'Pizza', rating: 4.2, deliveryTime: 35, category: 'Food', address: 'Stadium Road, Vehari' },
  { name: 'Silver Spoon', cuisine: 'Fast Food', rating: 4.0, deliveryTime: 25, category: 'Food', address: 'Main Bazar, Vehari' },
  { name: 'Naveed BBQ', cuisine: 'BBQ', rating: 4.6, deliveryTime: 50, category: 'Food', address: 'Sharqi Colony, Vehari' },
  { name: 'KFC Vehari', cuisine: 'Fast Food', rating: 4.3, deliveryTime: 30, category: 'Food', address: 'Multan Road, Vehari' },
  // Grocery Shops
  { name: 'Vehari General Store', cuisine: 'Groceries', rating: 4.8, deliveryTime: 20, category: 'Grocery', address: 'Karkhana Bazar, Vehari' },
  { name: 'Madina Cash & Carry', cuisine: 'Groceries', rating: 4.7, deliveryTime: 25, category: 'Grocery', address: 'Block 12, Vehari' },
  { name: 'Punjab Mart', cuisine: 'Groceries', rating: 4.6, deliveryTime: 30, category: 'Grocery', address: 'Model Town, Vehari' },
  { name: 'CSD Vehari', cuisine: 'Groceries', rating: 4.5, deliveryTime: 35, category: 'Grocery', address: 'Cantt Area, Vehari' },
  { name: 'Imtiaz Super Market', cuisine: 'Groceries', rating: 4.9, deliveryTime: 40, category: 'Grocery', address: 'D-Block, Vehari' },
  // Medical Shops
  { name: 'Servaid Pharmacy', cuisine: 'Pharmacy', rating: 4.8, deliveryTime: 15, category: 'Medical', address: 'Hospital Road, Vehari' },
  { name: 'Fazal Din Pharma Plus', cuisine: 'Pharmacy', rating: 4.7, deliveryTime: 20, category: 'Medical', address: 'Main Bazar, Vehari' },
  { name: 'Shaheen Chemist', cuisine: 'Pharmacy', rating: 4.6, deliveryTime: 25, category: 'Medical', address: 'Iqbal Town, Vehari' },
  { name: 'Al-Shifa Medical Store', cuisine: 'Pharmacy', rating: 4.5, deliveryTime: 30, category: 'Medical', address: 'Sharqi Colony, Vehari' },
  { name: 'Clinix Pharmacy', cuisine: 'Pharmacy', rating: 4.9, deliveryTime: 15, category: 'Medical', address: 'College Road, Vehari' },
];


const categories = ['Food', 'Grocery', 'Medical'];

export default function ShopList() {
  return (
    <section className="space-y-12">
      {categories.map(category => (
        <div key={category}>
          <div className="mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold font-headline">{category}</h2>
            <p className="text-muted-foreground mt-1">Find the best {category.toLowerCase()} options in town.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shops
              .filter(shop => shop.category === category)
              .map((shop) => (
                <ShopCard
                  key={shop.name}
                  name={shop.name}
                  cuisine={shop.cuisine}
                  rating={shop.rating}
                  deliveryTime={shop.deliveryTime}
                  address={shop.address}
                />
              ))}
          </div>
        </div>
      ))}
    </section>
  );
}
