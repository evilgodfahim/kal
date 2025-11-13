import { PlaywrightCrawler } from '@crawlee/playwright';
import { saveArticle, loadXML } from './xmlManager.js';

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

        console.log(`Found ${articles.length} articles.`);

        // Load existing XML
        const xmlData = await loadXML();

        // Add new articles if any
        for (const article of articles) {
            // Prepend newest first
            xmlData.rss.channel.item.unshift({
                title: article.title,
                link: article.link,
                description: article.image ? `<img src="${article.image}" />` : '',
                pubDate: new Date().toUTCString()
            });
        }

        // Keep only MAX_ITEMS
        xmlData.rss.channel.item = xmlData.rss.channel.item.slice(0, 500);

        // Always write XML, even if no new articles
        await saveArticle({ forceData: xmlData });

        console.log('XML updated.');
    },
});

// Run crawler
await crawler.run([BASE_URL]);
console.log('Scraping done.');