export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-br from-warm-50 via-warm-100 to-warm-200 p-4">
      <section className="bg-warm-50/95 rounded-xl shadow p-8 max-w-4xl w-full border border-warm-200">
        <h1 className="text-4xl font-serif font-bold mb-6 text-brown-800 text-center">About Wander Movement</h1>
        
        <div className="max-w-none font-serif">
          <h2 className="text-2xl font-serif font-bold mb-4 text-brown-800">About Wander Movement:</h2>
          <p className="mb-6" style={{ color: '#977669' }}>
            Wander Movement classes bring you Pilates through a yoga lens. We will spend our class strengthening through our cores, legs, and upper bodies using small Pilates balls and light hand weights. We will end class with a short yoga flow, stretch, and mindful breathing. You can expect to engage muscles you may not have known how to work, and leave feeling grounded and connected to yourself and community.
          </p>
          
          <h2 className="text-2xl font-serif font-bold mb-4 text-brown-800">Meet Leah:</h2>
          <p className="mb-6" style={{ color: '#977669' }}>
            Leah Wander is a professional dancer and Pilates instructor based in Columbus, Ohio. After more than 3 years of Pilates teaching experience, she brings a unique approach to movement that cultivates an environment of inclusivity, excitement, and joy.
          </p>
        </div>
      </section>
    </main>
  );
}
