let headers = ["Name", "Age", "City"];
    let data = [
      ["John", "30", "New York"],
      ["Jane", "25", "London"]
    ];

    function renderTable() {
      const headersRow = document.getElementById("headers");
      headersRow.innerHTML = "";
      headers.forEach((header, i) => {
        const th = document.createElement("th");
        const input = document.createElement("input");
        input.value = header;
        input.onchange = (e) => headers[i] = e.target.value;
        th.appendChild(input);
        headersRow.appendChild(th);
      });

      const tableBody = document.getElementById("table-body");
      tableBody.innerHTML = "";
      data.forEach((row, rowIndex) => {
        const tr = document.createElement("tr");
        row.forEach((cell, colIndex) => {
          const td = document.createElement("td");
          const input = document.createElement("input");
          input.value = cell;
          input.oninput = (e) => data[rowIndex][colIndex] = e.target.value;
          td.appendChild(input);
          tr.appendChild(td);
        });
        tableBody.appendChild(tr);
      });
    }

    function addColumn() {
      headers.push("New Column");
      data.forEach(row => row.push(""));
      renderTable();
    }

    function addRow() {
      data.push(Array(headers.length).fill(""));
      renderTable();
    }

    let lastGeneratedText = "";
let lastFormat = "";

// function generate() {
//   const format = document.getElementById("format").value;
//   lastFormat = format;
//   let result = "";
//   switch (format) {
//     case "CSV":
//       result = [headers.join(",")].concat(data.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))).join("\n");
//       break;
//     case "TSV":
//       result = [headers.join("\t")].concat(data.map(row => row.join("\t"))).join("\n");
//       break;
//     case "JSON":
//       result = JSON.stringify(data.map(row => Object.fromEntries(headers.map((h, i) => [h, row[i]]))), null, 2);
//       break;
//     case "NDJSON":
//     case "JSONLines":
//       result = data.map(row => JSON.stringify(Object.fromEntries(headers.map((h, i) => [h, row[i]])))).join("\n");
//       break;
//     case "SQL":
//       result = data.map(row => `INSERT INTO table_name (${headers.join(", ")}) VALUES (${row.map(v => `'${v.replace(/'/g, "''")}'`).join(", ")});`).join("\n");
//       break;
//     case "MongoDB":
//       result = data.map(row => `db.collection.insertOne(${JSON.stringify(Object.fromEntries(headers.map((h, i) => [h, row[i]])))});`).join("\n");
//       break;
//     case "HTML table":
//       result = `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>` +
//         data.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("") +
//         "</tbody></table>";
//       break;
//     case "XML":
//       result = "<rows>\n" + data.map(row => "  <row>" + headers.map((h, i) => `<${h}>${row[i]}</${h}>`).join("") + "</row>").join("\n") + "\n</rows>";
//       break;
//     case "Markdown table":
//       result = `| ${headers.join(" | ")} |\n| ${headers.map(() => "---").join(" | ")} |\n` +
//         data.map(row => `| ${row.join(" | ")} |`).join("\n");
//       break;
//     case "TXT":
//       result = [headers.join("\t")].concat(data.map(row => row.join("\t"))).join("\n");
//       break;
//     case "LaTeX table":
//       result = `\\begin{tabular}{|${"c|".repeat(headers.length)}}\n\\hline\n` +
//         `${headers.join(" & ")} \\\\ \\hline\n` +
//         data.map(row => `${row.join(" & ")} \\\\ \\hline`).join("\n") +
//         `\n\\end{tabular}`;
//       break;
//   }

//   lastGeneratedText = result;
//   document.getElementById("output").textContent = result;
//   document.getElementById("download-btn").style.display = "inline-block";

// }

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

function generateRows() {
  const rowCount = parseInt(document.getElementById("row-count").value);
  if (isNaN(rowCount) || rowCount < 1) {
    alert("Please enter a valid number of rows.");
    return;
  }

  const selected = document.getElementById("template").value;

  const rowGenerators = {
    products: () => [
      "P" + Math.floor(Math.random() * 10000),
      ["Laptop", "Phone", "Book", "Table", "Monitor"][Math.floor(Math.random() * 5)],
      ["Electronics", "Furniture", "Office", "Clothing"][Math.floor(Math.random() * 4)],
      (Math.random() * 1000).toFixed(2),
      Math.floor(Math.random() * 100)
    ],
    orders: () => [
      "ORD" + Math.floor(Math.random() * 100000),
      ["Alice", "Bob", "Charlie", "Diana"][Math.floor(Math.random() * 4)],
      new Date(Date.now() - Math.random() * 1e10).toISOString().split('T')[0],
      ["Pending", "Shipped", "Delivered", "Cancelled"][Math.floor(Math.random() * 4)],
      (Math.random() * 500).toFixed(2)
    ],
    payments: () => [
      "PAY" + Math.floor(Math.random() * 100000),
      ["Alice", "Bob", "Eve", "Tom"][Math.floor(Math.random() * 4)],
      (Math.random() * 2000).toFixed(2),
      ["Card", "PayPal", "Bank Transfer"][Math.floor(Math.random() * 3)],
      ["Completed", "Failed", "Refunded"][Math.floor(Math.random() * 3)]
    ],
    cars: () => [
      "CAR" + Math.floor(Math.random() * 100000),
      ["Toyota", "Ford", "BMW", "Tesla"][Math.floor(Math.random() * 4)],
      ["Model S", "Corolla", "Mustang", "X5"][Math.floor(Math.random() * 4)],
      Math.floor(Math.random() * 30 + 1990),
      (Math.random() * 50000 + 10000).toFixed(2)
    ]
  };

  for (let i = 0; i < rowCount; i++) {
    if (rowGenerators[selected]) {
      data.push(rowGenerators[selected]());
    } else {
      data.push(Array(headers.length).fill("").map(() => Math.random().toString(36).substring(2, 8)));
    }
  }

  renderTable();

  // Auto-download without preview
  const format = document.getElementById("format").value;
  const output = generateExport(format);
  downloadBlob(output, `data.${getFileExtension(format)}`);
}


function generateExport(format) {
  switch (format) {
    case "CSV":
      return [headers.join(",")].concat(data.map(row => row.join(","))).join("\n");
    case "TSV":
    case "TXT":
      return [headers.join("\t")].concat(data.map(row => row.join("\t"))).join("\n");
    case "JSON":
      return JSON.stringify(data.map(row => Object.fromEntries(headers.map((h, i) => [h, row[i]]))), null, 2);
    case "NDJSON":
    case "JSONLines":
      return data.map(row => JSON.stringify(Object.fromEntries(headers.map((h, i) => [h, row[i]])))).join("\n");
    case "SQL":
      return data.map(row => `INSERT INTO table_name (${headers.join(", ")}) VALUES (${row.map(v => `'${v}'`).join(", ")});`).join("\n");
    case "MongoDB":
      return data.map(row => `db.collection.insertOne(${JSON.stringify(Object.fromEntries(headers.map((h, i) => [h, row[i]])))});`).join("\n");
    case "HTML table":
      return `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>` +
             data.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("") +
             "</tbody></table>";
    case "XML":
      return "<rows>\n" + data.map(row => "  <row>" + headers.map((h, i) => `<${h}>${row[i]}</${h}>`).join("") + "</row>").join("\n") + "\n</rows>";
    case "Markdown table":
      return `| ${headers.join(" | ")} |\n| ${headers.map(() => "---").join(" | ")} |\n` +
             data.map(row => `| ${row.join(" | ")} |`).join("\n");
    case "LaTeX table":
      return `\\begin{tabular}{|${"c|".repeat(headers.length)}}\n\\hline\n` +
             `${headers.join(" & ")} \\\\ \\hline\n` +
             data.map(row => `${row.join(" & ")} \\\\ \\hline`).join("\n") +
             `\n\\end{tabular}`;
    default:
      return "";
  }
}

function applyTemplate() {
  const selected = document.getElementById("template").value;

  const templates = {
    products: {
      headers: ["Product ID", "Name", "Category", "Price", "Stock"],
      row: () => [
        "P" + Math.floor(Math.random() * 10000),
        ["Laptop", "Phone", "Book", "Table", "Monitor"][Math.floor(Math.random() * 5)],
        ["Electronics", "Furniture", "Office", "Clothing"][Math.floor(Math.random() * 4)],
        (Math.random() * 1000).toFixed(2),
        Math.floor(Math.random() * 100)
      ]
    },
    orders: {
      headers: ["Order ID", "Customer", "Date", "Status", "Total"],
      row: () => [
        "ORD" + Math.floor(Math.random() * 100000),
        ["Alice", "Bob", "Charlie", "Diana"][Math.floor(Math.random() * 4)],
        new Date(Date.now() - Math.random() * 1e10).toISOString().split('T')[0],
        ["Pending", "Shipped", "Delivered", "Cancelled"][Math.floor(Math.random() * 4)],
        (Math.random() * 500).toFixed(2)
      ]
    },
    payments: {
      headers: ["Payment ID", "User", "Amount", "Method", "Status"],
      row: () => [
        "PAY" + Math.floor(Math.random() * 100000),
        ["Alice", "Bob", "Eve", "Tom"][Math.floor(Math.random() * 4)],
        (Math.random() * 2000).toFixed(2),
        ["Card", "PayPal", "Bank Transfer"][Math.floor(Math.random() * 3)],
        ["Completed", "Failed", "Refunded"][Math.floor(Math.random() * 3)]
      ]
    },
    cars: {
      headers: ["Car ID", "Brand", "Model", "Year", "Price"],
      row: () => [
        "CAR" + Math.floor(Math.random() * 100000),
        ["Toyota", "Ford", "BMW", "Tesla"][Math.floor(Math.random() * 4)],
        ["Model S", "Corolla", "Mustang", "X5"][Math.floor(Math.random() * 4)],
        Math.floor(Math.random() * 30 + 1990),
        (Math.random() * 50000 + 10000).toFixed(2)
      ]
    }
  };

  if (templates[selected]) {
    headers = templates[selected].headers;
    data = [];
    for (let i = 0; i < 5; i++) {
      data.push(templates[selected].row());
    }
    renderTable();
  }
}

function downloadBlob(content, filename) {
  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function getFileExtension(format) {
  switch (format) {
    case "CSV": return "csv";
    case "TSV": return "tsv";
    case "JSON": return "json";
    case "NDJSON":
    case "JSONLines": return "ndjson";
    case "SQL": return "sql";
    case "MongoDB": return "js";
    case "HTML table": return "html";
    case "XML": return "xml";
    case "Markdown table": return "md";
    case "TXT": return "txt";
    case "LaTeX table": return "tex";
    default: return "txt";
  }
}



  function download() {
  if (!lastGeneratedText || !lastFormat) {
    alert("Please generate output first.");
    return;
  }


  function toggleTheme() {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }

  // Apply theme on load
  window.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark");
      const toggle = document.getElementById("theme-toggle");
      if (toggle) toggle.checked = true;
    }
  });

  const extensions = {
    "CSV": "csv",
    "TSV": "tsv",
    "JSON": "json",
    "NDJSON": "ndjson",
    "JSONLines": "jsonl",
    "SQL": "sql",
    "MongoDB": "js",
    "HTML table": "html",
    "XML": "xml",
    "Markdown table": "md",
    "TXT": "txt",
    "LaTeX table": "tex"
  };

  const ext = extensions[lastFormat] || "txt";
  const blob = new Blob([lastGeneratedText], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `output.${ext}`;
  a.click();
}



    renderTable();