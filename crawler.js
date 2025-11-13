import { PlaywrightCrawler, Dataset } from '@crawlee/playwright';
import playwright from 'playwright-extra';
import StealthPlugin from 'playwright-extra-plugin-stealth';
import { saveArticle } from './xmlManager.js';

playwright.use(StealthPlugin());

const BASE_URL = 'https://www.kalbela.com/ajkerpatrika';

const crawler = new PlaywrightCrawler({
    headless: true,
    async requestHandler({ page, enqueueLinks }) {
        const articles = await page.$$eval('.common-card-content', cards => {
            return cards.map(card => {
                const title = card.querySelector('h5.title')?.innerText.trim();
                const link = card.querySelector('a.link')?.href;
                const image = card.querySelector('img.news_img')?.src;
                return { title, link, image };
            }).filter(a => a.title && a.link);
        });

        for (const article of articles) {
            await saveArticle({
                title: article.title,
                link: article.link,
                image: article.image || '',
                date: new Date().toISOString()
            });
        }
    },
});

await crawler.run([BASE_URL]);
console.log('Scraping done.');
