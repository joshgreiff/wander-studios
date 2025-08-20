import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 flex flex-col items-center justify-center p-4">
      <section className="max-w-2xl w-full bg-pink-50/95 rounded-xl shadow-lg p-8 text-center border border-pink-200">
        <h1 className="text-4xl font-serif font-bold mb-4 text-brown-800">Page Not Found</h1>
        <p className="mb-6 text-brown-700 font-serif">Sorry, the page you&apos;re looking for doesn&apos;t exist.</p>
        <Link 
          href="/" 
          className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-serif font-semibold py-3 px-8 rounded-lg transition"
        >
          Go Home
        </Link>
      </section>
    </main>
  );
} 