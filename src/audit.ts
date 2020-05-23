const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
import config from './config';
import { saveReport, getReportDirectory } from './reports';

// see https://github.com/GoogleChrome/lighthouse/blob/master/lighthouse-core/config/constants.js
const lighthouseConfig = {
    extends: 'lighthouse:default',
    settings: {
        // throttling: throttling.mobileSlow4G, 
        emulatedFormFactor: 'desktop' // can ve mobile, table, desktop
    }
};
const opts =  {
    port: config.port,
    disableStorageReset: true
};

export async function audit(url: string) {
    const browser = await puppeteer.launch({
        args: [`--remote-debugging-port=${ config.port }`],
        headless: false,
        executablePath: config.browserPath,
        defaultViewport: {
            width: config.viewportWidth,
            height: config.viewportHeight
        }
    });
    
    const page = await browser.newPage();
    page.setCookie(
        {
            name: '',
            value: '',
            url: url,
            domain: ''
        }
    );

    await login(page, url, '', '');
    await navigateTo(page, '', '');
    await recordAuditForPage(page);

    // Open light house
    // https://googlechrome.github.io/lighthouse/viewer/

    await browser.close();
    return {
        js: true,
        json: true
    };
}

export async function login(page: any, url: string, usernameElement: string, passwordElement: string) {
    await page.goto(url, { timeout: 15000 });
    await page.waitForNavigation();

    const user = await page.$(usernameElement);
    const pwd = await page.$(passwordElement);
    
    await user.type(config.username);
    await pwd.type(config.password);

    await pwd.press('Enter');
    return await page.waitForNavigation();
}

export async function navigateTo(page:any, selectorElement: string, buttonSelector: string) {
    await page.waitForSelector(selectorElement);
    const cpbutton = await page.$(buttonSelector);
    cpbutton.click();
    await page.tracing.start({ path: getReportDirectory(page.url()) + '/dashboard.json', screenshots: true });
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await page.tracing.stop();
}

export async function recordAuditForPage(page: any) {
    let result = await lighthouse(page.url(), opts, lighthouseConfig);
    return saveReport(page.url(), result);
}