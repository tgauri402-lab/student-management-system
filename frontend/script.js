const apiInput = document.getElementById('apiBase');
let API_BASE = localStorage.getItem('studentApiBase') || apiInput.value;
apiInput.value = API_BASE;

document.getElementById('saveApi').addEventListener('click', () => {
  API_BASE = apiInput.value.trim().replace(/\/$/, '');
  localStorage.setItem('studentApiBase', API_BASE);
  checkConnection();
  loadRoster();
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

// ---- Tabs ----
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.panel;
    tabs.forEach(t => t.classList.toggle('active', t.dataset.panel === target));
    panels.forEach(p => p.classList.toggle('active', p.dataset.panel === target));
    if (target === 'roster') loadRoster();
  });
});

// ---- Connection status ----
async function checkConnection() {
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  try {
    const res = await fetch(`${API_BASE}/`);
    if (!res.ok) throw new Error();
    dot.className = 'dot online';
    text.textContent = 'online';
  } catch {
    dot.className = 'dot offline';
    text.textContent = 'offline';
  }
}
checkConnection();

// ---- Roster ----
const rosterList = document.getElementById('rosterList');
const rosterCount = document.getElementById('rosterCount');

document.getElementById('refreshRoster').addEventListener('click', loadRoster);

async function loadRoster() {
  rosterList.innerHTML = '<p class="hint">Loading the roster…</p>';
  try {
    const res = await fetch(`${API_BASE}/students`);
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    const body = await res.json();
    const students = (body.data || []).slice().sort((a, b) => a.id - b.id);
    renderRoster(students);
  } catch (err) {
    rosterList.innerHTML = `<p class="error-hint">Couldn't reach the register. ${err.message}</p>`;
    rosterCount.textContent = '—';
  }
}

function renderRoster(students) {
  rosterCount.textContent = students.length === 1 ? '1 entry' : `${students.length} entries`;

  if (!students.length) {
    rosterList.innerHTML = '<p class="hint">No students yet — add the first one on the Add tab.</p>';
    return;
  }

  rosterList.innerHTML = `
    <div class="roster-row head">
      <span>ID</span><span>Name</span><span>Course</span><span>Marks</span><span></span>
    </div>
  `;
  students.forEach(s => rosterList.appendChild(buildRow(s)));
}

function buildRow(student) {
  const row = document.createElement('div');
  row.className = 'roster-row';
  row.innerHTML = `
    <span>${student.id}</span>
    <span class="r-name">${escapeHtml(student.name)}</span>
    <span class="r-course">${escapeHtml(student.course)}</span>
    <span class="r-marks" data-role="marks">${student.marks ?? '—'}</span>
    <span class="r-actions">
      <button data-role="edit">edit</button>
      <button data-role="delete" class="del">remove</button>
    </span>
  `;
  row.querySelector('[data-role="edit"]').addEventListener('click', () => editRow(row, student));
  row.querySelector('[data-role="delete"]').addEventListener('click', () => removeRow(student.id));
  return row;
}

function editRow(row, student) {
  const marksCell = row.querySelector('[data-role="marks"]');
  const actions = row.querySelector('.r-actions');

  marksCell.innerHTML = `<span class="marks-edit"><input type="number" value="${student.marks ?? ''}" id="inline-${student.id}"></span>`;
  actions.innerHTML = `<button data-role="save">save</button><button data-role="cancel">cancel</button>`;

  const input = document.getElementById(`inline-${student.id}`);
  input.focus();
  input.select();

  actions.querySelector('[data-role="save"]').addEventListener('click', () => saveRow(student.id, input.value));
  actions.querySelector('[data-role="cancel"]').addEventListener('click', loadRoster);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') saveRow(student.id, input.value);
    if (e.key === 'Escape') loadRoster();
  });
}

async function saveRow(id, marks) {
  const n = Number(marks);
  if (Number.isNaN(n)) return;
  try {
    const res = await fetch(`${API_BASE}/students/${id}?marks=${encodeURIComponent(n)}`, { method: 'PUT' });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    loadRoster();
  } catch (err) {
    rosterList.insertAdjacentHTML('afterbegin', `<p class="error-hint">Couldn't update: ${err.message}</p>`);
  }
}

async function removeRow(id) {
  if (!confirm(`Remove student #${id} from the register?`)) return;
  try {
    const res = await fetch(`${API_BASE}/students/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    loadRoster();
  } catch (err) {
    rosterList.insertAdjacentHTML('afterbegin', `<p class="error-hint">Couldn't remove: ${err.message}</p>`);
  }
}

// ---- Add ----
document.getElementById('addForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const note = document.getElementById('addNote');
  const btn = e.target.querySelector('.pen-btn');

  const name = document.getElementById('f-name').value.trim();
  const course = document.getElementById('f-course').value.trim();
  const marks = document.getElementById('f-marks').value;

  if (!name || !course || marks === '') {
    note.textContent = 'Fill in name, course, and marks.';
    note.className = 'note';
    return;
  }

  btn.disabled = true;
  note.textContent = 'Adding…';
  note.className = 'note';

  try {
    const params = new URLSearchParams({ name, course, marks });
    const res = await fetch(`${API_BASE}/students?${params.toString()}`, { method: 'POST' });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    note.textContent = `${name} entered into the register.`;
    note.className = 'note ok';
    e.target.reset();
  } catch (err) {
    note.textContent = `Couldn't add student: ${err.message}`;
    note.className = 'note';
  } finally {
    btn.disabled = false;
  }
});

// ---- Update ----
document.getElementById('updateForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const note = document.getElementById('updateNote');
  const btn = e.target.querySelector('.pen-btn');

  const id = document.getElementById('u-id').value;
  const name = document.getElementById('u-name').value.trim();
  const course = document.getElementById('u-course').value.trim();
  const marks = document.getElementById('u-marks').value;

  if (id === '' || !name || !course || marks === '') {
    note.textContent = 'Fill in ID, name, course, and marks.';
    note.className = 'note';
    return;
  }

  const params = new URLSearchParams({ name, course, marks });

  btn.disabled = true;
  note.textContent = 'Updating…';
  note.className = 'note';

  try {
    const res = await fetch(`${API_BASE}/students/${id}?${params.toString()}`, { method: 'PUT' });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    note.textContent = `Student #${id} updated.`;
    note.className = 'note ok';
    e.target.reset();
  } catch (err) {
    note.textContent = `Couldn't update student: ${err.message}`;
    note.className = 'note';
  } finally {
    btn.disabled = false;
  }
});

// ---- Delete ----
document.getElementById('deleteForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const note = document.getElementById('deleteNote');
  const btn = e.target.querySelector('.pen-btn');

  const id = document.getElementById('d-id').value;
  if (id === '') {
    note.textContent = 'Enter a student ID.';
    note.className = 'note';
    return;
  }
  if (!confirm(`Strike student #${id} from the register?`)) return;

  btn.disabled = true;
  note.textContent = 'Removing…';
  note.className = 'note';

  try {
    const res = await fetch(`${API_BASE}/students/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    note.textContent = `Student #${id} struck from the register.`;
    note.className = 'note ok';
  } catch (err) {
    note.textContent = `Couldn't remove student: ${err.message}`;
    note.className = 'note';
  } finally {
    btn.disabled = false;
  }
});

// ---- Init ----
loadRoster();
