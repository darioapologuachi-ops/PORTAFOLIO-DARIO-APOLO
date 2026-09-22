/* Static, curated project data. No third-party tracking or remote requests. */
(() => {
  'use strict';
  const projects = window.PORTFOLIO_PROJECTS || [];
  const dialog = document.getElementById('projectModal');
  const search = document.getElementById('projectSearch');
  let activeProject = null;
  let imageIndex = 0;
  let activeFilter = 'all';
  let lastTrigger = null;
  const text = (id, value) => { document.getElementById(id).textContent = value; };
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  function filterProjects() {
    const query = normalize(search.value.trim());
    let visible = 0;
    document.querySelectorAll('.project-card').forEach(card => {
      const match = (activeFilter === 'all' || card.dataset.category === activeFilter) && normalize(card.dataset.search).includes(query);
      card.hidden = !match;
      if (match) visible++;
    });
    document.getElementById('noResults').hidden = visible !== 0;
    text('resultCount', `${visible} ${visible === 1 ? 'proyecto' : 'proyectos'}`);
  }
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    filterProjects();
  }));
  search.addEventListener('input', filterProjects);
  document.getElementById('resetFilters').addEventListener('click', () => {
    search.value = '';
    document.querySelector('[data-filter="all"]').click();
    search.focus();
  });

  function renderImage() {
    if (!activeProject) return;
    const image = activeProject.gallery[imageIndex];
    const target = document.getElementById('modalImage');
    target.src = image.src;
    target.alt = `${activeProject.title}. ${image.caption}`;
    text('imageCaption', image.caption);
    text('imageCounter', `${imageIndex + 1} / ${activeProject.gallery.length}`);
    const container = document.getElementById('thumbnails');
    container.replaceChildren();
    activeProject.gallery.forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `Ver imagen ${index + 1}: ${item.caption}`);
      button.setAttribute('aria-pressed', String(index === imageIndex));
      const thumbnail = document.createElement('img');
      thumbnail.src = item.thumb;
      thumbnail.alt = '';
      button.append(thumbnail);
      button.addEventListener('click', () => { imageIndex = index; renderImage(); document.querySelectorAll('#thumbnails button')[index].focus({preventScroll:true}); });
      container.append(button);
    });
  }
  function openProject(id) {
    const project = projects.find(item => item.id === id);
    if (!project) return;
    activeProject = project;
    imageIndex = 0;
    text('modalKicker', `${project.num} / Caso seleccionado`);
    text('modalType', project.type);
    text('modalTitle', project.title);
    text('modalLead', project.lead);
    text('modalStatus', `${project.status} · ${project.year}`);
    text('modalRole', project.role);
    text('modalSummary', project.summary);
    text('modalApproach', project.approach);
    text('modalDeliverables', project.deliverables);
    text('modalSource', project.source);
    const sourceLink = document.getElementById('modalSourceLink');
    sourceLink.hidden = !project.sourceUrl;
    if (project.sourceUrl) sourceLink.href = project.sourceUrl; else sourceLink.removeAttribute('href');
    dialog.querySelector('details').open = false;
    renderImage();
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('modal-open');
    document.getElementById('closeModal').focus({preventScroll:true});
  }
  function readHash() {
    const prefix = '#proyecto/';
    if (location.hash.startsWith(prefix)) {
      const id = location.hash.slice(prefix.length);
      if (projects.some(project => project.id === id)) openProject(id);
    } else if (dialog.open) dialog.close();
  }
  document.querySelectorAll('[data-project]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    lastTrigger = link;
    const hash = `#proyecto/${link.dataset.project}`;
    if (location.hash === hash) openProject(link.dataset.project); else location.hash = hash;
  }));
  document.getElementById('closeModal').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    if (location.hash.startsWith('#proyecto/')) history.replaceState(null, '', `${location.pathname}${location.search}#proyectos`);
    if (lastTrigger && !lastTrigger.closest('[hidden]')) lastTrigger.focus({preventScroll:true});
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  function nextImage(direction) {
    if (!activeProject) return;
    imageIndex = (imageIndex + direction + activeProject.gallery.length) % activeProject.gallery.length;
    renderImage();
  }
  document.getElementById('prevImage').addEventListener('click', () => nextImage(-1));
  document.getElementById('nextImage').addEventListener('click', () => nextImage(1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); nextImage(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); nextImage(1); }
  });
  window.addEventListener('hashchange', readHash);
  const menu = document.getElementById('mainNav');
  const menuToggle = document.getElementById('menuToggle');
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(expanded));
    menu.classList.toggle('is-open', expanded);
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
  }));
  readHash();
})();
