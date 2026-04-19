const { s3 } = require("../config/s3");
const { createPresignedPost } = require("@aws-sdk/s3-presigned-post");
const { CopyObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

/**
 * Generates a pre-signed POST URL for uploading to the temp directory.
 * @param {string} fileType - MIME type of the file
 * @param {string} originalName - Original filename
 * @param {string} folder - Folder name (e.g., 'banks', 'properties')
 */
const generatePresignedPostConfig = async (fileType, originalName, folder = "banks") => {
    const extension = originalName.split('.').pop();
    const fileName = `${uuidv4()}.${extension}`;
    const fileKey = `${folder}/temp/${fileName}`;

    const { url, fields } = await createPresignedPost(s3, {
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Conditions: [
            ["starts-with", "$Content-Type", "image/"],
            ["content-length-range", 0, 5242880], // Max 5MB
        ],
        Fields: {
            "Content-Type": fileType,
        },
        Expires: 3600, // 1 hour
    });

    return {
        url,
        fields,
        fileKey,
        fileUrl: `https://${BUCKET_NAME}.s3.${process.env.AWS_S3_REGION || 'us-east-1'}.amazonaws.com/${fileKey}`
    };
};

/**
 * Moves an object from temp to permanent folder.
 */
const moveTempToPermanent = async (tempKey) => {
    if (!tempKey || typeof tempKey !== 'string' || !tempKey.includes("/temp/")) return tempKey;

    const parts = tempKey.split("/");
    const folder = parts[0];
    const fileName = parts.pop();
    const permanentKey = `${folder}/permanent/${fileName}`;

    const copyParams = {
        Bucket: BUCKET_NAME,
        CopySource: `${BUCKET_NAME}/${tempKey}`,
        Key: permanentKey,
    };

    await s3.send(new CopyObjectCommand(copyParams));
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: tempKey }));

    return permanentKey;
};

/**
 * Deletes an object from S3.
 * @param {string} key - S3 key
 */
const deleteS3Object = async (key) => {
    if (!key) return;
    try {
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
    } catch (error) {
        console.error("Error deleting S3 object:", error);
    }
};

/**
 * Constructs the full S3 URL for a given key.
 * @param {string} key - S3 key
 * @returns {string} - Full S3 URL or relative path for legacy files
 */
const getFullUrl = (key) => {
    if (!key) return "";
    if (key.startsWith("http")) return key;

    // If it's an S3 path (managed by us)
    if (key.startsWith("banks/") || key.startsWith("properties/")) {
        return `https://${BUCKET_NAME}.s3.${process.env.AWS_S3_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    }

    // Legacy local path or other
    return key;
};

module.exports = {
    generatePresignedPostConfig,
    moveTempToPermanent,
    deleteS3Object,
    getFullUrl,
};
