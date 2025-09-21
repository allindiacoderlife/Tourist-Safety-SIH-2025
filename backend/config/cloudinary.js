const cloudinary = require('cloudinary').v2;
const { cloudinary_cloud_name, cloudinary_api_key, cloudinary_api_secret } = require('./secret');

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudinary_cloud_name,
  api_key: cloudinary_api_key,
  api_secret: cloudinary_api_secret,
});

// Upload image to Cloudinary
const uploadImage = async (fileBuffer, folder = 'tourist-safety-profiles', publicId) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'image',
          transformation: [
            { width: 500, height: 500, crop: 'fill' }, // Resize to 500x500
            { quality: 'auto' } // Auto quality optimization
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Convert buffer to stream
      const bufferStream = require('stream').Readable.from(fileBuffer);
      bufferStream.pipe(uploadStream);
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      result
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: true,
      result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate optimized image URL
const getOptimizedImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    width: 300,
    height: 300,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  };

  const finalOptions = { ...defaultOptions, ...options };
  return cloudinary.url(publicId, finalOptions);
};

module.exports = {
  uploadImage,
  deleteImage,
  getOptimizedImageUrl,
  cloudinary
};