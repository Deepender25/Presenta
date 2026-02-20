import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateImage = async (htmlContent, outputPath, width, height) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({ width, height });

  // Set the HTML content
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' }); // Wait for fonts to load

  // Take screenshot
  await page.screenshot({ path: outputPath, type: 'png' });

  await browser.close();
  console.log(`Saved ${outputPath}`);
};

const fontLoader = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Monsieur+La+Doulaise&display=swap');
    body {
      margin: 0;
      padding: 0;
      background-color: #fbfaf6;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }
  </style>
`;

// Banner Background HTML
const bannerHtml = `
  <html>
    <head>${fontLoader}</head>
    <body>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
        <style>
          .logo-text {
            font-family: 'Monsieur La Doulaise', cursive;
            font-size: 240px;
            fill: #1a1a1a;
            stroke: #1a1a1a;
            stroke-width: 3.5px;
            stroke-linecap: round;
            stroke-linejoin: round;
          }
          .logo-path {
            fill: none;
            stroke: #1a1a1a;
            stroke-width: 4.5px;
            stroke-linecap: round;
          }
        </style>
        <g transform="translate(100, 0)">
          <text x="500" y="315" text-anchor="middle" class="logo-text" dominant-baseline="middle">Presenta</text>
        </g>
      </svg>
    </body>
  </html>
`;

// Square Logo HTML
const squareHtml = `
  <html>
    <head>
      ${fontLoader}
      <style>
        .container {
          width: 500px;
          height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #fbfaf6;
        }
        .logo-text {
          font-family: 'Monsieur La Doulaise', cursive;
          font-size: 380px;
          color: #1a1a1a;
          margin: 0;
          padding: 0;
          line-height: 1;
          -webkit-text-stroke: 4px #1a1a1a;
          transform: translateY(-5%); /* Minor optical adjustment for cursive baselines */
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0;">
      <div class="container">
        <h1 class="logo-text">P</h1>
      </div>
    </body>
  </html>
`;

const run = async () => {
  await generateImage(bannerHtml, path.join(__dirname, 'public', 'preview-image.png'), 1200, 630);
  await generateImage(squareHtml, path.join(__dirname, 'public', 'logo-square.png'), 500, 500);
}

run();
