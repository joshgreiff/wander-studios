import React from 'react';

export default function Newsletter() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 flex flex-col items-center justify-center p-4">
      <section className="max-w-2xl w-full bg-pink-50/95 rounded-xl shadow p-6 flex flex-col items-center border border-pink-200">
        <h1 className="text-3xl font-serif font-bold mb-4 text-brown-800 text-center">Join Our Wellness Community</h1>
        <p className="mb-4 text-brown-700 text-center text-lg font-serif">Get class updates, wellness tips, and inspiration delivered to your inbox. No spam, just good vibes!</p>
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