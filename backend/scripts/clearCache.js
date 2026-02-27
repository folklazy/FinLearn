require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
Promise.all([
    p.apiCache.deleteMany({ where: { provider: 'yahoo' } }),
    p.apiCache.deleteMany({ where: { dataType: 'full' } }),
    p.apiCache.deleteMany({ where: { dataType: 'history' } }),
]).then(function(results) {
    console.log('yahoo cleared:', results[0].count, '| full cleared:', results[1].count, '| history cleared:', results[2].count);
    return p.$disconnect();
}).catch(function(e) { console.error(e); process.exit(1); });
