import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { productService, customerService, invoiceService } from '../../services';
import { formatCurrency } from '../../utils/format';

export default function CreateInvoiceModal({ open, onClose, onCreated }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1, unitPrice: 0, gstPercent: 0, stock: 0 }]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [amountPaid, setAmountPaid] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      customerService.list({ limit: 200 }).then((r) => setCustomers(r.data.data)).catch(() => {});
      productService.list({ limit: 500 }).then((r) => setProducts(r.data.data)).catch(() => {});
      setCustomerId('');
      setItems([{ productId: '', quantity: 1, unitPrice: 0, gstPercent: 0, stock: 0 }]);
      setDiscountAmount(0);
      setPaymentMethod('cash');
      setPaymentStatus('paid');
      setAmountPaid(0);
      setNotes('');
    }
  }, [open]);

  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === 'productId') {
        const product = products.find((p) => p.id === value);
        if (product) {
          next[index].unitPrice = parseFloat(product.selling_price);
          next[index].gstPercent = parseFloat(product.gst_percent);
          next[index].stock = product.current_stock;
        }
      }
      return next;
    });
  };

  const addItem = () => setItems((prev) => [...prev, { productId: '', quantity: 1, unitPrice: 0, gstPercent: 0, stock: 0 }]);
  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  const subtotal = items.reduce((sum, it) => sum + (it.unitPrice * it.quantity), 0);
  const gstTotal = items.reduce((sum, it) => sum + (it.unitPrice * it.quantity * it.gstPercent) / 100, 0);
  const grandTotal = subtotal + gstTotal - (parseFloat(discountAmount) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validItems = items.filter((it) => it.productId && it.quantity > 0);
    if (validItems.length === 0) {
      toast.error('Add at least one product line.');
      return;
    }
    for (const it of validItems) {
      if (it.quantity > it.stock) {
        toast.error(`Insufficient stock for selected product. Available: ${it.stock}`);
        return;
      }
    }

    setSaving(true);
    try {
      await invoiceService.create({
        customerId: customerId || null,
        items: validItems.map((it) => ({
          productId: it.productId, quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice), gstPercent: Number(it.gstPercent),
        })),
        discountAmount: Number(discountAmount) || 0,
        paymentMethod,
        paymentStatus,
        amountPaid: paymentStatus === 'paid' ? grandTotal : Number(amountPaid) || 0,
        notes,
      });
      toast.success('Invoice created successfully.');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invoice.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Invoice" maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Customer</label>
          <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Walk-in Customer</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Products</label>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <select
                  className="input col-span-5"
                  value={item.productId}
                  onChange={(e) => updateItem(i, 'productId', e.target.value)}
                >
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.current_stock <= 0}>
                      {p.name} ({p.current_stock} in stock)
                    </option>
                  ))}
                </select>
                <input
                  type="number" min="1" className="input col-span-2" placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                />
                <input
                  type="number" step="0.01" className="input col-span-2" placeholder="Price"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(i, 'unitPrice', e.target.value)}
                />
                <input
                  type="number" step="0.01" className="input col-span-2" placeholder="GST%"
                  value={item.gstPercent}
                  onChange={(e) => updateItem(i, 'gstPercent', e.target.value)}
                />
                <button
                  type="button"
                  className="col-span-1 h-9 w-9 rounded-lg flex items-center justify-center text-ink-muted hover:text-danger hover:bg-danger/10 transition-colors"
                  onClick={() => removeItem(i)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addItem} className="btn-secondary mt-3 !py-1.5 !text-xs">
            <Plus size={14} /> Add Line
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Discount (₹)</label>
            <input type="number" step="0.01" className="input" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} />
          </div>
          <div>
            <label className="label">Payment Method</label>
            <select className="input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="credit">Credit</option>
            </select>
          </div>
          <div>
            <label className="label">Payment Status</label>
            <select className="input" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
              <option value="paid">Paid in Full</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        {paymentStatus === 'partial' && (
          <div>
            <label className="label">Amount Paid Now (₹)</label>
            <input type="number" step="0.01" className="input" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
          </div>
        )}

        <div>
          <label className="label">Notes</label>
          <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="rounded-md bg-surface-2 border border-line px-5 py-4 space-y-2 text-sm">
          <div className="flex justify-between text-ink-muted"><span>Taxable Value</span><span className="tabular-nums">{formatCurrency(subtotal)}</span></div>
          <div className="flex justify-between text-ink-muted"><span>GST</span><span className="tabular-nums">{formatCurrency(gstTotal)}</span></div>
          <div className="flex justify-between text-ink-muted"><span>Discount</span><span className="tabular-nums">- {formatCurrency(parseFloat(discountAmount) || 0)}</span></div>
          <div className="flex justify-between text-base font-semibold text-ink pt-2.5 border-t border-line">
            <span>Grand Total</span><span className="tabular-nums">{formatCurrency(grandTotal)}</span>
          </div>
          <p className="text-[11px] text-ink-subtle pt-1">
            GST is split into CGST + SGST for in-state customers, or IGST for inter-state, based on the place of supply — shown on the generated invoice.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Generating Invoice…' : 'Generate Invoice'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
