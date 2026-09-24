/* Skycart storefront — standalone build. No framework, no build step. */
(function () {
  'use strict';

  var app, tpl, comp, pending = false, lastPage = null, depth = 0;
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  var WHOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;
  var TEXT_INPUTS = { text: 1, search: 1, tel: 1, email: 1, number: 1, password: 1, url: 1 };

  /* ---------- tiny component base (state + re-render) ---------- */
  function DCLogic(props) { this.props = props || {}; this.state = {}; }
  DCLogic.prototype.setState = function (patch) {
    var next = typeof patch === 'function' ? patch(this.state, this.props) : patch;
    this.state = Object.assign({}, this.state, next);
    schedule();
  };
  DCLogic.prototype.forceUpdate = function () { schedule(); };
  window.DCLogic = DCLogic;

  /* ---------- app logic (catalog, cart, checkout, navigation) ---------- */
  class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.catalog = this.buildCatalog();
    this.state = {
      page: 'home', cat: 'electricals', sub: 'all', sort: 'popular', pid: null, qty: 1, query: '',
      cart: { 'electricals-wires-cables-1': 1, 'electricals-switches-sockets-2': 1, 'lighting-luminaries-led-bulbs-1': 1 },
      orders: [], stack: [], pay: 'upi', toast: '', toastCart: false, lastOrder: null,
      notes: [{ id: 'n1', title: 'Monsoon sale is live', body: 'Up to 60% off site essentials. Shop electricals, tools and more.', time: 'Today', to: 'home' }]
    };
  }
  componentWillUnmount() { clearTimeout(this.tt); }

  buildCatalog() {
    var brands = ['Ferro', 'Havells', 'Finolex', 'Karam', 'Taparia', 'Philips'];
    var variants = ['Heavy Duty', 'Professional', 'Value Pack'];
    var badges = ['Bestseller', '', 'Bulk deal'];
    var ratings = ['4.8', '4', '4.1'];
    var cats = [
      { key: 'elec', id: 'electricals', name: 'Electricals', base: 4204, step: 330, reviews: [95, 1661], mrps: [6558, 6687, 6816, 7345, 7480, 7616], 
        subs: [['wires-cables', 'Wires & Cables', 'Wires', 'assets/images/electricals-wires-switches.jpg'], ['switches-sockets', 'Switches & Sockets', 'Switches', 'assets/images/electricals-wires-switches.jpg']] },
      { key: 'light', id: 'lighting-luminaries', name: 'Lighting', base: 349, step: 900, reviews: [412, 238], 
        subs: [['led-bulbs', 'LED Bulbs', 'LED Bulb', 'assets/images/lighting-bulbs-pendant.jpg'], ['pendant-lights', 'Pendant Lights', 'Pendant Light', 'assets/images/lighting-bulbs-pendant.jpg'], ['solar-lights', 'Solar Lights', 'Solar Light Kit', 'assets/images/lighting-solar-kit.jpg', 3499]] },
      { key: 'tools', id: 'power-tools', name: 'Power Tools', base: 2899, step: 700, reviews: [534, 876], 
        subs: [['drills', 'Drills', 'Drill', 'assets/images/power-tools-drill.jpg'], ['drivers', 'Impact Drivers', 'Impact Driver', 'assets/images/power-tools-drill.jpg']] },
      { key: 'safety', id: 'safety-and-security', name: 'Safety', base: 499, step: 1800, reviews: [318, 1204], 
        subs: [['safety-gear', 'Safety Gear', 'Safety Kit', 'assets/images/safety-gear.jpg'], ['cctv-cameras', 'CCTV Cameras', 'CCTV Camera', 'assets/images/security-cctv.jpg']] },
      { key: 'plumb', id: 'plumbing', name: 'Plumbing', base: 649, step: 250, reviews: [287, 642], 
        subs: [['taps-faucets', 'Taps & Faucets', 'Tap', 'assets/images/plumbing-pipe-tap.jpg'], ['pipes-fittings', 'Pipes & Fittings', 'Pipe', 'assets/images/plumbing-pipe-tap.jpg']] },
      { key: 'pack', id: 'packaging-material-handling', name: 'Packaging & Material Handling', base: 199, step: 150, reviews: [264, 187], 
        subs: [['mailers-envelopes', 'Mailers & Envelopes', 'Bubble Mailer', 'assets/images/packaging-mailers.jpg'], ['pallet-trucks', 'Trolleys & Pallet Trucks', 'Pallet Truck', 'assets/images/material-handling-pallet-truck.jpg', 12999]] },
      { key: 'build', id: 'construction-materials', name: 'Construction Materials', base: 399, step: 450, reviews: [356, 219], 
        subs: [['cement-plaster', 'Cement & Plaster', 'Cement', ''], ['tile-adhesives', 'Tile Adhesives', 'Tile Adhesive', '']] },
      { key: 'indus', id: 'industrial-supplies', name: 'Industrial Supplies', base: 249, step: 8000, reviews: [198, 341], 
        subs: [['fasteners-fittings', 'Fasteners & Fittings', 'Fitting Kit', 'assets/images/industrial-fittings.jpg'], ['bearings', 'Bearings', 'Bearing', 'assets/images/industrial-bearings.jpg', 899], ['pumps-motors', 'Pumps & Motors', 'Pump Motor', 'assets/images/industrial-pumps-motors.jpg', 8249]] },
      { key: 'weld', id: 'welding', name: 'Welding', base: 5499, step: -4800, reviews: [412, 276], 
        subs: [['welding-machines', 'Welding Machines', 'Welding Machine', 'assets/images/welding-machine.jpg'], ['welding-accessories', 'Welding Accessories', 'Welding Kit', 'assets/images/welding-machine.jpg']] },
      { key: 'kitchen', id: 'kitchen-pantry', name: 'Kitchen & Pantry', base: 1899, step: -1200, reviews: [623, 451], 
        subs: [['cookware', 'Cookware', 'Cookware Set', 'assets/images/kitchen-cookware.jpg'], ['storage-jars', 'Storage Jars', 'Storage Jar Set', 'assets/images/kitchen-cookware.jpg']] },
      { key: 'hardware', id: 'hardware', name: 'Hardware', base: 699, step: 100, reviews: [389, 512], 
        subs: [['hand-tools', 'Hand Tools', 'Plier Set', 'assets/images/hardware-hand-tools.jpg'], ['spanners-files', 'Spanners & Files', 'Spanner Set', 'assets/images/hardware-hand-tools.jpg']] },
      { key: 'auto', id: 'automotive', name: 'Automotive', base: 499, step: 3500, reviews: [301, 158], 
        subs: [['fluids-oils', 'Fluids & Oils', 'Engine Fluid', 'assets/images/automotive-fluids-battery.jpg'], ['car-batteries', 'Car Batteries', 'Car Battery', 'assets/images/automotive-fluids-battery.jpg']] },
      { key: 'garden', id: 'gardening-outdoor', name: 'Gardening & Outdoor', base: 599, step: 200, reviews: [245, 367], 
        subs: [['seeds-planting', 'Seeds & Planting', 'Garden Kit', 'assets/images/gardening-seeds-planting.jpg'], ['watering-tools', 'Watering & Tools', 'Watering Can', 'assets/images/gardening-watering-tools.jpg']] },
      { key: 'measure', id: 'measurement-testing', name: 'Measurement & Testing', base: 1199, step: -500, reviews: [534, 802], 
        subs: [['calculators-gauges', 'Calculators & Gauges', 'Calculator', 'assets/images/measurement-calculator-gauge.jpg'], ['test-kits', 'Test Kits', 'Test Kit', 'assets/images/testing-kits.jpg']] },
      { key: 'office', id: 'office-supplies', name: 'Office Supplies', base: 34999, step: -26000, reviews: [276, 419], 
        subs: [['computers', 'Computers & Accessories', 'Laptop', 'assets/images/office-laptop.jpg'], ['office-furniture', 'Office Furniture', 'Office Chair', 'assets/images/office-furniture-chair.jpg']] },
      { key: 'home', id: 'home-essentials', name: 'Home Essentials', base: 2499, step: 1500, reviews: [488, 305], 
        subs: [['fans-cooling', 'Fans & Cooling', 'Ceiling Fan', 'assets/images/home-fans-cooling.jpg'], ['home-appliances', 'Home Appliances', 'Room Heater', 'assets/images/home-fans-cooling.jpg']] }
    ];
    var IMG = { elec: 'assets/images/illustration-electricals.svg', light: 'assets/images/illustration-lighting.svg', tools: 'assets/images/illustration-power-tools.svg', safety: 'assets/images/illustration-safety.svg', plumb: 'assets/images/illustration-plumbing.svg', pack: 'assets/images/illustration-packaging.svg', build: 'assets/images/construction-materials.svg', indus: 'assets/images/illustration-industrial.svg', weld: 'assets/images/illustration-welding.svg', kitchen: 'assets/images/illustration-kitchen.svg', hardware: 'assets/images/illustration-hardware.svg', auto: 'assets/images/illustration-automotive.svg', garden: 'assets/images/illustration-gardening.svg', measure: 'assets/images/illustration-measurement.svg', office: 'assets/images/illustration-office.svg', home: 'assets/images/illustration-home.svg' };
    var list = [], b = 0;
    cats.forEach(function (c) {
      c.img = c.subs[0][3] || IMG[c.key];
      c.subs.forEach(function (s, si) {
        variants.forEach(function (v, vi) {
          var price = (s[4] || (c.base + si * c.step)) + vi * 55;
          var mrp = c.mrps ? c.mrps[si * 3 + vi] : Math.round(price * (1.52 + 0.03 * vi + 0.04 * si));
          var brand = brands[b % 6];
          list.push({ id: c.id + '-' + s[0] + '-' + (vi + 1), catId: c.id, catName: c.name, subId: s[0], subName: s[1],
            brand: brand, name: brand + ' ' + s[2] + ' ' + v, variant: v, badge: badges[vi], rating: ratings[vi],
            reviews: c.reviews[si] + vi, price: price, mrp: mrp, pop: list.length, img: s[3] || IMG[c.key] });
          b++;
        });
      });
    });
    return { cats: cats, list: list };
  }

  fmt(n) { return '₹' + Number(n).toLocaleString('en-IN'); }
  find(id) { return this.catalog.list.filter(function (p) { return p.id === id; })[0]; }
  catById(id) { return this.catalog.cats.filter(function (c) { return c.id === id; })[0]; }

  snap() { var s = this.state; return { page: s.page, cat: s.cat, sub: s.sub, pid: s.pid, qty: s.qty }; }
  go(page, extra) {
    var s = Object.assign({ page: page, stack: this.state.stack.concat([this.snap()]).slice(-30) }, extra || {});
    this.setState(s);
    try { window.scrollTo(0, 0); } catch (e) {}
  }
  back() {
    var st = this.state.stack.slice();
    var prev = st.pop() || { page: 'home' };
    this.setState(Object.assign({}, prev, { stack: st }));
    try { window.scrollTo(0, 0); } catch (e) {}
  }
  flash(msg, withCart) {
    var self = this;
    clearTimeout(this.tt);
    this.setState({ toast: msg, toastCart: !!withCart });
    this.tt = setTimeout(function () { self.setState({ toast: '' }); }, 2400);
  }
  addToCart(p, n) {
    var cart = Object.assign({}, this.state.cart);
    cart[p.id] = (cart[p.id] || 0) + (n || 1);
    this.setState({ cart: cart });
    this.flash('Added ' + p.name + ' to cart', true);
  }
  setQty(id, q) {
    var cart = Object.assign({}, this.state.cart);
    if (q <= 0) delete cart[id]; else cart[id] = q;
    this.setState({ cart: cart });
  }

  card(p) {
    var self = this;
    return Object.assign({}, p, {
      priceText: this.fmt(p.price), mrpText: this.fmt(p.mrp), hasBadge: !!p.badge,
      off: Math.round((1 - p.price / p.mrp) * 100) + '% off',
      label: this.state.cart[p.id] ? 'Add more (' + this.state.cart[p.id] + ')' : 'Add to cart',
      open: function () { self.go('product', { pid: p.id, qty: 1 }); },
      add: function () { self.addToCart(p, 1); }
    });
  }

  chip(on) {
    return on ? { bg: '#0b5cd5', fg: '#ffffff', bd: '#0b5cd5', on: true } : { bg: '#ffffff', fg: '#0f172a', bd: '#d5dae3', on: false };
  }

  renderVals() {
    var self = this, s = this.state, list = this.catalog.list, cats = this.catalog.cats;
    var page = s.page;
    var is = {}; is[page] = true;

    var openCat = {};
    cats.forEach(function (c) { openCat[c.key] = function () { self.go('category', { cat: c.id, sub: 'all', sort: 'popular' }); }; });

    // cart
    var lines = [], count = 0, mrpSum = 0, sum = 0;
    Object.keys(s.cart).forEach(function (id) {
      var p = self.find(id); if (!p) return;
      var q = s.cart[id];
      count += q; mrpSum += p.mrp * q; sum += p.price * q;
      lines.push({ id: id, img: p.img, name: p.name, subName: p.subName, qty: q,
        lineText: self.fmt(p.price * q), lineMrpText: self.fmt(p.mrp * q),
        open: function () { self.go('product', { pid: id, qty: 1 }); },
        inc: function () { self.setQty(id, q + 1); },
        dec: function () { self.setQty(id, q - 1); },
        remove: function () { self.setQty(id, 0); self.flash('Removed from cart', false); } });
    });

    // grid
    var grid = { items: [], title: '', hasTitle: false, showAll: false };
    var showGrid = false, listCount = 0, pageTitle = '', subChips = [], sortChips = [];
    var catObj = this.catById(s.cat) || cats[0];
    if (page === 'home') {
      showGrid = true;
      grid.items = list.filter(function (p) { return p.catId === 'electricals'; });
      grid.title = "Today's Deals"; grid.hasTitle = true; grid.showAll = true;
    }
    if (page === 'category') {
      showGrid = true; pageTitle = catObj.name;
      var items = list.filter(function (p) { return p.catId === catObj.id && (s.sub === 'all' || p.subId === s.sub); });
      var sorters = {
        popular: function (a, b) { return a.pop - b.pop; },
        low: function (a, b) { return a.price - b.price; },
        high: function (a, b) { return b.price - a.price; },
        rating: function (a, b) { return parseFloat(b.rating) - parseFloat(a.rating); }
      };
      grid.items = items.slice().sort(sorters[s.sort] || sorters.popular);
      listCount = items.length;
      subChips = [{ id: 'all', label: 'All' }].concat(catObj.subs.map(function (x) { return { id: x[0], label: x[1] }; }))
        .map(function (c) { return Object.assign({ label: c.label, pick: function () { self.setState({ sub: c.id }); } }, self.chip(s.sub === c.id)); });
      sortChips = [['popular', 'Popular'], ['low', 'Price: low to high'], ['high', 'Price: high to low'], ['rating', 'Top rated']]
        .map(function (c) { return Object.assign({ label: c[1], pick: function () { self.setState({ sort: c[0] }); } }, self.chip(s.sort === c[0])); });
    }
    var pd = {};
    if (page === 'product') {
      var p = this.find(s.pid) || list[0];
      pd = this.card(p); pd.reviews = p.reviews.toLocaleString('en-IN');
      pageTitle = p.catName;
      showGrid = true; grid.hasTitle = true; grid.title = 'You may also like';
      grid.items = list.filter(function (x) { return x.catId === p.catId && x.id !== p.id; }).slice(0, 5);
    }
    if (page === 'search') {
      showGrid = true; pageTitle = 'Search';
      var q = (s.query || '').trim().toLowerCase();
      if (q) {
        grid.items = list.filter(function (x) { return (x.name + ' ' + x.subName + ' ' + x.catName + ' ' + x.brand).toLowerCase().indexOf(q) !== -1; });
        grid.title = grid.items.length + ' results for “' + s.query.trim() + '”';
      } else {
        grid.items = list.filter(function (x) { return x.badge === 'Bestseller'; }).slice(0, 10);
        grid.title = 'Popular right now';
      }
      grid.hasTitle = true;
    }
    grid.empty = showGrid && grid.items.length === 0;
    grid.items = grid.items.map(function (x) { return self.card(x); });

    var titles = { categories: 'All categories', cart: 'My cart', checkout: 'Checkout', success: 'Order confirmed', orders: 'My orders', notifications: 'Notifications', account: 'Account' };
    if (titles[page]) pageTitle = titles[page];

    var active = '#0b5cd5', idle = '#64748b', idleD = '#0f172a';
    var nav = {
      home: page === 'home' ? active : idle,
      cats: (page === 'categories' || page === 'category') ? active : idle,
      cart: (page === 'cart' || page === 'checkout') ? active : idle,
      orders: (page === 'orders' || page === 'success') ? active : idle,
      account: page === 'account' ? active : idle,
      notes: page === 'notifications' ? active : idleD
    };

    var payOpts = [['upi', 'UPI', 'Pay with any UPI app'], ['cod', 'Cash on delivery', 'Pay when your order arrives'], ['credit', 'Business credit', 'Pay later on approved business accounts']]
      .map(function (o) { var on = s.pay === o[0]; return { label: o[1], hint: o[2], on: on, bd: on ? '#0b5cd5' : '#e5e8ee', bg: on ? '#f1f6fe' : '#ffffff', pick: function () { self.setState({ pay: o[0] }); } }; });

    return {
      is: is, nav: nav, pageTitle: pageTitle, showBack: page !== 'home',
      goHome: function () { self.go('home', { stack: [] }); },
      goCategories: function () { self.go('categories'); },
      goCart: function () { self.setState({ toast: '' }); self.go('cart'); },
      goOrders: function () { self.go('orders'); },
      goAccount: function () { self.go('account'); },
      goSearch: function () { self.go('search'); },
      goNotifications: function () { self.go('notifications'); },
      goCheckout: function () { self.go('checkout'); },
      goBack: function () { self.back(); },
      openCat: openCat,
      catTiles: cats.map(function (c) {
        return { name: c.name, img: c.img, initial: c.name.charAt(0), subs: c.subs.map(function (x) { return x[1]; }).join(' · '),
          count: list.filter(function (p) { return p.catId === c.id; }).length, open: openCat[c.key] };
      }),
      subChips: subChips, sortChips: sortChips, listCount: listCount,
      query: s.query,
      onQuery: function (e) { self.setState({ query: e.target.value }); },
      popular: ['Wires', 'Switches', 'LED', 'Drill', 'Helmet', 'Tap', 'Cement', 'Welding', 'Multimeter', 'Trolley'].map(function (t) { return { label: t, pick: function () { self.setState({ query: t }); } }; }),
      pd: pd, qty: s.qty,
      qtyInc: function () { self.setState({ qty: Math.min(99, s.qty + 1) }); },
      qtyDec: function () { self.setState({ qty: Math.max(1, s.qty - 1) }); },
      pdAdd: function () { var p = self.find(s.pid); if (p) self.addToCart(p, s.qty); },
      pdBuy: function () {
        var p = self.find(s.pid); if (!p) return;
        var cart = Object.assign({}, s.cart); cart[p.id] = (cart[p.id] || 0) + s.qty;
        self.setState({ cart: cart, toast: '' }); self.go('cart');
      },
      showGrid: showGrid, grid: grid,
      cartCount: count, cartEmpty: lines.length === 0, cartHas: lines.length > 0, lines: lines,
      sum: { mrp: this.fmt(mrpSum), save: this.fmt(mrpSum - sum), total: this.fmt(sum) },
      payOpts: payOpts,
      placeOrder: function () {
        if (!lines.length) { self.go('cart'); return; }
        var id = 'SC' + String(Date.now()).slice(-6);
        var d = new Date();
        var order = { id: id, items: count, total: self.fmt(sum),
          date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          pay: { upi: 'UPI', cod: 'Cash on delivery', credit: 'Business credit' }[s.pay],
          summary: lines.map(function (l) { return l.name + ' × ' + l.qty; }).join(', ') };
        var notes = [{ id: 'o' + id, title: 'Order ' + id + ' confirmed', body: count + ' items · ' + self.fmt(sum) + '. We will notify you when it ships.', time: 'Just now', to: 'orders' }].concat(s.notes);
        self.setState({ cart: {}, orders: [order].concat(s.orders), lastOrder: order, notes: notes, toast: '' });
        self.go('success', { stack: [] });
      },
      last: s.lastOrder || { id: '', items: 0, total: '' },
      orders: s.orders, ordersEmpty: s.orders.length === 0,
      notes: s.notes.map(function (n) { return Object.assign({}, n, { open: function () { self.go(n.to); } }); }),
      signIn: function () { self.flash('Sign-in is coming soon', false); },
      accountRows: [
        { label: 'My orders', go: function () { self.go('orders'); } },
        { label: 'My cart', go: function () { self.go('cart'); } },
        { label: 'Notifications', go: function () { self.go('notifications'); } },
        { label: 'Shop by category', go: function () { self.go('categories'); } },
        { label: 'Help & support', go: function () { self.flash('Help centre is coming soon', false); } }
      ],
      hasToast: !!s.toast, toast: s.toast, toastCart: s.toastCart
    };
  }
}

  /* ---------- template renderer ---------- */
  function lookup(scope, path) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    var parts = path.split('.'), v = scope;
    for (var i = 0; i < parts.length; i++) { if (v == null) return undefined; v = v[parts[i]]; }
    return v;
  }
  function interp(str, scope) {
    return str.replace(HOLE, function (_, p) { var v = lookup(scope, p); return v == null ? '' : String(v); });
  }
  function renderNodes(nodes, scope, out) {
    for (var i = 0; i < nodes.length; i++) renderNode(nodes[i], scope, out);
  }
  function renderNode(n, scope, out) {
    if (n.nodeType === 3) { out.appendChild(document.createTextNode(interp(n.nodeValue, scope))); return; }
    if (n.nodeType !== 1) return;
    var tag = n.localName;
    if (tag === 'sc-if') {
      if (lookup(scope, WHOLE.exec(n.getAttribute('value'))[1])) renderNodes(n.childNodes, scope, out);
      return;
    }
    if (tag === 'sc-for') {
      var list = lookup(scope, WHOLE.exec(n.getAttribute('list'))[1]) || [];
      var as = n.getAttribute('as');
      for (var k = 0; k < list.length; k++) {
        var s = Object.create(scope); s[as] = list[k]; s.$index = k;
        renderNodes(n.childNodes, s, out);
      }
      return;
    }
    if (tag === 'svg') { out.appendChild(document.importNode(n, true)); return; }
    var el = document.createElementNS(n.namespaceURI, tag);
    var props = {};
    for (var j = 0; j < n.attributes.length; j++) {
      var a = n.attributes[j], name = a.name, val = a.value, m = WHOLE.exec(val);
      if (name.indexOf('hint-') === 0) continue;
      if (name.indexOf('on') === 0 && m) {
        var fn = lookup(scope, m[1]);
        if (typeof fn !== 'function') continue;
        var ev = name.slice(2);
        if (ev === 'change' && tag === 'input' && TEXT_INPUTS[(n.getAttribute('type') || 'text').toLowerCase()]) ev = 'input';
        el.addEventListener(ev, fn);
        continue;
      }
      if (m) {
        var v = lookup(scope, m[1]);
        if (name === 'checked' || name === 'value' || name === 'autofocus') { props[name] = v; continue; }
        if (v === false || v == null) { if (name.indexOf('aria-') === 0) el.setAttribute(name, 'false'); continue; }
        el.setAttribute(name, String(v));
      } else {
        el.setAttribute(name, interp(val, scope));
      }
    }
    renderNodes(n.childNodes, scope, el);
    if ('value' in props) el.value = props.value == null ? '' : props.value;
    if ('checked' in props) el.checked = !!props.checked;
    if (props.autofocus) el.setAttribute('data-autofocus', '');
    out.appendChild(el);
  }

  function schedule() {
    if (pending || !app) return;
    pending = true;
    Promise.resolve().then(render);
  }
  function render() {
    pending = false;
    var active = document.activeElement, aid = active && active.id, ss, se;
    try { ss = active.selectionStart; se = active.selectionEnd; } catch (e) {}
    var keep = {};
    Array.prototype.forEach.call(app.querySelectorAll('input[id]'), function (i) {
      if (i.type !== 'radio' && i.type !== 'checkbox' && !i.hasAttribute('data-autofocus')) keep[i.id] = i.value;
    });
    var frag = document.createDocumentFragment();
    renderNodes(tpl.content.childNodes, comp.renderVals(), frag);
    app.replaceChildren(frag);
    Object.keys(keep).forEach(function (id) { var e = document.getElementById(id); if (e) e.value = keep[id]; });
    var pageChanged = comp.state.page !== lastPage;
    lastPage = comp.state.page;
    if (pageChanged) {
      var af = app.querySelector('[data-autofocus]');
      if (af && window.matchMedia('(min-width: 900px)').matches) af.focus();
      document.title = titleFor(comp.state);
    } else if (aid) {
      var e2 = document.getElementById(aid);
      if (e2) { e2.focus(); try { e2.setSelectionRange(ss, se); } catch (x) {} }
    }
  }

  /* ---------- URL routing (#/category/electricals, #/product/<id>, #/cart …) ---------- */
  var PAGES = ['categories', 'search', 'cart', 'checkout', 'orders', 'notifications', 'account'];
  function toHash(s) {
    if (s.page === 'category') return '#/category/' + s.cat;
    if (s.page === 'product') return '#/product/' + s.pid;
    if (s.page === 'home' || s.page === 'success') return '#/';
    return '#/' + s.page;
  }
  function fromHash() {
    var h = location.hash.replace(/^#\/?/, '').split('/');
    var p = h[0] || 'home';
    if (p === 'category' && h[1] && comp.catById(h[1])) return { page: 'category', cat: h[1], sub: 'all', sort: 'popular' };
    if (p === 'product' && h[1] && comp.find(h[1])) return { page: 'product', pid: h[1], qty: 1 };
    if (PAGES.indexOf(p) >= 0) return { page: p };
    return { page: 'home' };
  }
  function titleFor(s) {
    var base = 'Skycart';
    if (s.page === 'product') { var p = comp.find(s.pid); return (p ? p.name + ' — ' : '') + base; }
    if (s.page === 'category') { var c = comp.catById(s.cat); return (c ? c.name + ' — ' : '') + base; }
    if (s.page === 'home') return 'Skycart — Electricals, Tools & Home Essentials Delivered';
    return s.page.charAt(0).toUpperCase() + s.page.slice(1) + ' — ' + base;
  }

  function start() {
    app = document.getElementById('app');
    tpl = document.getElementById('app-template');
    comp = new Component({});
    var go = comp.go.bind(comp);
    comp.go = function (page, extra) {
      go(page, extra);
      var h = toHash(comp.state);
      if (h !== location.hash || page === 'success') { history.pushState(null, '', h); depth++; }
    };
    comp.back = function () {
      if (depth > 0) { depth--; history.back(); }
      else comp.go('home', { stack: [] });
    };
    window.addEventListener('popstate', function () {
      comp.setState(fromHash());
      try { window.scrollTo(0, 0); } catch (e) {}
    });
    comp.state = Object.assign({}, comp.state, fromHash());
    history.replaceState(null, '', toHash(comp.state));
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

