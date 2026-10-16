(() => {
  'use strict';
  function init() {
    const layout = document.getElementById('disclosure-layout');
    const content = document.getElementById('disclosure-content');
    const back = document.getElementById('disclosure-back');
    if (!layout || !content || !back) return;
    const buttons = [...layout.querySelectorAll('.disclosure-menu-button')];
    const panels = [...content.querySelectorAll('.disclosure-panel')];
    const mobile = window.matchMedia('(max-width: 600px)');
    let active = null;
    function render() {
      // Return panels to their common container before arranging the new view.
      panels.forEach(panel => {
        content.append(panel);
        panel.hidden = true;
        panel.classList.remove('is-active');
      });
      buttons.forEach(button => {
        const selected = button === active;
        button.classList.toggle('is-active', selected);
        button.setAttribute('aria-expanded', String(selected));
        if (selected) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
      });
      layout.classList.toggle('is-open', Boolean(active));
      layout.classList.toggle('is-mobile-accordion', mobile.matches);
      back.hidden = mobile.matches || !active;
      content.hidden = mobile.matches || !active;
      if (!active) return;
      const panel = panels.find(p => p.id === active.getAttribute('aria-controls'));
      if (!panel) return;
      if (mobile.matches) active.closest('.disclosure-menu-item').append(panel);
      panel.hidden = false;
      panel.classList.add('is-active');
    }
    buttons.forEach(button => button.addEventListener('click', () => {
      const panel = panels.find(p => p.id === button.getAttribute('aria-controls'));
      if (!panel) return;
      active = mobile.matches && active === button ? null : button;
      render();
      // On phones the button keeps keyboard focus, like a native accordion.
      if (active && !mobile.matches) {
        const heading = panel.querySelector('.disclosure-panel-title');
        if (heading) heading.focus({preventScroll: true});
      }
    }));
    back.addEventListener('click', () => {
      const previous = active;
      active = null;
      render();
      previous?.focus({preventScroll: true});
    });
    if (mobile.addEventListener) mobile.addEventListener('change', render);
    else mobile.addListener(render);
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
