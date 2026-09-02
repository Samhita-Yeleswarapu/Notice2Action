const { v2: cloudinary } = require('cloudinary');
let configured = false;

function ensureConfigured() {
  if (configured) return true;
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return false;
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
  return true;
}
async function uploadPdfBuffer(buffer, originalName = 'notice') {
  if (!ensureConfigured()) {
    return null;
  }

  const safeName = originalName
    .replace(/\.pdf$/i, '')
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .slice(0, 80) || 'notice';

  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'notice2action/pdfs',
        public_id: `${safeName}-${Date.now()}`,
      },
      (err, res) => {
        if (err) return reject(err);
        resolve(res);
      }
    );
    uploadStream.end(buffer);
  });

  return { url: result.secure_url, publicId: result.public_id };
}

async function deletePdfByPublicId(publicId) {
  if (!publicId || !ensureConfigured()) {
    return null;
  }
  return cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
}

module.exports = { uploadPdfBuffer, deletePdfByPublicId, isConfigured: ensureConfigured };
