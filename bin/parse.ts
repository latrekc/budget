#!/usr/bin/env node
import printTable from 'table-master';
import nf from 'format-number-with-string';
import bar from 'bar-horizontal';
import * as fs  from 'node:fs';

type Data = {
	date?: string,
	category?: string,
	subcategory: string,
	amount: number,
	account?: string,
	payee?: string,
	notes?: string,
	device?: string
}

type Result = {category: string,
	amount: number,
	'%'?: number}

let outcome,
	tmp:Data[] = [],
	RE_LINE = /^((\d{4})-(\d{2})-(\d{2})),"([^"]+)","([^"]+)","\s*(\d+\.\d+)","([^"]+)?","([^"]+)?","([^"]+)?","([^"]+)"$/,
	total = 0,
	category = {},
	subcategory = {},
	months = {},
	monthsCategory = {}
;

function normalizeCategory(subcategory: string, category: string):string {
	//return category;

	switch (subcategory) {
		case 'Ипотека Карбышева':
		case 'Квартплата Карбышева':
		case 'Электричество Карбышева':
			return 'Карбышева';

		case 'Аренда Войковская':
		case 'Квартплата Войковская':
		case 'Электричество Войковская':
		case 'Консьержка Войковская':
			return 'Войковская';

		case 'Квартплата Рублевка':
		case 'Электричество Рублевка':
			return 'Рублевка';

		case 'Магазин У Дома Овощи Фрукты':
		case 'Магазин У Дома Еда':
			return 'Магазин у дома';

		case 'Рынок Овощи Фрукты':
		case 'Рынок Мясо':
		case 'Рынок Молочка Сыры Хлеб':
			return 'Рынок';

		case 'Перекресток Еда':
		case 'Магнолия Еда':
		case 'Оливка Магазин':
			return 'Супермаркет';

		case 'Ремонт':
		case 'Шиномонтаж':
		case 'Замена масла':
		case 'Эвакуация':
			return 'Ремонт/Шиномонтаж/Замена масла/Эвакуация';

		case 'ОСАГО/ДСАГО/ТО':
		case 'Налоги':
			if(category === 'Машина/авто') {
				return 'ОСАГО/ДСАГО/ТО/Налоги';
			} else {
				return subcategory;
			}

		case 'Парковка':
		case 'Платные Дороги':
			return 'Парковка/Платные Дороги';

		case 'Топливо':
		case 'Омывайка':
		case 'Мойка':
			return 'Топливо/Омывайка/Мойка';

		default:
			return subcategory;
	}
}

var source = fs.readFileSync(__dirname + '/../data/Report.csv', 'utf-8').split(/\n/).forEach(function(line,i) {
	if(outcome || !i) {
		return;
	}

	if(line === '') {
		outcome = tmp.splice(1);
		return;
	}

	var match = line.match(RE_LINE);

	if(!match || match.length < 12) {
		console.log(line, match)
		return;
	}

	var data = {
		date: match[4],
		category: match[5],
		subcategory: normalizeCategory(match[6], match[5]),
		amount: parseFloat(match[7]),
		account: match[8],
		payee: match[9],
		notes:match[10],
		device: match[11]
	};

	var month = match[2] + '-' + match[3];

	tmp.push(data);

	if(!data.amount || isNaN(data.amount)) {
		console.log(line)
	}

	if(!subcategory[data.category]) {
		subcategory[data.category] = {};
	}
	if(!subcategory[data.category][data.subcategory]) {
		subcategory[data.category][data.subcategory] = 0;
	}

	if(!category[data.category]) {
		category[data.category] = 0;
	}

	if(!months[month]) {
		months[month] = 0;
	}
	if(!monthsCategory[data.category]) {
		monthsCategory[data.category] = {};
	}
	if(!monthsCategory[data.category][month]) {
		monthsCategory[data.category][month] = 0;
	}


	category[data.category] += data.amount;
	subcategory[data.category][data.subcategory] += data.amount;
	total += data.amount;

	months[month] += data.amount;
	monthsCategory[data.category][month] += data.amount;
});


(function() {
	var result:Result[] = [];

	Object.keys(category).sort(function(a, b) {
		return category[a] == category[b] ? 0 : (
			category[a] > category[b] ? -1 : 1
		);

	}).forEach(function(key) {
		result.push({
			category: key,
			amount: category[key],
			'%': category[key] / total
		})

		Object.keys(subcategory[key]).sort(function(a, b) {
			return subcategory[key][a] == subcategory[key][b] ? 0 : (
				subcategory[key][a] > subcategory[key][b] ? -1 : 1
			);

		}).map(function(subkey) {
			result.push({
				category: "\t" + subkey,
				amount: subcategory[key][subkey],
				'%': subcategory[key][subkey] / category[key]
			})
		});
	});

	result.push({category: 'Total:', amount: total})

	console.log('По категориям');

	printTable(result, 'lrr', [
		true, function(item) {
			return nf(item, '# ###')

		}, function(item) {
			return item ? (item * 100).toFixed(2) : ''
		}
	])
	console.log();
})();

function printMonths(title, data) {
	console.log("\t"+title);

	bar(data, {labels: true});

	console.log();
}

console.log('По месяцам');
printMonths('Общий', months);

Object.keys(monthsCategory).forEach(function(category) {
	printMonths(category, monthsCategory[category]);
});
