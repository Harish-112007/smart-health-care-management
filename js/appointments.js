/* ==========================================================
   appointments.js - booking page AND My Appointments page.
   Booking:  appointment.html
   Listing:  my-appointments.html
   ========================================================== */

/* ---------- Slot checking ---------- */

// A slot is "booked" if any appointment for the same doctor, date and time
// is not cancelled. Cancelled appointments free the slot again.
function isSlotBooked(doctorId, date, time) {
  return getAppointments().some(function (a) {
    return a.doctorId === doctorId && a.date === date && a.time === time && a.status !== "Cancelled";
  });
}

/* ---------- Booking page ---------- */

// Called when the patient picks a doctor
function onDoctorChange() {
  const doctor = getDoctorById(document.getElementById("doctorSelect").value);
  const info = document.getElementById("availabilityInfo");

  document.getElementById("selectedTime").value = "";
  document.getElementById("dateInput").value = "";

  if (!doctor) {
    document.getElementById("specialization").value = "";
    info.classList.add("hidden");
    document.getElementById("slotGrid").innerHTML = "";
    return;
  }

  document.getElementById("specialization").value = doctor.specialization;

  // Show this doctor's available days automatically
  info.innerHTML = "<strong>Available days:</strong> " + doctor.availableDays.join(", ") +
    "<br><strong>Time slots:</strong> " + doctor.timeSlots.join(", ");
  info.classList.remove("hidden");

  showSlots(); // show slots (disabled until a date is chosen)
}

// Called when the patient picks a date
function onDateChange() {
  document.getElementById("selectedTime").value = "";
  clearErrors("bookingForm");
  showSlots();
}

// Draw the time-slot buttons for the chosen doctor + date
function showSlots() {
  const doctor = getDoctorById(document.getElementById("doctorSelect").value);
  const date = document.getElementById("dateInput").value;
  const grid = document.getElementById("slotGrid");
  const hint = document.getElementById("slotHint");
  if (!doctor) { grid.innerHTML = ""; return; }

  // No date yet: list the slots but keep them disabled
  if (date === "") {
    hint.textContent = "Select a date to see which slots are free.";
    grid.innerHTML = doctor.timeSlots.map(function (t) {
      return '<button type="button" class="slot" disabled>' + t + "</button>";
    }).join("");
    return;
  }

  // Date must be in the future
  if (date < tomorrowString()) {
    setFieldError("dateInput", "Please choose a future date (tomorrow or later).");
    hint.textContent = "";
    grid.innerHTML = "";
    return;
  }

  // Doctor must work on that weekday
  const dayName = getDayName(date);
  if (!doctor.availableDays.includes(dayName)) {
    setFieldError("dateInput", doctor.name + " is not available on " + dayName + "s. Available: " + doctor.availableDays.join(", ") + ".");
    hint.textContent = "";
    grid.innerHTML = "";
    return;
  }

  hint.textContent = "Slots for " + dayName + ", " + formatDate(date) + ". Booked slots cannot be selected.";
  grid.innerHTML = doctor.timeSlots.map(function (t) {
    if (isSlotBooked(doctor.id, date, t)) {
      return '<button type="button" class="slot booked" disabled>' + t + "<small>Booked</small></button>";
    }
    return '<button type="button" class="slot" onclick="selectSlot(this, \'' + t + '\')">' + t + "</button>";
  }).join("");
}

// Highlight the chosen slot and remember it in a hidden input
function selectSlot(button, time) {
  document.querySelectorAll("#slotGrid .slot").forEach(function (s) { s.classList.remove("selected"); });
  button.classList.add("selected");
  document.getElementById("selectedTime").value = time;
  document.getElementById("err-selectedTime").textContent = "";
}

// Runs when the "Book Appointment" button is pressed
function bookAppointment(event) {
  event.preventDefault();
  clearErrors("bookingForm");
  hideAlert("formMessage");

  const patient = getLoggedInPatient();
  if (!patient) { requireLogin(); return; }

  const doctorId = document.getElementById("doctorSelect").value;
  const date = document.getElementById("dateInput").value;
  const time = document.getElementById("selectedTime").value;
  const reason = document.getElementById("reason").value.trim();
  const doctor = getDoctorById(doctorId);

  // Validation
  let valid = true;
  if (!doctor) { setFieldError("doctorSelect", "Please select a doctor."); valid = false; }
  if (date === "") {
    setFieldError("dateInput", "Please select a date."); valid = false;
  } else if (date < tomorrowString()) {
    setFieldError("dateInput", "Please choose a future date (tomorrow or later)."); valid = false;
  } else if (doctor && !doctor.availableDays.includes(getDayName(date))) {
    setFieldError("dateInput", doctor.name + " is not available on " + getDayName(date) + "s."); valid = false;
  }
  if (time === "") {
    document.getElementById("err-selectedTime").textContent = "Please select an available time slot."; valid = false;
  }
  if (reason.length < 5) {
    setFieldError("reason", "Please describe the reason for your visit (at least 5 characters)."); valid = false;
  }
  if (!valid) {
    showAlert("formMessage", "Please fix the highlighted fields.", "error");
    return;
  }

  // Check again that nobody booked this slot in the meantime
  if (isSlotBooked(doctor.id, date, time)) {
    showAlert("formMessage", "Sorry, that slot has just been booked. Please choose another time.", "error");
    showSlots();
    return;
  }

  // A patient cannot have two appointments at the same date and time
  const clash = getAppointments().some(function (a) {
    return a.patientId === patient.id && a.date === date && a.time === time && a.status !== "Cancelled";
  });
  if (clash) {
    showAlert("formMessage", "You already have another appointment at this date and time.", "error");
    return;
  }

  // Create and save the appointment
  const appointment = {
    appointmentId: generateAppointmentId(),
    patientId: patient.id,
    patientName: patient.name,
    doctorId: doctor.id,
    doctorName: doctor.name,
    specialization: doctor.specialization,
    date: date,
    time: time,
    reason: reason,
    status: "Confirmed",
    bookedOn: new Date().toISOString()
  };
  const all = getAppointments();
  all.push(appointment);
  saveToLocalStorage(KEYS.APPOINTMENTS, all);

  showConfirmation(appointment);
}

// Replace the form with the confirmation card
function showConfirmation(a) {
  document.getElementById("bookingCard").classList.add("hidden");
  const card = document.getElementById("confirmation");
  card.innerHTML =
    "<h2><i class='fa-solid fa-circle-check'></i> Appointment booked successfully!</h2>" +
    '<ul class="info-list">' +
    "<li><span>Appointment ID</span><span>" + escapeHtml(a.appointmentId) + "</span></li>" +
    "<li><span>Patient Name</span><span>" + escapeHtml(a.patientName) + "</span></li>" +
    "<li><span>Doctor</span><span>" + escapeHtml(a.doctorName) + " (" + escapeHtml(a.specialization) + ")</span></li>" +
    "<li><span>Date</span><span>" + formatDate(a.date) + "</span></li>" +
    "<li><span>Time</span><span>" + escapeHtml(a.time) + "</span></li>" +
    "<li><span>Status</span><span>" + statusBadge(a.status) + "</span></li></ul>" +
    '<div class="btn-row" style="margin-top:18px">' +
    '<a class="btn btn-primary" href="my-appointments.html">View My Appointments</a>' +
    '<a class="btn btn-outline" href="appointment.html">Book Another</a></div>';
  card.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Set up the booking page
function initBookingPage() {
  const patient = requireLogin();
  if (!patient) return;

  // Patient name and ID are filled automatically
  document.getElementById("patientName").value = patient.name;
  document.getElementById("patientId").value = patient.id;

  // Fill the doctor drop-down
  const select = document.getElementById("doctorSelect");
  getDoctors().forEach(function (d) {
    const option = document.createElement("option");
    option.value = d.id;
    option.textContent = d.name + " - " + d.specialization;
    select.appendChild(option);
  });

  // Only future dates: the earliest choice is tomorrow
  document.getElementById("dateInput").min = tomorrowString();

  // Pre-select the doctor if we came from a doctor card (?doctor=D101)
  const preselected = new URLSearchParams(window.location.search).get("doctor");
  if (preselected && getDoctorById(preselected)) {
    select.value = preselected;
    onDoctorChange();
  }

  select.addEventListener("change", onDoctorChange);
  document.getElementById("dateInput").addEventListener("change", onDateChange);
  document.getElementById("bookingForm").addEventListener("submit", bookAppointment);
}

/* ---------- My Appointments page ---------- */

// Show the logged-in patient's appointments, using the search + status filter
function loadAppointments() {
  const patient = getLoggedInPatient();
  if (!patient) return;
  refreshAppointmentStatuses();

  const text = document.getElementById("appointmentSearch").value.trim().toLowerCase();
  const status = document.getElementById("statusFilter").value;

  const list = getAppointments().filter(function (a) {
    if (a.patientId !== patient.id) return false;
    const matchesStatus = status === "" || a.status === status;
    const matchesText = text === "" ||
      a.appointmentId.toLowerCase().includes(text) ||
      a.doctorName.toLowerCase().includes(text) ||
      a.specialization.toLowerCase().includes(text) ||
      a.reason.toLowerCase().includes(text);
    return matchesStatus && matchesText;
  });

  // Newest appointment date first
  list.sort(function (a, b) {
    return appointmentDateTime(b.date, b.time) - appointmentDateTime(a.date, a.time);
  });

  const container = document.getElementById("appointmentList");
  if (list.length === 0) {
    container.innerHTML = '<div class="empty" style="grid-column:1/-1"><i class="fa-regular fa-calendar-xmark"></i>No appointments found. <a href="appointment.html">Book an appointment</a>.</div>';
    return;
  }

  container.innerHTML = list.map(function (a) {
    const cancelButton = isUpcoming(a)
      ? '<button class="btn btn-danger btn-sm" onclick="cancelAppointment(\'' + a.appointmentId + '\')">Cancel</button>'
      : "";
    return '<article class="card appt-card">' +
      '<div class="appt-head"><span class="appt-id">' + escapeHtml(a.appointmentId) + "</span>" + statusBadge(a.status) + "</div>" +
      '<ul class="info-list">' +
      "<li><span>Doctor</span><span>" + escapeHtml(a.doctorName) + "</span></li>" +
      "<li><span>Specialization</span><span>" + escapeHtml(a.specialization) + "</span></li>" +
      "<li><span>Date</span><span>" + formatDate(a.date) + "</span></li>" +
      "<li><span>Time</span><span>" + escapeHtml(a.time) + "</span></li>" +
      "<li><span>Reason</span><span>" + escapeHtml(a.reason) + "</span></li></ul>" +
      '<div class="btn-row"><button class="btn btn-outline btn-sm" onclick="viewAppointment(\'' + a.appointmentId + '\')">View Details</button>' +
      cancelButton + "</div></article>";
  }).join("");
}

// Cancel: change the status to "Cancelled" (the record is NOT deleted)
function cancelAppointment(appointmentId) {
  if (!confirm("Are you sure you want to cancel appointment " + appointmentId + "?")) return;

  const all = getAppointments();
  const appointment = all.find(function (a) { return a.appointmentId === appointmentId; });
  if (!appointment) return;

  if (!isUpcoming(appointment)) {
    showAlert("pageMessage", "Only upcoming appointments can be cancelled.", "error");
    return;
  }

  appointment.status = "Cancelled";
  appointment.cancelledOn = new Date().toISOString();
  saveToLocalStorage(KEYS.APPOINTMENTS, all);

  showAlert("pageMessage", "Appointment " + appointmentId + " was cancelled. The time slot is free again.", "success");
  loadAppointments();
}

// Show full details in a pop-up window
function viewAppointment(appointmentId) {
  const a = getAppointments().find(function (x) { return x.appointmentId === appointmentId; });
  if (!a) return;

  let extra = "<li><span>Booked on</span><span>" + new Date(a.bookedOn).toLocaleString("en-GB") + "</span></li>";
  if (a.cancelledOn) {
    extra += "<li><span>Cancelled on</span><span>" + new Date(a.cancelledOn).toLocaleString("en-GB") + "</span></li>";
  }

  document.getElementById("modalBody").innerHTML =
    '<ul class="info-list">' +
    "<li><span>Appointment ID</span><span>" + escapeHtml(a.appointmentId) + "</span></li>" +
    "<li><span>Patient</span><span>" + escapeHtml(a.patientName) + " (" + escapeHtml(a.patientId) + ")</span></li>" +
    "<li><span>Doctor</span><span>" + escapeHtml(a.doctorName) + "</span></li>" +
    "<li><span>Specialization</span><span>" + escapeHtml(a.specialization) + "</span></li>" +
    "<li><span>Date</span><span>" + formatDate(a.date) + " (" + getDayName(a.date) + ")</span></li>" +
    "<li><span>Time</span><span>" + escapeHtml(a.time) + "</span></li>" +
    "<li><span>Reason</span><span>" + escapeHtml(a.reason) + "</span></li>" +
    "<li><span>Status</span><span>" + statusBadge(a.status) + "</span></li>" + extra + "</ul>";
  document.getElementById("detailsModal").classList.add("open");
}

function closeModal() {
  document.getElementById("detailsModal").classList.remove("open");
}

document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("bookingForm")) initBookingPage();

  if (document.getElementById("appointmentList")) {
    if (!requireLogin()) return;
    loadAppointments();
    document.getElementById("appointmentSearch").addEventListener("input", loadAppointments);
    document.getElementById("statusFilter").addEventListener("change", loadAppointments);
    // Close the pop-up when the dark background is clicked
    document.getElementById("detailsModal").addEventListener("click", function (e) {
      if (e.target === this) closeModal();
    });
  }
});
