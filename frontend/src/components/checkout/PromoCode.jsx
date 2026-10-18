import { useState } from 'react';
import { promocodeAPI } from '../../api/marketplace';

const PromoCode = ({ onApply = () => {}, onRemove = () => {}, appliedPromo = null }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleApply = async () => {
    setLoading(true);
    setMessage('');
    try {
      const data = await promocodeAPI.apply(code.trim());
      onApply(data);
      setMessage('Promo applied');
    } catch (err) {
      setMessage(err?.response?.data?.detail || 'Invalid promo code');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onRemove();
    setCode('');
    setMessage('Promo removed');
  };

  return (
    <div className="bg-[#f5f5f5] rounded-3xl border border-gray-200 p-6 mt-6">
      <label className="block text-gray-500 mb-4 font-medium">Promo Code</label>

      {appliedPromo ? (
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">{appliedPromo.code}</div>
            <div className="text-sm text-gray-600">You saved ₹{appliedPromo.discount_amount}</div>
          </div>
          <button onClick={handleRemove} className="text-sm text-[#1f6d1a]">Remove</button>
        </div>
      ) : (
        <div className="flex gap-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            type="text"
            placeholder="GREEN20"
            className="flex-1 border border-gray-300 rounded-xl px-5 py-4 outline-none focus:border-[#1f6d1a]"
          />

          <button onClick={handleApply} disabled={loading || !code.trim()} className="border-2 border-[#1f6d1a] text-[#1f6d1a] px-8 rounded-xl font-semibold hover:bg-[#1f6d1a] hover:text-white transition disabled:opacity-60">
            {loading ? 'Applying...' : 'Apply'}
          </button>
        </div>
      )}

      {message && <div className="mt-3 text-sm text-[#1f6d1a]">{message}</div>}
    </div>
  );
};

export default PromoCode;