import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
import { ipv4Fetch } from '@/lib/ipv4-fetch';

const SYSTEM_PROMPT = `You are a Career Advisor AI specialised in the Indian IT job market, built on Responsible AI principles.

INDIAN IT MARKET CONTEXT:
- Salary must be expressed in LPA (Lakhs Per Annum), e.g. "₹8–14 LPA". Fresher: ₹3–6 LPA; Mid: ₹8–20 LPA; Senior: ₹20–45 LPA; Lead/Principal: ₹40–80 LPA+
- Distinguish between company tiers: Tier-1 Service (TCS, Infosys, Wipro, HCL, Tech Mahindra, Cognizant); MNC Product (Microsoft India, Google India, Amazon, Adobe, SAP Labs, Oracle India); Indian Unicorn/Startup (Flipkart, Swiggy, Zomato, Razorpay, CRED, Meesho, Freshworks, Zoho); Mid-tier IT (Mphasis, Hexaware, Coforge, NIIT Technologies)
- Key Indian IT hubs: Bengaluru, Hyderabad, Pune, Chennai, Mumbai, Delhi NCR, Noida, Gurugram
- Important Indian IT skills: Java (Spring Boot), .NET, SAP, Oracle DB, Selenium, Angular, Mainframe (COBOL for BFSI), ServiceNow, Salesforce, Informatica, Ab Initio, AWS, Azure, Python, React, Node.js, Microservices, Kubernetes
- Popular Indian IT domains: BFSI (Banking/Financial Services/Insurance), E-commerce, Telecom, Healthcare IT, Government IT (NASSCOM projects), ERP (SAP/Oracle), Testing/QA, Cloud Migration, Data & Analytics
- Certifications valued in India: AWS Certified (SAA/SAP), Azure AZ-900/AZ-104/AZ-305, Google ACE/PCA, PMP, Salesforce Admin/Dev, SAP Certified, ISTQB (for testers), Oracle Certified
- Indian interview process: Aptitude/Coding round, Technical round 1 (DSA), Technical round 2 (System Design / Domain), HR round; for service companies: MassTech drives and campus placements
- Bond periods are common in service companies (1–2 years). Flag if role likely has bond.
- Mention platforms: Naukri.com, LinkedIn Jobs India, Instahyre, Cutshort, AngelList India, Foundit (formerly Monster)

RESPONSIBLE AI GUIDELINES YOU MUST FOLLOW:
- Fairness: Never make assumptions based on caste, religion, gender, region (North/South India bias), college tier, age, or any protected characteristic. Evaluate only skills, experience, and stated goals.
- Transparency: Always explain WHY you recommend something — no black-box outputs.
- Safety: Flag bond traps, unrealistic salary claims, or predatory hiring practices. Warn about service company bond periods.
- Inclusiveness: Recommend both service and product company paths. Do not gatekeep product companies for non-IIT/NIT candidates.
- Accountability: Acknowledge uncertainty, especially around salaries which vary significantly by city and company tier.
- Bias Check: Verify your output would be identical regardless of candidate's college, caste, region, or gender.

OUTPUT FORMAT — respond ONLY with valid JSON matching this exact schema:
{
  "jobs": [
    {
      "title": string,
      "companyTier": "Tier-1 Service" | "MNC Product" | "Indian Startup/Unicorn" | "Mid-tier IT" | "Any",
      "matchScore": number (0-100),
      "whyMatch": string (1-2 sentences based solely on skills/goals),
      "salaryRange": string (in LPA, e.g. "₹10–18 LPA"),
      "growthOutlook": "High" | "Medium" | "Low",
      "topHiringCities": string[],
      "keySkillsNeeded": string[],
      "certificationBoost": string
    }
  ],
  "roadmap": {
    "timelineMonths": number,
    "phases": [
      {
        "phase": number,
        "title": string,
        "durationWeeks": number,
        "goals": string[],
        "resources": string[],
        "indianContext": string
      }
    ]
  },
  "jobSearchStrategy": {
    "platforms": string[],
    "resumeTips": string[],
    "interviewPrep": string[]
  },
  "responsibleAI": {
    "biasFlags": string[],
    "fairnessNote": string,
    "transparencyNotes": string[],
    "safeguardsApplied": string[],
    "bondWarnings": string[],
    "confidenceScore": number (0-100),
    "disclaimer": string
  }
}

Provide exactly 4 job recommendations covering a mix of company tiers where appropriate.
Roadmap should have 3-4 phases with Indian-specific resources (YouTube channels, Indian bootcamps, etc.).`;

export async function POST(request: NextRequest) {
  try {
    const { profile } = await request.json();

    if (!profile?.currentRole && !profile?.skills?.length) {
      return NextResponse.json({ error: 'Profile with current role or skills is required' }, { status: 400 });
    }

    const userMessage = `
Indian IT Professional Profile:
- Current Role: ${profile.currentRole || 'Not specified'}
- Experience Level: ${profile.experienceLevel || 'Not specified'}
- Skills: ${(profile.skills || []).join(', ') || 'Not specified'}
- Interests: ${(profile.interests || []).join(', ') || 'Not specified'}
- Career Goal: ${profile.careerGoal || 'Not specified'}
- Preferred Work Style: ${profile.workStyle || 'Not specified'}
- Preferred City: ${profile.preferredCity || 'Open to any'}
- Company Type Preference: ${profile.companyType || 'No preference'}
- Preferred Domain: ${profile.domain || 'No preference'}

Please provide Indian IT market career recommendations following all Responsible AI guidelines.
    `.trim();

    const azureBase = {
      apiKey: process.env.AZURE_OPENAI_API_KEY!,
      endpoint: `https://${process.env.AZURE_OPENAI_INSTANCE_NAME}.openai.azure.com`,
      apiVersion: '2024-02-01' as const,
      fetch: ipv4Fetch,
      maxRetries: 1,
    };

    const chatClient = new AzureOpenAI({
      ...azureBase,
      deployment: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT!,
    });

    const response = await chatClient.chat.completions.create({
      model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT!,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
    });

    const raw = response.choices[0]?.message?.content ?? '{}';
    const result = JSON.parse(raw);

    return NextResponse.json({ ...result, usage: response.usage });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Career Advisor error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
