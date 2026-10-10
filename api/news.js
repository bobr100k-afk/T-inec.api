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
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'cs-CZ,cs;q=0.9,en;q=0.8'
            },
            timeout: 10000
        });

        const $ = cheerio.load(data);
        const articles = [];

        // Универсальный поиск по всем ссылкам и карточкам eHutník
        $('a').each((i, element) => {
            const $link =$(element);
            const title = $link.text().trim();
            let href = $link.attr('href') || '';

            // Фильтруем заголовок (длиной от 15 символов, чтобы исключить меню и кнопки)
            if (title.length > 15 && href.length > 3) {
                if (href.startsWith('/')) {
                    href = `https://ehutnik.cz${href}`;
                }

                // Ищем даты внутри родительских тегов
                const $parent =$link.closest('div, li, article, section, p');
                let dateStr = '';
                
                // Поиск тегов времени или текста с датой
                const timeText = $parent.find('time, .date, .time, .published, span').text().trim();
                const dateMatch = (timeText + ' ' + $parent.text()).match(/\b\d{1,2}\.\s*\d{1,2}\.\s*\d{4}\b/);

                if (dateMatch) {
                    dateStr = dateMatch[0].replace(/\s+/g, '');
                } else {
                    // Если дата на главной не указана явно, ставим дату сканирования
                    const now = new Date();
                    const d = String(now.getDate()).padStart(2, '0');
                    const m = String(now.getMonth() + 1).padStart(2, '0');
                    dateStr = `${d}.${m}.${now.getFullYear()}`;
                }

                // Получаем описание из контейнера
                let desc = $parent.find('p, .excerpt, .desc').not($link).text().trim();
                if (!desc || desc === title) {
                    desc = 'Aktuální zpráva z regionu Třinecko na eHutník.cz.';
                }

                // Убираем дубликаты новостей
                const isDuplicate = articles.some(item => item.title === title || item.link === href);
                if (!isDuplicate && articles.length < 20) {
                    articles.push({
                        title,
                        desc: desc.length > 160 ? desc.substring(0, 160) + '...' : desc,
                        link: href,
                        tag: 'EHÚTNÍK / REGION',
                        date: dateStr
                    });
                }
            }
        });

        return res.status(200).json({ success: true, count: articles.length, articles });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: 'Не удалось распарсить ehutnik.cz',
            details: error.message 
        });
    }
};
