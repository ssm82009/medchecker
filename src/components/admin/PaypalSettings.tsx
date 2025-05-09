
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { usePaypalSettings } from '@/hooks/paypal/usePaypalSettings';
import PaypalForm from './paypal/PaypalForm';
import PermissionErrorMessage from './paypal/PermissionErrorMessage';
import ErrorDialog from './paypal/ErrorDialog';

const PaypalSettings = () => {
  const {
    paypalMode,
    sandboxClientId,
    sandboxSecret,
    liveClientId,
    liveSecret,
    savingPaypal,
    isError,
    errorMessage,
    isPermissionError,
    handlePaypalModeChange,
    setSandboxClientId,
    setSandboxSecret,
    setLiveClientId,
    setLiveSecret,
    savePaypalSettings,
    setIsError
  } = usePaypalSettings();

  // إذا كان هناك خطأ في الصلاحيات، عرض رسالة مناسبة
  if (isPermissionError) {
    return <PermissionErrorMessage />;
  }

  return (
    <Card className="mb-8 max-w-xl mx-auto">
      <CardHeader><CardTitle>إعدادات بوابة الدفع بايبال</CardTitle></CardHeader>
      <CardContent>
        <PaypalForm
          paypalMode={paypalMode}
          sandboxClientId={sandboxClientId}
          sandboxSecret={sandboxSecret}
          liveClientId={liveClientId}
          liveSecret={liveSecret}
          onPaypalModeChange={handlePaypalModeChange}
          setSandboxClientId={setSandboxClientId}
          setSandboxSecret={setSandboxSecret}
          setLiveClientId={setLiveClientId}
          setLiveSecret={setLiveSecret}
          onSaveClick={savePaypalSettings}
          savingPaypal={savingPaypal}
        />
      </CardContent>

      {/* عرض تفاصيل الخطأ */}
      <ErrorDialog 
        isOpen={isError} 
        onOpenChange={setIsError} 
        errorMessage={errorMessage} 
      />
    </Card>
  );
};

export default PaypalSettings;
