export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-br from-warm-50 via-warm-100 to-warm-200 p-4">
      <section className="bg-warm-50/95 rounded-xl shadow p-8 max-w-4xl w-full border border-warm-200">
        <h1 className="text-4xl font-serif font-bold mb-6 text-brown-800 text-center">About Wander Movement</h1>
        
        <div className="prose prose-lg max-w-none text-brown-700 font-serif">
          <p className="mb-6">
            Welcome to Wander Movement, where we believe that movement is medicine for the mind, body, and soul. 
            Our mission is to create a welcoming, inclusive space where everyone can explore the transformative 
            power of mindful movement.
          </p>
          
          <h2 className="text-2xl font-serif font-bold mb-4 text-brown-800">Our Philosophy</h2>
          <p className="mb-6">
            At Wander Movement, we embrace the philosophy that every body is unique and every journey is personal. 
            We don&apos;t believe in one-size-fits-all approaches. Instead, we celebrate individuality and create 
            experiences that honor your unique needs, abilities, and goals.
          </p>
          
          <h2 className="text-2xl font-serif font-bold mb-4 text-brown-800">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <h3 className="text-xl font-serif font-semibold mb-2 text-brown-800">Pilates</h3>
              <p className="text-brown-600">Core strength, flexibility, and mindful movement for all levels.</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-serif font-semibold mb-2 text-brown-800">Yoga</h3>
              <p className="text-brown-600">Balance, mindfulness, and inner peace through movement and breath.</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-serif font-semibold mb-2 text-brown-800">Dance</h3>
              <p className="text-brown-600">Joyful expression and creative movement for the soul.</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-serif font-bold mb-4 text-brown-800">Our Community</h2>
          <p className="mb-6">
            We&apos;re more than just a movement studio—we&apos;re a community of individuals supporting each other 
            on their wellness journeys. Whether you&apos;re a beginner or an experienced practitioner, 
            you&apos;ll find a warm, supportive environment where you can grow, learn, and thrive.
          </p>
          
          <h2 className="text-2xl font-serif font-bold mb-4 text-brown-800">Meet Leah</h2>
          <p className="mb-6">
            Leah, the heart and soul behind Wander Movement, brings years of experience and a deep passion 
            for helping others discover the transformative power of movement. Her approach is grounded in 
            compassion, expertise, and a genuine desire to see every individual flourish.
          </p>
          
          <p className="text-brown-800 font-serif font-semibold">
            Ready to begin your journey? We can&apos;t wait to welcome you to our community.
          </p>
        </div>
      </section>


    </main>
  );
} 