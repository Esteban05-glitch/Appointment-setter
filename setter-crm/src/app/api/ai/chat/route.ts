import { Groq } from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `Eres un experto Appointment Setter y cerrador de ventas de alto ticket. 
                    Tu objetivo es ayudar al usuario a manejar objeciones de clientes potenciales en DMs.
                    
                    Instrucciones:
                    1. Proporciona respuestas persuasivas, empáticas y orientadas a la acción.
                    2. Mantén un tono profesional pero cercano, ideal para redes sociales (IG, LinkedIn).
                    3. Tus respuestas deben ser cortas y directas, fáciles de copiar y pegar.
                    4. Si el usuario te da una objeción, utiliza técnicas de ventas (como el "Feel, Felt, Found" o "Isolate the objection") para superarla.
                    5. Responde siempre en el mismo idioma que el usuario le pregunte (español por defecto).`
                },
                ...messages
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        return NextResponse.json({
            content: response.choices[0]?.message?.content || "Lo siento, no pude generar una respuesta."
        });
    } catch (error: any) {
        console.error("Groq API Error:", error);
        return NextResponse.json({ error: "Error al procesar la solicitud de IA" }, { status: 500 });
    }
}
