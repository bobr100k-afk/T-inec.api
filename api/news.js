const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { data } = await axios.get('https://ehutnik.cz/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 8000
        });

        const $ = cheerio.load(data);
        const articles = [];

        $('article, .post, .news-item').each((i, element) => {
            if (i >= 12) return;

            const titleElement = $(element).find('h2, h3, .entry-title, .post-title').first();
            const title = titleElement.text().trim();
            
            const linkElement = $(element).find('a').first();
            let link = linkElement.attr('href') || 'https://ehutnik.cz/';
            if (link.startsWith('/')) {
                link = `https://ehutnik.cz${link}`;
            }

            const descElement = $(element).find('p, .entry-summary, .post-excerpt').first();
            const desc = descElement.text().trim() || 'Zpráva z regionu Třinecko.';

            const dateElement = $(element).find('time, .date, .post-date').first();
            let date = dateElement.text().trim() || '10.10.2026';

            if (title.length > 5) {
                articles.push({
                    title,
                    desc: desc.length > 150 ? desc.substring(0, 150) + '...' : desc,
                    link,
                    tag: 'EHÚTNÍK / TŘINEC',
                    date
                });
            }
        });

        return res.status(200).json({ success: true, count: articles.length, articles });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch news from ehutnik.cz',
            details: error.message 
        });
    }
};
