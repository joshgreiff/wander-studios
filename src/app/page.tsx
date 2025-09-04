import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-warm-50 via-warm-100 to-warm-200 flex flex-col items-center justify-center p-4">
      <section className="max-w-2xl w-full text-center bg-warm-50/90 rounded-xl shadow-lg p-8 mb-8 border border-warm-200">
        <h1 className="text-4xl font-serif font-bold mb-4 text-brown-800">Wander Movement - Pilates, Yoga, Dance</h1>
        <p className="mb-4 text-lg text-brown-700 font-serif">Hello! Welcome to Wander Movement, where we offer low-cost, wellness focused Pilates drop-in classes. I&apos;m excited to welcome you to a community where you will leave feeling connected, confident, and strong.</p>
        <div className="flex justify-center mb-6">
          <Image
            src="/images/FB447B20-86DA-4C3C-B9E1-0AD284641692.jpeg"
            alt="Wander Movement instructor"
            width={400}
            height={400}
            className="rounded-lg shadow-md object-cover"
          />
        </div>
        <Link href="/book" className="inline-block bg-warm-400 hover:bg-warm-500 text-white font-serif font-semibold py-3 px-8 rounded-full transition mb-6">
          Book a Class
        </Link>
        <p className="text-brown-800 font-serif font-semibold mb-2">All levels, all budgets, all sizes. <span className="italic">Come as you are.</span></p>
      </section>

      <section className="max-w-3xl w-full bg-warm-50/95 rounded-xl shadow p-6 mb-8 flex flex-col items-center border border-warm-200">
        <h2 className="text-2xl font-serif font-bold mb-4 text-brown-800">Our Mission & Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          <div className="flex flex-col items-center">
            <span className="text-4xl mb-2">🧘‍♀️</span>
            <h3 className="font-serif font-semibold text-brown-700 mb-1">Strength</h3>
            <p className="text-brown-600 text-center text-sm font-serif">Empowering you to build physical and mental resilience through mindful movement.</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl mb-2">💌</span>
            <h3 className="font-serif font-semibold text-brown-700 mb-1">Community</h3>
            <p className="text-brown-600 text-center text-sm font-serif">Fostering a welcoming, inclusive space for all bodies, backgrounds, and abilities.</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl mb-2">🌱</span>
            <h3 className="font-serif font-semibold text-brown-700 mb-1">Growth</h3>
            <p className="text-brown-600 text-center text-sm font-serif">Supporting your journey toward a calmer, stronger, and happier you—inside and out.</p>
          </div>
        </div>
      </section>

      <section className="max-w-2xl w-full bg-warm-50/80 rounded-xl shadow p-6 mb-8 border border-warm-200">
        <h2 className="text-2xl font-serif font-bold mb-2 text-brown-800">A Letter from Leah</h2>
        <p className="mb-2 text-brown-700 font-serif">Pilates is at the core of our vision, but our mission is to offer multiple aspects of wellness to help you cultivate a mind-body connection that fosters personal growth. Yoga, meditation, nutrition, community, and collaboration are all on the horizon, but for now, all of this starts with you.</p>
        <p className="mb-2 text-brown-700 font-serif">Taking a leap of faith is scary, but the best part is discovering how much others needed you to leap. If physical results are your only goal, I urge you to dream bigger. Over crowded classes, lack of modifications, and surface-level cueing don&apos;t have to be the standard.</p>
        <p className="mb-2 text-brown-700 font-serif">I&apos;m grateful you&apos;re here, and I&apos;m grateful to begin this journey with you.</p>
        <p className="text-brown-800 font-serif font-semibold mt-4">More to come,<br/>Leah</p>
      </section>

      <section className="max-w-2xl w-full bg-warm-50/95 rounded-xl shadow p-6 mb-8 flex flex-col items-center border border-warm-200">
        <h2 className="text-xl font-serif font-bold mb-4 text-brown-800">Join Our Wellness Community</h2>
        <p className="mb-4 text-brown-700 text-center font-serif">Get class updates, wellness tips, and inspiration delivered to your inbox.</p>
        <div className="w-full max-w-md mx-auto">
          <div
            dangerouslySetInnerHTML={{ __html: `
<style type="text/css">@import url('https://assets.mlcdn.com/fonts.css?version=1750852');</style>
<style>
#mlb2-27886150 .ml-form-embedContent { display: none !important; }
#mlb2-27886150 .ml-form-successContent h4,
#mlb2-27886150 .ml-form-successContent p {
  color: #846358 !important;
  font-weight: 600;
}
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
  color: #846358 !important;
  background: #fff !important;
  border: 1.5px solid #fce7f3 !important;
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
  border-color: #ec4899 !important;
  outline: none;
}
#mlb2-27886150 input.form-control::placeholder {
  color: #846358 !important;
  opacity: 0.7;
}
#mlb2-27886150 button.primary {
  background: #ec4899 !important;
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
  background: #db2777 !important;
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
  title: "Wander Movement | Pilates, Yoga & Dance",
};
