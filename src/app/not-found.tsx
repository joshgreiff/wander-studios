import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-400 to-red-400 flex flex-col items-center justify-center p-4">
      <section className="max-w-2xl w-full bg-white/80 rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-orange-900">Page Not Found</h1>
        <p className="mb-6 text-orange-800">Sorry, the page you&apos;re looking for doesn&apos;t exist.</p>
        <Link 
          href="/" 
          className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-lg transition"
        >
          Go Home
        </Link>
      </section>
    </main>
  );
} 