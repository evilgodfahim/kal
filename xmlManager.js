import fs from 'fs-extra';
import { parseStringPromise, Builder } from 'xml2js';

const XML_FILE = './articles.xml';
const MAX_ITEMS = 500;

export async function loadXML() {
    if (!fs.existsSync(XML_FILE)) return { rss: { $: { version: '2.0' }, channel: { title: "Kalbela News", link: "https://www.kalbela.com/ajkerpatrika", description: "Latest news from Kalbela.com", item: [] } } };
    const content = await fs.readFile(XML_FILE, 'utf8');
    const data = await parseStringPromise(content);
    data.rss.channel.item = data.rss.channel.item || [];
    return data;
}

export async function saveArticle(article) {
    const data = await loadXML();

    // Create RSS <item>
    const rssItem = {
        title: article.title,
        link: article.link,
        description: article.image ? `<img src="${article.image}" />` : '',
        pubDate: new Date(article.date).toUTCString()
    };

    // Add newest first
    data.rss.channel.item.unshift(rssItem);

    // Limit to MAX_ITEMS
    if (data.rss.channel.item.length > MAX_ITEMS) {
        data.rss.channel.item = data.rss.channel.item.slice(0, MAX_ITEMS);
    }

    const builder = new Builder({ xmldec: { version: '1.0', encoding: 'UTF-8' } });
    const xml = builder.buildObject(data);
    await fs.writeFile(XML_FILE, xml, 'utf8');
}
