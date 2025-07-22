// 1. Helper functions for user data
function getUser() {
  return JSON.parse(localStorage.getItem('freightUser'));
}
function setUser(u) {
  localStorage.setItem('freightUser', JSON.stringify(u));
}
function logout() {
  localStorage.removeItem('freightUser');
  window.location = 'index.html';
}
function requireAuth() {
  const u = getUser();
  if (!u || !u.verified) {
    logout(); // [Line 12] ❗ Used logout() safely inside block
  }
  return u;
}

// 2. Signup logic on index.html
if (document.getElementById('signupBtn')) {
  document.getElementById('signupBtn').onclick = () => {
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const age = parseInt(document.getElementById('age').value, 10);
    const role = document.getElementById('role').value;
    const pwd = document.getElementById('password').value;
    const err = document.getElementById('error');

    if (!email || !phone || !age || !role || !pwd) {
      err.textContent = 'All fields are required.';
    } else if (age < 18) {
      err.textContent = 'You must be at least 18.';
    } else {
      const user = { email, password: pwd, phone, age, role, verified: true };
      setUser(user);
      window.location = 'dashboard.html';
    }
  };
}

// 3. Logout button
if (document.getElementById('logoutBtn')) {
  document.getElementById('logoutBtn').onclick = logout;
}

// 4. Dashboard rendering
if (document.getElementById('dashboardContent')) {
  const u = requireAuth();
  const cont = document.getElementById('dashboardContent');
  document.body.setAttribute('data-role', u.role);
  let html = `<p>Hi, <strong>${u.email}</strong> (${u.role})</p>`;
  html += `<div><button onclick="location.href='${u.role === 'shipper' ? 'postload.html' : 'marketplace.html'}'">
            ${u.role === 'shipper' ? 'Post a Load' : 'Find Loads'}</button></div><hr>`;

  const loads = JSON.parse(localStorage.getItem('sampleLoads') || '[]');
  if (u.role === 'carrier') {
    html += '<h3>Suggested Loads</h3>';
    loads.slice(0, 3).forEach(ld => {
      html += `<div class="card">From ${ld.o} → ${ld.d}, ${ld.w}kg, ${ld.type}, Rate ${ld.rate}</div>`;
    });
    html += '<h3>Recently Posted Loads</h3>';
    loads.slice(0, 5).forEach(ld => html += `<div class="card">…</div>`);
  } else {
    html += '<h3>Your Recent Loads</h3>';
    loads.filter(l => l.shipper === u.email).forEach(ld =>
      html += `<div class="card">${ld.o}→${ld.d}, rate ${ld.rate}</div>`);
  }
  cont.innerHTML = html;
}

// 5. Marketplace logic (fixed return issue)
if (document.getElementById('marketplaceContent')) {
  (function () { // [Line 71] Wrap logic in IIFE so return is legal
    const u = requireAuth();
    if (!u || u.role !== 'carrier') {
      logout(); // [Line 74] ❗ fixed illegal return
      return;
    }

    let loads = JSON.parse(localStorage.getItem('sampleLoads') || '[]');
    const list = loads.map(ld => {
      return `<div class="card">
        <strong>${ld.shipper}</strong>: ${ld.o} → ${ld.d}, ${ld.w}kg • ${ld.type} • $${ld.rate}
        <button onclick="alert('Booked!')">Book Load</button>
      </div>`;
    }).join('');
    document.getElementById('marketplaceContent').innerHTML = `
      <h2>Marketplace</h2>
      <div class="filter"><em>Filter UI here</em></div>
      ${list || '<p>No loads available.</p>'}
    `;
  })();
}

// 6. Post Load logic (shipper only)
if (document.getElementById('postLoadForm')) {
  const u = requireAuth();
  if (!u || u.role !== 'shipper') {
    logout(); // [Line 96] ❗ replaced illegal return with block
  } else {
    document.getElementById('postLoadForm').onsubmit = e => {
      e.preventDefault();
      const data = {
        shipper: u.email,
        o: e.target.origin.value,
        d: e.target.destination.value,
        w: e.target.weight.value,
        type: e.target.loadType.value,
        rate: e.target.rate.value,
        date: e.target.date.value
      };
      const arr = JSON.parse(localStorage.getItem('sampleLoads') || '[]');
      arr.push(data);
      localStorage.setItem('sampleLoads', JSON.stringify(arr));
      alert('Load posted!');
      window.location = 'dashboard.html';
    };
  }
}

// 7. Dummy messaging data
const messages = JSON.parse(localStorage.getItem('messages') || '[]');
messages.push({
  from: "carrier@example.com",
  to: "shipper@example.com",
  text: "Truck is ready tomorrow",
  timestamp: new Date().toISOString(),
  loadId: 12345
});
localStorage.setItem('messages', JSON.stringify(messages));

// 8. Dummy profile info
const user = getUser();
if (user) {
  const profiles = JSON.parse(localStorage.getItem('profiles') || '{}');
  profiles[user.email] = {
    name: "John Doe",
    vehicleType: "Dry Van",
    bankDetails: "123-456-789"
  };
  localStorage.setItem('profiles', JSON.stringify(profiles));
}
