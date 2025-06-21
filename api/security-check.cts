import type { VercelRequest, VercelResponse } from '@vercel/node';
import path from 'path';
import fs from 'fs';

const ONE_HOUR = 60 * 60; // seconds

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { cookies, url = '/' } = req;
  const securityCookie = cookies?.['security_verified'];
  
  // Let Vercel handle its own routes and static assets by not interfering
  const isVercelAsset = url.startsWith('/_vercel');
  const isStaticAsset = /\.(js|css|png|jpg|jpeg|gif|svg|ico|json|txt|webmanifest|map|woff|woff2|ttf|eot)$/i.test(url);
  if (isVercelAsset || isStaticAsset) {
    // This function is a rewrite for all routes, so we can't just "pass through".
    // We can try to serve the file from the "public" or "dist" directory or just return 404
    // and hope Vercel's default behavior takes over. A 404 is safer.
    res.status(404).send('Not found');
    return;
  }

  const isApi = url.startsWith('/api/');
  const isCheckpoint = url.startsWith('/security-check');

  // Basic bot detection
  const userAgent = req.headers['user-agent'] || '';
  const isBot = /bot|crawl|spider|crawling/i.test(userAgent);
  if (isBot) {
    res.status(403).send('Bots are not allowed');
    return;
  }

  // Allow API and checkpoint page through. The API check is now safe because assets are handled.
  if (isApi) {
    res.status(404).send('Not found');
    return;
  }
  if (isCheckpoint) {
    // Serve the checkpoint page
    const filePath = path.join(process.cwd(), 'public', 'security-check.html');
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(fs.readFileSync(filePath, 'utf-8'));
    } else {
      res.status(404).send('Checkpoint page not found');
    }
    return;
  }

  // If already verified, serve the Vite app
  if (securityCookie === 'true') {
    // In Vercel's environment, the built files are in the parent directory.
    // We construct a path to `dist/index.html` which is where Vite places the entry file.
    const indexPath = path.join(process.cwd(), 'dist', 'index.html');
    
    try {
      if (fs.existsSync(indexPath)) {
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(fs.readFileSync(indexPath, 'utf-8'));
      } else {
        // Fallback for cases where the structure might differ
        const rootIndexPath = path.join(process.cwd(), 'index.html');
        if (fs.existsSync(rootIndexPath)) {
            res.setHeader('Content-Type', 'text/html');
            res.status(200).send(fs.readFileSync(rootIndexPath, 'utf-8'));
        } else {
            res.status(404).send('App entry point not found. Please redeploy.');
        }
      }
    } catch (error) {
        console.error("Failed to serve index.html:", error);
        res.status(500).send('Internal Server Error while trying to load the application.');
    }
    return;
  }

  // Not verified, redirect to checkpoint
  const redirectUrl = `/security-check?redirect=${encodeURIComponent(url)}`;
  res.writeHead(302, { Location: redirectUrl });
  res.end();
} 