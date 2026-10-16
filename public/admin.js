(() => {
  const loginPanel = document.querySelector('#admin-login');
  const dashboard = document.querySelector('#admin-dashboard');
  const loginMessage = document.querySelector('#login-message');
  const photoNames = {
    hero: 'Homepage hero',
    'menu-burger': 'Menu · burger',
    'menu-nachos': 'Menu · nachos',
    'menu-wrap': 'Menu · wrap',
    story: 'Our story'
  };

  async function api(url, options = {}) {
    const response = await fetch(url, { credentials: 'same-origin', ...options });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'The request could not be completed.');
    return data;
  }

  function showDashboard(show) {
    loginPanel.hidden = show;
    dashboard.hidden = !show;
  }

  async function loadPhotos() {
    const photos = await api('/api/admin/photos');
    const manager = document.querySelector('#photo-manager');
    manager.replaceChildren();
    Object.entries(photoNames).forEach(([slot, label]) => {
      const card = document.createElement('article');
      card.className = 'photo-card';
      const image = document.createElement('img');
      image.src = photos[slot];
      image.alt = `${label} current photo`;
      image.loading = 'lazy';
      const title = document.createElement('h3');
      title.textContent = label;
      const hint = document.createElement('p');
      hint.className = 'photo-hint';
      hint.textContent = 'Choose a replacement image';
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/png,image/webp';
      input.setAttribute('aria-label', `Upload ${label} photo`);
      input.addEventListener('change', async () => {
        const file = input.files && input.files[0];
        if (!file) return;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024) {
          hint.textContent = 'Choose a JPG, PNG or WebP image under 3 MB.';
          input.value = '';
          return;
        }
        input.disabled = true;
        hint.textContent = 'Uploading…';
        try {
          const form = new FormData();
          form.set('slot', slot);
          form.set('file', file);
          const updated = await api('/api/admin/photos', { method: 'POST', body: form });
          const previewUrl = new URL(updated[slot], location.href);
          previewUrl.searchParams.set('v', Date.now());
          image.src = previewUrl.toString();
          hint.textContent = 'Photo updated';
        } catch (error) {
          hint.textContent = error.message;
        } finally {
          input.disabled = false;
          input.value = '';
        }
      });
      card.append(image, title, input, hint);
      manager.append(card);
    });
  }

  async function loadLeads() {
    const rows = document.querySelector('#lead-rows');
    const message = document.querySelector('#leads-message');
    message.textContent = 'Loading enquiries…';
    try {
      const leads = await api('/api/admin/leads');
      rows.replaceChildren();
      if (!leads.length) {
        message.textContent = 'No enquiries yet.';
        return;
      }
      leads.forEach(lead => {
        const row = document.createElement('tr');
        const values = [new Date(lead.createdAt).toLocaleString(), lead.name, lead.phone, lead.email || '—', lead.city, lead.message || '—'];
        values.forEach(value => {
          const cell = document.createElement('td');
          cell.textContent = value;
          row.append(cell);
        });
        rows.append(row);
      });
      message.textContent = `${leads.length} ${leads.length === 1 ? 'enquiry' : 'enquiries'}`;
    } catch (error) {
      message.textContent = error.message;
    }
  }

  async function enterDashboard() {
    showDashboard(true);
    await Promise.allSettled([loadPhotos(), loadLeads()]);
  }

  document.querySelector('#login-form').addEventListener('submit', async event => {
    event.preventDefault();
    const button = event.currentTarget.querySelector('button');
    button.disabled = true;
    loginMessage.textContent = 'Signing in…';
    try {
      await api('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: new FormData(event.currentTarget).get('password') }) });
      event.currentTarget.reset();
      loginMessage.textContent = '';
      await enterDashboard();
    } catch (error) {
      loginMessage.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });

  document.querySelector('#logout-button').addEventListener('click', async () => {
    await api('/api/admin/logout', { method: 'POST' }).catch(() => {});
    showDashboard(false);
  });
  document.querySelector('#refresh-leads').addEventListener('click', loadLeads);

  api('/api/admin/session').then(enterDashboard).catch(() => showDashboard(false));
})();
