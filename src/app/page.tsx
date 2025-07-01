import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-400 to-red-400 flex flex-col items-center justify-center p-4">
      <section className="max-w-2xl w-full text-center bg-white/80 rounded-xl shadow-lg p-8 mb-8">
        <h1 className="text-4xl font-bold mb-4 text-orange-900">Wander Studios - A Wellness Space</h1>
        <p className="mb-4 text-lg text-orange-800">Hello! I'm so happy you are here.<br/>Whether you are a friend, current student, or someone I've never met, I'm so excited to welcome you to a space where you can leave feeling better than you started.</p>
        <div className="flex justify-center mb-6">
          <Image src="/images/hero1.jpg" alt="Wander Studios instructor" width={400} height={400} className="rounded-lg shadow-md object-cover" />
        </div>
        <a href="/book" className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-full transition mb-6">Book a Class</a>
        <p className="text-orange-900 font-semibold mb-2">All levels, all budgets, all locations, all sizes. <span className="italic">Come as you are.</span></p>
      </section>
      <section className="max-w-2xl w-full bg-white/70 rounded-xl shadow p-6 mb-8">
        <h2 className="text-2xl font-bold mb-2 text-orange-900">A Letter from Leah</h2>
        <p className="mb-2 text-orange-800">Pilates is at the core of our vision, but our mission is to offer multiple aspects of wellness to help you cultivate a mind-body connection that fosters personal growth. Yoga, meditation, nutrition, community, and collaboration are all on the horizon, but for now, all of this starts with you.</p>
        <p className="mb-2 text-orange-800">Taking a leap of faith is scary, but the best part is discovering how much others needed you to leap. If physical results are your only goal, I urge you to dream bigger. Over crowded classes, lack of modifications, and surface-level cueing don't have to be the standard.</p>
        <p className="mb-2 text-orange-800">We'll begin with virtual classes, with in-person offerings coming soon. Everything you need to sign up for future classes will be included here.</p>
        <p className="mb-2 text-orange-800">I'm grateful you're here, and I'm grateful to begin this journey with you.</p>
        <p className="text-orange-900 font-semibold mt-4">More to come,<br/>Leah</p>
      </section>
    </main>
  );
}
