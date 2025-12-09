
// Mock State
const state = {
    type: 'landing',
    style: 'modern',
    color: 'blue',
    structure: 'single',
    pages: ['home'],
    features: ['hero', 'features', 'contact'],
    details: 'I want a site for my AI startup called "NeuroLink".'
};

// --- LOGIC FROM prompt-generator.html ---

const typeLabels = {
    landing: 'High-Fidelity, Zero-Distraction Landing Page (A/B Test Ready)',
    business: 'Global B2B/Corporate Authority Site (Enterprise Ready)',
    portfolio: 'Interactive, Narrative-Driven Creative Folio (Visual Storytelling)',
    store: 'Direct-to-Consumer (DTC) Luxury E-commerce Storefront',
    saas: 'Product-Led Growth (PLG) Platform (User-Centric Design)',
    restaurant: 'High-End Culinary Experience Site (Focus on Gastronomic Imagery)',
    agency: 'Boutique Digital Agency Showcase (High-Impact Case Studies)',
    blog: 'Minimalist Editorial Magazine (Focus on Reading Experience)',
    personal: 'Personal Brand Identity Site (High-Impact Biography)',
    event: 'Immersive Event Experience Site (Animated Countdown, Ticket CTA)'
};

const styleLabels = {
    minimal: 'Swiss Grid Purity (Maximalist Whitespace, Editorial Typography)',
    modern: 'Bento Box Grid & Glassmorphism (Fluid motion, layered depth)',
    bold: 'Neo-Brutalism 3.0 (Asymmetrical layout, high-contrast negative space)',
    elegant: 'Timeless Luxury/Editorial (Serif headlines, delicate lines, sophisticated animation)',
    playful: 'Dopamine Design (3D elements, vibrant colors, organic shapes)',
    dark: 'Premium Dark Mode (OLED black, neon accents, cinematic atmosphere)'
};

const colorLabels = {
    monochrome: 'Luxury Monochromatic (Zinc/Slate scales, 1% Gold accent)',
    blue: 'Deep Tech Ocean (Electric Indigo/Royal Blue, Trust-focused)',
    green: 'Organic Modern Earth Tones (Sage, Cream, Natural Linen Textures)',
    warm: 'Sunset Premium (Rich oranges, warm greys, soft pink gradients)',
    earth: 'Natural Aesthetics (Stone, sand, clay, charcoal)',
    neon: 'High-Voltage Cyberpunk (Pure black background, Lime/Cyan glowing accents)'
};

// Mapping for specific color palettes based on selection
const colorPalettes = {
    monochrome: `
--bg-main: 0 0% 100%;
--bg-secondary: 0 0% 98%;
--text-main: 0 0% 9%;
--text-muted: 0 0% 45%;
--accent: 0 0% 9%;
--accent-contrast: 0 0% 100%;
--border: 0 0% 90%;`,
    blue: `
--bg-main: 220 30% 98%;
--bg-secondary: 220 30% 96%;
--text-main: 222 47% 11%;
--text-muted: 215 25% 40%;
--accent: 221 83% 53%;
--accent-contrast: 0 0% 100%;
--border: 220 20% 90%;`,
    green: `
--bg-main: 150 15% 98%;
--bg-secondary: 150 15% 96%;
--text-main: 164 45% 10%;
--text-muted: 160 15% 40%;
--accent: 158 64% 35%;
--accent-contrast: 0 0% 100%;
--border: 150 10% 88%;`,
    warm: `
--bg-main: 25 30% 98%;
--bg-secondary: 25 30% 96%;
--text-main: 20 20% 10%;
--text-muted: 20 10% 40%;
--accent: 12 76% 61%;
--accent-contrast: 0 0% 100%;
--border: 20 15% 90%;`,
    earth: `
--bg-main: 35 25% 96%;
--bg-secondary: 35 20% 92%;
--text-main: 30 15% 15%;
--text-muted: 30 10% 40%;
--accent: 28 35% 45%;
--accent-contrast: 35 25% 96%;
--border: 30 10% 85%;`,
    neon: `
--bg-main: 240 10% 4%;
--bg-secondary: 240 10% 8%;
--text-main: 0 0% 100%;
--text-muted: 240 10% 65%;
--accent: 142 77% 53%;
--accent-contrast: 0 0% 0%;
--border: 240 10% 20%;`
};

// Font recommendations based on style
const fonts = {
    minimal: 'font-family: "Inter", sans-serif; (Heading: "Inter", Body: "Inter")',
    modern: 'font-family: "Plus Jakarta Sans", sans-serif; (Heading: "Plus Jakarta Sans", Body: "Inter")',
    bold: 'font-family: "Oswald", sans-serif; (Heading: "Oswald", Body: "Roboto")',
    elegant: 'font-family: "Playfair Display", serif; (Heading: "Playfair Display", Body: "Lato")',
    playful: 'font-family: "Quicksand", sans-serif; (Heading: "Quicksand", Body: "Nunito")',
    dark: 'font-family: "Space Grotesk", sans-serif; (Heading: "Space Grotesk", Body: "Inter")'
};

const featureLabels = {
    hero: 'Immersive Hero Section (Large visuals, strong value prop, primary CTA)',
    about: 'About/Story Section (Grid layout with images)',
    services: 'Bento-Grid Services Section (Interactive cards)',
    portfolio: 'Masonry Portfolio Gallery (Hover reveals details)',
    testimonials: 'Social Proof Carousel (Modern card design)',
    pricing: 'Tiered Pricing Table (Highlighting "Pro" plan)',
    contact: 'Minimalist Contact Area (Clean layout)',
    faq: 'Accordion FAQ (Smooth expanding details)',
    team: 'Team Showcase (Profile cards with social overlays)',
    blog: 'Editorial Blog Grid (Featured article + recent posts)'
};

const pageLabels = {
    home: 'Home Page',
    about: 'About',
    services: 'Services',
    portfolio: 'Work',
    blog: 'Journal',
    contact: 'Contact',
    pricing: 'Pricing',
    team: 'Team',
    faq: 'FAQ',
    testimonials: 'Reviews'
};

// Constructing the "Mega Prompt" for Premium Results
let prompt = `ACT AS A **SENIOR FRONTEND ENGINEER, AWARD-WINNING UI/UX DESIGNER, AND BRAND STRATEGIST**.

Your primary goal is to build the MOST BEAUTIFUL, PREMIUM, and POLISHED website possible, adhering to **Awwwards "Site of the Day" quality standards**. The final output MUST be a single, production-ready \`index.html\` file that feels like a top-tier startup or luxury brand site.

---

### 1. PROJECT OVERVIEW
- **Role/Theme**: "${typeLabels[state.type] || 'Premium Brand Website'}"
- **Structure**: ${state.structure === 'multi' ? 'Client-Side Routing Single Page Application (SPA) in one file' : 'High-Conversion Landing Page'}
- **Core Aesthetic**: "${styleLabels[state.style] || 'Modern & Clean'}"
- **Brand Palette**: "${colorLabels[state.color] || 'Premium Palette'}"

### 2. DESIGN & AESTHETICS (CRITICAL)
- **Quality Standard**: Aim for **Pixel Perfect UI**. Use a strict **Grid System** (e.g., 12-column) for perfect alignment.
- **Typography**: Use Google Fonts: ${fonts[state.style] || 'Inter'}. Use distinct weights.
- **Whitespace**: Utilize **MAXIMALIST negative space** (120px+ vertical padding between sections). Do not crowd elements.
- **Micro-Interactions**: All interactive elements (buttons, cards) must have smooth \`transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);\`. Implement subtle effects like **3D-lift on hover**.
- **Visual Depth**: Use **Glassmorphism** (\`backdrop-filter: blur(10px)\`) for the sticky header/navbar. Apply **Luxury Shadows** (multi-layered, soft, diffused) for a premium, lifted feel.

### 3. TECHNICAL REQUIREMENTS
- **Single File**: Everything (HTML, CSS, JS) must be in ONE file.
- **Responsive**: Mandatory Mobile-First approach. Use **CSS Grid and Flexbox**.
- **Images**: Use high-quality Unsplash source URLs that MATCH the industry ("${state.type}").
- **Icons**: Use FontAwesome via CDN.
- **Scroll**: \`html { scroll-behavior: smooth; }\`

### 4. COLOR PALETTE (USE THESE CSS VARIABLES)
Use HSL values for flexibility. Put this in your \`:root\`:
\`\`\`css
:root {
${colorPalettes[state.color] || colorPalettes.blue}
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 24px;
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}
\`\`\`

### 5. SECTIONS TO BUILD
${state.structure === 'multi' ?
        `Implement a client-side router (pure JS) to switch these "pages" instantly without reload (with a smooth fade-in animation):
${state.pages.map(p => `- ${pageLabels[p]}`).join('\n')}` :
        `Build these premium sections in order with smooth transitions:
${state.features.length > 0 ? state.features.map(f => `- ${featureLabels[f]}`).join('\n') : '- Immersive Hero, High-Impact Features, Detailed About, Contact Form'}`
    }

### 6. CONTENT GUIDELINES
- Write **PROFESSIONAL, COMPELLING, AND VALUE-DRIVEN COPY**. No "Lorem Ipsum".
- Headlines should be punchy and large (e.g., 3.8rem+ on desktop).

${state.details ? `### 7. SPECIFIC USER REQUESTS\n${state.details}` : ''}

`;

// Contact Form Logic
const hasContactForm = state.features.includes('contact') || (state.structure === 'multi' && state.pages.includes('contact'));

if (hasContactForm) {
    prompt += `
### CONTACT FORM INTEGRATION (MANDATORY)
You MUST implement the contact form exactly as follows using the YENZE API.
Do NOT use any other service.

HTML:
\`\`\`html
<form id="contactForm" onsubmit="submitForm(event)" class="contact-form">
    <div class="form-group">
        <label>Name</label>
        <input type="text" name="name" placeholder="Your Name" required>
    </div>
    <div class="form-group">
        <label>Email</label>
        <input type="email" name="email" placeholder="john@example.com" required>
    </div>
    <div class="form-group">
        <label>Message</label>
        <textarea name="message" placeholder="How can we help?" required></textarea>
    </div>
    <button type="submit" class="btn-submit">Send Message</button>
</form>
\`\`\`

JAVASCRIPT:
\`\`\`javascript
async function submitForm(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const response = await fetch('https://yenze.io/api/submit-form', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            alert('Message sent successfully!');
            form.reset();
        } else {
            alert('Error: ' + (result.error || 'Could not send'));
        }
    } catch (error) {
        alert('Connection error. Please try again.');
    }

    btn.disabled = false;
    btn.textContent = originalText;
}
\`\`\`
`;
}

prompt += `
### FINAL OUTPUT FORMAT
Please provide the complete code in a single HTML file.
Wrap the code in a markdown code block (e.g., \`\`\`html ... \`\`\`).
Ensure the code is complete and functional.
`;

console.log(prompt);
