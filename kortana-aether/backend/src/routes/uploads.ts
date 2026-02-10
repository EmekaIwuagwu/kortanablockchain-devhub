import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

const router = Router();

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and PDFs are allowed'));
        }
    }
});

import Document from '../models/Document.js';

/**
 * Upload to Pinata Helper
 */
const uploadToPinata = async (filePath: string, fileName: string) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    let data = new FormData();
    data.append('file', fs.createReadStream(filePath));

    const metadata = JSON.stringify({
        name: fileName,
        keyvalues: {
            project: 'Aether-Real-Estate'
        }
    });
    data.append('pinataMetadata', metadata);

    const options = JSON.stringify({
        cidVersion: 0,
    });
    data.append('pinataOptions', options);

    try {
        const response = await axios.post(url, data, {
            maxBodyLength: Infinity,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${(data as any)._boundary}`,
                'Authorization': `Bearer ${process.env.PINATA_JWT}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Pinata upload error:', error);
        throw error;
    }
};

// POST /api/upload
router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const userAddress = req.body.userAddress || req.headers['x-user-address'];
        if (!userAddress) {
            return res.status(400).json({ message: 'userAddress is required to identify the owner' });
        }

        const filePath = req.file.path;
        console.log(`🚀 File saved locally: ${filePath}. Uploading to Pinata...`);

        // Upload to Pinata
        let pinataResult = null;
        try {
            pinataResult = await uploadToPinata(filePath, req.file.originalname);
            console.log(`✅ Pinata upload success: ${pinataResult.IpfsHash}`);
        } catch (pinError) {
            console.error('⚠️ Pinata upload failed, but local file is saved.');
        }

        // Return the file path or URL
        const fileUrl = `/uploads/${req.file.filename}`;

        // Save to Database
        const doc = await Document.create({
            userAddress: userAddress as string,
            fileName: req.file.originalname,
            fileUrl: fileUrl,
            ipfsHash: pinataResult ? pinataResult.IpfsHash : null,
            status: 'PENDING'
        });

        res.json({
            message: pinataResult ? 'File uploaded to Local & IPFS successfully' : 'File uploaded locally (IPFS failed)',
            fileUrl: fileUrl,
            fileName: req.file.originalname,
            ipfsHash: pinataResult ? pinataResult.IpfsHash : null,
            documentId: doc.id,
            pinataData: pinataResult
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

// GET /api/upload/user/:address
router.get('/user/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const documents = await Document.findAll({
            where: { userAddress: address },
            order: [['createdAt', 'DESC']]
        });
        res.json({ documents });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch documents', error: error.message });
    }
});

export default router;
