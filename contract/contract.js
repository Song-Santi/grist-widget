function ready(fn) {
    if (document.readyState !== 'loading'){
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
}
  
function addDemo(row) {
  if (!row.Room) {
    for (const key of ['Contract']) {
      if (!row[key]) { row[key] = '     '; }
    }
    for (const key of ['DateInText', 'SideA', 'SideB', 'Room', 'RoomHandover', 'RoomPriceText', 'ItemFee', 'AccountBank', 'DateInFormat']) {
      if (!(key in row)) { row[key] = key; }
    }
  }
  return row;
}
  
const data = {
  count: 0,
  contract: '',
  status: 'waiting',
  tableConnected: false,
  rowConnected: false,
  haveRows: false,
};
let app = undefined;
  
Vue.filter('fallback', function(value, str) {
  if (!value) {
    throw new Error("Please provide column " + str);
  }
  return value;
});

function handleError(err) {
  console.error(err);
  const target = app || data;
  target.contract = '';
  target.status = String(err).replace(/^Error: /, '');
  console.log(data);
}

function updateContract(row) {
  try {
    data.status = '';
    if (row === null) {
      throw new Error("(No data - not on row - please add or select a row)");
    }
    console.log("GOT...", JSON.stringify(row));
    if (row.References) {
      try {
        Object.assign(row, row.References);
      } catch (err) {
        throw new Error('Could not understand References column. ' + err);
      }
    }

    addDemo(row);

    data.contract = Object.assign({}, data.contract, row);

    // Make contract information available for debugging.
    window.contract = row;
  } catch (err) {
    handleError(err);
  }
}
  
ready(function() {
// Update the contract anytime the document data changes.
grist.ready();
grist.onRecord(updateContract);

// Monitor status so we can give user advice.
grist.on('message', msg => {
  // If we are told about a table but not which row to access, check the
  // number of rows.  Currently if the table is empty, and "select by" is
  // not set, onRecord() will never be called.
  if (msg.tableId && !app.rowConnected) {
    grist.docApi.fetchSelectedTable().then(table => {
      if (table.id && table.id.length >= 1) {
        app.haveRows = true;
      }
    }).catch(e => console.log(e));
  }
  if (msg.tableId) { app.tableConnected = true; }
  if (msg.tableId && !msg.dataChange) { app.rowConnected = true; }
});

Vue.config.errorHandler = function (err, vm, info)  {
  handleError(err);
};

app = new Vue({
  el: '#app',
  data: data
});

});
  
//handle PDF
/*
function generatePDF() {
  // Tạo đối tượng jsPDF
  var pdf = new jsPDF('p', 'pt', 'letter');

  // Tắt header và footer mặc định
  pdf.setDisplayMode('fullwidth', 'single');

  // Định nghĩa header
  var header = function(data) {
    // Sử dụng ảnh cho header
    pdf.addImage('./asset/header.jpg', 'JPEG', 40, 20, 80, 40);
  };

  // Định nghĩa footer
  var footer = function(data) {
    // Sử dụng ảnh cho footer
    pdf.addImage('./asset/footer.jpg', 'JPEG', 40, 750, 80, 40);

    // Thêm số trang
    pdf.text('Page ' + data.pageNumber, data.settings.margin.left, 780);
  };

  // Đăng ký header và footer
  pdf.autoTable({ head: [], body: [] }); // Cần thêm autoTable để đăng ký header và footer
  pdf.autoTable({ head: [], body: [], didDrawPage: header, willDrawPage: footer });

  // Thêm nội dung vào trang PDF, ví dụ:
  //pdf.text('Hello, this is the content of the PDF.', 40, 120);

  // Tải PDF với tên file là 'output.pdf'
  pdf.save('Contract.pdf');
}
*/ 
