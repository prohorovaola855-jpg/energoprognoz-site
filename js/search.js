(() => {
  function init() {
    const triggers = document.querySelectorAll('.search-button');
    if (!triggers.length) return;
    const dialog = document.createElement('dialog');
    dialog.className = 'site-search';
    dialog.setAttribute('aria-labelledby','site-search-title');
    dialog.innerHTML = '<div class="site-search-top"><h2 id="site-search-title">Поиск по сайту</h2><button class="site-search-close" type="button" aria-label="Закрыть поиск">×</button></div><form class="site-search-form"><label for="site-search-query">Что вы хотите найти?</label><div class="site-search-controls"><input id="site-search-query" type="search" required placeholder="Например, документы"><button type="submit">Найти</button></div></form><p class="site-search-status" role="status"></p><ul class="site-search-results"></ul>';
    document.body.append(dialog);
    const input = dialog.querySelector('input');
    const status = dialog.querySelector('.site-search-status');
    const results = dialog.querySelector('.site-search-results');
    let opener, indexPromise;
    const normalize = s => s.toLocaleLowerCase('ru').replaceAll('ё','е');
    triggers.forEach(button => button.addEventListener('click', () => {
      opener=button;dialog.showModal();input.focus();
    }));
    dialog.querySelector('.site-search-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('close',()=>opener?.focus());
    dialog.querySelector('form').addEventListener('submit', async event => {
      event.preventDefault();results.replaceChildren();status.textContent='Ищем…';
      try {
        indexPromise ||= fetch('js/search-index.json?v=20261016-mobile3').then(r=>{if(!r.ok)throw Error();return r.json();});
        const entries=await indexPromise;
        const terms=normalize(input.value.trim()).split(/\s+/).filter(Boolean);
        const matches=terms.length ? entries.filter(e=>terms.every(t=>normalize(e.title+' '+e.text).includes(t))) : [];
        matches.forEach(entry=>{
          const li=document.createElement('li'), a=document.createElement('a');
          a.href=entry.url;a.textContent=entry.title;li.append(a);results.append(li);
        });
        status.textContent=matches.length ? `Найдено страниц: ${matches.length}` : 'Ничего не найдено. Попробуйте другое слово.';
      } catch {indexPromise=null;status.textContent='Не удалось загрузить поиск. Попробуйте ещё раз.';}
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
