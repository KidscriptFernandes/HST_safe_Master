import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import handler from './api/init-webrtc.js'
import inferHandler from './api/infer-workflow.js'
import fs from 'fs'
import path from 'path'

function writeLog(message) {
  try {
    const logFile = path.resolve('api-logs.txt');
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${message}\n`, 'utf8');
  } catch (err) {
    console.error('Failed to write to api-logs.txt:', err);
  }
}

export default defineConfig(({ mode }) => {
  // Load env variables (including ROBOFLOW_API_KEY)
  const env = loadEnv(mode, process.cwd(), '');
  // Assign them to process.env
  process.env = { ...process.env, ...env };

  writeLog(`Vite config loaded. Mode: ${mode}. ROBOFLOW_API_KEY present: ${!!process.env.ROBOFLOW_API_KEY}`);

  return {
    plugins: [
      react(),
      {
        name: 'vercel-api-emulator',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.startsWith('/api/init-webrtc')) {
              writeLog(`Request received: ${req.method} ${req.url}`);

              // Add status and json helpers to res (Vercel/Express compatible)
              res.status = (code) => {
                res.statusCode = code;
                return res;
              };
              res.json = (data) => {
                writeLog(`Response Status: ${res.statusCode || 200}`);
                writeLog(`Response Data: ${JSON.stringify(data).substring(0, 500)}...`);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return res;
              };

              // Read request body if method is POST
              if (req.method === 'POST') {
                let body = '';
                for await (const chunk of req) {
                  body += chunk;
                }
                writeLog(`Request raw body length: ${body.length}`);
                if (body) {
                  try {
                    req.body = JSON.parse(body);
                  } catch (err) {
                    writeLog(`JSON parse error: ${err.message}`);
                    res.status(400).json({ message: 'Invalid JSON body' });
                    return;
                  }
                }
              }

              // Call the Vercel handler
              try {
                await handler(req, res);
              } catch (err) {
                writeLog(`API execution error: ${err.stack || err.message || err}`);
                console.error('Error running api handler:', err);
                if (!res.writableEnded) {
                  res.status(500).json({ message: err.message || 'Internal server error' });
                }
              }
            } else if (req.url && req.url.startsWith('/api/infer-workflow')) {
              writeLog(`Request received: ${req.method} ${req.url}`);

              // Add status and json helpers to res (Vercel/Express compatible)
              res.status = (code) => {
                res.statusCode = code;
                return res;
              };
              res.json = (data) => {
                writeLog(`Response Status: ${res.statusCode || 200}`);
                writeLog(`Response Data: ${JSON.stringify(data).substring(0, 500)}...`);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return res;
              };

              // Read request body if method is POST
              if (req.method === 'POST') {
                let body = '';
                for await (const chunk of req) {
                  body += chunk;
                }
                writeLog(`Request raw body length: ${body.length}`);
                if (body) {
                  try {
                    req.body = JSON.parse(body);
                  } catch (err) {
                    writeLog(`JSON parse error: ${err.message}`);
                    res.status(400).json({ message: 'Invalid JSON body' });
                    return;
                  }
                }
              }

              // Call the Vercel handler
              try {
                await inferHandler(req, res);
              } catch (err) {
                writeLog(`API execution error: ${err.stack || err.message || err}`);
                console.error('Error running api handler:', err);
                if (!res.writableEnded) {
                  res.status(500).json({ message: err.message || 'Internal server error' });
                }
              }
            } else {
              next();
            }
          });
        }
      }
    ],
  };
})
