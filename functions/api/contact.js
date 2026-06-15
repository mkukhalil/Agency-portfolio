export async function onRequestPost({ request, env }) {
    try {
        const data = await request.json();

        const name = data.name?.trim();
        const email = data.email?.trim();
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
                subject: `New contact form message from ${name}`,
                html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br />')}</p>
        `,
            }),
        });

        if (!resendResponse.ok) {
            const error = await resendResponse.text();

            return Response.json(
                { success: false, error: 'Email could not be sent.', details: error },
                { status: 500 }
            );
        }

        return Response.json({
            success: true,
            message: 'Message sent successfully.',
        });
    } catch (error) {
        return Response.json(
            { success: false, error: 'Something went wrong.' },
            { status: 500 }
        );
    }
}