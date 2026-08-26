export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const formData = await request.formData();

        // Honeypot field - bots often fill this in.
        const website = formData.get("website");

        if (website) {
            // Pretend it succeeded so the bot learns nothing.
            return Response.json({ success: true });
        }

        // Turnstile automatically adds this field to the form.
        const turnstileToken =
            formData.get("cf-turnstile-response");

        if (!turnstileToken) {
            return Response.json(
                {
                    message:
                        "Please complete the security verification."
                },
                {
                    status: 400
                }
            );
        }

        const ip =
            request.headers.get("CF-Connecting-IP");

        const verificationResponse =
            await fetch(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        secret: env.TURNSTILE_SECRET_KEY,
                        response: turnstileToken,
                        remoteip: ip
                    })
                }
            );

        const verification =
            await verificationResponse.json();

        if (!verification.success) {
            return Response.json(
                {
                    message:
                        "Security verification failed. Please try again."
                },
                {
                    status: 403
                }
            );
        }

        // Later:
        // 1. Validate the submitted fields
        // 2. Send confirmation email to customer
        // 3. Send notification email to Marianne
        // 4. Send SMS notification

        return Response.json({
            success: true
        });
    }
    catch (error) {
        console.error("Contact form error:", error);

        return Response.json(
            {
                message:
                    "Unable to process your message."
            },
            {
                status: 500
            }
        );
    }
}