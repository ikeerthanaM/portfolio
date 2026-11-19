let adminPassword = sessionStorage.getItem('ocean_admin_pass') || '';
let currentSection = 'education';
let editingId = null;
let portfolioData = {};
let quillInstance = null;

const SECTION_SCHEMAS = {
  profile: {
    label: 'Name & Handle',
    fields: [
      { name: 'fullName', label: 'Your Full Name (Written in Sand)', type: 'text', required: true },
      { name: 'handle', label: 'Username / Handle (Floating Screen Edge)', type: 'text', required: true }
    ]
  },
  education: {
    label: 'Education',
    fields: [
      { name: 'institution', label: 'Institution / School Name', type: 'text', required: true },
      { name: 'degree', label: 'Degree / Program', type: 'text', required: true },
      { name: 'year', label: 'Years (e.g., 2023 - 2027)', type: 'text', required: true },
      { name: 'details', label: 'Details / GPA / Highlights', type: 'textarea' }
    ]
  },
  interests: {
    label: 'Interests',
    fields: [
      { name: 'title', label: 'Interest Topic', type: 'text', required: true },
      { name: 'description', label: 'Why it inspires you', type: 'textarea', required: true }
    ]
  },
  skills: {
    label: 'Skills',
    fields: [
      { name: 'name', label: 'Skill Name (e.g., JavaScript, Node.js)', type: 'text', required: true },
      { name: 'category', label: 'Category (e.g., Frontend, Backend, Tools)', type: 'text', required: true },
      { name: 'level', label: 'Proficiency (e.g., Beginner, Intermediate, Advanced)', type: 'text', required: true }
    ]
  },
  projects: {
    label: 'Projects',
    fields: [
      { name: 'title', label: 'Project Title', type: 'text', required: true },
      { name: 'techStack', label: 'Tech Stack Used', type: 'text', required: true },
      { name: 'description', label: 'Project Description', type: 'textarea', required: true },
      { name: 'link', label: 'GitHub or Live URL', type: 'url' }
    ]
  },
  achievements: {
    label: 'Achievements',
    fields: [
      { name: 'title', label: 'Achievement / Award Title', type: 'text', required: true },
      { name: 'issuer', label: 'Issued By / Event', type: 'text', required: true },
      { name: 'date', label: 'Year / Date', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' }
    ]
  },
  digitalFootprints: {
    label: 'Digital Footprints',
    fields: [
      { name: 'platform', label: 'Platform (e.g., GitHub, LinkedIn, X, Medium)', type: 'text', required: true },
      { name: 'handle', label: 'Username / Handle', type: 'text', required: true },
      { name: 'url', label: 'Profile URL', type: 'url', required: true }
    ]
  },
  articles: {
    label: 'Articles',
    fields: [
      { name: 'title', label: 'Article Headline', type: 'text', required: true },
      { name: 'date', label: 'Publish Date (YYYY-MM-DD)', type: 'text', required: true },
      { name: 'content', label: 'Article Body', type: 'richtext', required: true }
    ]
  }
};

const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const formFieldsContainer = document.getElementById('form-fields');
const dynamicForm = document.getElementById('dynamic-form');
const itemsContainer = document.getElementById('items-container');
const formTitle = document.getElementById('form-title');
const listTitle = document.getElementById('list-title');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 2500);
}

if (adminPassword) {
  verifyAndUnlock(adminPassword);
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const pass = document.getElementById('admin-pass-input').value;
  await verifyAndUnlock(pass);
});

async function verifyAndUnlock(pass) {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pass })
    });
    if (res.ok) {
      adminPassword = pass;
      sessionStorage.setItem('ocean_admin_pass', pass);
      loginScreen.style.display = 'none';
      dashboard.style.display = 'block';
      loginError.style.display = 'none';
      await loadAllPortfolioData();
      renderSection();
    } else {
      sessionStorage.removeItem('ocean_admin_pass');
      loginError.style.display = 'block';
    }
  } catch (err) {
    loginError.textContent = 'Server connection error.';
    loginError.style.display = 'block';
  }
}

document.getElementById('logout-btn').addEventListener('click', () => {
  sessionStorage.removeItem('ocean_admin_pass');
  location.reload();
});

document.getElementById('section-tabs').addEventListener('click', (e) => {
  if (!e.target.classList.contains('tab-btn')) return;
  document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
  e.target.classList.add('active');
  currentSection = e.target.dataset.section;
  editingId = null;
  cancelEditBtn.style.display = 'none';
  renderSection();
});

cancelEditBtn.addEventListener('click', () => {
  editingId = null;
  cancelEditBtn.style.display = 'none';
  renderSection();
});

async function loadAllPortfolioData() {
  const res = await fetch('/api/portfolio');
  portfolioData = await res.json();
}

function renderSection() {
  const schema = SECTION_SCHEMAS[currentSection];
  formTitle.textContent = editingId ? `Edit ${schema.label} Entry` : `Add New ${schema.label} Entry`;
  listTitle.textContent = `Saved ${schema.label} (${(portfolioData[currentSection] || []).length})`;

  formFieldsContainer.innerHTML = '';
  quillInstance = null;

  schema.fields.forEach((field) => {
    const group = document.createElement('div');
    group.className = 'form-group';

    const label = document.createElement('label');
    label.textContent = field.label;
    group.appendChild(label);

    if (field.type === 'textarea') {
      const textarea = document.createElement('textarea');
      textarea.name = field.name;
      if (field.required) textarea.required = true;
      group.appendChild(textarea);
    } else if (field.type === 'richtext') {
      const wrapper = document.createElement('div');
      wrapper.id = 'editor-wrapper';
      const editorDiv = document.createElement('div');
      editorDiv.id = 'quill-editor';
      wrapper.appendChild(editorDiv);
      group.appendChild(wrapper);
    } else {
      const input = document.createElement('input');
      input.type = field.type;
      input.name = field.name;
      if (field.required) input.required = true;
      if (field.name === 'date' && currentSection === 'articles') {
        input.value = new Date().toISOString().split('T')[0];
      }
      group.appendChild(input);
    }

    formFieldsContainer.appendChild(group);
  });

  if (currentSection === 'articles') {
    quillInstance = new Quill('#quill-editor', {
      theme: 'snow',
      placeholder: 'Write your article here with headings, bold, lists, quotes, and code...',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link'],
          ['clean']
        ]
      }
    });
  }

  renderItemsList();
}

function renderItemsList() {
  const items = portfolioData[currentSection] || [];
  itemsContainer.innerHTML = '';

  if (items.length === 0) {
    itemsContainer.innerHTML = '<p style="color:#94a3b8;">No entries yet. Add your first one on the left!</p>';
    return;
  }

  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'item-card';

    const heading = item.fullName || item.title || item.institution || item.name || item.platform || 'Entry';
    const sub = item.handle || item.degree || item.category || item.techStack || item.issuer || item.date || '';
    const desc = item.details || item.description || item.url || '';

    card.innerHTML = `
      <h3>${escapeHtml(heading)}</h3>
      ${sub ? `<div class="item-meta">${escapeHtml(sub)} ${item.year ? `(${escapeHtml(item.year)})` : ''} ${item.level ? `• ${escapeHtml(item.level)}` : ''}</div>` : ''}
      ${desc ? `<div class="item-desc">${escapeHtml(desc)}</div>` : ''}
      ${item.content ? `<div class="item-desc" style="color:#94a3b8;font-style:italic;">[Rich Text Article — ${item.content.replace(/<[^>]*>/g, '').slice(0, 90)}...]</div>` : ''}
      <div class="item-actions">
        <button class="btn btn-edit" data-id="${item.id}">Edit</button>
        <button class="btn btn-danger" data-id="${item.id}">Delete</button>
      </div>
    `;

    card.querySelector('.btn-edit').addEventListener('click', () => startEditing(item));
    card.querySelector('.btn-danger').addEventListener('click', () => deleteEntry(item.id));
    itemsContainer.appendChild(card);
  });
}

function startEditing(item) {
  editingId = item.id;
  cancelEditBtn.style.display = 'inline-block';
  renderSection();

  const schema = SECTION_SCHEMAS[currentSection];
  schema.fields.forEach((field) => {
    if (field.type === 'richtext' && quillInstance) {
      quillInstance.root.innerHTML = item[field.name] || '';
    } else {
      const el = dynamicForm.querySelector(`[name="${field.name}"]`);
      if (el) el.value = item[field.name] || '';
    }
  });
}

dynamicForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const schema = SECTION_SCHEMAS[currentSection];
  const payload = { _adminPassword: adminPassword };

  schema.fields.forEach((field) => {
    if (field.type === 'richtext' && quillInstance) {
      payload[field.name] = quillInstance.root.innerHTML;
    } else {
      const el = dynamicForm.querySelector(`[name="${field.name}"]`);
      if (el) payload[field.name] = el.value.trim();
    }
  });

  const encodedPass = encodeURIComponent(adminPassword);
  const url = editingId
    ? `/api/${currentSection}/${editingId}?password=${encodedPass}`
    : `/api/${currentSection}?password=${encodedPass}`;
  const method = editingId ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': adminPassword
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    showToast(editingId ? 'Updated successfully!' : 'Added successfully!');
    editingId = null;
    cancelEditBtn.style.display = 'none';
    await loadAllPortfolioData();
    renderSection();
  } else {
    const errText = await res.text();
    alert('Save failed (HTTP ' + res.status + '): ' + errText);
  }
});

async function deleteEntry(id) {
  if (!confirm('Delete this entry?')) return;
  const encodedPass = encodeURIComponent(adminPassword);
  const res = await fetch(`/api/${currentSection}/${id}?password=${encodedPass}`, {
    method: 'DELETE',
    headers: { 'x-admin-password': adminPassword }
  });
  if (res.ok) {
    showToast('Deleted!');
    await loadAllPortfolioData();
    renderSection();
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}