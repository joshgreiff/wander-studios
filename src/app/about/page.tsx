import Image from 'next/image';

export default function About() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-400 to-red-400 flex flex-col items-center p-4">
      <section className="max-w-3xl w-full bg-white/80 rounded-xl shadow-lg p-8 mt-8">
        <h2 className="text-3xl font-bold mb-4 text-orange-900">About Wander Movement</h2>
        <p className="mb-4 text-orange-800">Wander Movement is a wellness community focused on strength, resilience, and joy in movement. We will offer mat Pilates, Pilates & yoga fusion, and deep stretch classes, with more to come in the future. Our mission is to help you feel empowered, connected, and strong.</p>
      </section>
    </main>
  );
} 