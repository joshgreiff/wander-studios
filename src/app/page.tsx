import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-warm-50 via-warm-100 to-warm-200 flex flex-col items-center justify-center p-4">
      <section className="max-w-2xl w-full text-center bg-warm-50/90 rounded-xl shadow-lg p-8 mb-8 border border-warm-200">
        <h1 className="text-4xl font-serif font-bold mb-4 text-brown-800">Wander Movement - Pilates, Yoga, Dance</h1>
        <p className="mb-4 text-lg text-brown-700 font-serif">Hello! I&apos;m so happy you are here. Whether you are a friend, or current/future client, I&apos;m excited to welcome you to a wellness space that will leave you feeling better than you started.</p>
        <div className="flex justify-center mb-6">
          <Image
            src="/images/IMG_8658.JPG"
            alt="Wander Movement instructor"
            width={400}
            height={400}
            className="rounded-lg shadow-md object-cover"
          />
        </div>
        <Link href="/book" className="inline-block bg-warm-400 hover:bg-warm-500 text-white font-serif font-semibold py-3 px-8 rounded-full transition mb-6">
          Book a Class
        </Link>
        <p className="text-brown-800 font-serif font-semibold mb-2">All levels, all budgets, all sizes. <span className="italic">Come as you are.</span></p>
      </section>

      <section className="max-w-3xl w-full bg-warm-50/95 rounded-xl shadow p-6 mb-8 flex flex-col items-center border border-warm-200">
        <h2 className="text-2xl font-serif font-bold mb-4 text-brown-800">Our Mission & Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          <div className="flex flex-col items-center">
            <span className="text-4xl mb-2">🧘‍♀️</span>
            <h3 className="font-serif font-semibold text-brown-700 mb-1">Strength</h3>
            <p className="text-brown-600 text-center text-sm font-serif">Empowering you to build physical and mental resilience through mindful movement.</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl mb-2">💌</span>
            <h3 className="font-serif font-semibold text-brown-700 mb-1">Community</h3>
            <p className="text-brown-600 text-center text-sm font-serif">Fostering a welcoming, inclusive space for all bodies, backgrounds, and abilities.</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl mb-2">🌱</span>
            <h3 className="font-serif font-semibold text-brown-700 mb-1">Growth</h3>
            <p className="text-brown-600 text-center text-sm font-serif">Supporting your journey toward a calmer, stronger, and happier you—inside and out.</p>
          </div>
        </div>
      </section>

      <section className="max-w-2xl w-full bg-warm-50/80 rounded-xl shadow p-6 mb-8 border border-warm-200">
        <h2 className="text-2xl font-serif font-bold mb-2 text-brown-800">A Letter from Leah</h2>
        <p className="mb-2 text-brown-700 font-serif">Pilates is at the core of our vision, but our mission is to offer multiple aspects of wellness to help you cultivate a mind-body connection that fosters personal growth. Yoga, meditation, nutrition, community, and collaboration are all on the horizon, but for now, all of this starts with you.</p>
        <p className="mb-2 text-brown-700 font-serif">Taking a leap of faith is scary, but the best part is discovering how much others needed you to leap. If physical results are your only goal, I urge you to dream bigger. Over crowded classes, lack of modifications, and surface-level cueing don&apos;t have to be the standard.</p>
        <p className="mb-2 text-brown-700 font-serif">I&apos;m grateful you&apos;re here, and I&apos;m grateful to begin this journey with you.</p>
        <p className="text-brown-800 font-serif font-semibold mt-4">More to come,<br/>Leah</p>
      </section>

      <section className="max-w-2xl w-full bg-warm-50/95 rounded-xl shadow p-6 mb-8 flex flex-col items-center border border-warm-200">
        <h2 className="text-xl font-serif font-bold mb-4 text-brown-800">Join Our Wellness Community</h2>
        <p className="mb-4 text-brown-700 text-center font-serif">Get class updates, wellness tips, and inspiration delivered to your inbox.</p>
        <div className="w-full max-w-md mx-auto">
          <div
            className="ml-form-embed"
            data-account="2788615:l9z9y8p3v8"
            data-form="2788615:l9z9y8p3v8"
            style={{
              backgroundColor: 'transparent',
              color: '#43302b',
              fontFamily: 'Georgia, Times New Roman, serif'
            }}
          ></div>
        </div>
      </section>
    </main>
  );
}

export const metadata = {
  title: "Wander Movement | Pilates, Yoga & Dance",
};
