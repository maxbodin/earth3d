"use server";
const ORS_API_URL: string =
  "https://api.openrouteservice.org/geocode";
const ORS_TOKEN: string = process.env.ORS_API_KEY ?? "";

/**
 *
 * @param text
 */
export const autocomplete = async (text: string): Promise<any> => {
  try {
    const response: Response = await fetch(
      `${ORS_API_URL}/autocomplete?api_key=${ORS_TOKEN}&text=${encodeURIComponent(text)}&size=20`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(`autocomplete: Failed to fetch data ${error.message}`);
  }
};

/**
 *
 * @param lon
 * @param lat
 */
export const reverse = async (lon: number, lat: number): Promise<any> => {
  try {
    const response: Response = await fetch(
      `${ORS_API_URL}/reverse?api_key=${ORS_TOKEN}&point.lon=${lon}&point.lat=${lat}&size=3`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(`autocomplete: Failed to fetch data ${error.message}`);
  }
};


