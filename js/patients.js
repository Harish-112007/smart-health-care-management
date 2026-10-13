/* ==========================================================
   patients.js - admin-style Patient Records page (patients.html)
   Joins the "patients" and "appointments" collections.
   ========================================================== */

// Build one table row per appointment.
// A patient with no appointments still gets one row (with dashes).
function buildRecordRows() {
  const appointments = getAppointments();
  const rows = [];

  getPatients().forEach(function (p) {
    const mine = appointments.filter(function (a) { return a.patientId === p.id; });
    if (mine.length === 0) {
      rows.push({ patient: p, appointment: null });
    } else {
      mine.forEach(function (a) { rows.push({ patient: p, appointment: a }); });
    }
  });
  return rows;
}

// Show the table (with search + status filter applied)
function loadPatientRecords() {
  refreshAppointmentStatuses();
  const search = document.getElementById("patientSearch").value.trim().toLowerCase();
  const status = document.getElementById("statusFilter").value;

  const rows = buildRecordRows().filter(function (r) {
    const matchesText = search === "" ||
      r.patient.name.toLowerCase().includes(search) ||
      r.patient.id.toLowerCase().includes(search) ||
      r.patient.phone.includes(search) ||
      (r.appointment && r.appointment.appointmentId.toLowerCase().includes(search));
    const matchesStatus = status === "" || (r.appointment && r.appointment.status === status);
    return matchesText && matchesStatus;
  });

  // Summary numbers
  document.getElementById("countPatients").textContent = getPatients().length;
  document.getElementById("countAppointments").textContent = getAppointments().length;

  const body = document.getElementById("recordsBody");
  if (rows.length === 0) {
    body.innerHTML = '<tr><td colspan="11" class="text-muted" style="text-align:center;padding:32px">No records found. Register a patient and book an appointment to see data here.</td></tr>';
    return;
  }

  body.innerHTML = rows.map(function (r) {
    const p = r.patient;
    const a = r.appointment;
    return "<tr>" +
      "<td>" + escapeHtml(p.id) + "</td>" +
      "<td>" + escapeHtml(p.name) + "</td>" +
      "<td>" + escapeHtml(p.age) + "</td>" +
      "<td>" + escapeHtml(p.gender) + "</td>" +
      "<td>" + escapeHtml(p.phone) + "</td>" +
      "<td>" + escapeHtml(p.email) + "</td>" +
      "<td>" + (a ? escapeHtml(a.appointmentId) : "-") + "</td>" +
      "<td>" + (a ? escapeHtml(a.doctorName) : "-") + "</td>" +
      "<td>" + (a ? formatDate(a.date) : "-") + "</td>" +
      "<td>" + (a ? escapeHtml(a.time) : "-") + "</td>" +
      "<td>" + (a ? statusBadge(a.status) : '<span class="badge badge-none">No appointments</span>') + "</td>" +
      "</tr>";
  }).join("");
}

// Demo helper: wipe all patients, appointments and login
function resetDemoData() {
  if (!confirm("This deletes ALL patients and appointments stored in this browser. Continue?")) return;
  localStorage.removeItem(KEYS.PATIENTS);
  localStorage.removeItem(KEYS.APPOINTMENTS);
  localStorage.removeItem(KEYS.LOGGED_IN);
  window.location.href = "index.html";
}

// Search patients by name, Patient ID or phone number
function searchPatients() { loadPatientRecords(); }

document.addEventListener("DOMContentLoaded", function () {
  if (!document.getElementById("recordsBody")) return;
  loadPatientRecords();
  document.getElementById("patientSearch").addEventListener("input", searchPatients);
  document.getElementById("statusFilter").addEventListener("change", searchPatients);
});
