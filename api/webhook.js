export default async function handler(req, res) {
    // Verificación de Webhook (Meta lo solicita con GET)
    if (req.method === 'GET') {
      const VERIFY_TOKEN = 'omar123bot';
  
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];
  
      if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
      } else {
        return res.sendStatus(403);
      }
    }
  
    // Procesamiento del mensaje (POST)
    if (req.method === 'POST') {
      try {
        const body = req.body;
  
        const mensaje = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;
        const numero = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from;
  
        if (!mensaje || !numero) {
          return res.status(200).json({ status: "sin mensaje" });
        }
  
        // Llamada a Hugging Face
        const hfResponse = await fetch('https://api-inference.huggingface.co/models/tu_usuario/tu_modelo', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer TU_HUGGINGFACE_TOKEN',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: mensaje }),
        });
  
        const result = await hfResponse.json();
        const respuestaBot = result[0]?.generated_text || "No entendí tu mensaje.";
  
        // Enviar respuesta a WhatsApp
        await fetch(`https://graph.facebook.com/v18.0/TU_NUMERO_ID/messages`, {
          method: 'POST',
          headers: {
            Authorization: 'Bearer TU_TOKEN_WHATSAPP',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: numero,
            type: 'text',
            text: { body: respuestaBot },
          }),
        });
  
        return res.status(200).json({ status: 'respuesta enviada' });
  
      } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: 'Algo falló.' });
      }
    }
  
    res.status(405).send('Método no permitido');
  }
  