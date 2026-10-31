(function () {
  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function inline(s) {
    return esc(s)
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, t, u) {
        return /^(https?:|mailto:|#)/.test(u) ? '<a href="' + u + '">' + t + '</a>' : t;
      })
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  }
  function block(lines) {
    var html = '', list = [], para = [];
    function flush() {
      if (list.length) { html += '<ul>' + list.map(function (l) { return '<li>' + inline(l) + '</li>'; }).join('') + '</ul>'; list = []; }
      if (para.length) { html += '<p>' + inline(para.join(' ')) + '</p>'; para = []; }
    }
    lines.forEach(function (line) {
      var yt = line.match(/^@youtube\[([\w-]+)\]$/);
      if (yt) { flush(); html += '<div class="video"><iframe src="https://www.youtube.com/embed/' + yt[1] + '" title="Angus Canoe Club video" allowfullscreen loading="lazy"></iframe></div>'; }
      else if (/^[-*] /.test(line)) { if (para.length) flush(); list.push(line.slice(2)); }
      else if (/^!\[[^\]]*\]\([^)]+\)$/.test(line.trim())) { flush(); html += '<span class="img">' + inline(line.trim()) + '</span>'; }
      else if (!line.trim()) flush();
      else { if (list.length) flush(); para.push(line.trim()); }
    });
    flush();
    return html;
  }
  function render(md) {
    var out = '';
    md.split(/^## /m).slice(1).forEach(function (sec) {
      var lines = sec.split('\n'), title = lines.shift().trim(), id = title.toLowerCase().replace(/\W+/g, '-');
      var body = block(lines);
      if (id === 'gallery') body = '<div class="gallery">' + body.replace(/<span class="img">|<\/span>/g, '') + '</div>';
      out += '<section id="' + id + '"><h2>' + esc(title) + '</h2>' + body + '</section>';
    });
    return out;
  }
  fetch('content.md').then(function (r) { return r.text(); }).then(function (md) {
    document.getElementById('content').innerHTML = render(md);
  }).catch(function () {
    document.getElementById('content').textContent = 'Sorry, the content could not be loaded.';
  });
})();
