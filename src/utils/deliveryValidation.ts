import { supabase } from "@/integrations/supabase/client";

export interface DeliveryValidationResult {
  isValid: boolean;
  estimatedMinutes?: number;
  message?: string;
  suggestPickup?: boolean;
  distanceMiles?: number;
}

export const validateDeliveryAddress = async (address: string): Promise<DeliveryValidationResult> => {
  try {
    console.log("🚀 Starting delivery validation for:", address);
    
    // Create a timeout promise - reduced to 5 seconds for faster UX
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Validation timeout')), 5000);
    });

    // Race between the actual call and the timeout
    const validationPromise = supabase.functions.invoke('validate-delivery-address', {
      body: { address }
    });

    const { data, error } = await Promise.race([validationPromise, timeoutPromise]) as any;

    if (error) {
      console.error("❌ Delivery validation error:", error);
      // Return as valid but with a warning - allow checkout to proceed
      return {
        isValid: true,
        estimatedMinutes: 30,
        message: "Address validation unavailable. We'll confirm delivery during order processing.",
        suggestPickup: false
      };
    }

    console.log("✅ Validation successful:", data);
    return data as DeliveryValidationResult;
  } catch (error) {
    console.error("❌ Delivery validation exception:", error);
    // Return as valid but with a warning - allow checkout to proceed
    return {
      isValid: true,
      estimatedMinutes: 30,
      message: "Address validation unavailable. We'll confirm delivery during order processing.",
      suggestPickup: false
    };
  }
};
