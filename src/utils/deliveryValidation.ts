import { supabase } from "@/integrations/supabase/client";

export const validateDeliveryAddress = async (address: string): Promise<{
  isValid: boolean;
  estimatedMinutes?: number;
  message?: string;
}> => {
  try {
    // Extract zip code from address (simple regex)
    const zipMatch = address.match(/\b\d{5}\b/);
    
    if (!zipMatch) {
      return {
        isValid: false,
        message: "Please include a valid 5-digit ZIP code in your delivery address."
      };
    }

    const zipCode = zipMatch[0];

    // Check if zip code is in delivery zone
    const { data: zone, error } = await supabase
      .from("delivery_zones")
      .select("estimated_minutes, is_active")
      .eq("zip_code", zipCode)
      .eq("is_active", true)
      .single();

    if (error || !zone) {
      return {
        isValid: false,
        message: `Sorry, we don't currently deliver to ZIP code ${zipCode}. We only deliver within a 15-minute radius of our restaurant.`
      };
    }

    return {
      isValid: true,
      estimatedMinutes: zone.estimated_minutes,
      message: `Estimated delivery time: ${zone.estimated_minutes} minutes`
    };
  } catch (error) {
    console.error("Delivery validation error:", error);
    return {
      isValid: false,
      message: "Unable to validate delivery address. Please try again."
    };
  }
};
