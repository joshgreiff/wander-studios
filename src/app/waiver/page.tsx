export default function Waiver() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-400 to-red-400 flex flex-col items-center p-4">
      <section className="max-w-2xl w-full bg-white/80 rounded-xl shadow-lg p-8 mt-8">
        <h2 className="text-3xl font-bold mb-4 text-orange-900">Digital Liability Waiver</h2>
        <p className="mb-4 text-orange-800">Before attending your first class, please complete our digital liability waiver. This helps us keep everyone safe and informed.</p>
        <div className="mb-8">
          {/* TODO: Embed Jotform or other digital waiver form here */}
          <div className="bg-orange-100 border border-orange-300 rounded p-4 text-center text-orange-700">
            [Digital waiver form will appear here]
          </div>
        </div>
        <p className="text-orange-700 text-sm">You only need to sign the waiver once before your first class.</p>
      </section>
    </main>
  );
} 