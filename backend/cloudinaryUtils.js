const cloudinary = require("./cloudinary");

/*
 Extract the Cloudinary public_id from a full URL
 Example: https://res.cloudinary.com/demo/image/upload/v1234567/folder/image.jpg
 Returns: folder/image
 */
function extractPublicId(cloudinaryUrl) {
    if (!cloudinaryUrl || typeof cloudinaryUrl !== 'string') {
        return null;
    }

    try {
        const match = cloudinaryUrl.match(/\/upload\/v\d+\/(.+)\.\w+$/);
        if (match && match[1]) {
            return match[1];
        }

        const match2 = cloudinaryUrl.match(/\/upload\/(.+)\.\w+$/);
        if (match2 && match2[1]) {
            return match2[1];
        }
    } catch (err) {
        console.error("Error extracting public_id:", err);
    }

    return null;
}

/*
 Delete from Cloudinary asynchronously (fire-and-forget)
 Does not await, so the user doesn't have to wait
 */
function deleteFromCloudinaryAsync(cloudinaryUrl, resourceType = 'image') {
    const publicId = extractPublicId(cloudinaryUrl);

    if (!publicId) {
        return;
    }

    cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
        .then((result) => {
            // deletion successful
        })
        .catch((err) => {
            console.error(`Cloudinary deletion failed for ${publicId}:`, err);
        });
}

module.exports = {
    extractPublicId,
    deleteFromCloudinaryAsync
};
