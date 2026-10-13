/* ==========================================================
   doctors.js - doctor listing, search and specialization filter.
   Used by doctors.html
   ========================================================== */

// Show doctors as cards. "list" is an array of doctor objects.
function loadDoctors(list) {
  const container = document.getElementById("doctorList");
  const doctors = list || getDoctors();

  if (doctors.length === 0) {
    container.innerHTML = '<div class="empty" style="grid-column:1/-1"><i class="fa-solid fa-user-doctor"></i>No doctors match your search. Try a different name or specialization.</div>';
    return;
  }

  container.innerHTML = doctors.map(function (d) {
    // Initials for the avatar: "Dr. Arun Kumar" -> "AK"
    const words = d.name.replace("Dr. ", "").split(" ");
    const initials = words[0][0] + (words[1] ? words[1][0] : "");

    const days = d.availableDays.map(function (day) { return '<span class="chip day">' + day.slice(0, 3) + "</span>"; }).join("");
    const times = d.timeSlots.map(function (t) { return '<span class="chip">' + t + "</span>"; }).join("");

    return '<article class="card doctor-card">' +
      '<div class="doc-top"><div class="avatar">' + escapeHtml(initials) + "</div>" +
      "<div><h3>" + escapeHtml(d.name) + '</h3><div class="doc-spec">' + escapeHtml(d.specialization) + "</div></div></div>" +
      '<ul class="doc-meta">' +
      '<li><i class="fa-solid fa-briefcase-medical"></i>' + d.experience + " years of experience</li>" +
      '<li><i class="fa-solid fa-graduation-cap"></i>' + escapeHtml(d.qualification) + "</li>" +
      '<li><i class="fa-solid fa-circle-info"></i>' + escapeHtml(d.consultation) + "</li></ul>" +
      "<div><strong>Available days</strong><div class='chips' style='margin-top:6px'>" + days + "</div></div>" +
      "<div><strong>Appointment timings</strong><div class='chips' style='margin-top:6px'>" + times + "</div></div>" +
      '<button class="btn btn-primary" onclick="bookDoctor(\'' + d.id + '\')"><i class="fa-regular fa-calendar-check"></i> Book Appointment</button>' +
      "</article>";
  }).join("");
}

// Fill the specialization drop-down from the doctor data
function loadSpecializations() {
  const select = document.getElementById("specializationFilter");
  const names = [];
  getDoctors().forEach(function (d) {
    if (!names.includes(d.specialization)) names.push(d.specialization);
  });
  names.sort().forEach(function (name) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });
}

// Filter by the search box text AND the specialization drop-down
function searchDoctors() {
  const text = document.getElementById("doctorSearch").value.trim().toLowerCase();
  const specialization = document.getElementById("specializationFilter").value;

  const result = getDoctors().filter(function (d) {
    const matchesText = d.name.toLowerCase().includes(text) || d.specialization.toLowerCase().includes(text);
    const matchesSpec = specialization === "" || d.specialization === specialization;
    return matchesText && matchesSpec;
  });
  loadDoctors(result);
}

// "Book Appointment" button on a doctor card
function bookDoctor(doctorId) {
  const target = "appointment.html?doctor=" + doctorId;
  if (getLoggedInPatient()) {
    window.location.href = target;
  } else {
    // Not logged in: go to login first, then come back to booking
    window.location.href = "login.html?next=" + encodeURIComponent(target);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  if (!document.getElementById("doctorList")) return;
  loadSpecializations();
  loadDoctors();
  document.getElementById("doctorSearch").addEventListener("input", searchDoctors);
  document.getElementById("specializationFilter").addEventListener("change", searchDoctors);
});
