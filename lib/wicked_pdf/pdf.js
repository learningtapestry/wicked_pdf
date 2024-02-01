"use strict";
const puppeteer = require(`${process.argv[2]}/puppeteer`);

const createPdf = async options => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: options.puppeteerHeadlessNewMode ? 'new' : true,
      args: [
        "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas", "--disable-gpu",
        "--disable-software-rasterizer", "--export-tagged-pdf"]
    });
    const page = await browser.newPage();
    await page.goto(options.input, { waitUntil: ['domcontentloaded', 'networkidle0'], timeout: options.timeout || 0 });
    delete options.input;
    delete options.puppeteerHeadlessNewMode;
    await page.pdf(options);
  } catch (err) {
    const executablePath = puppeteer.executablePath();
    console.log(err.message + "; executablePath: " + executablePath);
    process.stderr.write(err.message + "; executablePath: " + executablePath);
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
      top: "10mm",
      bottom: "10mm",
      left: "10mm",
      right: "10mm"
    },
    landscape: false,
    format: "A4", // Format takes precedence over width and height if set
    height: "297", // A4
    width: "210", // A4
    path: process.argv[process.argv.length - 1],
    input: process.argv[process.argv.length - 2],
    scale: 1.0,
    displayHeaderFooter: false,
    printBackground: true,
    footerTemplate: '',
    headerTemplate: ''
  };
  for (let i = 3; i < process.argv.length - 2; i += 2) {
    const value = process.argv[i + 1];
    switch (process.argv[i]) {
      case "--page-size":
        options.format = value;
        break;
      case "--orientation":
        options.landscape = value === "Landscape";
        break;
      case "--zoom":
        options.scale = parseFloat(value);
        break;
      case "--page-width":
        delete options.format;
        options.width = value;
        break;
      case "--footer":
        options.displayHeaderFooter = true;
        options.footerTemplate = value;
        break;
      case "--header":
        options.displayHeaderFooter = true;
        options.headerTemplate = value;
        break;
      case "--page-height":
        delete options.format;
        options.height = value;
        break;
      case "--margin-top":
        options.margin.top = value;
        break;
      case "--margin-bottom":
        options.margin.bottom = value;
        break;
      case "--margin-left":
        options.margin.left = value;
        break;
      case "--margin-right":
        options.margin.right = value;
        break;
      case "--page-range":
        options.pageRanges = value;
        break;
      case "--puppeteer-timeout":
        options.timeout = parseInt(value);
        break;
      case "--puppeteer-headless-mode":
        // if to pass as new new headless mode will be used, other values will use old mode
        // details are here - https://developer.chrome.com/docs/chromium/new-headless
        // it's recommended to test against new mode and upgrade puppeteer to the latest version
        options.puppeteerHeadlessNewMode = value === "new";
        break;
      default:
        console.log("Unknown argument: " + value);
    }
  }
  return options;
};
createPdf(parseCmd());
