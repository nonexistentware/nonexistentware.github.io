
function generate() {
  const type = document.getElementById('type').value;
  const count = parseInt(document.getElementById('count').value, 10);
  const format = document.getElementById('format').value;
  let data = [];

  if (type === 'users') {
    for (let i = 1; i <= count; i++) {
      data.push({ id: i, name: 'User' + i, email: 'user' + i + '@example.com' });
    }
  } else if (type === 'orders') {
    for (let i = 1; i <= count; i++) {
      data.push({ orderId: 1000 + i, product: 'Product' + i, amount: (Math.random() * 100).toFixed(2) });
    }
  }

  let output = '';
  let filename = type + '.' + format;

  switch(format) {
    case 'csv':
      output = generateDelimited(data, ',');
      break;
    case 'tsv':
      output = generateDelimited(data, '\t');
      break;
    case 'json':
      output = JSON.stringify(data, null, 2);
      break;
    case 'ndjson':
      output = data.map(row => JSON.stringify(row)).join('\n');
      break;
    case 'html':
      output = '<table><tr>' + Object.keys(data[0]).map(k => '<th>' + k + '</th>').join('') + '</tr>' +
               data.map(row => '<tr>' + Object.values(row).map(v => '<td>' + v + '</td>').join('') + '</tr>').join('') +
               '</table>';
      break;
    case 'xml':
      output = '<items>' + data.map(row => '<item>' + Object.entries(row).map(([k,v]) => `<${k}>${v}</${k}>`).join('') + '</item>').join('') + '</items>';
      break;
    case 'markdown':
      const keys = Object.keys(data[0]);
      output = '| ' + keys.join(' | ') + ' |\n| ' + keys.map(() => '---').join(' | ') + ' |\n';
      output += data.map(row => '| ' + Object.values(row).join(' | ') + ' |').join('\n');
      break;
    case 'sql':
      const table = type;
      const cols = Object.keys(data[0]);
      output = data.map(row => `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${Object.values(row).map(v => `'${v}'`).join(', ')});`).join('\n');
      break;
    case 'txt':
      output = data.map(row => Object.values(row).join(' ')).join('\n');
      break;
    default:
      alert("Format not supported yet.");
      return;
  }

  const blob = new Blob([output], { type: 'text/plain' });
  const link = document.createElement('a');
  link.download = filename;
  link.href = URL.createObjectURL(blob);
  link.click();
}

function generateDelimited(data, delimiter) {
  const keys = Object.keys(data[0]);
  const rows = data.map(row => keys.map(key => row[key]).join(delimiter));
  return keys.join(delimiter) + '\n' + rows.join('\n');
}
