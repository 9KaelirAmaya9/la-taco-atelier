import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { validateDeliveryAddress } from '@/utils/deliveryValidation';
import { useLanguage } from '@/contexts/LanguageContext';

const DeliveryAddressValidator = () => {
  const { t } = useLanguage();
  const [address, setAddress] = useState('');
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<{
    isValid: boolean;
    message: string;
    estimatedMinutes?: number;
  } | null>(null);

  const handleValidate = async () => {
    if (!address.trim()) return;

    setValidating(true);
    setResult(null);

    try {
      const validationResult = await validateDeliveryAddress(address);
      setResult({
        isValid: validationResult.isValid,
        message: validationResult.message || '',
        estimatedMinutes: validationResult.estimatedMinutes,
      });
    } catch (error) {
      setResult({
        isValid: false,
        message: 'Unable to validate address. Please try again.',
      });
    } finally {
      setValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleValidate();
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <MapPin className="h-6 w-6 text-primary" />
        <h3 className="font-serif text-2xl font-semibold">
          {t("location.checkDelivery")}
        </h3>
      </div>
      
      <p className="text-muted-foreground mb-4">
        {t("location.checkDeliverySubtext")}
      </p>

      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="Enter your delivery address..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={validating}
          className="flex-1"
        />
        <Button 
          onClick={handleValidate} 
          disabled={validating || !address.trim()}
        >
          {validating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            'Check'
          )}
        </Button>
      </div>

      {result && (
        <div
          className={`p-4 rounded-lg border ${
            result.isValid
              ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
              : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900'
          }`}
        >
          <div className="flex items-start gap-3">
            {result.isValid ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`font-semibold ${
                result.isValid 
                  ? 'text-green-900 dark:text-green-100' 
                  : 'text-amber-900 dark:text-amber-100'
              }`}>
                {result.isValid ? 'Delivery Available!' : 'Outside Delivery Zone'}
              </p>
              <p className={`text-sm mt-1 ${
                result.isValid 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-amber-700 dark:text-amber-300'
              }`}>
                {result.message}
              </p>
              {result.estimatedMinutes && (
                <p className="text-sm font-medium mt-2 text-green-800 dark:text-green-200">
                  Estimated delivery: ~{result.estimatedMinutes} minutes
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DeliveryAddressValidator;
