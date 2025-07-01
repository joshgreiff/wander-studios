export default function Contact() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-400 to-red-400 flex flex-col items-center p-4">
      <section className="max-w-2xl w-full bg-white/80 rounded-xl shadow-lg p-8 mt-8">
        <h2 className="text-3xl font-bold mb-4 text-orange-900">Contact Us</h2>
        <p className="mb-4 text-orange-800">Have questions or want to connect? Reach out below or follow us on social media!</p>
        <div className="mb-8">
          {/* TODO: Replace with a real contact form or use Formspree/Getform */}
          <div className="bg-orange-100 border border-orange-300 rounded p-4 text-center text-orange-700 mb-4">
            [Contact form will appear here]
          </div>
          <p className="text-orange-800">Or email us directly: <a href="mailto:hello@wanderstudios.com" className="underline text-orange-700">hello@wanderstudios.com</a></p>
        </div>
        <div className="flex gap-4 justify-center">
          <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="text-orange-700 hover:text-orange-900 font-semibold">Instagram</a>
          {/* Add more social links as needed */}
        </div>
      </section>
    </main>
  );
} 