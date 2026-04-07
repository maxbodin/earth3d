/**
 * Represents a single photo object within the "photo" array.
 */
export interface Photo {
   id: string;           // Unique ID of the photo
   owner: string;        // Owner's ID
   secret: string;       // Secret string used to construct the photo URL
   server: string;       // Server ID where the photo is stored
   farm: number;         // Farm ID where the photo is stored
   title: string;        // Title of the photo
   ispublic: number;     // Indicates if the photo is public (1) or private (0)
   isfriend: number;     // Indicates if the photo is available to friends (1) or not (0)
   isfamily: number;     // Indicates if the photo is available to family (1) or not (0)
   license: string;      // License type of the photo
   description: any,
   dateupload: string,
   datetaken: string,
   datetakengranularity: number,
   datetakenunknown: string,
   ownername: string;    // Name of the photo's owner
   tags: string,
   latitude: string,
   longitude: string,
   accuracy: string,
   context: number,
   place_id: string,
   woeid: string,
   geo_is_public: number,
   geo_is_contact: number,
   geo_is_friend: number,
   geo_is_family: number
}

/**
 * Represents the "photos" object containing pagination information and the list of photos.
 */
interface Photos {
   page: number;         // Current page number
   pages: number;        // Total number of available pages
   perpage: number;      // Number of photos per page
   total: number;        // Total number of photos available
   photo: Photo[];       // Array of photo objects
}
