/* ==========================================================
   chatbot.js - basic rule-based health chatbot (chatbot.html)
   How it works (easy to explain in a viva):
   1. The user's message is converted to lowercase.
   2. We first look for EMERGENCY words.
   3. Otherwise we compare the message with keyword lists in
      KNOWLEDGE and choose the entry with the best match.
   4. If nothing matches, a polite fallback answer is shown.
   It gives GENERAL information only - no diagnosis, no treatment.
   ========================================================== */

// Messages that mean "get urgent help" - checked first
const EMERGENCY_WORDS = [
  "chest pain", "cant breathe", "can't breathe", "cannot breathe", "difficulty breathing",
  "trouble breathing", "shortness of breath", "unconscious", "not breathing", "severe bleeding",
  "heart attack", "stroke", "seizure", "overdose", "poison", "choking"
];
const SELF_HARM_WORDS = ["suicide", "kill myself", "end my life", "want to die", "self harm", "self-harm"];

const KNOWLEDGE = [
  {
    keywords: ["hello", "hi", "hey", "good morning", "good evening"],
    answer: "Hello! I am the Smart Healthcare assistant. You can ask me general health questions, such as \"What is a fever?\" or \"When should I see a doctor?\""
  },
  {
    keywords: ["what is a fever", "what is fever", "fever", "high temperature"],
    answer: "A fever is a temporary rise in body temperature, usually above about 38 C (100.4 F). It is often a sign that the body is fighting an infection.\n\nGeneral tips: rest, drink plenty of fluids and wear light clothing. See a doctor if the fever is very high, lasts more than 2-3 days, or comes with a stiff neck, rash, confusion or breathing trouble. Take babies with a fever to a doctor promptly."
  },
  {
    keywords: ["dehydration", "dehydrated", "not drinking enough water"],
    answer: "Dehydration happens when the body loses more fluid than it takes in, for example through sweating, vomiting or diarrhoea.\n\nCommon signs: thirst, dry mouth, dark yellow urine, tiredness, dizziness and headache.\n\nGeneral prevention: drink fluids regularly, especially in hot weather or during illness. Seek medical care if someone cannot keep fluids down, is very drowsy or confused, or passes very little urine."
  },
  {
    keywords: ["healthy lifestyle", "stay healthy", "be healthy", "maintain health", "healthy life", "healthy habits"],
    answer: "General habits that support good health:\n- Eat a balanced diet with vegetables, fruit, whole grains and protein\n- Be active for about 150 minutes a week (for example brisk walking)\n- Sleep 7-9 hours (adults)\n- Drink enough water\n- Avoid tobacco and limit alcohol\n- Manage stress and keep in touch with friends and family\n- Go for regular check-ups and recommended vaccinations"
  },
  {
    keywords: ["when should i see a doctor", "when to see a doctor", "see a doctor", "visit a doctor", "consult a doctor", "should i see"],
    answer: "It is a good idea to see a doctor if you have:\n- Symptoms that last longer than expected or keep getting worse\n- A high fever that does not settle\n- Pain that is severe or unexplained\n- Unexplained weight loss or lasting tiredness\n- Ongoing cough, or blood in cough, urine or stools\n\nGo to emergency care straight away for chest pain, difficulty breathing, sudden weakness or confusion, severe bleeding or loss of consciousness. You can book a visit on the Doctors page."
  },
  {
    keywords: ["common cold", "cold symptoms", "symptoms of cold", "what is a cold", "runny nose", "sneezing"],
    answer: "Common cold symptoms include a runny or blocked nose, sneezing, sore throat, mild cough, watery eyes and feeling tired. Symptoms usually improve within 7-10 days.\n\nRest, fluids and good hand washing help. See a doctor if symptoms last longer than 10 days, get worse, or you have a high fever or trouble breathing."
  },
  {
    keywords: ["headache", "head pain", "migraine"],
    answer: "Headaches are common and often linked to stress, poor sleep, dehydration, long screen time or skipped meals. Resting in a quiet place, drinking water and regular sleep can help.\n\nSee a doctor promptly if a headache is sudden and severe, follows a head injury, or comes with fever and stiff neck, vision changes, weakness or confusion."
  },
  {
    keywords: ["cough", "coughing"],
    answer: "A cough is the body's way of clearing the airways. Short coughs are often caused by colds or irritation. Warm fluids and rest may soothe it.\n\nSee a doctor if a cough lasts more than 2-3 weeks, brings up blood, or comes with breathlessness, chest pain, fever or weight loss."
  },
  {
    keywords: ["sore throat", "throat pain"],
    answer: "A sore throat is often caused by a viral infection. Warm drinks, rest and gargling with warm salt water may bring comfort.\n\nSee a doctor if it lasts longer than a week, if swallowing or breathing is difficult, or if you have a high fever."
  },
  {
    keywords: ["sleep", "insomnia", "cant sleep", "can't sleep"],
    answer: "Good sleep habits: keep regular sleep and wake times, avoid caffeine late in the day, limit screens before bed, keep the room dark and cool, and avoid heavy meals late at night. If sleep problems last for weeks, talk to a doctor."
  },
  {
    keywords: ["stress", "anxiety", "anxious", "depressed", "mental health", "feeling low"],
    answer: "Feeling stressed or low sometimes is common. Helpful steps include talking to someone you trust, regular exercise, enough sleep, and short breaks from work or study.\n\nIf these feelings last for weeks or affect daily life, please speak with a doctor or a mental health professional. You do not have to manage this alone."
  },
  {
    keywords: ["exercise", "workout", "physical activity", "fitness"],
    answer: "Most adults benefit from about 150 minutes of moderate activity each week, such as brisk walking, cycling or swimming, plus muscle-strengthening activity on 2 days. Start slowly and increase gradually. Check with a doctor first if you have a health condition or have been inactive for a long time."
  },
  {
    keywords: ["diet", "nutrition", "balanced diet", "what to eat", "healthy food"],
    answer: "A balanced diet includes vegetables and fruit, whole grains, protein (pulses, eggs, fish, lean meat or dairy) and healthy fats, while limiting sugary drinks, salt and heavily processed food. Eating regular meals and drinking enough water also helps."
  },
  {
    keywords: ["water", "how much water", "hydration"],
    answer: "Needs vary with age, weather and activity, but many adults do well with around 6-8 glasses of fluid a day. Pale yellow urine is a simple sign of good hydration."
  },
  {
    keywords: ["blood pressure", "hypertension"],
    answer: "Blood pressure is the force of blood against artery walls. High blood pressure often has no symptoms, so regular checks are important. Less salt, regular activity, a healthy weight and not smoking all help. Only a doctor can tell you what your readings mean."
  },
  {
    keywords: ["diabetes", "blood sugar", "sugar level"],
    answer: "Diabetes is a condition where blood sugar stays too high. Common signs include increased thirst, frequent urination, tiredness and blurred vision. It needs proper testing and medical care. A healthy diet, regular activity and check-ups are important parts of prevention and management."
  },
  {
    keywords: ["hand wash", "hygiene", "wash hands", "prevent infection"],
    answer: "Washing hands with soap and water for at least 20 seconds (before eating, after using the toilet, and after coughing or sneezing) is one of the best ways to prevent infections. Cover coughs and sneezes and stay home when unwell."
  },
  {
    keywords: ["vaccine", "vaccination", "immunization"],
    answer: "Vaccines help the body build protection against certain diseases. Your doctor or local health department can tell you which vaccines are recommended for your age and situation."
  },
  {
    keywords: ["book appointment", "book an appointment", "make an appointment", "how to book"],
    answer: "To book an appointment: 1) Register and log in, 2) open the Doctors page or Appointments page, 3) choose a doctor, a future date and a free time slot, 4) enter the reason for your visit and press Book Appointment. You will get an Appointment ID as confirmation."
  },
  {
    keywords: ["medicine information", "medicine", "tablet", "drug"],
    answer: "You can read general information about some common medicines on the Medicines page. For advice about your own medicines, please ask a doctor or pharmacist. I cannot recommend medicines or doses."
  },
  {
    keywords: ["thank", "thanks"],
    answer: "You are welcome! Take care. Ask me anything else about general health."
  },
  {
    keywords: ["bye", "goodbye"],
    answer: "Goodbye! Stay healthy."
  }
];

const FALLBACK_ANSWER = "I am not sure about that one. I can only answer basic general health questions, for example about fever, dehydration, colds, healthy habits, sleep or when to see a doctor.\n\nFor anything specific to you, please consult a qualified doctor. You can book one on the Doctors page.";

// Make a message easy to compare: lowercase, no punctuation except apostrophes
function cleanText(text) {
  return " " + text.toLowerCase().replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim() + " ";
}

// Returns an object { text, emergency } for the given user message
function chatbotResponse(message) {
  const text = cleanText(message);

  // Step 1: emergency or self-harm words
  if (SELF_HARM_WORDS.some(function (w) { return text.includes(cleanText(w)); })) {
    return {
      emergency: true,
      text: "I am really sorry you are feeling this way. You deserve support right now.\n\nPlease contact your local emergency number or a crisis helpline immediately (for example 988 in the US or Tele-MANAS 14416 in India), or tell someone you trust who can stay with you. I cannot give medical care, but a real person can help."
    };
  }
  if (EMERGENCY_WORDS.some(function (w) { return text.includes(cleanText(w)); })) {
    return {
      emergency: true,
      text: "These symptoms can be serious. Please call your local emergency number now (for example 112 in India or 911 in the US) or go to the nearest emergency department. Do not wait for an online answer."
    };
  }

  // Step 2: find the knowledge entry with the best keyword match.
  // Longer matching phrases score higher than short words.
  let best = null;
  let bestScore = 0;
  KNOWLEDGE.forEach(function (entry) {
    let score = 0;
    entry.keywords.forEach(function (keyword) {
      if (text.includes(cleanText(keyword))) score += keyword.length;
    });
    if (score > bestScore) { bestScore = score; best = entry; }
  });

  return { emergency: false, text: best ? best.answer : FALLBACK_ANSWER };
}

/* ---------- Chat window ---------- */
function addMessage(text, who, extraClass) {
  const win = document.getElementById("chatWindow");
  const bubble = document.createElement("div");
  bubble.className = "msg " + who + (extraClass ? " " + extraClass : "");
  bubble.textContent = text;            // textContent = safe, no HTML injection
  win.appendChild(bubble);
  win.scrollTop = win.scrollHeight;
  return bubble;
}

function sendMessage(event) {
  if (event) event.preventDefault();
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  if (message === "") { input.focus(); return; }
  if (message.length > 300) { addMessage("Please keep your question under 300 characters.", "bot"); return; }

  addMessage(message, "user");
  input.value = "";

  // Small "typing" pause to feel natural
  const typing = addMessage("Typing...", "bot", "typing");
  setTimeout(function () {
    typing.remove();
    const reply = chatbotResponse(message);
    addMessage(reply.text, "bot", reply.emergency ? "emergency" : "");
  }, 600);
}

// Suggestion buttons under the chat
function askSuggestion(question) {
  document.getElementById("chatInput").value = question;
  sendMessage();
}

function clearChat() {
  document.getElementById("chatWindow").innerHTML = "";
  addMessage("Chat cleared. Ask me a general health question whenever you are ready.", "bot");
}

document.addEventListener("DOMContentLoaded", function () {
  if (!document.getElementById("chatWindow")) return;
  document.getElementById("chatForm").addEventListener("submit", sendMessage);
  document.getElementById("clearChat").addEventListener("click", clearChat);
  addMessage("Hello! I can answer general health questions. Try one of the suggestions below or type your own.", "bot");
});
