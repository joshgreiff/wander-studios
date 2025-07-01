export default function Book() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-400 to-red-400 flex flex-col items-center p-4">
      <section className="max-w-2xl w-full bg-white/80 rounded-xl shadow-lg p-8 mt-8">
        <h2 className="text-3xl font-bold mb-4 text-orange-900">Book a Class</h2>
        <p className="mb-4 text-orange-800">Reserve your spot for an upcoming Pilates or yoga class. Payment is handled securely through our booking partner below.</p>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-orange-900 mb-2">Class Descriptions</h3>
          <ul className="list-disc list-inside text-orange-800">
            <li><strong>Pilates Flow:</strong> All levels, focused on strength and mobility.</li>
            <li><strong>Yoga for Resilience:</strong> Gentle, grounding, and restorative.</li>
            <li><strong>Community Movement:</strong> A blend of Pilates, yoga, and mindful movement for everyone.</li>
          </ul>
        </div>
        <div className="mb-8">
          {/* TODO: Embed Square/Calendly/Jotform scheduler here */}
          <div className="bg-orange-100 border border-orange-300 rounded p-4 text-center text-orange-700">
            [Booking scheduler will appear here]
          </div>
        </div>
        <p className="text-orange-700 text-sm">Payment is required at the time of booking.</p>
      </section>
    </main>
  );
} 