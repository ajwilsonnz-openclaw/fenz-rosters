import { NextRequest, NextResponse } from 'next/server';
import { handleOfferResponse } from '@/engine/engine-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { offerId, action, reason } = body;

        if (!offerId || !action) {
            return NextResponse.json({ success: false, error: 'Missing offerId or action' }, { status: 400 });
        }

        const response = action === 'accept' ? 'accepted' : 'declined';
        
        // Pass everything to the engine-v2 response handler
        await handleOfferResponse(offerId, response);

        return NextResponse.json({ 
            success: true, 
            message: `Offer ${response} successfully. Engine will re-run if round is complete.` 
        });

    } catch (error: any) {
        console.error('Offers Respond API error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}