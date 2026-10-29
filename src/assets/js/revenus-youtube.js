(function () {
  const $ = (id) => document.getElementById(id);
  const eur = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(n);
  const eur0 = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  const num = (id) => Math.max(0, parseFloat($(id).value) || 0);

  let summary = '';
  function compute() {
    const views = num('views');
    const rpm = num('rpm');
    const videos = num('videos');
    const total = views / 1000 * rpm;
    $('total').textContent = eur0(total);
    $('range').textContent = `${eur0(total * 0.6)} – ${eur0(total * 1.4)}`;
    $('year').textContent = eur0(total * 12);
    $('pervideo').textContent = videos > 0 ? eur(total / videos) : '–';
    $('per1000').textContent = eur(rpm);
    summary = `Revenus YouTube estimés : ${eur0(total)}/mois pour ${views.toLocaleString('fr-FR')} vues (RPM ${eur(rpm)}) – ${eur0(total * 12)}/an.`;
  }

  document.querySelectorAll('.tool input').forEach((el) => el.addEventListener('input', compute));
  $('copy').addEventListener('click', () => window.copyText(summary, $('status')));
  compute();
})();
