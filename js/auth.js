/* ==========================================================
   auth.js - patient registration, login and the dashboard.
   (logoutPatient() is in app.js because the navbar uses it.)
   ========================================================== */

/* ---------- Register ---------- */
function registerPatient(event) {
  event.preventDefault();               // stop the page from reloading
  clearErrors("registerForm");
  hideAlert("formMessage");

  // 1. Read the values typed by the user
  const name = document.getElementById("fullName").value.trim();
  const age = Number(document.getElementById("age").value);
  const gender = document.getElementById("gender").value;
  const phone = document.getElementById("phone").value.replace(/[\s-]/g, ""); // remove spaces/dashes
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const address = document.getElementById("address").value.trim();

  // 2. Validate every field
  let valid = true;
  if (!/^[A-Za-z][A-Za-z .'-]{2,}$/.test(name)) {
    setFieldError("fullName", "Enter your full name (letters only, at least 3 characters)."); valid = false;
  }
  if (!Number.isInteger(age) || age < 1 || age > 120) {
    setFieldError("age", "Enter a valid age between 1 and 120."); valid = false;
  }
  if (gender === "") {
    setFieldError("gender", "Please select a gender."); valid = false;
  }
  if (!isValidPhone(phone)) {
    setFieldError("phone", "Enter a 10-digit phone number (numbers only)."); valid = false;
  }
  if (!isValidEmail(email)) {
    setFieldError("email", "Enter a valid email, for example name@example.com."); valid = false;
  }
  if (password.length < 6 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    setFieldError("password", "Password needs at least 6 characters with a letter and a number."); valid = false;
  }
  if (address.length < 5) {
    setFieldError("address", "Enter your address (at least 5 characters)."); valid = false;
  }
  if (!valid) {
    showAlert("formMessage", "Please fix the highlighted fields.", "error");
    return;
  }

  // 3. Make sure the email is not already registered
  const patients = getPatients();
  const alreadyUsed = patients.some(function (p) { return p.email === email; });
  if (alreadyUsed) {
    setFieldError("email", "This email is already registered. Please log in.");
    showAlert("formMessage", "An account with this email already exists.", "error");
    return;
  }

  // 4. Save the new patient
  // NOTE: a real system must NEVER store plain-text passwords.
  // This is done only because this is a demo without a backend.
  const newPatient = {
    id: generatePatientId(),
    name: name,
    age: age,
    gender: gender,
    phone: phone,
    email: email,
    password: password,
    address: address,
    registeredOn: new Date().toISOString()
  };
  patients.push(newPatient);
  saveToLocalStorage(KEYS.PATIENTS, patients);

  // 5. Success message + link to login
  document.getElementById("registerForm").reset();
  showAlert("formMessage", "Registration successful! Your Patient ID is " + newPatient.id + ". You can now log in.", "success");
  document.getElementById("goLogin").classList.remove("hidden");
}

/* ---------- Login ---------- */
function loginPatient(event) {
  event.preventDefault();
  clearErrors("loginForm");
  hideAlert("formMessage");

  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;

  let valid = true;
  if (!isValidEmail(email)) { setFieldError("email", "Enter a valid email address."); valid = false; }
  if (password === "") { setFieldError("password", "Enter your password."); valid = false; }
  if (!valid) return;

  // Look for a patient with this email AND password
  const patient = getPatients().find(function (p) {
    return p.email === email && p.password === password;
  });
  if (!patient) {
    showAlert("formMessage", "Incorrect email or password. If you are new, please register first.", "error");
    return;
  }

  // Save the logged-in patient (without the password)
  const session = {
    id: patient.id, name: patient.name, age: patient.age, gender: patient.gender,
    phone: patient.phone, email: patient.email, address: patient.address
  };
  saveToLocalStorage(KEYS.LOGGED_IN, session);

  // Go to the page the user wanted (like the booking page), otherwise the dashboard.
  // The pattern below only allows our own pages, never outside websites.
  const next = new URLSearchParams(window.location.search).get("next");
  const safe = next && /^[a-z-]+\.html(\?doctor=D\d+)?$/i.test(next);
  window.location.href = safe ? next : "dashboard.html";
}

/* ---------- Dashboard ---------- */
function loadDashboard() {
  const patient = requireLogin();
  if (!patient) return;
  refreshAppointmentStatuses();

  document.getElementById("welcomeName").textContent = "Welcome, " + patient.name;

  // Basic information
  document.getElementById("patientInfo").innerHTML =
    "<li><span>Patient ID</span><span>" + escapeHtml(patient.id) + "</span></li>" +
    "<li><span>Age / Gender</span><span>" + escapeHtml(patient.age) + " / " + escapeHtml(patient.gender) + "</span></li>" +
    "<li><span>Phone</span><span>" + escapeHtml(patient.phone) + "</span></li>" +
    "<li><span>Email</span><span>" + escapeHtml(patient.email) + "</span></li>";

  // Counts
  const mine = getAppointments().filter(function (a) { return a.patientId === patient.id; });
  const upcoming = mine.filter(isUpcoming);
  document.getElementById("statTotal").textContent = mine.length;
  document.getElementById("statUpcoming").textContent = upcoming.length;
  document.getElementById("statCompleted").textContent = mine.filter(function (a) { return a.status === "Completed"; }).length;
  document.getElementById("statCancelled").textContent = mine.filter(function (a) { return a.status === "Cancelled"; }).length;

  // Next 3 upcoming appointments (soonest first)
  upcoming.sort(function (a, b) {
    return appointmentDateTime(a.date, a.time) - appointmentDateTime(b.date, b.time);
  });
  const box = document.getElementById("upcomingList");
  if (upcoming.length === 0) {
    box.innerHTML = '<div class="empty"><i class="fa-regular fa-calendar"></i>No upcoming appointments. Book one to get started.</div>';
    return;
  }
  box.innerHTML = upcoming.slice(0, 3).map(function (a) {
    return '<div class="upcoming-item"><div><strong>' + escapeHtml(a.doctorName) + "</strong><br><small class='text-muted'>" +
      escapeHtml(a.specialization) + " | " + escapeHtml(a.appointmentId) + "</small></div><div style='text-align:right'>" +
      formatDate(a.date) + "<br><small class='text-muted'>" + escapeHtml(a.time) + "</small></div></div>";
  }).join("");
}

/* ---------- Connect forms to functions (runs when the page loads) ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  if (registerForm) registerForm.addEventListener("submit", registerPatient);

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    // Already logged in? Skip the login page.
    if (getLoggedInPatient()) { window.location.href = "dashboard.html"; return; }
    loginForm.addEventListener("submit", loginPatient);
  }

  if (document.getElementById("welcomeName")) loadDashboard();
});
