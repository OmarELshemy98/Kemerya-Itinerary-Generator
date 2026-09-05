const cheerio = require('cheerio');
const https = require('https');
const url = 'https://www.kemeryatours.com/egypt-day-tours/cairo-day-tours';

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
  let html = '';
  res.on('data', (c) => html += c);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    const $ = cheerio.load(html);

    console.log('\n=== 1. Looking for tour-card/card elements ===');
    const found = $('.tour-card, .card, a.tour-card, .tour-card.card, [class*="tour"]');
    console.log('total matches:', found.length);
    found.each((i, el) => {
      if (i > 8) return false;
      const cls = el.attribs.class || '';
      const tag = el.tagName;
      const href = el.attribs.href || '';
      const h3 = $(el).find('h3,h2,h4').first().text().trim();
      console.log(`  [${i}] <${tag}> class="${cls.substring(0,100)}" href=${href.substring(0, 80)} h=${h3.substring(0, 70)}`);
    });

    console.log('\n=== 2. All <a> tags with 6+ path parts (likely tour links) ===');
    let linksFound = 0;
    $('a').each((_, el) => {
      const h = el.attribs.href || '';
      const abs = h.startsWith('http') ? h : (h.startsWith('/') ? 'https://www.kemeryatours.com' + h : '');
      if (!abs) return;
      const parts = abs.split('/').filter(Boolean);
      if (parts.length >= 6 && /tour/i.test(abs)) {
        const txt = $(el).text().trim().replace(/\s+/g,' ').substring(0, 90);
        console.log(`  ${abs.substring(0, 120)}`);
        console.log(`      text="${txt}"`);
        linksFound++;
        if (linksFound > 12) return false;
      }
    });

    console.log('\n=== 3. Check if page is redirect / captcha ===');
    const title = $('title').text();
    console.log('Page title:', title);
    const bodyText = $('body').text().replace(/\s+/g,' ').substring(0, 400);
    console.log('Body snippet:', bodyText);
  });
}).on('error', (e) => console.error('ERR', e.message));
