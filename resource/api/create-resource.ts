import { storeContent } from '../services/content-storage.js';

export interface CreateResourceRequest {
    userId: string;
    username: string;
    content: string;
    messageId?: string; // Optional - will be generated if not provided
    sourcePlatform?: string;
    contentType?: string;
    priceUsdCents?: number;
}

export interface CreateResourceResponse {
    success: boolean;
    resourceId: string;
    proofToken: string;
    duplicate?: boolean;
}

/**
 * Create a new resource by encrypting and storing content
 * 
 * This replaces the DM queue processor with a direct API call approach.
 * 
 * @param request - Resource creation parameters
 * @returns Resource ID and proof token
 */
export async function createResource(
    request: CreateResourceRequest
): Promise<CreateResourceResponse> {
    const { userId, username, content, messageId, sourcePlatform, contentType, priceUsdCents } = request;

    console.log(`📝 Creating resource for @${username} (${userId})`);
    console.log(`   Content length: ${content.length} chars`);

    try {
        // Generate messageId if not provided (for API calls without source message)
        const effectiveMessageId = messageId || `api-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        // Store encrypted content
        const { resourceId, proofToken, isNew } = await storeContent({
            userId,
            username,
            content,
            messageId: effectiveMessageId,
            sourcePlatform: sourcePlatform || 'api',
            contentType: contentType || 'text/plain',
            priceUsdCents: priceUsdCents || 20, // Default $0.20
        });

        if (!isNew) {
            console.log(`⚠️  Duplicate content detected`);
            return {
                success: true,
                resourceId,
                proofToken,
                duplicate: true,
            };
        }

        console.log(`✅ Resource created successfully`);
        console.log(`   Resource ID: ${resourceId}`);
        console.log(`   Proof: ${proofToken}`);

        return {
            success: true,
            resourceId,
            proofToken,
            duplicate: false,
        };

    } catch (error) {
        console.error(`❌ Error creating resource:`, error);
        throw error;
    }
}
