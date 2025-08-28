import ShopCard from './ShopCard';
import { initialShops, initialCategories } from '@/lib/shops';

export default function ShopList() {
  return (
    <div className="space-y-12">
      {initialCategories.map(category => (
        <div key={category}>
          <div className="mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold font-headline">{category}</h2>
            <p className="text-muted-foreground mt-1">Find the best {category.toLowerCase()} options in town.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {initialShops
              .filter(shop => shop.category === category)
              .map((shop) => (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
