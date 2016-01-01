#!/usr/bin/env node
require('table-master');
var nf = require('format-number-with-string');


var outcome,
	tmp = [],
	RE_LINE = /^(\d{4}-\d{2}-\d{2}),"([^"]+)","([^"]+)","\s*(\d+\.\d+)","([^"]+)?","([^"]+)?","([^"]+)?","([^"]+)"$/,
	total = 0,
	category = {},
	subcategory = {}
;

var source = require('fs').readFileSync(__dirname + '/../data/Report.csv', 'utf-8').split(/\n/).forEach(function(line,i) {
	if(outcome || !i) {
		return;
	}

	if(line === '') {
		outcome = tmp.splice(1);
		return;
	}

	var match = line.match(RE_LINE);

	if(!match) {
		console.log(line, match)
	}

	var data = {
		date: match[1],
		category: match[2],
		subcategory: match[3],
		amount: parseFloat(match[4]),
		account: match[5],
		payee: match[6],
		notes:match[7],
		device: match[8]
	};

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

	category[data.category] += data.amount;
	subcategory[data.category][data.subcategory] += data.amount;
	total += data.amount;
});

var result = [];

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

console.table(result, 'lrr', [
	true, function(item) {
		return nf(item, '# ###')

	}, function(item) {
		return item ? (item * 100).toFixed(1) : ''
	}
])