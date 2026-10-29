(function () {
  const $ = (id) => document.getElementById(id);
  const LIMITS = [
    ['Post sur X', 280],
    ['Instagram – bio', 150],
    ['Instagram – légende', 2200],
    ['TikTok – bio', 80],
    ['TikTok – légende', 2200],
    ['YouTube – titre', 100],
    ['YouTube – description', 5000],
    ['Twitch – titre du live', 140],
    ['Twitch – bio', 300],
  ];

  LIMITS.forEach(([label, max], i) => {
    const o = document.createElement('option');
    o.value = i;
    o.textContent = `${label} (${max})`;
    $('type').appendChild(o);
  });

  const seg = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('fr', { granularity: 'grapheme' }) : null;
  const length = (s) => (seg ? [...seg.segment(s)].length : [...s].length);

  function update() {
    const text = $('text').value;
    const max = LIMITS[$('type').value][1];
    const n = length(text);
    $('count').textContent = `${n} / ${max}`;
    $('count').style.color = n > max ? '#d6336c' : '';
    $('left').textContent = max - n;
    $('words').textContent = (text.trim().match(/\S+/g) || []).length;
    $('lines').textContent = text ? text.split('\n').length : 0;
  }

  $('text').addEventListener('input', update);
  $('type').addEventListener('change', update);
  $('copy').addEventListener('click', () => window.copyText($('text').value, $('status')));
  $('clear').addEventListener('click', () => { $('text').value = ''; update(); $('text').focus(); });
  update();
})();
