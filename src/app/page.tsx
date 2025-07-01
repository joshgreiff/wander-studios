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
            <p className="italic text-orange-800 mb-2">&quot;Wander Studios classes are the highlight of my week. I feel stronger and more connected to my body!&quot;</p>
            <p className="text-orange-700 font-semibold">– Jamie</p>
          </div>
          <div className="bg-orange-100 border-l-4 border-orange-400 rounded p-4 shadow">
            <p className="italic text-orange-800 mb-2">&quot;Leah&apos;s approach is so welcoming and inclusive. I never feel out of place, no matter my experience level.&quot;</p>
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
        <div className="w-full max-w-md mx-auto">
          <div
            dangerouslySetInnerHTML={{ __html: `
<style type="text/css">@import url('https://assets.mlcdn.com/fonts.css?version=1750852');</style>
<style>
#mlb2-27886150 .ml-form-embedContent { display: none !important; }
#mlb2-27886150 .ml-form-embedBody .ml-block-form {
  display: flex;
  flex-direction: row;
  gap: 0.75rem;
  margin-top: 1rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}
#mlb2-27886150 .ml-form-embedBody .ml-form-fieldRow.inputs-row {
  display: flex;
  flex-direction: row;
  gap: 0.75rem;
  flex: 1 1 0%;
  margin: 0;
  min-width: 320px;
}
#mlb2-27886150 .ml-form-embedBody .ml-form-fieldRow:not(.inputs-row) {
  flex: 1 1 0%;
  margin: 0;
}
#mlb2-27886150 input.form-control {
  color: #b45309 !important;
  background: #fff !important;
  border: 1.5px solid #e5e7eb !important;
  border-radius: 0.5rem !important;
  padding: 0.75rem 1rem !important;
  font-size: 1rem !important;
  font-weight: 500;
  width: 100% !important;
  box-sizing: border-box;
  height: 48px;
  transition: border 0.2s;
}
#mlb2-27886150 input.form-control:focus {
  border-color: #f59e42 !important;
  outline: none;
}
#mlb2-27886150 input.form-control::placeholder {
  color: #b45309 !important;
  opacity: 0.7;
}
#mlb2-27886150 button.primary {
  background: #ea580c !important;
  color: #fff !important;
  font-weight: 700;
  border: none !important;
  border-radius: 0.5rem !important;
  padding: 0 2rem !important;
  font-size: 1rem !important;
  height: 48px;
  min-width: 120px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px 0 rgb(16 24 40 / 5%);
}
#mlb2-27886150 button.primary:hover {
  background: #c2410c !important;
}
#mlb2-27886150 button.loading { display: none !important; }
@media (max-width: 700px) {
  #mlb2-27886150 .ml-form-embedBody .ml-block-form {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
  #mlb2-27886150 .ml-form-embedBody .ml-form-fieldRow.inputs-row {
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
  }
  #mlb2-27886150 button.primary, #mlb2-27886150 input.form-control {
    width: 100% !important;
    min-width: 0;
  }
}
</style>
<div id="mlb2-27886150" class="ml-form-embedContainer ml-subscribe-form ml-subscribe-form-27886150">
  <div class="ml-form-align-center ">
    <div class="ml-form-embedWrapper embedForm">
      <div class="ml-form-embedBody ml-form-embedBodyDefault row-form">
        <form class="ml-block-form" action="https://assets.mailerlite.com/jsonp/1627697/forms/158745988459136353/subscribe" data-code="" method="post" target="_blank">
          <div class="ml-form-formContent">
            <div class="ml-form-fieldRow inputs-row">
              <div class="ml-field-group ml-field-email ml-validate-email ml-validate-required" style="flex:1;">
                <input aria-label="email" aria-required="true" type="email" class="form-control" data-inputmask="" name="fields[email]" placeholder="Email" autocomplete="email">
              </div>
              <div class="ml-field-group ml-field-name ml-validate-required" style="flex:1;">
                <input aria-label="name" aria-required="true" type="text" class="form-control" data-inputmask="" name="fields[name]" placeholder="Name" autocomplete="given-name">
              </div>
            </div>
          </div>
          <input type="hidden" name="ml-submit" value="1">
          <div class="ml-form-embedSubmit">
            <button type="submit" class="primary">Subscribe</button>
            <button disabled="disabled" style="display: none;" type="button" class="loading">
              <div class="ml-form-embedSubmitLoad"></div>
              <span class="sr-only">Loading...</span>
            </button>
          </div>
          <input type="hidden" name="anticsrf" value="true">
        </form>
      </div>
      <div class="ml-form-successBody row-success" style="display: none">
        <div class="ml-form-successContent">
          <h4>Thank you!</h4>
          <p>You have successfully joined our subscriber list.</p>
        </div>
      </div>
    </div>
  </div>
</div>
<script>function ml_webform_success_27886150() { var $ = ml_jQuery || jQuery; $('.ml-subscribe-form-27886150 .row-success').show(); $('.ml-subscribe-form-27886150 .row-form').hide(); }</script>
<script src="https://groot.mailerlite.com/js/w/webforms.min.js?v176e10baa5e7ed80d35ae235be3d5024" type="text/javascript"></script>
<script>fetch("https://assets.mailerlite.com/jsonp/1627697/forms/158745988459136353/takel")</script>
` }}
          />
    </div>
      </section>
    </main>
  );
}

export const metadata = {
  title: "Wander Studios | Pilates, Yoga & Wellness",
};
