/* ==========================================================
   app.js - shared helpers used by EVERY page.
   Load this file first on every page.
   It contains: LocalStorage helpers, default doctor data,
   navbar/footer, login-state helpers, date helpers and
   form-validation helpers.
   ========================================================== */

/* ---------- 1. LocalStorage keys (one "collection" each) ---------- */
const KEYS = {
  PATIENTS: "patients",
  DOCTORS: "doctors",
  APPOINTMENTS: "appointments",
  LOGGED_IN: "loggedInPatient"
};

/* Change this number if you edit DEFAULT_DOCTORS below,
   so the browser reloads the new doctor list. */
const DATA_VERSION = "1";

/* ---------- 2. Save / read data ---------- */

// Save any JavaScript value into LocalStorage (as JSON text)
function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Read a value from LocalStorage. If nothing is stored, return "fallback".
function getFromLocalStorage(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error("Could not read " + key, error);
    return fallback;
  }
}

/* ---------- 3. Default (sample) doctors ---------- */
const DEFAULT_DOCTORS = [
  {
    id: "D101", name: "Dr. Arun Kumar", specialization: "General Physician",
    experience: 12, qualification: "MBBS, MD (General Medicine)",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    timeSlots: ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"],
    consultation: "15-minute in-clinic consultation. Fee: Rs. 500"
  },
  {
    id: "D102", name: "Dr. Priya Sharma", specialization: "Cardiologist",
    experience: 15, qualification: "MBBS, MD, DM (Cardiology)",
    availableDays: ["Monday", "Wednesday", "Friday"],
    timeSlots: ["10:00 AM", "11:00 AM", "12:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"],
    consultation: "30-minute in-clinic consultation. Fee: Rs. 900"
  },
  {
    id: "D103", name: "Dr. Rahul Kumar", specialization: "Dermatologist",
    experience: 9, qualification: "MBBS, MD (Dermatology)",
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    timeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
    consultation: "20-minute in-clinic consultation. Fee: Rs. 700"
  },
  {
    id: "D104", name: "Dr. Meena Devi", specialization: "Pediatrician",
    experience: 11, qualification: "MBBS, DCH, MD (Pediatrics)",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    timeSlots: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM", "04:30 PM"],
    consultation: "20-minute in-clinic consultation. Fee: Rs. 600"
  },
  {
    id: "D105", name: "Dr. Sanjay Verma", specialization: "Orthopedic",
    experience: 18, qualification: "MBBS, MS (Orthopaedics)",
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    timeSlots: ["10:00 AM", "10:45 AM", "11:30 AM", "03:00 PM", "03:45 PM", "04:30 PM"],
    consultation: "30-minute in-clinic consultation. Fee: Rs. 800"
  },
  {
    id: "D106", name: "Dr. Kavya Nair", specialization: "ENT Specialist",
    experience: 7, qualification: "MBBS, MS (ENT)",
    availableDays: ["Monday", "Wednesday", "Friday", "Saturday"],
    timeSlots: ["09:00 AM", "09:45 AM", "10:30 AM", "02:00 PM", "02:45 PM", "03:30 PM"],
    consultation: "20-minute in-clinic consultation. Fee: Rs. 650"
  }
];

// Runs on every page load: makes sure the 4 collections exist.
function initData() {
  if (localStorage.getItem("dataVersion") !== DATA_VERSION ||
      getFromLocalStorage(KEYS.DOCTORS).length === 0) {
    saveToLocalStorage(KEYS.DOCTORS, DEFAULT_DOCTORS);
    localStorage.setItem("dataVersion", DATA_VERSION);
  }
  if (localStorage.getItem(KEYS.PATIENTS) === null) saveToLocalStorage(KEYS.PATIENTS, []);
  if (localStorage.getItem(KEYS.APPOINTMENTS) === null) saveToLocalStorage(KEYS.APPOINTMENTS, []);
}

/* ---------- 4. Small data helpers ---------- */
function getDoctors() { return getFromLocalStorage(KEYS.DOCTORS); }
function getDoctorById(id) { return getDoctors().find(function (d) { return d.id === id; }); }
function getPatients() { return getFromLocalStorage(KEYS.PATIENTS); }
function getAppointments() { return getFromLocalStorage(KEYS.APPOINTMENTS); }
function getLoggedInPatient() { return getFromLocalStorage(KEYS.LOGGED_IN, null); }

// Patient ID looks like PAT-1001, PAT-1002 ...
function generatePatientId() {
  const patients = getPatients();
  let highest = 1000;
  patients.forEach(function (p) {
    const number = parseInt(String(p.id).replace("PAT-", ""), 10);
    if (number > highest) highest = number;
  });
  return "PAT-" + (highest + 1);
}

// Appointment ID looks like APT-20261005-4821 (date + random number).
// The loop makes sure the same ID is never used twice.
function generateAppointmentId() {
  const existing = getAppointments().map(function (a) { return a.appointmentId; });
  const today = todayString().replace(/-/g, "");
  let id;
  do {
    id = "APT-" + today + "-" + Math.floor(1000 + Math.random() * 9000);
  } while (existing.includes(id));
  return id;
}

/* ---------- 5. Date & time helpers ---------- */
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Returns a Date as text "YYYY-MM-DD" (the format used by <input type="date">)
function toDateString(dateObject) {
  const y = dateObject.getFullYear();
  const m = String(dateObject.getMonth() + 1).padStart(2, "0");
  const d = String(dateObject.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}
function todayString() { return toDateString(new Date()); }
function tomorrowString() {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return toDateString(t);
}

// "2026-10-05" -> Date object at midnight (local time)
function parseDate(dateText) {
  const parts = dateText.split("-").map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}
function getDayName(dateText) { return DAY_NAMES[parseDate(dateText).getDay()]; }

// "2026-10-05" -> "05 Oct 2026"
function formatDate(dateText) {
  return parseDate(dateText).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// Combine date "2026-10-05" and time "03:30 PM" into one Date object
function appointmentDateTime(dateText, timeText) {
  const result = parseDate(dateText);
  const parts = timeText.split(" ");            // ["03:30", "PM"]
  const hm = parts[0].split(":").map(Number);   // [3, 30]
  let hours = hm[0] % 12;
  if (parts[1] === "PM") hours += 12;
  result.setHours(hours, hm[1], 0, 0);
  return result;
}

/* ---------- 6. Appointment status helpers ---------- */

// Status values used in the project: Confirmed, Cancelled, Completed
function isUpcoming(appointment) {
  return appointment.status === "Confirmed" &&
         appointmentDateTime(appointment.date, appointment.time) > new Date();
}

// If a confirmed appointment time has passed, mark it Completed.
function refreshAppointmentStatuses() {
  const all = getAppointments();
  let changed = false;
  all.forEach(function (a) {
    if (a.status === "Confirmed" && appointmentDateTime(a.date, a.time) <= new Date()) {
      a.status = "Completed";
      changed = true;
    }
  });
  if (changed) saveToLocalStorage(KEYS.APPOINTMENTS, all);
}

// Returns the CSS class for a status badge
function statusBadge(status) {
  return '<span class="badge badge-' + String(status).toLowerCase() + '">' + escapeHtml(status) + "</span>";
}

/* ---------- 7. Login state ---------- */

// Use on pages that need a logged-in patient.
// If nobody is logged in, send them to the login page.
function requireLogin() {
  const patient = getLoggedInPatient();
  if (!patient) {
    const page = window.location.pathname.split("/").pop() || "index.html";
    window.location.href = "login.html?next=" + encodeURIComponent(page + window.location.search);
    return null;
  }
  return patient;
}

function logoutPatient() {
  localStorage.removeItem(KEYS.LOGGED_IN);
  window.location.href = "index.html";
}

/* ---------- 8. Safety + validation helpers ---------- */

// Stops user text from being treated as HTML (prevents script injection)
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = String(text === undefined || text === null ? "" : text);
  return div.innerHTML;
}

function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email); }
function isValidPhone(phone) { return /^[0-9]{10}$/.test(phone); }

// Show a coloured message box. type = error | success | warning | info
function showAlert(elementId, message, type) {
  const box = document.getElementById(elementId);
  if (!box) return;
  box.className = "alert alert-" + type;
  box.textContent = message;
  box.classList.remove("hidden");
  box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function hideAlert(elementId) {
  const box = document.getElementById(elementId);
  if (box) box.classList.add("hidden");
}

// Show an error under one form field. The message goes in <small id="err-FIELDID">
function setFieldError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const error = document.getElementById("err-" + fieldId);
  if (input) input.classList.add("invalid");
  if (error) error.textContent = message;
}
function clearErrors(formId) {
  const form = document.getElementById(formId);
  form.querySelectorAll(".field-error").forEach(function (e) { e.textContent = ""; });
  form.querySelectorAll(".invalid").forEach(function (i) { i.classList.remove("invalid"); });
}

/* ---------- 9. Navbar and footer (same on every page) ---------- */
function renderNavbar() {
  const holder = document.getElementById("navbar");
  if (!holder) return;

  const current = window.location.pathname.split("/").pop() || "index.html";
  const patient = getLoggedInPatient();

  // [label, file, extra files that should also highlight this link]
  const links = [
    ["Home", "index.html", []],
    ["Doctors", "doctors.html", []],
    ["Appointments", "my-appointments.html", ["appointment.html"]],
    ["Medicines", "medicines.html", []],
    ["AI Chatbot", "chatbot.html", []],
    ["Patient Records", "patients.html", []]
  ];

  let items = "";
  links.forEach(function (l) {
    const active = current === l[1] || l[2].includes(current) ? "active" : "";
    items += '<li><a class="' + active + '" href="' + l[1] + '">' + l[0] + "</a></li>";
  });

  if (patient) {
    items += '<li><a class="' + (current === "dashboard.html" ? "active" : "") + '" href="dashboard.html"><i class="fa-solid fa-user"></i> ' + escapeHtml(patient.name.split(" ")[0]) + "</a></li>";
    items += '<li><button class="link-btn" onclick="logoutPatient()">Logout</button></li>';
  } else {
    items += '<li><a class="nav-cta" href="login.html">Login / Register</a></li>';
  }

  holder.innerHTML =
    '<nav class="navbar"><div class="container nav-inner">' +
    '<a class="brand" href="index.html"><span class="brand-mark"><i class="fa-solid fa-heart-pulse"></i></span>Smart Healthcare</a>' +
    '<button class="nav-toggle" id="navToggle" aria-label="Open menu"><i class="fa-solid fa-bars"></i></button>' +
    '<ul class="nav-links" id="navLinks">' + items + "</ul></div></nav>";

  // Mobile menu open/close
  document.getElementById("navToggle").addEventListener("click", function () {
    document.getElementById("navLinks").classList.toggle("open");
  });
}

function renderFooter() {
  const holder = document.getElementById("footer");
  if (!holder) return;
  holder.innerHTML =
    '<footer class="footer"><div class="container">' +
    '<div class="footer-grid">' +
    '<div><h4>Smart Healthcare</h4><p>An academic final-year project that shows online appointment booking, medicine information and a basic health chatbot.</p></div>' +
    '<div><h4>Pages</h4><a href="doctors.html">Doctors</a><a href="my-appointments.html">Appointments</a><a href="medicines.html">Medicines</a><a href="chatbot.html">AI Chatbot</a></div>' +
    '<div><h4>Account</h4><a href="register.html">Register</a><a href="login.html">Login</a><a href="dashboard.html">Dashboard</a><a href="patients.html">Patient Records</a></div>' +
    "</div>" +
    '<p class="footer-note"><strong>Demonstration system:</strong> data is stored only in this browser (LocalStorage). It is not suitable for real medical or personal records. Please do not enter real sensitive information.</p>' +
    "</div></footer>";
}

/* ---------- 10. Start-up ---------- */
document.addEventListener("DOMContentLoaded", function () {
  initData();
  renderNavbar();
  renderFooter();
});
