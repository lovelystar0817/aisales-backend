import { FrameworkConfiguration } from './types.js';

export const alibabaTelesalesConfiguration: FrameworkConfiguration = {
  base: {
    id: 'alibaba-telesales',
    friendlyId: 'alibaba-telesales',
    type: 'list',
  },

  localized: {
    // English (Original)
    en: {
      title: 'Alibaba Cloud Telesales Framework',
      description:
        'Comprehensive framework for conducting professional telesales calls for Alibaba Cloud services',
      parts: [
        {
          title: 'Alibaba Cloud Telesales Evaluation Criteria',
          description:
            'All evaluation criteria for Alibaba Cloud telesales calls',
          items: [
            'Greeting: Provides a polite and professional salutation upon call connection',
            'Introduction: Introduce yourself and your role in Alibaba Cloud upon connection',
            'Customer Verification: Verify the clients identity early in the call by the registered name of the account and registered email.',
            'Professionalism: Maintains professional tone and vocabulary, avoiding excessive fillers, colloquialisms, or aggressive/dismissive language',
            "Empathy & Patience: Do not interrupt the customer, except for polite interjections (e.g., 'Excuse me' or 'Sorry, may I…').",
            'Language Analysis: Demonstrates clear pronunciation and natural pacing, avoiding frequent hesitations or errors that impede listener understanding.',
            'Company Details Verification: Identify and validate key company details:\n- Company Name\n- Industry\n- Annual IT budget.',
            'Project Details Verification: Identify the key project details:\n- Project Background\n- Project Approved\n- Current Project Stage',
            "Decision Makers Information: Identify the decision makers details and motivations:\n- Contact's Job Title\n- Key Project Bottlenecks\n- Competitor Landscape",
            "Needs Discovery & Qualification: Accurately addresses the customer's core needs through active clarification, avoiding premature transitions to email or contact-sharing",
            'Redirect User to Email: In case of poor audio quality or heavily accented speech making understanding difficult, suggest if offline follow-up is acceptable.',
            'Handling of Customer Requests: Actively listen to the customers requests and identify the path for resolution',
            'Ask Strategic Followup Questions: Ask targeted follow-up questions to deepen discovery while maintaining control of the conversation. Do not get led off-topic.',
            'Summarisation of the Requirement: Effectively summarise the requirement of the user and their motivations',
            'Address Concerns regarding Performance & Scaling: Explore the concerns of the user by asking follow questions about Disk I/O, Compute, Data & Media Storage\n\nSuggest solutions to resolve their concerns.',
            'Address Concerns regarding Budget: Explore the concerns of the user by identifying their currently solution & budget and recommending solutions',
            "Address Concerns about Alibaba's Competitiveness: Explore the concerns of the user and suggest advantages of Alibaba using concrete and number backed samples",
            'Address Concerns about AI functionalities of Alibaba Cloud: Explore the clients requirement and suggest solutions if applicable',
            'Summary of Next Steps: Summarise the actions items on the user and themselves and explain the process for the followup',
            'End Call Process: End the call with a courteous closing and confirm from the user that they have no further queries.',
          ],
        },
      ],
    },
  },
};

// Evaluation prompt for Alibaba Telesales Framework
export const alibabaTelesalesFrameworkEvaluationPrompt = `You are an expert sales coach specializing in Alibaba Cloud Telesales. Your task is to evaluate **only the user's** sales technique performance.

IMPORTANT: In the transcript, the user (salesperson) is speaking with an AI character named {{characterName}} (the prospect). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "customer," "AI," or any other term. Focus exclusively on the salesperson's technique.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the salesperson - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the prospect - IGNORE THESE COMPLETELY

[ALIBABA TELESALES FRAMEWORK EVALUATION]
Evaluate against these 20 specific criteria from the Alibaba Cloud telesales framework. Each criterion is scored out of 5 points, with all scores summed for the overall score out of 100:

**Call Opening & Verification:**
1. Greeting: Provides a polite and professional salutation upon call connection (0-5)
2. Introduction: Introduce yourself and your role in Alibaba Cloud upon connection (0-5)
3. Customer Verification: Verify the client's identity early in the call by the registered name of the account and registered email (0-5)

**Professionalism & Communication:**
4. Professionalism: Maintains professional tone and vocabulary, avoiding excessive fillers, colloquialisms, or aggressive/dismissive language (0-5)
5. Empathy & Patience: Do not interrupt the customer, except for polite interjections (e.g., "Excuse me" or "Sorry, may I...") (0-5)
6. Language Analysis: Demonstrates clear pronunciation and natural pacing, avoiding frequent hesitations or errors that impede listener understanding (0-5)

**Information Gathering:**
7. Company Details Verification: Identify and validate key company details: Company Name, Industry, Annual IT budget (0-5)
8. Project Details Verification: Identify the key project details: Project Background, Project Approved, Current Project Stage (0-5)
9. Decision Makers Information: Identify the decision makers details and motivations: Contact's Job Title, Key Project Bottlenecks, Competitor Landscape (0-5)

**Needs Discovery & Qualification:**
10. Needs Discovery & Qualification: Accurately addresses the customer's core needs through active clarification, avoiding premature transitions to email or contact-sharing (0-5)
11. Redirect User to Email: In case of poor audio quality or heavily accented speech making understanding difficult, suggest if offline follow-up is acceptable (0-5)
12. Handling of Customer Requests: Actively listen to the customer's requests and identify the path for resolution (0-5)
13. Ask Strategic Followup Questions: Ask targeted follow-up questions to deepen discovery while maintaining control of the conversation. Do not get led off-topic (0-5)
14. Summarisation of the Requirement: Effectively summarise the requirement of the user and their motivations (0-5)

**Technical Solution Presentation:**
15. Address Concerns regarding Performance & Scaling: Explore the concerns of the user by asking follow questions about Disk I/O, Compute, Data & Media Storage. Suggest solutions to resolve their concerns (0-5)
16. Address Concerns regarding Budget: Explore the concerns of the user by identifying their currently solution & budget and recommending solutions (0-5)
17. Address Concerns about Alibaba's Competitiveness: Explore the concerns of the user and suggest advantages of Alibaba using concrete and number backed samples (0-5)
18. Address Concerns about AI functionalities of Alibaba Cloud: Explore the client's requirement and suggest solutions if applicable (0-5)

**Call Closing:**
19. Summary of Next Steps: Summarise the actions items on the user and themselves and explain the process for the followup (0-5)
20. End Call Process: End the call with a courteous closing and confirm from the user that they have no further queries (0-5)

[EVALUATION CRITERIA]
For each criterion:
- **Score**: Number out of 5 based on effectiveness (0: Not Done, 1: Very Poor, 2: Poor, 3: Adequate, 4: Good, 5: Excellent)
- **Why**: Brief explanation of the score (30-40 words), referencing specific examples from transcript
- **Suggestion**: Specific improvement recommendation with actionable advice including examples of correct/better responses

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific examples from the transcript when possible
- Be constructive and actionable in suggestions
- Focus on Alibaba Cloud-specific requirements and technical solution selling
- Calculate overall score as the sum of all 20 section scores (each worth 5 points, total 100)

[STRICT JSON OUTPUT FORMAT]
{{{{
  "salesTechnique": {{{{
    "description": "Measures the ability to conduct professional Alibaba Cloud telesales calls following the comprehensive evaluation framework.",
    "overallScore": "number", //out of 100 (sum of all 20 criterion scores)
    "maxScore": 100,
    "sections": [
      {{{{
        "title": "Greeting",
        "score": "number",  //out of 5
        "maxScore": 5,
        "why": "string",
        "suggestion": "string"
      }}}},
      {{{{
        "title": "Introduction",
        "score": "number",  //out of 5
        "maxScore": 5,
        "why": "string",
        "suggestion": "string"
      }}}},
      {{{{
        "title": "Customer Verification",
        "score": "number",  //out of 5
        "maxScore": 5,
        "why": "string",
        "suggestion": "string"
      }}}},
      {{{{
        "title": "Professionalism",
        "score": "number",  //out of 5
        "maxScore": 5,
        "why": "string",
        "suggestion": "string"
      }}}},
      {{{{
        "title": "Empathy & Patience",
        "score": "number",  //out of 5
        "maxScore": 5,
        "why": "string",
        "suggestion": "string"
      }}}},
      {{{{
        "title": "Language Analysis",
        "score": "number",  //out of 5
        "maxScore": 5,
        "why": "string",
        "suggestion": "string"
      }}}},
      {{{{
        "title": "Company Details Verification",
        "score": "number",  //out of 5
        "maxScore": 5,
        "why": "string",
        "suggestion": "string"
      }}}},
      {{{{
        "title": "Project Details Verification",
        "score": "number",  //out of 5
        "maxScore": 5,
        "why": "string",
        "suggestion": "string"
      }}}},
      {{{{
        "title": "Decision Makers Information",
        "score": "number",  //out of 5
        "maxScore": 5,
        "why": "string",
        "suggestion": "string"
      }}}},
      {{{{
        "title": "Needs Discovery & Qualification",
        "score": "number",  //out of 5
        "maxScore": 5,
        "why": "string",
        "suggestion": "string"
      }}}},
      {{{{
        "title": "Redirect User to Email",
        "score": "number",  //out of 5
        "maxScore": 5,
        "why": "string",
        "suggestion": "string"
      }}}},
      {{{{
        "title": "Handling of Customer Requests",
        "score": "number",  //out of 5
        "maxScore": 5,
        "why": "string",
        "suggestion": "string"
      }}}},
      {{{{
        "title": "Ask Strategic Followup Questions",
        "score": "number",  //out of 5
        "maxScore": 5,
        "why": "string",
        "suggestion": "string"
      }}}},
      {{{{
        "title": "Summarisation of the Requirement",
        "score": "number",  //out of 5
        "maxScore": 5,
        "why": "string",
        "suggestion": "string"
      }}}},
      {{{{
        "title": "Address Concerns regarding Performance & Scaling",
        "score": "number",  //out of 5
        "maxScore": 5,
        "why": "string",
        "suggestion": "string"
      }}}},
      {{{{
        "title": "Address Concerns regarding Budget",
        "score": "number",  //out of 5
        "maxScore": 5,
        "why": "string",
        "suggestion": "string"
      }}}},
      {{{{
        "title": "Address Concerns about Alibaba's Competitiveness",
        "score": "number",  //out of 5
        "maxScore": 5,
        "why": "string",
        "suggestion": "string"
      }}}},
      {{{{
        "title": "Address Concerns about AI functionalities of Alibaba Cloud",
        "score": "number",  //out of 5
        "maxScore": 5,
        "why": "string",
        "suggestion": "string"
      }}}},
      {{{{
        "title": "Summary of Next Steps",
        "score": "number",  //out of 5
        "maxScore": 5,
        "why": "string",
        "suggestion": "string"
      }}}},
      {{{{
        "title": "End Call Process",
        "score": "number",  //out of 5
        "maxScore": 5,
        "why": "string",
        "suggestion": "string"
      }}}}
    ]
  }}}}
}}}}

[EXAMPLE ASSESSMENT]
{{{{
  "salesTechnique": {{{{
    "description": "Measures the ability to conduct professional Alibaba Cloud telesales calls following the comprehensive evaluation framework.",
    "overallScore": 62,
    "maxScore": 100,
    "sections": [
      {{{{
        "title": "Greeting",
        "score": 4,
        "maxScore": 5,
        "why": "You provided a polite and professional salutation saying 'Good morning, thank you for taking my call.' This was appropriate and professional.",
        "suggestion": "Consider personalizing the greeting with the time-appropriate salutation and confirming you reached the right person immediately."
      }}}},
      {{{{
        "title": "Introduction",
        "score": 4,
        "maxScore": 5,
        "why": "You introduced yourself as 'Sarah from Alibaba Cloud' and mentioned your role. This was clear and professional.",
        "suggestion": "Add your specific role title for clarity, e.g., 'I'm Sarah, Solutions Consultant at Alibaba Cloud.'"
      }}}},
      {{{{
        "title": "Customer Verification",
        "score": 1,
        "maxScore": 5,
        "why": "You did not verify {{{{characterName}}}}'s identity using the registered account name (Builder.io) and email (engg@builder.io) as required for security.",
        "suggestion": "After introduction, say: 'For security purposes, may I confirm you're calling from Builder.io and your registered email is engg@builder.io?'"
      }}}},
      {{{{
        "title": "Professionalism",
        "score": 4,
        "maxScore": 5,
        "why": "You maintained a professional tone and vocabulary throughout. Only minor use of filler words ('um' appeared twice) was noted.",
        "suggestion": "Practice pausing briefly instead of using filler words to maintain a more polished delivery."
      }}}},
      {{{{
        "title": "Empathy & Patience",
        "score": 5,
        "maxScore": 5,
        "why": "You listened attentively throughout the call and did not interrupt {{{{characterName}}}}. When clarifying, you used polite interjections like 'Excuse me.'",
        "suggestion": "Excellent work. Continue demonstrating patience and active listening in all customer interactions."
      }}}},
      {{{{
        "title": "Language Analysis",
        "score": 4,
        "maxScore": 5,
        "why": "Your pronunciation was clear with natural pacing. Only minimal hesitations ('uh' appeared once) that did not significantly impede understanding.",
        "suggestion": "Maintain your clear pronunciation and consider eliminating the remaining hesitations for even smoother delivery."
      }}}},
      {{{{
        "title": "Company Details Verification",
        "score": 2,
        "maxScore": 5,
        "why": "You confirmed the company name (Builder.io) and industry (IT), but did not ask about the annual IT budget.",
        "suggestion": "Ask: 'What's your annual IT budget allocated for cloud services?' This helps tailor solutions to their financial capacity."
      }}}},
      {{{{
        "title": "Project Details Verification",
        "score": 3,
        "maxScore": 5,
        "why": "You identified the project background (scaling issues) and current stage but missed asking about project approval status.",
        "suggestion": "Ask: 'Has this scaling project been approved by management, and what's the timeline for implementation?'"
      }}}},
      {{{{
        "title": "Decision Makers Information",
        "score": 2,
        "maxScore": 5,
        "why": "You confirmed {{{{characterName}}}}'s role (Head of Infrastructure) but did not explore key project bottlenecks or competitor landscape in detail.",
        "suggestion": "Ask: 'What are the main technical bottlenecks you're facing?' and 'Are you currently evaluating other cloud providers?'"
      }}}},
      {{{{
        "title": "Needs Discovery & Qualification",
        "score": 4,
        "maxScore": 5,
        "why": "You identified the core need (website slowdowns during traffic spikes) through active clarification and avoided premature transitions to email or contact-sharing.",
        "suggestion": "Probe deeper into the business impact: 'How much revenue are you losing during these slowdowns?'"
      }}}},
      {{{{
        "title": "Redirect User to Email",
        "score": 5,
        "maxScore": 5,
        "why": "Not applicable - audio quality was good. You appropriately did not suggest offline follow-up when it wasn't needed.",
        "suggestion": "Continue assessing call quality and only suggest offline follow-up when truly necessary."
      }}}},
      {{{{
        "title": "Handling of Customer Requests",
        "score": 4,
        "maxScore": 5,
        "why": "You actively listened when {{{{characterName}}}} mentioned media loading issues and identified the path for resolution (CDN + OSS solution).",
        "suggestion": "Acknowledge requests more explicitly: 'I understand you need a solution for media loading. Let me address that specifically.'"
      }}}},
      {{{{
        "title": "Ask Strategic Followup Questions",
        "score": 3,
        "maxScore": 5,
        "why": "You asked follow-up questions about media types and traffic patterns, but didn't maintain full control - missed exploring AI content needs.",
        "suggestion": "After hearing about marketing materials, ask: 'Are you also looking for AI-powered content generation for your campaigns?'"
      }}}},
      {{{{
        "title": "Summarisation of the Requirement",
        "score": 2,
        "maxScore": 5,
        "why": "You did not summarize {{{{characterName}}}}'s requirements or motivations at the end of the discovery phase.",
        "suggestion": "Summarize: 'So you need: 1) Media loading solution for traffic spikes, 2) Scaling for upcoming sale, 3) AI for marketing content. Correct?'"
      }}}},
      {{{{
        "title": "Address Concerns regarding Performance & Scaling",
        "score": 3,
        "maxScore": 5,
        "why": "You suggested OSS + CDN for media but didn't explore Disk I/O or compute concerns, and didn't suggest ECS upgrade options.",
        "suggestion": "Ask about current instance type and recommend: 'Upgrade to C7 instances with auto-scaling to handle 10x traffic spikes automatically.'"
      }}}},
      {{{{
        "title": "Address Concerns regarding Budget",
        "score": 2,
        "maxScore": 5,
        "why": "You mentioned pricing briefly but didn't identify their current solution cost or present specific cost-saving options like annual plans.",
        "suggestion": "Present budget solutions: 'Annual subscriptions offer 30% savings. Based on your $20K budget, we can optimize costs through resource packages.'"
      }}}},
      {{{{
        "title": "Address Concerns about Alibaba's Competitiveness",
        "score": 1,
        "maxScore": 5,
        "why": "You did not provide concrete, number-backed examples of Alibaba's advantages over competitors like AWS or Azure.",
        "suggestion": "Share: 'Alibaba handles 500,000+ TPS during Singles' Day. We're #1 in APAC with 10-20% lower costs than AWS for similar configurations.'"
      }}}},
      {{{{
        "title": "Address Concerns about AI functionalities of Alibaba Cloud",
        "score": 1,
        "maxScore": 5,
        "why": "You did not explore or present AI solutions like Model Studio, Qwen-Image, or WAN series for content generation.",
        "suggestion": "Present: 'Our Model Studio with Qwen-Image can generate marketing images at 70-90% lower cost than agencies, with WAN series for video content.'"
      }}}},
      {{{{
        "title": "Summary of Next Steps",
        "score": 2,
        "maxScore": 5,
        "why": "You mentioned sending information but didn't clearly summarize action items for both parties or explain the follow-up process.",
        "suggestion": "Say: 'I'll email a technical proposal by Friday. You review with your CFO. We'll schedule a 30-min consultation next week. Sound good?'"
      }}}},
      {{{{
        "title": "End Call Process",
        "score": 3,
        "maxScore": 5,
        "why": "You ended with a courteous closing ('Thank you for your time') but didn't confirm if {{{{characterName}}}} had further queries.",
        "suggestion": "Before ending, ask: 'Do you have any other questions before we wrap up?' This ensures all concerns are addressed."
      }}}}
    ]
  }}}}
}}}}
`;
