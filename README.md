# Smart Healthcare Management System

Final-year academic project built with **HTML5, CSS3 and JavaScript only**.
Data is stored in the browser's **LocalStorage** (no backend, no database).

> Demonstration system. Not suitable for real medical or personal records.

## Run in VS Code
1. Install VS Code and the **Live Server** extension (by Ritwick Dey).
2. File > Open Folder > choose `Smart-Healthcare-Management-System`.
3. Right-click `index.html` > **Open with Live Server** (or click "Go Live" at the bottom right).
4. The site opens at http://127.0.0.1:5500/. You can also just double-click `index.html`.

An internet connection is needed only for the icons (Font Awesome) and the font (Google Fonts).

## Demo flow (for your viva)
Register > Login > Dashboard > Doctors > Book Appointment > Confirmation >
My Appointments > Cancel > Patient Records > Medicines > Chatbot

## File guide
| File | Purpose |
|---|---|
| js/app.js | Shared code: LocalStorage helpers, sample doctors, navbar/footer, date and validation helpers |
| js/auth.js | registerPatient(), loginPatient(), dashboard |
| js/doctors.js | loadDoctors(), searchDoctors() |
| js/appointments.js | bookAppointment(), cancelAppointment(), loadAppointments() |
| js/patients.js | Patient Records, searchPatients() |
| js/medicines.js | Medicine dataset, searchMedicine() |
| js/chatbot.js | chatbotResponse() (keyword matching) |

## LocalStorage keys
`patients`, `doctors`, `appointments`, `loggedInPatient`
(view them in the browser: F12 > Application > Local Storage)

## Reset data
Use the "Reset demo data" button on the Patient Records page,
or clear Local Storage from the browser developer tools.
