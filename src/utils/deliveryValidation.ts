import { supabase } from "@/integrations/supabase/client";

export const validateDeliveryAddress = async (address: string): Promise<{
  isValid: boolean;
  estimatedMinutes?: number;
  message?: string;
}> => {
  try {
    // Use edge function for real-time validation with Mapbox
    const { data, error } = await supabase.functions.invoke('validate-delivery-address', {
      body: { address }
    });

    if (error) {
      console.error("Delivery validation error:", error);
      return {
        isValid: false,
        message: "Unable to validate delivery address. Please try again."
      };
    }

    return data;
  } catch (error) {
    console.error("Delivery validation error:", error);
    return {
      isValid: false,
      message: "Unable to validate delivery address. Please try again."
    };
  }
};
