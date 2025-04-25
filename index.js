import express from 'express';
import helmet from 'helmet';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const app = express();
app.use(helmet());
app.use(express.json());

const TOKEN = process.env.COMMAND_TOKEN;
const WHITELIST = (process.env.ALLOWED_CMDS || 'uptime,whoami,df -h').split(',');

const execAsync = promisify(exec);

app.post('/cmd', async (req, res) => {
  const auth = req.get('Authorization') || '';
  if (!auth.startsWith('Bearer ') || auth.slice(7) !== TOKEN)
    return res.status(401).json({ error: 'unauthorized' });

  const { cmd } = req.body || {};
  if (!cmd || !WHITELIST.includes(cmd.split(' ')[0]))
    return res.status(403).json({ error: 'command not allowed' });

  try {
    const { stdout, stderr } = await execAsync(cmd, { timeout: 15000 });
    res.json({ ok: true, stdout, stderr });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message, stderr: e.stderr });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('API listening on', PORT));
