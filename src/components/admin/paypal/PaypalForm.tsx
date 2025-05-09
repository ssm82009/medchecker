
import React from 'react';
import { Button } from '@/components/ui/button';

interface PaypalFormProps {
  paypalMode: 'sandbox' | 'live';
  sandboxClientId: string;
  sandboxSecret: string;
  liveClientId: string;
  liveSecret: string;
  onPaypalModeChange: (value: string) => void;
  setSandboxClientId: (value: string) => void;
  setSandboxSecret: (value: string) => void;
  setLiveClientId: (value: string) => void;
  setLiveSecret: (value: string) => void;
  onSaveClick: () => void;
  savingPaypal: boolean;
}

const PaypalForm: React.FC<PaypalFormProps> = ({
  paypalMode,
  sandboxClientId,
  sandboxSecret,
  liveClientId,
  liveSecret,
  onPaypalModeChange,
  setSandboxClientId,
  setSandboxSecret,
  setLiveClientId,
  setLiveSecret,
  onSaveClick,
  savingPaypal
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">وضع التشغيل</label>
        <select
          value={paypalMode}
          onChange={(e) => onPaypalModeChange(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="sandbox">Sandbox (اختبار)</option>
          <option value="live">Live (مباشر)</option>
        </select>
      </div>
      {paypalMode === 'sandbox' ? (
        <>
          <div>
            <label className="block mb-1 font-medium">Sandbox Client ID</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded" 
              value={sandboxClientId} 
              onChange={e => setSandboxClientId(e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Sandbox Secret</label>
            <input 
              type="password" 
              className="w-full p-2 border rounded" 
              value={sandboxSecret} 
              onChange={e => setSandboxSecret(e.target.value)} 
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="block mb-1 font-medium">Live Client ID</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded" 
              value={liveClientId} 
              onChange={e => setLiveClientId(e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Live Secret</label>
            <input 
              type="password" 
              className="w-full p-2 border rounded" 
              value={liveSecret} 
              onChange={e => setLiveSecret(e.target.value)} 
            />
          </div>
        </>
      )}
      <div>
        <label className="block mb-1 font-medium">العملة</label>
        <input 
          type="text" 
          className="w-full p-2 border rounded bg-gray-100" 
          value="USD" 
          disabled 
        />
      </div>
      <button
        onClick={onSaveClick}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        disabled={savingPaypal}
      >
        {savingPaypal ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
      </button>
    </div>
  );
};

export default PaypalForm;
