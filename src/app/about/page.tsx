import Image from 'next/image';

export default function About() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-400 to-red-400 flex flex-col items-center p-4">
      <section className="max-w-3xl w-full bg-white/80 rounded-xl shadow-lg p-8 mt-8">
        <h2 className="text-3xl font-bold mb-4 text-orange-900">About Wander Studios</h2>
        <p className="mb-4 text-orange-800">Wander Studios is a wellness community focused on strength, resilience, and joy in movement. We offer Pilates and yoga classes for all bodies, free from diet culture. Our mission is to help you feel empowered, connected, and strong—wherever you are on your journey.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <Image src="/images/about1.jpg" alt="Instructor 1" width={400} height={400} className="rounded-lg object-cover" />
          <Image src="/images/about2.jpg" alt="Instructor 2" width={400} height={400} className="rounded-lg object-cover" />
          <Image src="/images/about3.jpg" alt="Instructor 3" width={400} height={400} className="rounded-lg object-cover" />
          <Image src="/images/about4.jpg" alt="Instructor 4" width={400} height={400} className="rounded-lg object-cover" />
        </div>
      </section>
    </main>
  );
} 