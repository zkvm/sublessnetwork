import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { JSONContent } from '@tiptap/react';

/**
 * Mock API endpoint for creating resources
 * 
 * TODO: Replace this with actual resource service endpoint
 * that will:
 * 1. Encrypt the content
 * 2. Store in database
 * 3. Generate proof token
 * 4. Return resource ID and proof
 */

interface CreateResourceRequest {
    title: string;
    content: JSONContent;
    preview: string;
    userId: string;
    timestamp: string;
}

interface CreateResourceResponse {
    success: boolean;
    resourceId: string;
    proof: string;
    message: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<CreateResourceResponse | { error: string }>
) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { title, content, preview, userId, timestamp } = req.body as CreateResourceRequest;

        // Validate required fields
        if (!title || !content || !preview || !userId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Generate mock resource ID (UUID)
        const resourceId = crypto.randomUUID();

        // Generate mock proof token (format: XXX-XXXX)
        const proofPart1 = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const proofPart2 = crypto.randomBytes(2).toString('hex');
        const proof = `${proofPart1}-${proofPart2}`;

        // Log for debugging (in real implementation, this would be stored in database)
        console.log('📝 Mock Resource Created:');
        console.log(`   Resource ID: ${resourceId}`);
        console.log(`   Proof Token: ${proof}`);
        console.log(`   User ID: ${userId}`);
        console.log(`   Title: ${title}`);
        console.log(`   Preview length: ${preview.length} chars`);
        console.log(`   Content (JSON):`, JSON.stringify(content, null, 2));
        console.log(`   Timestamp: ${timestamp}`);

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Return mock response
        return res.status(201).json({
            success: true,
            resourceId,
            proof,
            message: 'Resource created successfully (mock)',
        });

    } catch (error: any) {
        console.error('Error in mock create resource API:', error);
        return res.status(500).json({
            error: error.message || 'Internal server error',
        });
    }
}
