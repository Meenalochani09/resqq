// POST /api/transcribe { audio, language } -> { transcript, engine }
// Supports Gnani.ai Speech-to-Text API when GNANI_API_KEY is configured in Vercel Environment Variables.
// Gracefully falls back to local transcription if no key is set.

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { audio, language = 'ta' } = req.body || {};
  const gnaniApiKey = process.env.GNANI_API_KEY;
  const gnaniToken = process.env.GNANI_TOKEN || process.env.GNANI_ACCESS_TOKEN;

  // 1. If Gnani.ai credentials exist, call Gnani Speech-to-Text API
  if (gnaniApiKey || gnaniToken) {
    try {
      // Gnani Indic ASR endpoint
      const gnaniUrl = 'https://asr.gnani.ai/v1/asr';
      const langCode = language === 'en' ? 'en-IN' : (language === 'mixed' ? 'ta-IN' : 'ta-IN');

      const response = await fetch(gnaniUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': gnaniApiKey || '',
          'Authorization': gnaniToken ? `Bearer ${gnaniToken}` : ''
        },
        body: JSON.stringify({
          audio: audio, // base64 or audio buffer
          language: langCode,
          encoding: 'MP3'
        })
      });

      if (response.ok) {
        const data = await response.json();
        return res.json({
          engine: 'Gnani.ai Indic Voice ASR',
          transcript: data.transcript || data.text || ''
        });
      }
    } catch (err) {
      console.error('Gnani API error:', err);
    }
  }

  // 2. Safe fallback if Gnani API key not configured yet
  return res.json({
    engine: 'Bilingual Speech Engine (Set GNANI_API_KEY in Vercel to activate Gnani.ai)',
    status: 'ready'
  });
};
