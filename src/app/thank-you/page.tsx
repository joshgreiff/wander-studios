export default function ThankYou() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-400 to-red-400 flex flex-col items-center p-4">
      <section className="max-w-2xl w-full bg-white/80 rounded-xl shadow-lg p-8 mt-8 text-center">
        <h2 className="text-3xl font-bold mb-4 text-orange-900">Thank You for Booking!</h2>
        <p className="mb-4 text-orange-800">Your spot is confirmed. We can&apos;t wait to move with you!</p>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-orange-900 mb-2">What to Bring</h3>
          <ul className="list-disc list-inside text-orange-800 text-left inline-block">
            <li>Comfortable clothes</li>
            <li>Yoga mat (if you have one)</li>
            <li>Water bottle</li>
            <li>Open mind and positive energy!</li>
          </ul>
        </div>
        <div className="mb-8">
          {/* TODO: Insert Zoom link or access details here */}
          <div className="bg-orange-100 border border-orange-300 rounded p-4 text-center text-orange-700">
            [Zoom link or class access details will appear here]
          </div>
        </div>
        <p className="text-orange-700 text-sm">Check your email for confirmation and further details.</p>
      </section>
    </main>
  );
} 