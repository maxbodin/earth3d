'use server'

import { createFlickr } from 'flickr-sdk'
import { Photo } from '@/app/types/flickrTypes'

const FLICKR_API_KEY: string = process.env.FLICKR_API_KEY ?? ''

const { flickr } = createFlickr(FLICKR_API_KEY)

/**
 *
 * @param photo
 * @param size
 */
const getFlickrImageURL = (photo: Photo, size: 'q' | 'o' | 'b') => {
   let url: string = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${
      photo.secret
   }`
   if (size) {
      // Configure image size
      url += `_${size}`
   }
   url += '.jpg'
   return url
}

/**
 *
 * @param latitude
 * @param longitude
 */
export const fetchGeoPhotos = async (latitude: number, longitude: number): Promise<any> => {
   const { stat, photos } = await flickr('flickr.photos.search', {
      //text: 'cat',
      //sort: 'interestingness-desc',
      per_page: '100',
      media: 'photos',
      lat: latitude.toString(),
      lon: longitude.toString(),
      //license: '4',
      radius: '32',
      radius_units: 'km',
      extras: 'description,license,date_upload,date_taken,owner_name,geo,tags',
   })

   return photos.photo.map((photo: Photo) => getFlickrImageURL(photo, 'q'))
}


