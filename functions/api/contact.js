const escapeHtml = (value = '') => {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

export async function onRequestPost({ request, env }) {
    try {
        if (!env.RESEND_API_KEY) {
            return Response.json(
                { success: false, error: 'Email service is not configured.' },
                { status: 500 }
            );
        }

        const data = await request.json();

        const name = data.name?.trim();
        const email = data.email?.trim();
        const company = data.company?.trim() || 'Not provided';
        const projectType = data.projectType?.trim() || 'Not selected';
        const budget = data.budget?.trim() || 'Not selected';
        const timeline = data.timeline?.trim() || 'Not selected';
        const message = data.message?.trim();

        if (!name || !email || !message) {
            return Response.json(
                { success: false, error: 'Please fill all required fields.' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return Response.json(
                { success: false, error: 'Please enter a valid email address.' },
                { status: 400 }
            );
        }

        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Nukt Agency <contact@nukt.agency>',
                to: ['contact.nukt@gmail.com'],
                reply_to: email,
                subject: `New project inquiry from ${name}`,
                html: `
                    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6;">
                        <h2 style="margin-bottom: 16px;">New Project Inquiry</h2>

                        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
                        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
                        <p><strong>Company / Brand:</strong> ${escapeHtml(company)}</p>
                        <p><strong>Project Type:</strong> ${escapeHtml(projectType)}</p>
                        <p><strong>Estimated Budget:</strong> ${escapeHtml(budget)}</p>
                        <p><strong>Timeline:</strong> ${escapeHtml(timeline)}</p>

                        <hr style="border: 0; border-top: 1px solid #ddd; margin: 24px 0;" />

                        <p><strong>Project Details:</strong></p>
                        <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
                    </div>
                `,
            }),
        });

        if (!resendResponse.ok) {
            const error = await resendResponse.text();

            return Response.json(
                {
                    success: false,
                    error: 'Email could not be sent.',
                    details: error,
                },
                { status: 500 }
            );
        }

        return Response.json({
            success: true,
            message: 'Message sent successfully.',
        });
    } catch {
        return Response.json(
            { success: false, error: 'Something went wrong.' },
            { status: 500 }
        );
    }
}