'use strict';

const puppeteer = require(`${process.argv[2]}/puppeteer`);

(async () => {
  const createPdf = async (options) => {
    let browser;
    try {
      const browserParams = {
        args: [
          // common flags to speed up the process
          '--disable-features=IsolateOrigins',
          '--disable-site-isolation-trials',
          '--autoplay-policy=user-gesture-required',
          '--disable-background-networking',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-breakpad',
          '--disable-client-side-phishing-detection',
          '--disable-component-update',
          '--disable-default-apps',
          '--disable-dev-shm-usage',
          '--disable-domain-reliability',
          '--disable-extensions',
          '--disable-features=AudioServiceOutOfProcess',
          '--disable-hang-monitor',
          '--disable-ipc-flooding-protection',
          '--disable-notifications',
          '--disable-offer-store-unmasked-wallet-cards',
          '--disable-popup-blocking',
          '--disable-print-preview',
          '--disable-prompt-on-repost',
          '--disable-renderer-backgrounding',
          '--disable-setuid-sandbox',
          '--disable-speech-api',
          '--disable-sync',
          '--hide-scrollbars',
          '--ignore-gpu-blacklist',
          '--metrics-recording-only',
          '--mute-audio',
          '--no-default-browser-check',
          '--no-first-run',
          '--no-pings',
          '--no-sandbox',
          '--no-zygote',
          '--password-store=basic',
          '--use-gl=swiftshader',
          '--use-mock-keychain',
          // pdf related flags
          '--deterministic-mode',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--disable-skia-runtime-opts',
          '--disable-software-rasterizer',
          '--export-tagged-pdf',
          '--font-render-hinting=none',
          '--force-color-profile=srgb',
        ],
      }

      if (options.useFirefox) {
        browserParams.browser = 'firefox';
        browserParams.ignoreHTTPSErrors=  true;
        const firefoxPath = process.env.PUPPETEER_FIREFOX_EXECUTABLE_PATH;
        if (firefoxPath && firefoxPath.trim() !== '') {
          browserParams.executablePath = firefoxPath;
        }
      } else {
        browserParams.headless = options.puppeteerHeadlessNewMode ? 'new' : true;
        const chromePath = process.env.PUPPETEER_EXECUTABLE_PATH;
        if (!chromePath || chromePath.trim() !== '') {
          browserParams.executablePath = chromePath;
        }
      }

      browser = await puppeteer.launch(browserParams);

      const page = await browser.newPage();
      await page.goto(options.input, {
        waitUntil: ['domcontentloaded', 'networkidle0'],
        timeout: options.timeout || 0,
      });
      delete options.input;
      delete options.puppeteerHeadlessNewMode;
      await page.pdf(options);
    } catch (err) {
      // Show an error here because `puppeteer.executablePath()` can raise an error too
      console.log('Error: ' + err.message);
      const executablePath = puppeteer.executablePath();
      console.log('executablePath: ' + executablePath);
      process.stderr.write('Error: ' + err.message);
      process.stderr.write('executablePath: ' + executablePath);
    } finally {
      if (browser) {
        await browser.close();
      }
      process.exit();
    }
  };

  const parseCmd = () => {
    let options = {
      margin: {
        top: '10mm',
        bottom: '10mm',
        left: '10mm',
        right: '10mm',
      },
      landscape: false,
      format: 'A4', // Format takes precedence over width and height if set
      height: '297', // A4
      width: '210', // A4
      path: process.argv[process.argv.length - 1],
      input: process.argv[process.argv.length - 2],
      scale: 1.0,
      displayHeaderFooter: false,
      printBackground: true,
      footerTemplate: '',
      headerTemplate: '',
      tagged: true,
    };
    for (let i = 3; i < process.argv.length - 2; i += 2) {
      const value = process.argv[i + 1];
      switch (process.argv[i]) {
        case '--page-size':
          options.format = value;
          break;
        case '--orientation':
          options.landscape = value === 'Landscape';
          break;
        case '--zoom':
          options.scale = parseFloat(value);
          break;
        case '--page-width':
          delete options.format;
          options.width = value;
          break;
        case '--footer':
          options.displayHeaderFooter = true;
          options.footerTemplate = value;
          break;
        case '--header':
          options.displayHeaderFooter = true;
          options.headerTemplate = value;
          break;
        case '--page-height':
          delete options.format;
          options.height = value;
          break;
        case '--margin-top':
          options.margin.top = value;
          break;
        case '--margin-bottom':
          options.margin.bottom = value;
          break;
        case '--margin-left':
          options.margin.left = value;
          break;
        case '--margin-right':
          options.margin.right = value;
          break;
        case '--page-range':
          options.pageRanges = value;
          break;
        case '--puppeteer-timeout':
          options.timeout = parseInt(value);
          break;
        case '--puppeteer-headless-mode':
          // if to pass, as new headless mode will be used, other values will use old mode
          // details are here - https://developer.chrome.com/docs/chromium/new-headless
          // it's recommended to test against the new mode and upgrade puppeteer to the latest version
          options.puppeteerHeadlessNewMode = value === 'new';
          break;
        case '--ld-preload-override':
          // This is a special case to override the LD_PRELOAD environment variable.
          // When using Chromium, it is possible that its binary is built using
          // a different memory allocator than passed in the environment variable.
          process.env.LD_PRELOAD = value;
          break;
        case '--use-firefox':
          options.useFirefox = value === 'true';
          break;
        default:
          console.log('Unknown argument: ' + value);
      }
    }
    return options;
  };

  const cmdOptions = parseCmd();
  await createPdf(cmdOptions);
})();
