#!/usr/bin/env node
var nf = require('format-number-with-string');
require('table-master');

var fs = require('fs');
var root = __dirname + '/../data/bank/csv/';
var RE_LINE = /^\uFEFF?"(\d{2})\/(\d{2})\/(\d{4})","(.+?)","(-?\d+\.\d+)","'(\d+)'"\s*/i;

var data = [];
var result = [], keys = {};
var total = {
	descr: 'Total:',
	income: 0,
	outcome: 0,
	count: 0
};

fs.readdirSync(root).forEach(function(path) {
	if(!path.match(/\.csv$/)) {
		return;
	}

	fs.readFileSync(root + path, 'utf-8').split(/\n/).forEach(function(line) {
		var m = line.match(RE_LINE);

		if(line.match(/ (EUR|USD|EGP)"/)) {

		} else if(line.match(/ RUB"/)) {

		} else if(line.match(/ \w{3}"/)) {
			console.log(line)
			
		}

		if(m) {
			var descr = m[4]
				.replace(/^ОПЛАТА КАРТОЙ\s+/, '')
				.replace(/^ОПЛАТА УСЛУГ \d+\s+/, '')
				.replace(/\s+(MOSKVA|MOSCOW|TVER|Moskva|KHIMKI|EMMAUS|ANDREYKOVO|Moscow|PUTILKOVO)(\s+RU)?/g, '')
				.replace(/(\s+|^)(OAO|OOO|ZAO|WWW\.)\s*/g, '')
				.replace(/\s{2,}/g, ' ')
				.replace(/^.*(Apteka|Aptech).*$/i, 'APTEKA')
				.replace(/^(HYPERGLOBUS|КОМИССИЯ ЗА СНЯТИЕ НАЛИЧНЫХ|OSTROVA|PEREKRESTOK|SHAKE SHACK|VOYKOVSKAYA|БИЛАЙН \d+|КВАРТПЛАТА|МЕГАФОН \d+|МТС \d+|DETSKIY MIR|LUKOIL AZS|MCDONALDS|MEGAFON.RU|MGTS|MOSENERGOSB|OSTIN|ULMART|ZARA|ВНЕСЕНИЕ НАЛИЧНЫХ|ВХОДЯЩИЙ ПЛАТЕЖ|ОПЛАТА ЗАДОЛЖЕННОСТИ ПО КРЕДИТНОЙ КАРТЕ|ПЕРЕВОД СРЕДСТВ|ПРОЦЕНТЫ НА ОСТАТОК|СНЯТИЕ НАЛИЧНЫХ).+$/g, '$1')
				.replace(/^ОПЛАТА ЗА \d+ ПОЕЗД.+$/, 'ОПЛАТА ЗА ПОЕЗДКИ')
				.replace(/^.*CAFETERA MAIL\.RU.+$/, 'CAFETERA MAIL.RU')
				.replace(/^.+(АХМЕДОВА МАРИНА|ТУГОВИКОВА МАРИНА|МАРИНА ТУГОВИКОВА).+$/, 'ТУГОВИКОВА МАРИНА')
				.replace(/^.+(АНО ФОНТ|ШКОЛА ЗНАЙКА).+$/, 'ДЕТСАД')
				.replace(/^.+СОВЕТСКОЕ ОТДЕЛЕНИЕ.+$/, 'ТОМА')
				.replace(/^.+ТУГОВИКОВ СТАНИСЛАВ ВИТАЛЬЕВИЧ.+$/, 'ИПОТЕКА')
			;

			data.push({
				date: m[3] + '-' + m[2] + '-' + m[1],
				amount: parseFloat(m[5]),
				descr: descr,
				account: m[6]
			});
		}
	})
});

data.sort(function(a, b) {
	return a.descr == b.descr ? 0 : (
		a.descr > b.descr ? 1 : -1
	);

}).forEach(function(item) {
	var key = keys[item.descr];

	if(!key) {
		result.push({
			pos: result.length + 1,
			descr: item.descr,
			income: 0,
			outcome: 0,
			count: 0
		});
	
		key = keys[item.descr] = {
			data: [],
			pos: result.length
		};

	}

	var field = item.amount > 0 ? 'income' : 'outcome';

	result[key.pos - 1][field] += item.amount;
	result[key.pos - 1].count++;
	total[field] += item.amount;
	total.count++;
	key.data.push(item);
});


result.sort(function(a, b) {
	return a.outcome == b.outcome ? (
		a.income == b.income ? 0: (
			a.income > b.income ? -1 : 1
		)
	) : (
		a.outcome > b.outcome ? 1 : -1
	);
});


result.push(total)
/*
console.table(result, 'rlrrr', [
	true, true, function(item) {
		var sign = item < 0 ? '-' : '';
		return sign + nf(item, '# ###')

	}, function(item) {
		var sign = item < 0 ? '-' : '';
		return sign + nf(item, '# ###')

	}, true
])
*/