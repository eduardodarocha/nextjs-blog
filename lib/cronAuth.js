// A missing secret and a wrong secret are different problems, so they get
// different status codes — otherwise the logs cannot tell them apart.
export function authenticateCron(req, res) {
  const authHeader = req.headers.authorization || '';
  const cronSecret = process.env.CRON_SECRET;

  console.log('[cron] invoked', {
    path: req.url,
    ua: req.headers['user-agent'],                   // 'vercel-cron/1.0' when Vercel calls
    schedule: req.headers['x-vercel-cron-schedule'],
    hasSecret: Boolean(cronSecret),
    hasAuthHeader: Boolean(authHeader),
  });

  if (process.env.NODE_ENV === 'production') {
    if (!cronSecret) {
      console.error('[cron] CRON_SECRET is not set in this environment');
      res.status(500).json({ error: 'CRON_SECRET not configured.' });
      return false;
    }
    if (authHeader.trim() !== `Bearer ${cronSecret.trim()}`) {
      console.error('[cron] auth mismatch');
      res.status(401).json({ error: 'Unauthorized cron request.' });
      return false;
    }
  } else if (cronSecret && authHeader.trim() !== `Bearer ${cronSecret.trim()}`) {
    res.status(401).json({ error: 'Unauthorized cron request.' });
    return false;
  }

  return true;
}
