const API_BASE = 'http://localhost:5000/api';

const panelTitle = document.getElementById('panelTitle');
const loginView = document.getElementById('loginView');
const registerView = document.getElementById('registerView');
const loginTabs = document.getElementById('loginTabs');

const mobileTab = document.getElementById('mobileTab');
const userTab = document.getElementById('userTab');
const mobileForm = document.getElementById('mobileForm');
const userForm = document.getElementById('userForm');

const openRegister = document.getElementById('openRegister');
const backToLogin = document.getElementById('backToLogin');

const registerForm = document.getElementById('registerForm');
const messageBox = document.getElementById('messageBox');
const sendOtpBtn = document.getElementById('sendOtpBtn');

function showMessage(type, text) {
  messageBox.className = `message ${type}`;
  messageBox.textContent = text;
}

function clearMessage() {
  messageBox.className = 'message hidden';
  messageBox.textContent = '';
}

function switchTab(mode) {
  if (mode === 'mobile') {
    mobileTab.classList.add('active');
    userTab.classList.remove('active');
    mobileForm.classList.remove('hidden');
    userForm.classList.add('hidden');
  } else {
    userTab.classList.add('active');
    mobileTab.classList.remove('active');
    userForm.classList.remove('hidden');
    mobileForm.classList.add('hidden');
  }
  clearMessage();
}

function showRegisterView() {
  panelTitle.textContent = 'Register to AOS Portal';
  loginView.classList.add('hidden');
  registerView.classList.remove('hidden');
  loginTabs.classList.add('hidden');
  clearMessage();
}

function showLoginView() {
  panelTitle.textContent = 'Login to AOS Portal';
  registerView.classList.add('hidden');
  loginView.classList.remove('hidden');
  loginTabs.classList.remove('hidden');
  switchTab('mobile');
  clearMessage();
}

mobileTab.addEventListener('click', () => switchTab('mobile'));
userTab.addEventListener('click', () => switchTab('user'));
openRegister.addEventListener('click', showRegisterView);
backToLogin.addEventListener('click', showLoginView);

document.getElementById('mobileNo').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '');
});

document.getElementById('otp').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '');
});

document.getElementById('regMobile').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '');
});

document.getElementById('regMpin').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
});

document.getElementById('regConfirmMpin').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
});

sendOtpBtn.addEventListener('click', async () => {
  const mobileNo = document.getElementById('mobileNo').value.trim();

  if (mobileNo.length !== 10) {
    showMessage('error', 'Enter a valid 10-digit mobile number.');
    return;
  }

  try {
    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = 'Sending...';

    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNo })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Unable to send OTP.');

    showMessage('success', `${data.message} Demo OTP: ${data.otp}`);
  } catch (error) {
    showMessage('error', error.message);
  } finally {
    sendOtpBtn.disabled = false;
    sendOtpBtn.textContent = 'Send OTP';
  }
});

mobileForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const mobileNo = document.getElementById('mobileNo').value.trim();
  const otp = document.getElementById('otp').value.trim();

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginMode: 'M', mobileNo, otp })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Mobile login failed.');

    showMessage('success', data.message);
  } catch (error) {
    showMessage('error', error.message);
  }
});

userForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginMode: 'U', username, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Username login failed.');

    showMessage('success', data.message);
  } catch (error) {
    showMessage('error', error.message);
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    username: document.getElementById('regUsername').value.trim(),
    mobileNo: document.getElementById('regMobile').value.trim(),
    password: document.getElementById('regPassword').value.trim(),
    confirmPassword: document.getElementById('regConfirmPassword').value.trim(),
    mpin: document.getElementById('regMpin').value.trim(),
    confirmMpin: document.getElementById('regConfirmMpin').value.trim(),
    roleId: document.getElementById('regRole').value
  };

  if (
    !payload.username ||
    !payload.mobileNo ||
    !payload.password ||
    !payload.confirmPassword ||
    !payload.mpin ||
    !payload.confirmMpin ||
    !payload.roleId
  ) {
    showMessage('error', 'Please fill all required registration fields.');
    return;
  }

  if (payload.mobileNo.length !== 10) {
    showMessage('error', 'Mobile number must be 10 digits.');
    return;
  }

  if (payload.password !== payload.confirmPassword) {
    showMessage('error', 'Password and confirm password do not match.');
    return;
  }

  if (payload.mpin !== payload.confirmMpin) {
    showMessage('error', 'MPIN and confirm MPIN do not match.');
    return;
  }

  if (payload.mpin.length !== 4) {
    showMessage('error', 'MPIN must be exactly 4 digits.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed.');

    showMessage('success', data.message || 'Registration successful.');
    registerForm.reset();
    showLoginView();
  } catch (error) {
    showMessage('error', error.message);
  }
});