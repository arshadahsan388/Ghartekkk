
export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto bg-card p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-6 font-headline text-primary">About GharTek</h1>
        <div className="prose dark:prose-invert max-w-none space-y-6">
          <p className="text-lg leading-relaxed">
            Welcome to GharTek, your one-stop solution for fast and reliable delivery services in Vehari, Pakistan. Our mission is to simplify your life by bringing everything you need right to your doorstep, whether it's your favorite meal, weekly groceries, or essential medicines.
          </p>

          <h2 className="text-2xl font-semibold mt-8">Our Story</h2>
          <p>
            GharTek was born from a simple idea: to bridge the gap between local vendors and customers in a way that is convenient, efficient, and trustworthy. We saw the need for a unified platform where people could order anything they need, from a single place, without the hassle of navigating traffic or long queues.
          </p>
            
          <h2 className="text-2xl font-semibold mt-8">What We Do</h2>
          <p>
            We are more than just a food delivery app. GharTek is a comprehensive delivery partner that handles:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Restaurant Food:</strong> Craving biryani or pizza? We partner with the best local restaurants to bring you your favorite dishes.</li>
            <li><strong>Groceries:</strong> From fresh produce to household staples, get your groceries delivered in minutes.</li>
            <li><strong>Medicines:</strong> We provide safe and timely delivery of medicines from trusted local pharmacies.</li>
            <li><strong>Custom Orders:</strong> If you need something that's not listed, just tell us what it is. Our dedicated riders will find it and deliver it to you.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8">Our Commitment</h2>
          <p>
            We are committed to providing exceptional service to the community of Vehari. We believe in supporting local businesses and creating a seamless connection between them and our valued customers. Your convenience and satisfaction are our top priorities.
          </p>
           <p className="pt-4">
            Thank you for choosing GharTek.
          </p>
        </div>
      </div>
    </div>
  );
}
