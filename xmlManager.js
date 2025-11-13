import fs from 'fs-extra';
import { parseStringPromise, Builder } from 'xml2js';

const XML_FILE = './articles.xml';
const MAX_ITEMS = 500;

export async function loadXML() {
    if (!fs.existsSync(XML_FILE)) return { articles: { article: [] } };
    const content = await fs.readFile(XML_FILE, 'utf8');
    const data = await parseStringPromise(content);
    data.articles.article = data.articles.article || [];
    return data;
}

export async function saveArticle(article) {
    const data = await loadXML();
    data.articles.article.unshift(article); // newest first
    if (data.articles.article.length > MAX_ITEMS) {
        data.articles.article = data.articles.article.slice(0, MAX_ITEMS);
    }
    const builder = new Builder({ xmldec: { version: '1.0', encoding: 'UTF-8' } });
    const xml = builder.buildObject(data);
    await fs.writeFile(XML_FILE, xml, 'utf8');
}
