import ShopRecommendations from '@/components/recommendations/ShopRecommendations';
import ShopList from '@/components/shops/ShopList';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-12">
        <ShopRecommendations />
        <ShopList />
      </div>
    </div>
  );
}
