/* ==========================================================
   medicines.js - medicine information search (medicines.html)
   The data below is a small demonstration dataset for
   general education. It contains NO dosage advice.
   ========================================================== */

const MEDICINES = [
  {
    name: "Paracetamol", type: "Pain reliever and fever reducer",
    uses: ["Relief of mild to moderate pain such as headache or toothache", "Lowering fever"],
    sideEffects: ["Usually well tolerated", "Rarely: skin rash or allergic reaction"],
    precautions: ["Check other medicines you take; many cold and flu products already contain paracetamol", "Tell a doctor if you have liver problems or drink alcohol regularly"],
    warnings: ["Taking too much can seriously damage the liver. Seek medical help immediately if an overdose is suspected."]
  },
  {
    name: "Amoxicillin", type: "Antibiotic (penicillin group)",
    uses: ["Treating some bacterial infections, such as certain ear, throat, chest and urinary infections"],
    sideEffects: ["Nausea, diarrhoea or stomach upset", "Skin rash"],
    precautions: ["Tell your doctor if you are allergic to penicillin", "Finish the course exactly as your doctor advises"],
    warnings: ["Antibiotics do not work against viral infections such as colds and flu.", "Stop and get urgent care if you have swelling of the face or throat or difficulty breathing."]
  },
  {
    name: "Cetirizine", type: "Antihistamine (allergy medicine)",
    uses: ["Relief of allergy symptoms such as sneezing, runny nose, itchy eyes and hives"],
    sideEffects: ["Drowsiness", "Dry mouth", "Headache"],
    precautions: ["May cause sleepiness, so be careful when driving or using machines", "Avoid alcohol", "Ask a doctor first if you have kidney problems, are pregnant or breastfeeding"],
    warnings: ["Do not combine with other sedating medicines without medical advice."]
  },
  {
    name: "Ibuprofen", type: "Anti-inflammatory pain reliever (NSAID)",
    uses: ["Relief of pain and inflammation, for example muscle pain, period pain, dental pain", "Lowering fever"],
    sideEffects: ["Stomach pain, heartburn or nausea", "Dizziness"],
    precautions: ["Best taken with food", "Ask a doctor first if you have stomach ulcers, asthma, kidney or heart problems", "Usually avoided in later pregnancy"],
    warnings: ["Can cause stomach bleeding. Seek medical help for black stools or vomiting blood.", "Do not take with other NSAIDs (such as aspirin) unless a doctor says so."]
  },
  {
    name: "Omeprazole", type: "Proton pump inhibitor (reduces stomach acid)",
    uses: ["Acid reflux and heartburn", "Stomach or duodenal ulcers", "Protecting the stomach in some people who take NSAIDs"],
    sideEffects: ["Headache", "Diarrhoea or constipation", "Stomach pain or gas"],
    precautions: ["Long-term use should be reviewed by a doctor", "Tell your doctor about all other medicines you take"],
    warnings: ["See a doctor if you have trouble swallowing, unexplained weight loss or persistent vomiting."]
  },
  {
    name: "Aspirin", type: "Pain reliever, fever reducer and blood thinner",
    uses: ["Short-term pain and fever relief", "Sometimes prescribed by doctors to reduce the risk of blood clots"],
    sideEffects: ["Stomach irritation", "Increased bleeding or bruising"],
    precautions: ["Ask a doctor first if you have ulcers, asthma or bleeding problems", "Take with food to reduce stomach upset"],
    warnings: ["Not for children and teenagers because of a rare but serious illness called Reye's syndrome.", "Do not start daily aspirin for the heart without medical advice."]
  },
  {
    name: "Metformin", type: "Prescription diabetes medicine",
    uses: ["Helping to control blood sugar in type 2 diabetes"],
    sideEffects: ["Nausea, diarrhoea or stomach upset", "Metallic taste"],
    precautions: ["Only use when prescribed", "Doctors may check kidney function regularly", "Tell your doctor before any scan using contrast dye or surgery"],
    warnings: ["Seek urgent care for unusual tiredness, fast breathing or severe stomach pain."]
  },
  {
    name: "Salbutamol", type: "Reliever inhaler for asthma",
    uses: ["Quick relief of wheezing, cough and breathlessness in asthma and similar lung conditions"],
    sideEffects: ["Shaky hands (tremor)", "Fast heartbeat", "Headache"],
    precautions: ["Learn the correct inhaler technique from a healthcare professional", "Tell a doctor if you have heart problems or thyroid problems"],
    warnings: ["If you need your reliever more often than usual, or it stops helping, get medical help urgently."]
  }
];

// Turn a list into <li> items
function listToHtml(items) {
  return items.map(function (i) { return "<li>" + escapeHtml(i) + "</li>"; }).join("");
}

// Draw medicine cards
function showMedicines(list) {
  const container = document.getElementById("medicineResults");
  if (list.length === 0) {
    container.innerHTML = '<div class="empty" style="grid-column:1/-1"><i class="fa-solid fa-pills"></i>No medicine found with that name. Try Paracetamol, Amoxicillin, Cetirizine, Ibuprofen or Omeprazole.</div>';
    return;
  }
  container.innerHTML = list.map(function (m) {
    return '<article class="card med-card">' +
      "<h3>" + escapeHtml(m.name) + '</h3><div class="med-type">' + escapeHtml(m.type) + "</div>" +
      "<h4>Common uses</h4><ul>" + listToHtml(m.uses) + "</ul>" +
      "<h4>Common side effects</h4><ul>" + listToHtml(m.sideEffects) + "</ul>" +
      "<h4>Basic precautions</h4><ul>" + listToHtml(m.precautions) + "</ul>" +
      '<div class="med-warning"><strong>Important warning:</strong> ' + escapeHtml(m.warnings.join(" ")) + "</div>" +
      "</article>";
  }).join("");
}

// Search by medicine name (an empty search shows all medicines)
function searchMedicine() {
  const text = document.getElementById("medicineSearch").value.trim().toLowerCase();
  const result = MEDICINES.filter(function (m) { return m.name.toLowerCase().includes(text); });
  showMedicines(result);
}

document.addEventListener("DOMContentLoaded", function () {
  if (!document.getElementById("medicineResults")) return;
  showMedicines(MEDICINES);
  document.getElementById("medicineSearch").addEventListener("input", searchMedicine);
  document.getElementById("medicineForm").addEventListener("submit", function (e) {
    e.preventDefault();
    searchMedicine();
  });
});
