const RESEND_BATCH_URL = "https://api.resend.com/emails/batch";

const FROM_ADDRESS =
    "RingerWorks <hello@updates.ringerworks.com>";

const BUSINESS_EMAIL =
    "marianne@ringerworks.com";

const ALLOWED_PROJECT_TYPES = new Set([
    "",
    "New application or feature",
    "Existing application or modernization",
    "Database or SQL Server",
    "API or system integration",
    "Troubleshooting or production issue",
    "Technical consulting",
    "Not sure yet"
]);


export async function onRequestPost(context) {

    const { request, env } = context;

    try {

        const formData = await request.formData();


        // ---------------------------------------------------------
        // HONEYPOT
        // ---------------------------------------------------------

        const website =
            getString(formData, "website");

        if (website) {

            // Pretend the request succeeded.
            // This gives bots no useful feedback.

            return Response.json({
                success: true
            });
        }


        // ---------------------------------------------------------
        // TURNSTILE
        // ---------------------------------------------------------

        const turnstileToken =
            getString(
                formData,
                "cf-turnstile-response"
            );

        if (!turnstileToken) {

            return jsonError(
                "Please complete the security verification.",
                400
            );
        }


        const ip =
            request.headers.get("CF-Connecting-IP") || "";


        const turnstileResponse =
            await fetch(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        secret:
                            env.TURNSTILE_SECRET_KEY,

                        response:
                            turnstileToken,

                        remoteip:
                            ip
                    })
                }
            );


        const turnstileResult =
            await turnstileResponse.json();


        if (
            !turnstileResult.success ||
            turnstileResult.hostname !==
            "ringerworks.com"
        ) {

            console.error(
                "Turnstile verification failed:",
                turnstileResult
            );

            return jsonError(
                "Security verification failed. Please try again.",
                403
            );
        }


        // ---------------------------------------------------------
        // READ + VALIDATE FORM DATA
        // ---------------------------------------------------------

        const name =
            getString(formData, "name").trim();

        const email =
            getString(formData, "email").trim();

        const phone =
            getString(formData, "phone").trim();

        const company =
            getString(formData, "company").trim();

        const projectType =
            getString(
                formData,
                "projectType"
            ).trim();

        const description =
            getString(
                formData,
                "description"
            ).trim();


        if (
            !name ||
            name.length > 100
        ) {

            return jsonError(
                "Please enter your name.",
                400
            );
        }


        if (
            !isValidEmail(email) ||
            email.length > 254
        ) {

            return jsonError(
                "Please enter a valid email address.",
                400
            );
        }


        if (phone.length > 40) {

            return jsonError(
                "The phone number is too long.",
                400
            );
        }


        if (company.length > 150) {

            return jsonError(
                "The company name is too long.",
                400
            );
        }


        if (
            !ALLOWED_PROJECT_TYPES.has(
                projectType
            )
        ) {

            return jsonError(
                "Please select a valid project type.",
                400
            );
        }


        if (
            !description ||
            description.length > 5000
        ) {

            return jsonError(
                "Please tell me a little about what you're trying to solve.",
                400
            );
        }


        // ---------------------------------------------------------
        // PREPARE SAFE VALUES FOR HTML EMAIL
        // ---------------------------------------------------------

        const safeName =
            escapeHtml(name);

        const safeEmail =
            escapeHtml(email);

        const safePhone =
            escapeHtml(phone || "Not provided");

        const safeCompany =
            escapeHtml(
                company || "Not provided"
            );

        const safeProjectType =
            escapeHtml(
                projectType || "Not specified"
            );

        const safeDescription =
            escapeHtml(description)
                .replace(/\n/g, "<br>");


        // ---------------------------------------------------------
        // CUSTOMER CONFIRMATION EMAIL
        // ---------------------------------------------------------

        const customerEmail = {

            from:
                FROM_ADDRESS,

            to: [
                email
            ],

            subject:
                "Thanks for contacting RingerWorks",

            headers: {
                "Reply-To":
                    BUSINESS_EMAIL
            },

            text:
                `Hi ${name},

Thanks for reaching out to RingerWorks. I received your message and will take a look at what you sent.

I'll get back to you soon.

Marianne Ringer
RingerWorks
Creative thinking. Robust solutions.`,

            html:
                `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;">
    <div style="max-width:600px;margin:0 auto;padding:24px;">
        <h2 style="margin-bottom:16px;">
            Thanks for reaching out.
        </h2>

        <p>
            Hi ${safeName},
        </p>

        <p>
            I received your message and will take a look
            at what you sent.
        </p>

        <p>
            I'll get back to you soon.
        </p>

        <p style="margin-top:28px;">
            Marianne Ringer<br>
            <strong>RingerWorks</strong><br>
            Creative thinking. Robust solutions.
        </p>
    </div>
</body>
</html>`
        };


        // ---------------------------------------------------------
        // YOUR NOTIFICATION EMAIL
        // ---------------------------------------------------------

        const ownerEmail = {

            from:
                FROM_ADDRESS,

            to: [
                BUSINESS_EMAIL
            ],

            subject:
                "New RingerWorks website inquiry",

            headers: {
                "Reply-To":
                    email
            },

            text:
                `New website inquiry

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Company: ${company || "Not provided"}
Project type: ${projectType || "Not specified"}

What are they trying to solve?

${description}`,

            html:
                `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;">
    <div style="max-width:650px;margin:0 auto;padding:24px;">

        <h2>
            New RingerWorks website inquiry
        </h2>

        <table
            style="
                border-collapse:collapse;
                width:100%;
                margin:20px 0;
            ">

            <tr>
                <td style="padding:6px 12px 6px 0;"><strong>Name</strong></td>
                <td style="padding:6px 0;">${safeName}</td>
            </tr>

            <tr>
                <td style="padding:6px 12px 6px 0;"><strong>Email</strong></td>
                <td style="padding:6px 0;">${safeEmail}</td>
            </tr>

            <tr>
                <td style="padding:6px 12px 6px 0;"><strong>Phone</strong></td>
                <td style="padding:6px 0;">${safePhone}</td>
            </tr>

            <tr>
                <td style="padding:6px 12px 6px 0;"><strong>Company</strong></td>
                <td style="padding:6px 0;">${safeCompany}</td>
            </tr>

            <tr>
                <td style="padding:6px 12px 6px 0;"><strong>Project type</strong></td>
                <td style="padding:6px 0;">${safeProjectType}</td>
            </tr>

        </table>

        <h3>
            What are they trying to solve?
        </h3>

        <p>
            ${safeDescription}
        </p>

        <hr style="margin:28px 0;border:0;border-top:1px solid #ddd;">

        <p style="font-size:13px;color:#666;">
            Replying to this email will reply directly to
            ${safeName} at ${safeEmail}.
        </p>

    </div>
</body>
</html>`
        };


        // ---------------------------------------------------------
        // SEND BOTH EMAILS THROUGH RESEND
        // ---------------------------------------------------------

        const resendResponse =
            await fetch(
                RESEND_BATCH_URL,
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${env.RESEND_API_KEY}`,

                        "Content-Type":
                            "application/json",

                        "User-Agent":
                            "RingerWorks-Website/1.0"
                    },

                    body: JSON.stringify([
                        ownerEmail,
                        customerEmail
                    ])
                }
            );


        if (!resendResponse.ok) {

            const resendError =
                await resendResponse.text();

            console.error(
                "Resend error:",
                resendResponse.status,
                resendError
            );

            return jsonError(
                "Unable to send your message right now. Please try again.",
                500
            );
        }


        const resendResult =
            await resendResponse.json();

        console.log(
            "Contact emails sent:",
            resendResult
        );


        // ---------------------------------------------------------
        // SUCCESS
        // ---------------------------------------------------------

        return Response.json({
            success: true
        });

    }
    catch (error) {

        console.error(
            "Contact form error:",
            error
        );

        return jsonError(
            "Unable to process your message right now. Please try again.",
            500
        );
    }
}


// =============================================================
// HELPERS
// =============================================================

function getString(formData, fieldName) {

    const value =
        formData.get(fieldName);

    return typeof value === "string"
        ? value
        : "";
}


function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}


function escapeHtml(value) {

    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function jsonError(message, status) {

    return Response.json(
        {
            success: false,
            message
        },
        {
            status
        }
    );
}