(function () {
  const $ = (id) => document.getElementById(id);
  const PRICES = { t1: 4.99, t2: 9.99, t3: 24.99 };
  const BIT_VALUE = 0.01;
  const eur = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  const num = (id) => Math.max(0, parseFloat($(id).value) || 0);

  let summary = '';
  function compute() {
    const share = parseFloat($('share').value);
    const subs = (num('t1') * PRICES.t1 + num('t2') * PRICES.t2 + num('t3') * PRICES.t3) * share;
    const bits = num('bits') * BIT_VALUE;
    const ads = (num('viewers') * num('hours') / 1000) * num('adrpm');
    const total = subs + bits + ads;
    $('r-subs').textContent = eur(subs);
    $('r-bits').textContent = eur(bits);
    $('r-ads').textContent = eur(ads);
    $('total').textContent = eur(total);
    $('r-year').textContent = eur(total * 12);
    summary = `Revenus Twitch estimés : ${eur(total)}/mois (abonnements ${eur(subs)}, bits ${eur(bits)}, pubs ${eur(ads)}) – ${eur(total * 12)}/an.`;
  }

  document.querySelectorAll('.tool input, .tool select').forEach((el) => el.addEventListener('input', compute));
  $('copy').addEventListener('click', () => window.copyText(summary, $('status')));
  compute();
})();
