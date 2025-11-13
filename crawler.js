import { PlaywrightCrawler } from '@crawlee/playwright';
import { saveArticle } from './xmlManager.js';

const BASE_URL = 'https://www.kalbela.com/ajkerpatrika';

const crawler = new PlaywrightCrawler({
    headless: true,
    launchContext: {
        launchOptions: {
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    },
    async requestHandler({ page }) {
        // Wait for the news cards to load
        await page.waitForSelector('.common-card-content');

        // Extract all articles
        const articles = await page.$$eval('.common-card-content', cards => {
            return cards.map(card => {
                const title = card.querySelector('h5.title')?.innerText.trim();
                const link = card.querySelector('a.link')?.href;
                const image = card.querySelector('img.news_img')?.src;
                return { title, link, image };
            }).filter(a => a.title && a.link);
        });

        // Save to XML
        for (const article of articles) {
            await saveArticle({
                title: article.title,
                link: article.link,
                image: article.image || '',
                date: new Date().toISOString(),
            });
        }

        console.log(`Saved ${articles.length} articles.`);
    },
});

await crawler.run([BASE_URL]);
console.log('Scraping done.');
