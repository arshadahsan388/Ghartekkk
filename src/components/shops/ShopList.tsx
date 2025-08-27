import ShopCard from './ShopCard';

const shops = [
  // Food Shops
  { name: 'Al-Madina Restaurant', cuisine: 'Pakistani', rating: 4.5, deliveryTime: 40, category: 'Food', 'data-ai-hint': 'biryani plate', address: 'Club Road, Vehari' },
  { name: 'Pizza N Pizza', cuisine: 'Pizza', rating: 4.2, deliveryTime: 35, category: 'Food', 'data-ai-hint': 'pepperoni pizza', address: 'Stadium Road, Vehari' },
  { name: 'Silver Spoon', cuisine: 'Fast Food', rating: 4.0, deliveryTime: 25, category: 'Food', 'data-ai-hint': 'zinger burger', address: 'Main Bazar, Vehari' },
  { name: 'Naveed BBQ', cuisine: 'BBQ', rating: 4.6, deliveryTime: 50, category: 'Food', 'data-ai-hint': 'bbq platter', address: 'Sharqi Colony, Vehari' },
  { name: 'KFC Vehari', cuisine: 'Fast Food', rating: 4.3, deliveryTime: 30, category: 'Food', 'data-ai-hint': 'fried chicken bucket', address: 'Multan Road, Vehari' },
  // Grocery Shops
  { name: 'Vehari General Store', cuisine: 'Groceries', rating: 4.8, deliveryTime: 20, category: 'Grocery', 'data-ai-hint': 'grocery items', address: 'Karkhana Bazar, Vehari' },
  { name: 'Madina Cash & Carry', cuisine: 'Groceries', rating: 4.7, deliveryTime: 25, category: 'Grocery', 'data-ai-hint': 'shopping cart', address: 'Block 12, Vehari' },
  { name: 'Punjab Mart', cuisine: 'Groceries', rating: 4.6, deliveryTime: 30, category: 'Grocery', 'data-ai-hint': 'fresh vegetables', address: 'Model Town, Vehari' },
  { name: 'CSD Vehari', cuisine: 'Groceries', rating: 4.5, deliveryTime: 35, category: 'Grocery', 'data-ai-hint': 'packaged goods', address: 'Cantt Area, Vehari' },
  { name: 'Imtiaz Super Market', cuisine: 'Groceries', rating: 4.9, deliveryTime: 40, category: 'Grocery', 'data-ai-hint': 'supermarket aisle', address: 'D-Block, Vehari' },
  // Medical Shops
  { name: 'Servaid Pharmacy', cuisine: 'Pharmacy', rating: 4.8, deliveryTime: 15, category: 'Medical', 'data-ai-hint': 'pharmacy counter', address: 'Hospital Road, Vehari' },
  { name: 'Fazal Din Pharma Plus', cuisine: 'Pharmacy', rating: 4.7, deliveryTime: 20, category: 'Medical', 'data-ai-hint': 'medicines on shelf', address: 'Main Bazar, Vehari' },
  { name: 'Shaheen Chemist', cuisine: 'Pharmacy', rating: 4.6, deliveryTime: 25, category: 'Medical', 'data-ai-hint': 'blister packs', address: 'Iqbal Town, Vehari' },
  { name: 'Al-Shifa Medical Store', cuisine: 'Pharmacy', rating: 4.5, deliveryTime: 30, category: 'Medical', 'data-ai-hint': 'pills bottle', address: 'Sharqi Colony, Vehari' },
  { name: 'Clinix Pharmacy', cuisine: 'Pharmacy', rating: 4.9, deliveryTime: 15, category: 'Medical', 'data-ai-hint': 'pharmacist helping customer', address: 'College Road, Vehari' },
];


const categories = ['Food', 'Grocery', 'Medical'];

export default function ShopList() {
  return (
    <section className="space-y-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold font-headline">Explore Shops in Vehari</h2>
        <p className="text-muted-foreground mt-2">Find what you need from our curated list of shops.</p>
      </div>

      {categories.map(category => (
        <div key={category}>
          <h3 className="text-2xl font-bold font-headline mb-6">{category}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {shops
              .filter(shop => shop.category === category)
              .map((shop, index) => (
                <ShopCard
                  key={shop.name}
                  name={shop.name}
                  cuisine={shop.cuisine}
                  rating={shop.rating}
                  imageUrl={`https://picsum.photos/400/250?random=${category}${index}`}
                  deliveryTime={shop.deliveryTime}
                  data-ai-hint={shop['data-ai-hint']}
                  address={shop.address}
                />
              ))}
          </div>
        </div>
      ))}
    </section>
  );
}
