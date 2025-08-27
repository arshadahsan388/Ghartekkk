import ShopCard from './ShopCard';

const shops = [
  { name: 'Al-Madina Restaurant', cuisine: 'Pakistani', rating: 4.5, deliveryTime: 40, category: 'Pakistani', 'data-ai-hint': 'biryani plate', address: 'Club Road, Vehari' },
  { name: 'Pizza N Pizza', cuisine: 'Pizza', rating: 4.2, deliveryTime: 35, category: 'Pizza', 'data-ai-hint': 'pepperoni pizza', address: 'Stadium Road, Vehari' },
  { name: 'Silver Spoon', cuisine: 'Fast Food', rating: 4.0, deliveryTime: 25, category: 'Fast Food', 'data-ai-hint': 'zinger burger', address: 'Main Bazar, Vehari' },
  { name: 'Naveed BBQ', cuisine: 'BBQ', rating: 4.6, deliveryTime: 50, category: 'BBQ', 'data-ai-hint': 'bbq platter', address: 'Sharqi Colony, Vehari' },
  { name: 'Friends Cafe', cuisine: 'Fast Food', rating: 4.1, deliveryTime: 30, category: 'Fast Food', 'data-ai-hint': 'club sandwich', address: 'Peoples Colony, Vehari' },
  { name: 'Student Biryani', cuisine: 'Pakistani', rating: 4.4, deliveryTime: 45, category: 'Pakistani', 'data-ai-hint': 'chicken biryani', address: 'College Road, Vehari' },
  { name: 'Mr. Chef', cuisine: 'Home-made', rating: 4.8, deliveryTime: 60, category: 'Home-made', 'data-ai-hint': 'home cooked meal', address: 'Muslim Town, Vehari' },
];


const categories = [...new Set(shops.map(shop => shop.category))];

export default function ShopList() {
  return (
    <section className="space-y-8">
      <div>
        <h2 className="font-headline text-2xl font-bold">Explore Restaurants</h2>
        <p className="text-muted-foreground">Find your next meal from our curated list of restaurants.</p>
      </div>

      {categories.map(category => (
        <div key={category}>
          <h3 className="font-headline text-xl font-semibold mb-4">{category}</h3>
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
