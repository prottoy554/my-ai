export default async function handler(req, res) {
    // CORS পলিসি (যাতে যেকোনো অ্যাপ বা ওয়েবসাইট থেকে কল করা যায়)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // URL থেকে massage বা message প্যারামিটার নেওয়া
    const userMessage = req.query.massage || req.query.message;

    if (!userMessage) {
        return res.status(400).json({ 
            status: "error", 
            message: "massage parameter required. Example: /api?massage=hi" 
        });
    }

    // আপনার AgentRouter API Key
    const apiKey = "sk-qvQdRfwuHQ9OWOSxUfV86A9oO6K2RMV0GrXNsqfXlCEAkiug";
    const apiUrl = "https://agentrouter.org/v1/messages";

    const payload = {
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content: userMessage }]
    };

    // Claude CLI-এর ছদ্মবেশ (বট চেকিং বাইপাস করতে)
    const headers = {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "Authorization": `Bearer ${apiKey}`,
        "anthropic-version": "2023-06-01",
        "anthropic-client": "claude-code",
        "User-Agent": "@anthropic-ai/claude-code/0.2.9 darwin-arm64 node-v20.0.0"
    };

    try {
        // Vercel-এর নিজস্ব fetch ব্যবহার করে API কল
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();

        // Anthropic ফরম্যাট রেসপন্স
        if (response.ok && data.content && data.content[0].text) {
            return res.status(200).json({ 
                status: "success", 
                user_message: userMessage, 
                ai_reply: data.content[0].text 
            });
        } 
        // OpenAI ফরম্যাট রেসপন্স
        else if (response.ok && data.choices && data.choices[0].message.content) {
            return res.status(200).json({ 
                status: "success", 
                user_message: userMessage, 
                ai_reply: data.choices[0].message.content 
            });
        }
        // যদি অন্য কোনো এরর আসে
        else {
            return res.status(response.status).json({ 
                status: "error", 
                message: "API Provider Error", 
                details: data 
            });
        }
    } catch (error) {
        return res.status(500).json({ 
            status: "error", 
            message: "Server Connection Error", 
            error: error.message 
        });
    }
}
