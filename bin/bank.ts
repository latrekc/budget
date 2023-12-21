#!/usr/bin/env node
import printTable from "table-master";
import nf from "format-number-with-string";
import * as fs from "node:fs";
const root = __dirname + "/../data/bank/csv/";
const RE_LINE =
  /^\uFEFF?"(\d{2})\/(\d{2})\/(\d{4})","(.+?)","(-?\d+\.\d+)","'(\d+)'"\s*/i;

type Data = {
  date?: string;
  amount: number;
  account: string;
  currency: string;
  descr: string;
};

type Result = {
  pos?: number;
  descr: string;
  outcome: number;
  income: number;
  count: number;
};

enum FIELDS {
  INCOME = "income",
  OUTCOME = "outcome",
}

type Keys = Record<
  string,
  {
    pos: number;
    data: Data[];
  }
>;

const data: Data[] = [];

fs.readdirSync(root).forEach(function (path) {
  if (!path.match(/\.csv$/)) {
    return;
  }

  fs.readFileSync(root + path, "utf-8")
    .split(/\n/)
    .forEach(function (line) {
      var m = line.match(RE_LINE);

      var currency = line.match(/ (EUR|USD|EGP)"/);

      if (m) {
        var descr = m[4]
          .replace(/\s{2,}/g, " ")
          .replace(/^ОПЛАТА КАРТОЙ\s+/, "")
          .replace(/^ОПЛАТА УСЛУГ \d+\s+/, "")
          .replace(/^.+СОВЕТСКОЕ ОТДЕЛЕНИЕ.+$/, "ТОМА")
          .replace(
            /\s+(MOSKVA|MOSCOW|TVER|Moskva|KHIMKI|EMMAUS|ANDREYKOVO|Moscow|PUTILKOVO)(\s+RU)?/g,
            ""
          )
          .replace(/(\s+|^)(OAO|OOO|ZAO|WWW\.)\s*/g, "")
          .replace(
            /^.*(Apteka|Aptech|DARSAN|FARGO FARMATSEVTIKA).*$/i,
            "APTEKA"
          )
          .replace(/^.+TOPUP 6276/, "МЕГАФОН 9264926276")
          .replace(/^.+TOPUP 1833/, "МЕГАФОН 9262001833")
          .replace(/^ST7709735.+/, "МЕГАФОН 9262220376")
          .replace(
            /^(MAGNOLIYA|HYPERGLOBUS|КОМИССИЯ ЗА СНЯТИЕ НАЛИЧНЫХ|OSTROVA|PEREKRESTOK|SHAKE SHACK|VOYKOVSKAYA|БИЛАЙН \d+|КВАРТПЛАТА|МЕГАФОН \d+|МТС \d+|DETSKIY MIR|LUKOIL AZS|MCDONALDS|MGTS|MOSENERGOSB|OSTIN|ULMART|ZARA|ВНЕСЕНИЕ НАЛИЧНЫХ|ВХОДЯЩИЙ ПЛАТЕЖ|ОПЛАТА ЗАДОЛЖЕННОСТИ ПО КРЕДИТНОЙ КАРТЕ|ПЕРЕВОД СРЕДСТВ|ПРОЦЕНТЫ НА ОСТАТОК|СНЯТИЕ НАЛИЧНЫХ).*$/g,
            "$1"
          )
          .replace(/^ОПЛАТА ЗА \d+ ПОЕЗД.+$/, "ОПЛАТА ЗА ПОЕЗДКИ")
          .replace(/^(AVRORA RUSKO|KFS-AEROPORT)/, "CAFETERA MAIL.RU")
          .replace(/^GIPERMARKET UYUTERRA/, "UYUTERRA")
          .replace(/^(MOS.GOSUSLUGI.RU|MOSENERGOSB)/, "КВАРТПЛАТА")
          .replace(/Cafe Mu-Mu/, "MUMU")
          .replace(/^.*CAFETERA MAIL\.RU.+$/, "CAFETERA MAIL.RU")
          .replace(
            /^.+(АХМЕДОВА МАРИНА|ТУГОВИКОВА МАРИНА|МАРИНА ТУГОВИКОВА).+$/,
            "ТУГОВИКОВА МАРИНА"
          )
          .replace(/^.+(АНО ФОНТ|ШКОЛА ЗНАЙКА).+$/, "ДЕТСАД")
          .replace(/^.+ТУГОВИКОВ СТАНИСЛАВ ВИТАЛЬЕВИЧ.+$/, "ИПОТЕКА");
        data.push({
          date: m[3] + "-" + m[2] + "-" + m[1],
          amount: parseFloat(m[5]),
          descr: descr,
          account: m[6],
          currency: currency ? currency[1] : "RUB",
        });
      }
    });
});

function showTable(data: Data[]) {
  var result: Result[] = [],
    keys: Keys = {};

  var total = {
    descr: "Total:",
    income: 0,
    outcome: 0,
    count: 0,
  };

  data
    .sort(function (a, b) {
      return a.descr == b.descr ? 0 : a.descr > b.descr ? 1 : -1;
    })
    .forEach(function (item) {
      var key = keys[item.descr];

      if (!key) {
        result.push({
          pos: result.length + 1,
          descr: item.descr,
          income: 0,
          outcome: 0,
          count: 0,
        });

        key = keys[item.descr] = {
          data: [],
          pos: result.length,
        };
      }

      var field = item.amount > 0 ? FIELDS.INCOME : FIELDS.OUTCOME;

      result[key.pos - 1][field] += item.amount;
      result[key.pos - 1].count++;
      total[field] += item.amount;
      total.count++;
      key.data.push(item);
    });

  /*
	result.sort(function(a, b) {
		return a.outcome == b.outcome ? (
			a.income == b.income ? 0: (
				a.income > b.income ? -1 : 1
			)
		) : (
			a.outcome > b.outcome ? 1 : -1
		);
	});
*/

  result.push(total);

  printTable(result, "rlrrr", [
    true,
    true,
    function (item: number) {
      var sign = item < 0 ? "-" : "";
      return sign + nf(item, "# ###.00");
    },
    function (item: number) {
      var sign = item < 0 ? "-" : "";
      return sign + nf(item, "# ###.00");
    },
    true,
  ]);
}

enum Currencies {
  RUB = "RUB",
  EUR = "EUR",
  USD = "USD",
}

var accounts: Record<string, { currency: Currencies; data: Data[] }> = {
  "40817978030330046856": { currency: Currencies.EUR, data: [] },
  "40817840330170087887": { currency: Currencies.USD, data: [] },
  "*": { currency: Currencies.RUB, data: [] },
};

var currencies: Record<Currencies, Data[]> = {
  [Currencies.EUR]: [],
  [Currencies.USD]: [],
  [Currencies.RUB]: [],
};

data.forEach(function (item) {
  var key = accounts.hasOwnProperty(item.account)
    ? accounts[item.account].currency
    : Currencies.RUB;
  currencies[key].push(item);
});

Object.keys(currencies).forEach(function (currency) {
  console.log(currency);
  showTable(currencies[currency as Currencies]);
  console.log();
});
