import { supabase } from "@/integrations/supabase/client";

export interface GoogleMapsValidationResult {
  isValid: boolean;
  estimatedMinutes?: number;
  message?: string;
  suggestPickup?: boolean;
  distanceMiles?: number;
  formattedAddress?: string;
}

export interface GooglePlace {
  place_id: string;
  formatted_address: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

/**
 * Validates a delivery address using Google Maps place_id
 * This replaces text parsing with structured Google Maps data
 */
export const validateDeliveryAddressGoogle = async (
  place_id: string,
  formatted_address?: string
): Promise<GoogleMapsValidationResult> => {
  try {
    console.log("🚀 Starting Google Maps delivery validation for place_id:", place_id);
    
    if (!place_id || place_id.trim().length === 0) {
      return {
        isValid: false,
        message: "Please provide a valid address.",
        suggestPickup: true
      };
    }
    
    // Reduced timeout to 5 seconds (Google APIs are faster than Mapbox)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Validation timeout')), 5000);
    });

    // Call the new Google Maps validation edge function
    const validationPromise = supabase.functions.invoke('validate-delivery-google', {
      body: { 
        place_id: place_id.trim(),
        formatted_address: formatted_address
      }
    });

    const result = await Promise.race([validationPromise, timeoutPromise]) as any;

    console.log("📦 Google Maps validation raw result:", result);

    // Handle different response formats
    let data: any = null;
    let error: any = null;

    if (result && typeof result === 'object') {
      // Check if it's a Supabase function response
      if ('data' in result && 'error' in result) {
        data = result.data;
        error = result.error;
        console.log("📦 Supabase function response - data:", data, "error:", error);
      } else if ('isValid' in result) {
        // Direct response from edge function
        data = result;
        console.log("📦 Direct edge function response:", data);
      } else {
        // Try to parse as error
        error = result;
        console.log("📦 Parsed as error:", error);
      }
    } else {
      error = result;
      console.log("📦 Non-object result, treating as error:", error);
    }

    if (error) {
      console.error("❌ Google Maps validation error:", error);
      console.error("❌ Error type:", typeof error);
      console.error("❌ Error keys:", error ? Object.keys(error) : 'null');
      
      // Try to extract error message from error object
      let errorMessage = "We apologize, but we couldn't validate your address. Pickup is always available!";
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      }
      
      console.error("❌ Extracted error message:", errorMessage);
      
      return {
        isValid: false,
        message: errorMessage,
        suggestPickup: true
      };
    }

    // Validate response structure
    if (!data || typeof data !== 'object') {
      console.error("❌ Invalid validation response:", data);
      return {
        isValid: false,
        message: "We apologize, but we received an invalid response. Pickup is always available!",
        suggestPickup: true
      };
    }

    // Ensure response has required fields
    const validationResult: GoogleMapsValidationResult = {
      isValid: data.isValid === true,
      message: data.message || (data.isValid ? "Address validated successfully" : "Address validation failed"),
      suggestPickup: data.suggestPickup === true,
      estimatedMinutes: data.estimatedMinutes,
      distanceMiles: data.distanceMiles,
      formattedAddress: data.formattedAddress || formatted_address
    };

    console.log("✅ Google Maps validation successful:", validationResult);
    return validationResult;
  } catch (error: any) {
    console.error("❌ Google Maps validation exception:", error);
    
    // Handle timeout specifically
    if (error?.message === 'Validation timeout') {
      return {
        isValid: false,
        message: "Validation is taking longer than expected. Please try again or choose pickup instead.",
        suggestPickup: true
      };
    }
    
    return {
      isValid: false,
      message: error?.message || "We apologize, but we couldn't validate your address. Pickup is always available!",
      suggestPickup: true
    };
  }
};

