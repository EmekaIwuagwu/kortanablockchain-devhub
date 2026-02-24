import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { sendEmail, getWelcomeEmailTemplate } from '@/lib/emailService';
import { validateWalletAddress } from '@/lib/walletValidator';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, fullName, phone, country, walletAddress, tier, referralCode: incomingRefCode, transactionHash, paymentMethod } = body;

        // 1. Basic Validation
        if (!email || !fullName || !walletAddress || !tier) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        if (!validateWalletAddress(walletAddress)) {
            return NextResponse.json({ success: false, message: 'Invalid ERC-20 wallet address' }, { status: 400 });
        }

        // 2. Connect to DB
        const client = await clientPromise;
        const db = client.db('kortana_presale');
        const users = db.collection('presale_users');

        // 3. Check uniqueness
        const existingUser = await users.findOne({ $or: [{ email }, { walletAddress }] });
        if (existingUser) {
            // Allow updating transaction hash if user is already registered but hasn't paid
            if (transactionHash && existingUser.email === email) {
                await users.updateOne({ email }, {
                    $set: {
                        transactionHash,
                        paymentStatus: 'pending',
                        updatedAt: new Date()
                    }
                });
                return NextResponse.json({ success: true, message: 'Transaction hash updated for verification.' });
            }
            return NextResponse.json({
                success: false,
                message: existingUser.email === email ? 'Email already registered' : 'Wallet address already registered'
            }, { status: 400 });
        }

        // 4. Handle Referrer
        let referrerId = null;
        if (incomingRefCode) {
            const referrer = await users.findOne({ referralCode: incomingRefCode });
            if (referrer) {
                referrerId = referrer._id;
            }
        }

        // 5. Generate unique referral code for new user
        const newUserRefCode = `ref_kortana_${uuidv4().split('-')[0]}`;

        // 6. Create User Record
        const newUser = {
            email,
            fullName,
            phone,
            country,
            walletAddress,
            tier,
            referralCode: newUserRefCode,
            referrerId,
            transactionHash: transactionHash || null,
            paymentMethod: paymentMethod || null,
            paymentStatus: transactionHash ? 'pending' : 'awaiting_payment',
            status: 'confirmed',
            createdAt: new Date(),
            updatedAt: new Date(),
            remindersSent: [{ type: 'registration', sentAt: new Date() }]
        };

        const result = await users.insertOne(newUser);

        // 7. Update Stats (Optional: could be done via trigger or separate logic)
        const stats = db.collection('presale_stats');
        await stats.updateOne(
            {},
            {
                $inc: {
                    totalRegistrations: 1,
                    [`tierBreakdown.${tier}.count`]: 1
                },
                $set: { lastUpdated: new Date() }
            },
            { upsert: true }
        );

        // 8. Send Welcome Email
        const referralLink = `https://www.kortana.network/presale?ref=${newUserRefCode}`;
        const emailHtml = getWelcomeEmailTemplate(fullName, tier, walletAddress, referralLink);
        await sendEmail(email, 'Welcome to Kortana Presale! 🚀', emailHtml);

        return NextResponse.json({
            success: true,
            userId: result.insertedId,
            referralLink,
            referralCode: newUserRefCode,
            tier,
            message: 'Registration successful. Check your email for confirmation.'
        });

    } catch (error: any) {
        console.error('Registration Error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
