const Xray = require('x-ray');
const x = Xray({
    filters: {
        trim: value => value.trim(),
        fulltrim: value => value.trim().replace(/\n/g, '').replace(/\t/g, ''),
        cardapio_empty: value => value === 'Bebidas' ? false : true
    }
});

module.exports = {
    scrape: scrape = (data = '') => {
        const url = 'http://www.ufc.br/restaurante/cardapio/1-restaurante-universitario-de-fortaleza/' + data;
        return x(url, {
            empty: '.c-cardapios table td | cardapio_empty',
            cafe: {
                bebidas: ['td.bebidas span[class="desc"]'],
                paes: ['td.paes span[class="desc"]'],
                frutas: ['td.frutas span[class="desc"]'],
                especial: ['td.especial span[class="desc"]'],
            },
            almoco: {
                principal: ['table.almoco td.principal span[class="desc"]'],
                vegetariano: 'table.almoco td.vegetariano span[class="desc"]',
                salada: 'table.almoco td.salada span[class="desc"]',
                guarnicao: 'table.almoco td.guarnicao span[class="desc"]',
                acmp: ['table.almoco td.acompanhamento span[class="desc"]'],
                suco: 'table.almoco td.suco span[class="desc"]',
                sobremesa: ['table.almoco td.sobremesa span[class="desc"]'],
            },
            jantar: {
                principal: ['table.jantar td.principal span[class="desc"]'],
                vegetariano: 'table.jantar td.vegetariano span[class="desc"]',
                salada: 'table.jantar td.salada span[class="desc"]',
                guarnicao: 'table.jantar td.guarnicao span[class="desc"]',
                acmp: ['table.jantar td.acompanhamento span[class="desc"]'],
                suco: 'table.jantar td.suco span[class="desc"]',
                sobremesa: ['table.jantar td.sobremesa span[class="desc"]'],
            },
        })
    }
}
