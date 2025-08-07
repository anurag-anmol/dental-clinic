export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const {
        to, // whatsapp:+919876543210
        name,
        date,
        time,
        dentist,
        clinic,
        brand,
    } = req.body;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;

    const templateName = "dental_appointment_booking";
    const languageCode = "en";

    const payload = new URLSearchParams({
        To: to,
        From: from,
        ContentType: "application/json",
        Content: JSON.stringify({
            template_name: templateName,
            template_language: languageCode,
            template_data: {
                body: {
                    parameters: [
                        { type: "text", text: name },
                        { type: "text", text: date },
                        { type: "text", text: time },
                        { type: "text", text: dentist },
                        { type: "text", text: clinic },
                        { type: "text", text: brand },
                    ],
                },
            },
        }),
    });

    try {
        const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
            {
                method: "POST",
                headers: {
                    Authorization:
                        "Basic " +
                        Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: payload,
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(500).json({ message: "Failed to send message", data });
        }

        return res.status(200).json({ message: "Message sent", sid: data.sid });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", error });
    }
}
