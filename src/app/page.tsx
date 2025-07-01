import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-400 to-red-400 flex flex-col items-center justify-center p-4">
      <section className="max-w-2xl w-full text-center bg-white/80 rounded-xl shadow-lg p-8 mb-8">
        <h1 className="text-4xl font-bold mb-4 text-orange-900">Wander Studios - A Wellness Space</h1>
        <p className="mb-4 text-lg text-orange-800">Hello! I&apos;m so happy you are here.<br/>Whether you are a friend, current student, or someone I&apos;ve never met, I&apos;m so excited to welcome you to a space where you can leave feeling better than you started.</p>
        <div className="flex justify-center mb-6">
          <Image src="/images/IMG_8658.JPG" alt="Wander Studios instructor" width={400} height={400} className="rounded-lg shadow-md object-cover" />
        </div>
        <a href="/book" className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-full transition mb-6">Book a Class</a>
        <p className="text-orange-900 font-semibold mb-2">All levels, all budgets, all locations, all sizes. <span className="italic">Come as you are.</span></p>
      </section>
      <section className="max-w-3xl w-full bg-white/90 rounded-xl shadow p-6 mb-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-orange-900">Our Mission & Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          <div className="flex flex-col items-center">
            <span className="text-4xl mb-2">💪</span>
            <h3 className="font-semibold text-orange-800 mb-1">Strength</h3>
            <p className="text-orange-700 text-center text-sm">Empowering you to build physical and mental resilience through mindful movement.</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl mb-2">🤝</span>
            <h3 className="font-semibold text-orange-800 mb-1">Community</h3>
            <p className="text-orange-700 text-center text-sm">Fostering a welcoming, inclusive space for all bodies, backgrounds, and abilities.</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl mb-2">🌱</span>
            <h3 className="font-semibold text-orange-800 mb-1">Growth</h3>
            <p className="text-orange-700 text-center text-sm">Supporting your journey toward a calmer, stronger, and happier you—inside and out.</p>
          </div>
        </div>
      </section>
      <section className="max-w-2xl w-full bg-white/80 rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-orange-900">Gallery</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Image src="/images/IMG_8658.JPG" alt="Gallery 1" width={400} height={400} className="rounded-lg object-cover" />
          <Image src="/images/IMG_8659.JPG" alt="Gallery 2" width={400} height={400} className="rounded-lg object-cover" />
          <Image src="/images/Screenshot 2025-06-30 at 4.49.31 PM.JPEG" alt="Gallery 3" width={400} height={400} className="rounded-lg object-cover" />
          <Image src="/images/Screenshot 2025-06-30 at 4.49.53 PM.JPEG" alt="Gallery 4" width={400} height={400} className="rounded-lg object-cover" />
        </div>
      </section>
      <section className="max-w-3xl w-full bg-white/90 rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-orange-900">What Our Students Say</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-orange-100 border-l-4 border-orange-400 rounded p-4 shadow">
            <p className="italic text-orange-800 mb-2">"Wander Studios classes are the highlight of my week. I feel stronger and more connected to my body!"</p>
            <p className="text-orange-700 font-semibold">– Jamie</p>
          </div>
          <div className="bg-orange-100 border-l-4 border-orange-400 rounded p-4 shadow">
            <p className="italic text-orange-800 mb-2">"Leah's approach is so welcoming and inclusive. I never feel out of place, no matter my experience level."</p>
            <p className="text-orange-700 font-semibold">– Taylor</p>
          </div>
        </div>
      </section>
      <section className="max-w-2xl w-full bg-white/70 rounded-xl shadow p-6 mb-8">
        <h2 className="text-2xl font-bold mb-2 text-orange-900">A Letter from Leah</h2>
        <p className="mb-2 text-orange-800">Pilates is at the core of our vision, but our mission is to offer multiple aspects of wellness to help you cultivate a mind-body connection that fosters personal growth. Yoga, meditation, nutrition, community, and collaboration are all on the horizon, but for now, all of this starts with you.</p>
        <p className="mb-2 text-orange-800">Taking a leap of faith is scary, but the best part is discovering how much others needed you to leap. If physical results are your only goal, I urge you to dream bigger. Over crowded classes, lack of modifications, and surface-level cueing don&apos;t have to be the standard.</p>
        <p className="mb-2 text-orange-800">We&apos;ll begin with virtual classes, with in-person offerings coming soon. Everything you need to sign up for future classes will be included here.</p>
        <p className="mb-2 text-orange-800">I&apos;m grateful you&apos;re here, and I&apos;m grateful to begin this journey with you.</p>
        <p className="text-orange-900 font-semibold mt-4">More to come,<br/>Leah</p>
      </section>
      <section className="max-w-2xl w-full bg-white/90 rounded-xl shadow p-6 mb-8 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4 text-orange-900">Join Our Wellness Community</h2>
        <p className="mb-4 text-orange-800 text-center">Get class updates, wellness tips, and inspiration delivered to your inbox. No spam, just good vibes!</p>
        <form className="w-full flex flex-col sm:flex-row gap-2 justify-center">
          <input type="email" placeholder="Your email address" className="flex-1 px-4 py-2 rounded border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400" disabled />
          <button className="bg-orange-600 text-white font-semibold px-6 py-2 rounded hover:bg-orange-700 transition" disabled>Sign Up</button>
        </form>
        <p className="text-orange-700 text-xs mt-2">(Newsletter sign-up coming soon!)</p>
      </section>
    </main>
  );
}

export const metadata = {
  title: "Wander Studios | Pilates, Yoga & Wellness",
};
