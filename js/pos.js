const STORAGE_KEY = 'motorcycle-pos-demo';

const defaultState = {
  categories: ['Brakes', 'Fluids', 'Electrical', 'Engine', 'Maintenance'],
  products: [
    { id: crypto.randomUUID(), name: 'Brake Pad Set', category: 'Brakes', stock: 12, cost: 35, price: 55, sku: 'BP-01' },
    { id: crypto.randomUUID(), name: 'Engine Oil 10W-40', category: 'Fluids', stock: 8, cost: 18, price: 26, sku: 'OIL-10' },
    { id: crypto.randomUUID(), name: 'Motorcycle Battery', category: 'Electrical', stock: 5, cost: 72, price: 99, sku: 'BAT-01' },
    { id: crypto.randomUUID(), name: 'Air Filter', category: 'Engine', stock: 4, cost: 21, price: 34, sku: 'AF-01' },
    { id: crypto.randomUUID(), name: 'Chain Lube', category: 'Maintenance', stock: 15, cost: 7, price: 12, sku: 'CL-01' }
  ],
  services: [
    { id: crypto.randomUUID(), name: 'Oil Change', price: 60 },
    { id: crypto.randomUUID(), name: 'Brake Inspection', price: 40 },
    { id: crypto.randomUUID(), name: 'Full Service', price: 120 },
    { id: crypto.randomUUID(), name: 'Diagnostic Check', price: 55 }
  ],
  customers: [],
  orders: [],
  currentOrderItems: []
};

let state = loadState();

const navButtons = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');
const productForm = document.getElementById('product-form');
const showProductFormBtn = document.getElementById('show-product-form');
const cancelProductFormBtn = document.getElementById('cancel-product-form');
const productSearch = document.getElementById('product-search');
const productFilter = document.getElementById('product-filter');
const productTableBody = document.getElementById('product-table-body');
const serviceSelect = document.getElementById('service-select');
const productSelect = document.getElementById('product-select');
const serviceQuantity = document.getElementById('service-quantity');
const productQuantity = document.getElementById('product-quantity');
const addServiceBtn = document.getElementById('add-service-btn');
const addProductBtn = document.getElementById('add-product-btn');
const orderItemsBody = document.getElementById('order-items-body');
const subtotalValue = document.getElementById('subtotal-value');
const taxValue = document.getElementById('tax-value');
const totalValue = document.getElementById('total-value');
const taxRateInput = document.getElementById('tax-rate');
const saveOrderBtn = document.getElementById('save-order-btn');
const printLastReceiptBtn = document.getElementById('print-last-receipt-btn');
const customerForm = document.getElementById('customer-form');
const customerTableBody = document.getElementById('customer-table-body');
const customerHistoryList = document.getElementById('customer-history-list');
const customerSearch = document.getElementById('customer-search');
const customerDetailCard = document.getElementById('customer-detail-card');
const categoryChipList = document.getElementById('category-chip-list');
const addCategoryBtn = document.getElementById('add-category-btn');
const categoryList = document.getElementById('category-list');

init();

function init() {
  bindNavigation();
  bindProductForm();
  bindCustomerForm();
  bindOrderActions();
  bindBackupActions();
  render();
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return JSON.parse(JSON.stringify(defaultState));
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      ...JSON.parse(JSON.stringify(defaultState)),
      ...parsed
    };
  } catch {
    return JSON.parse(JSON.stringify(defaultState));
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function bindNavigation() {
  navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      navButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');

      views.forEach((view) => view.classList.remove('active'));
      const target = document.getElementById(`${button.dataset.view}-view`);
      if (target) target.classList.add('active');
    });
  });
}

function bindProductForm() {
  showProductFormBtn.addEventListener('click', () => {
    productForm.classList.remove('hidden');
    document.getElementById('product-name').focus();
  });

  addCategoryBtn.addEventListener('click', () => {
    const nextCategory = prompt('Enter a new category name');
    if (!nextCategory) return;
    const categoryName = nextCategory.trim();
    if (!categoryName) return;
    if (!state.categories.includes(categoryName)) {
      state.categories.push(categoryName);
      saveState();
      renderCategories();
    }
  });

  cancelProductFormBtn.addEventListener('click', () => {
    productForm.reset();
    productForm.classList.add('hidden');
  });

  productForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const categoryName = document.getElementById('product-category').value.trim();
    if (!state.categories.includes(categoryName)) {
      state.categories.push(categoryName);
    }

    const productId = productForm.dataset.editingProductId;
    const productData = {
      name: document.getElementById('product-name').value.trim(),
      category: categoryName,
      stock: Number(document.getElementById('product-stock').value),
      cost: Number(document.getElementById('product-cost').value),
      price: Number(document.getElementById('product-price').value),
      sku: document.getElementById('product-sku').value.trim() || 'NEW'
    };

    if (productId) {
      const product = state.products.find((entry) => entry.id === productId);
      if (product) {
        Object.assign(product, productData);
      }
    } else {
      state.products.unshift({ id: crypto.randomUUID(), ...productData });
    }

    saveState();
    render();
    productForm.reset();
    productForm.classList.add('hidden');
    delete productForm.dataset.editingProductId;
  });
}

function bindCustomerForm() {
  customerForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const reminderInterval = Number(document.getElementById('customer-reminder-interval').value) || 1;
    const customer = {
      id: crypto.randomUUID(),
      name: document.getElementById('customer-name').value.trim(),
      phone: document.getElementById('customer-phone').value.trim(),
      brand: document.getElementById('customer-brand').value.trim(),
      model: document.getElementById('customer-model').value.trim(),
      year: document.getElementById('customer-year').value.trim(),
      plate: document.getElementById('customer-plate').value.trim(),
      reminderInterval,
      nextReminder: calculateNextReminder(reminderInterval),
      reminderStatus: 'pending',
      reminderNote: document.getElementById('customer-reminder-note').value.trim(),
      serviceHistory: []
    };

    state.customers.unshift(customer);
    saveState();
    renderCustomers();
    customerForm.reset();
    document.getElementById('customer-reminder-interval').value = '1';
    document.getElementById('customer-reminder-note').value = '';
  });

  document.getElementById('clear-customer-form').addEventListener('click', () => {
    customerForm.reset();
    document.getElementById('customer-reminder-interval').value = '1';
    document.getElementById('customer-reminder-note').value = '';
  });
}

function bindOrderActions() {
  addServiceBtn.addEventListener('click', () => {
    const selected = state.services.find((service) => service.id === serviceSelect.value);
    if (!selected) return;
    state.currentOrderItems.push({
      id: crypto.randomUUID(),
      type: 'service',
      name: selected.name,
      qty: Number(serviceQuantity.value) || 1,
      unitPrice: selected.price
    });
    saveState();
    renderOrderItems();
  });

  addProductBtn.addEventListener('click', () => {
    const selected = state.products.find((product) => product.id === productSelect.value);
    if (!selected) return;
    const qty = Number(productQuantity.value) || 1;
    if (qty > selected.stock) {
      alert('Not enough stock for that item.');
      return;
    }

    state.currentOrderItems.push({
      id: crypto.randomUUID(),
      type: 'product',
      name: selected.name,
      qty,
      unitPrice: selected.price,
      productId: selected.id
    });
    saveState();
    renderOrderItems();
  });

  saveOrderBtn.addEventListener('click', () => {
    const customerName = document.getElementById('order-customer').value.trim();
    if (!customerName || state.currentOrderItems.length === 0) {
      alert('Please enter a customer name and at least one item.');
      return;
    }

    const taxRate = Number(taxRateInput.value) || 0;
    const subtotal = state.currentOrderItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    const reminderInterval = Number(document.getElementById('reminder-interval').value) || 1;
    const reminderDate = calculateNextReminder(reminderInterval);

    const order = {
      id: crypto.randomUUID(),
      customer: customerName,
      phone: document.getElementById('order-phone').value.trim(),
      vehicle: `${document.getElementById('order-vehicle-brand').value.trim()} ${document.getElementById('order-vehicle-model').value.trim()}`.trim(),
      note: document.getElementById('order-note').value.trim(),
      reminderInterval,
      reminderDate,
      items: state.currentOrderItems,
      subtotal,
      tax,
      total,
      createdAt: new Date().toISOString()
    };

    state.orders.unshift(order);

    const historyEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      vehicle: order.vehicle || '—',
      total,
      note: order.note || '—',
      services: state.currentOrderItems.map((item) => item.name).join(', ')
    };

    const existingCustomer = state.customers.find((customer) => customer.name.toLowerCase() === customerName.toLowerCase());
    if (existingCustomer) {
      existingCustomer.nextReminder = reminderDate;
      existingCustomer.reminderInterval = reminderInterval;
      existingCustomer.reminderStatus = 'pending';
      existingCustomer.reminderNote = document.getElementById('order-note').value.trim();
      existingCustomer.serviceHistory = existingCustomer.serviceHistory || [];
      existingCustomer.serviceHistory.unshift(historyEntry);
    } else {
      state.customers.unshift({
        id: crypto.randomUUID(),
        name: customerName,
        phone: document.getElementById('order-phone').value.trim(),
        brand: document.getElementById('order-vehicle-brand').value.trim(),
        model: document.getElementById('order-vehicle-model').value.trim(),
        year: document.getElementById('order-vehicle-year').value.trim(),
        plate: document.getElementById('order-vehicle-id').value.trim(),
        reminderInterval,
        nextReminder: reminderDate,
        reminderStatus: 'pending',
        reminderNote: document.getElementById('order-note').value.trim(),
        serviceHistory: [historyEntry]
      });
    }

    state.currentOrderItems.forEach((item) => {
      if (item.type === 'product' && item.productId) {
        const product = state.products.find((entry) => entry.id === item.productId);
        if (product) {
          product.stock -= item.qty;
        }
      }
    });

    state.currentOrderItems = [];
    saveState();
    render();
    document.getElementById('order-form').reset();
    taxRateInput.value = '8';
    renderOrderItems();

    if (confirm('Repair order saved. Print receipt now?')) {
      printReceipt(order);
    }
  });

  printLastReceiptBtn.addEventListener('click', () => {
    printReceipt(state.orders[0]);
  });

  productSearch.addEventListener('input', renderProducts);
  productFilter.addEventListener('change', renderProducts);
  customerSearch.addEventListener('input', renderCustomers);
}

function render() {
  renderStats();
  renderCategories();
  renderProducts();
  renderCustomers();
  renderCustomerHistory();
  renderDropdowns();
  renderOrderItems();
  renderReports();
}

function renderStats() {
  document.getElementById('products-count').textContent = state.products.length;
  const lowStock = state.products.filter((product) => product.stock <= 5);
  document.getElementById('low-stock-count').textContent = lowStock.length;
  document.getElementById('orders-count').textContent = state.orders.length;
  const salesToday = state.orders.reduce((sum, order) => sum + order.total, 0);
  document.getElementById('sales-total').textContent = formatCurrency(salesToday);

  const lowStockList = document.getElementById('low-stock-list');
  lowStockList.innerHTML = '';
  if (lowStock.length === 0) {
    lowStockList.innerHTML = '<li>No low-stock products right now.</li>';
    return;
  }

  lowStock.forEach((product) => {
    const item = document.createElement('li');
    item.textContent = `${product.name} — ${product.stock} left`;
    lowStockList.appendChild(item);
  });

  const upcomingRemindersList = document.getElementById('upcoming-reminders-list');
  upcomingRemindersList.innerHTML = '';
  const reminders = state.customers.filter((customer) => customer.nextReminder).sort((a, b) => new Date(a.nextReminder) - new Date(b.nextReminder));
  if (reminders.length === 0) {
    upcomingRemindersList.innerHTML = '<li>No reminders yet.</li>';
    return;
  }

  reminders.slice(0, 4).forEach((customer) => {
    const item = document.createElement('li');
    const overdue = new Date(customer.nextReminder) < new Date();
    item.textContent = `${customer.name} — ${formatDate(customer.nextReminder)} (${overdue ? 'Overdue' : 'Upcoming'})`;
    upcomingRemindersList.appendChild(item);
  });
}

function renderCategories() {
  categoryChipList.innerHTML = '';
  categoryList.innerHTML = '';

  state.categories.forEach((category) => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.innerHTML = `${category}<button type="button" data-category-delete="${category}" aria-label="Delete ${category}">×</button>`;
    categoryChipList.appendChild(chip);

    const option = document.createElement('option');
    option.value = category;
    categoryList.appendChild(option);
  });

  categoryChipList.querySelectorAll('[data-category-delete]').forEach((button) => {
    button.addEventListener('click', () => {
      const category = button.dataset.categoryDelete;
      const hasProducts = state.products.some((product) => product.category === category);
      if (hasProducts) {
        alert('Please remove or reassign products in this category before deleting it.');
        return;
      }
      state.categories = state.categories.filter((entry) => entry !== category);
      saveState();
      renderCategories();
    });
  });
}

function renderProducts() {
  const query = productSearch.value.trim().toLowerCase();
  const category = productFilter.value;
  const filtered = state.products.filter((product) => {
    const haystack = `${product.name} ${product.sku || ''} ${product.category}`.toLowerCase();
    const matchesSearch = !query || haystack.includes(query);
    const matchesCategory = category === 'all' || product.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(state.products.map((product) => product.category))];
  productFilter.innerHTML = categories.map((entry) => `<option value="${entry}" ${entry === category ? 'selected' : ''}>${entry === 'all' ? 'All categories' : entry}</option>`).join('');

  productTableBody.innerHTML = '';
  if (filtered.length === 0) {
    productTableBody.innerHTML = '<tr><td colspan="6">No products found.</td></tr>';
    return;
  }

  filtered.forEach((product) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.sku || '—'}</td>
      <td>${product.category}</td>
      <td>${product.stock}</td>
      <td>${formatCurrency(product.cost)}</td>
      <td>${formatCurrency(product.price)}</td>
      <td>
        <div class="actions">
          <button class="icon-btn" data-edit-id="${product.id}">Edit</button>
          <button class="icon-btn" data-delete-id="${product.id}">Delete</button>
        </div>
      </td>
    `;
    productTableBody.appendChild(row);
  });

  productTableBody.querySelectorAll('[data-edit-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const product = state.products.find((entry) => entry.id === button.dataset.editId);
      if (!product) return;
      document.getElementById('product-name').value = product.name;
      document.getElementById('product-category').value = product.category;
      document.getElementById('product-stock').value = product.stock;
      document.getElementById('product-cost').value = product.cost;
      document.getElementById('product-price').value = product.price;
      document.getElementById('product-sku').value = product.sku || '';
      productForm.dataset.editingProductId = product.id;
      productForm.classList.remove('hidden');
      document.getElementById('product-name').focus();
    });
  });

  productTableBody.querySelectorAll('[data-delete-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.products = state.products.filter((product) => product.id !== button.dataset.deleteId);
      saveState();
      render();
    });
  });
}

function renderCustomers() {
  const query = customerSearch.value.trim().toLowerCase();
  const filteredCustomers = state.customers.filter((customer) => {
    const haystack = `${customer.name} ${customer.phone} ${customer.brand} ${customer.model} ${customer.year} ${customer.plate}`.toLowerCase();
    return !query || haystack.includes(query);
  });

  customerTableBody.innerHTML = '';
  if (!filteredCustomers.length) {
    customerTableBody.innerHTML = '<tr><td colspan="8">No customers found.</td></tr>';
    renderCustomerDetail(null);
    return;
  }

  filteredCustomers.forEach((customer) => {
    const overdue = customer.nextReminder && new Date(customer.nextReminder) < new Date();
    const statusLabel = !customer.nextReminder ? 'No reminder' : overdue ? 'Overdue' : 'Upcoming';
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><button class="icon-btn" data-customer-select-id="${customer.id}">${customer.name}</button></td>
      <td>${[customer.brand, customer.model, customer.year].filter(Boolean).join(' ')}</td>
      <td>${customer.phone || '—'}</td>
      <td>${customer.nextReminder ? formatDate(customer.nextReminder) : 'No reminder'}</td>
      <td>${customer.reminderInterval || 1} month${(customer.reminderInterval || 1) > 1 ? 's' : ''}</td>
      <td><span class="status-pill ${overdue ? 'overdue' : ''}">${statusLabel}</span></td>
      <td>${customer.reminderNote ? customer.reminderNote : '—'}</td>
      <td><button class="icon-btn" data-reminder-done-id="${customer.id}">Mark done</button></td>
    `;
    customerTableBody.appendChild(row);
  });

  customerTableBody.querySelectorAll('[data-reminder-done-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const customer = state.customers.find((entry) => entry.id === button.dataset.reminderDoneId);
      if (!customer) return;
      customer.nextReminder = calculateNextReminder(customer.reminderInterval || 1);
      customer.reminderStatus = 'pending';
      saveState();
      render();
    });
  });

  customerTableBody.querySelectorAll('[data-customer-select-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const customer = state.customers.find((entry) => entry.id === button.dataset.customerSelectId);
      renderCustomerDetail(customer);
    });
  });

  const selectedCustomer = state.customers.find((customer) => customer.id === customerDetailCard.dataset.customerId) || filteredCustomers[0] || null;
  renderCustomerDetail(selectedCustomer);
}

function renderCustomerDetail(customer) {
  if (!customer) {
    customerDetailCard.innerHTML = '<p>No customer selected.</p>';
    customerDetailCard.dataset.customerId = '';
    return;
  }

  const overdue = customer.nextReminder && new Date(customer.nextReminder) < new Date();
  customerDetailCard.dataset.customerId = customer.id;
  customerDetailCard.innerHTML = `
    <p><strong>${customer.name}</strong></p>
    <p>Phone: ${customer.phone || '—'}</p>
    <p>Vehicle: ${[customer.brand, customer.model, customer.year].filter(Boolean).join(' ') || '—'}</p>
    <p>Plate / VIN: ${customer.plate || '—'}</p>
    <p>Next reminder: ${customer.nextReminder ? formatDate(customer.nextReminder) : 'No reminder'}</p>
    <p>Status: <span class="status-pill ${overdue ? 'overdue' : ''}">${customer.nextReminder ? (overdue ? 'Overdue' : 'Upcoming') : 'No reminder'}</span></p>
    <p>Note: ${customer.reminderNote || '—'}</p>
  `;
}

function renderCustomerHistory() {
  const entries = state.customers.flatMap((customer) => {
    const history = customer.serviceHistory || [];
    return history.map((item) => ({
      ...item,
      customerName: customer.name,
      vehicle: item.vehicle || [customer.brand, customer.model, customer.year].filter(Boolean).join(' ')
    }));
  });

  entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  customerHistoryList.innerHTML = '';

  if (!entries.length) {
    customerHistoryList.innerHTML = '<li>No service history yet.</li>';
    return;
  }

  entries.slice(0, 12).forEach((entry) => {
    const item = document.createElement('li');
    item.innerHTML = `
      <strong>${entry.customerName}</strong><br />
      ${entry.vehicle}<br />
      <small>${formatDate(entry.date)} • ${entry.services}</small><br />
      <small>${formatCurrency(entry.total)} • ${entry.note}</small>
    `;
    customerHistoryList.appendChild(item);
  });
}

function renderDropdowns() {
  serviceSelect.innerHTML = state.services.map((service) => `<option value="${service.id}">${service.name} — ${formatCurrency(service.price)}</option>`).join('');
  productSelect.innerHTML = state.products.map((product) => `<option value="${product.id}">${product.name} — ${product.stock} in stock</option>`).join('');
}

function renderOrderItems() {
  orderItemsBody.innerHTML = '';
  if (state.currentOrderItems.length === 0) {
    orderItemsBody.innerHTML = '<tr><td colspan="5">No items added yet.</td></tr>';
    updateTotals();
    return;
  }

  state.currentOrderItems.forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${formatCurrency(item.unitPrice)}</td>
      <td>${formatCurrency(item.qty * item.unitPrice)}</td>
      <td><button class="icon-btn" data-remove-id="${item.id}">Remove</button></td>
    `;
    orderItemsBody.appendChild(row);
  });

  orderItemsBody.querySelectorAll('[data-remove-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.currentOrderItems = state.currentOrderItems.filter((item) => item.id !== button.dataset.removeId);
      saveState();
      renderOrderItems();
    });
  });

  updateTotals();
}

function updateTotals() {
  const subtotal = state.currentOrderItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const taxRate = Number(taxRateInput.value) || 0;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  subtotalValue.textContent = formatCurrency(subtotal);
  taxValue.textContent = formatCurrency(tax);
  totalValue.textContent = formatCurrency(total);
}

function renderReports() {
  const reportLowStock = document.getElementById('report-low-stock');
  const reportOrders = document.getElementById('report-orders');

  reportLowStock.innerHTML = '';
  const lowStock = state.products.filter((product) => product.stock <= 5);
  if (lowStock.length === 0) {
    reportLowStock.innerHTML = '<li>No low-stock items.</li>';
  } else {
    lowStock.forEach((product) => {
      const item = document.createElement('li');
      item.textContent = `${product.name} — ${product.stock} in stock`;
      reportLowStock.appendChild(item);
    });
  }

  reportOrders.innerHTML = '';
  if (state.orders.length === 0) {
    reportOrders.innerHTML = '<li>No sales yet.</li>';
    return;
  }

  state.orders.slice(0, 6).forEach((order) => {
    const item = document.createElement('li');
    item.innerHTML = `
      <span>${order.customer} — ${formatCurrency(order.total)} — ${new Date(order.createdAt).toLocaleString()}</span>
      <button type="button" class="icon-btn" data-print-order-id="${order.id}">Print</button>
    `;
    reportOrders.appendChild(item);
  });

  reportOrders.querySelectorAll('[data-print-order-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const order = state.orders.find((entry) => entry.id === button.dataset.printOrderId);
      printReceipt(order);
    });
  });
}

function calculateNextReminder(months) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
}

function formatDate(value) {
  return new Date(value).toLocaleDateString();
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

taxRateInput.addEventListener('input', updateTotals);

function bindBackupActions() {
  document.getElementById('export-backup-btn').addEventListener('click', exportBackup);

  document.getElementById('import-backup-input').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    importBackup(file);
    event.target.value = '';
  });
}

function exportBackup() {
  const dataStr = JSON.stringify(state, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pos-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importBackup(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    let parsed;
    try {
      parsed = JSON.parse(event.target.result);
    } catch {
      alert('Could not read that file. Make sure it is a valid backup JSON file.');
      return;
    }

    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.products)) {
      alert('That file does not look like a POS backup.');
      return;
    }

    if (!confirm('This will replace all current data with the backup. Continue?')) return;

    state = {
      ...JSON.parse(JSON.stringify(defaultState)),
      ...parsed,
      currentOrderItems: []
    };
    saveState();
    render();
    alert('Backup restored.');
  };
  reader.readAsText(file);
}

function buildReceiptHTML(order) {
  const itemsRows = order.items.map((item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${formatCurrency(item.unitPrice)}</td>
      <td>${formatCurrency(item.qty * item.unitPrice)}</td>
    </tr>
  `).join('');

  return `
    <h2>Motorcycle Repair Shop</h2>
    <p>Repair order receipt</p>
    <p>Date: ${new Date(order.createdAt).toLocaleString()}</p>
    <p>Customer: ${order.customer}</p>
    <p>Phone: ${order.phone || '—'}</p>
    <p>Vehicle: ${order.vehicle || '—'}</p>
    ${order.note ? `<p>Note: ${order.note}</p>` : ''}
    <table>
      <thead>
        <tr><th>Item</th><th>Qty</th><th>Unit price</th><th>Line total</th></tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>
    <p>Subtotal: ${formatCurrency(order.subtotal)}</p>
    <p>Tax: ${formatCurrency(order.tax)}</p>
    <p class="receipt-total">Total: ${formatCurrency(order.total)}</p>
    <p>Next maintenance reminder: ${order.reminderDate ? formatDate(order.reminderDate) : '—'}</p>
  `;
}

function printReceipt(order) {
  if (!order) {
    alert('No repair order to print yet. Save one first.');
    return;
  }
  document.getElementById('print-receipt').innerHTML = buildReceiptHTML(order);
  document.body.classList.add('printing-receipt');
  window.print();
}

window.addEventListener('afterprint', () => {
  document.body.classList.remove('printing-receipt');
});
