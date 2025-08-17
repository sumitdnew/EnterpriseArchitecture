// OpenAI Service for Create React App
// Note: In production, you should use a backend API to protect your API key

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

export interface OpenAIRequest {
  prompt: string;
  max_tokens?: number;
  temperature?: number;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export const callOpenAI = async (request: OpenAIRequest): Promise<OpenAIResponse> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please add REACT_APP_OPENAI_API_KEY to your .env.local file');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
                 {
           role: 'system',
           content: 'You are an expert enterprise architect with deep knowledge of software architecture patterns, cloud technologies, security, compliance, and scalability. You MUST provide industry-specific compliance requirements. For healthcare: include HIPAA, HITECH, FDA. For financial: include SOX, PCI, Basel-III, GLBA. For government: include FedRAMP, FISMA, NIST. For education: include FERPA, COPPA. For manufacturing: include ISO-27001, ISO-9001. For logistics: include ISO-28000, C-TPAT. For media: include DRM, Copyright. For gaming: include COPPA, ESRB. For energy: include NERC-CIP, ISO-27001. For automotive: include ISO-26262, AUTOSAR. Always prioritize industry-specific compliance over general compliance like GDPR unless the project explicitly involves EU data. Provide detailed, practical recommendations in JSON format.'
         },
        {
          role: 'user',
          content: request.prompt
        }
      ],
      max_tokens: request.max_tokens || 2000,
      temperature: request.temperature || 0.3,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('OpenAI API error:', errorData);
    throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  return response.json();
};
