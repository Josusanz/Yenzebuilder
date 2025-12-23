// YENZE Builder - Main Application Logic
// Version 1.1.2 - All features restored: collapsible layers, multipage, integrations + pricing system

// Element Templates
const ELEMENT_TEMPLATES = {
    'contact-form': `
        <section style="padding: 4rem 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 3rem; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <h2 style="font-size: 2rem; margin: 0 0 0.5rem; color: #1a1a2e; font-weight: 700;">Get in Touch</h2>
                <p style="color: #6b7280; margin: 0 0 2rem;">We'd love to hear from you. Send us a message!</p>
                <form action="https://api.web3forms.com/submit" method="POST" id="contactForm">
                    <input type="hidden" name="access_key" value="YOUR_WEB3FORMS_KEY">
                    <input type="hidden" name="subject" value="New Contact Form Submission">
                    <input type="hidden" name="redirect" value="https://web3forms.com/success">

                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151; font-size: 0.875rem;">Name</label>
                        <input type="text" name="name" placeholder="Your name" required style="width: 100%; padding: 0.75rem 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; transition: all 0.2s;" onfocus="this.style.borderColor='#667eea'" onblur="this.style.borderColor='#e5e7eb'">
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151; font-size: 0.875rem;">Email</label>
                        <input type="email" name="email" placeholder="your@email.com" required style="width: 100%; padding: 0.75rem 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; transition: all 0.2s;" onfocus="this.style.borderColor='#667eea'" onblur="this.style.borderColor='#e5e7eb'">
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151; font-size: 0.875rem;">Message</label>
                        <textarea name="message" placeholder="Your message..." rows="4" required style="width: 100%; padding: 0.75rem 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; resize: vertical; transition: all 0.2s;" onfocus="this.style.borderColor='#667eea'" onblur="this.style.borderColor='#e5e7eb'"></textarea>
                    </div>
                    <div class="h-captcha" data-captcha="true"></div>
                    <button type="submit" style="width: 100%; padding: 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">Send Message</button>
                </form>
                <script src="https://web3forms.com/client/script.js" async defer></script>
            </div>
        </section>
    `,
    'newsletter-form': `
        <section style="padding: 3rem 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
            <div style="max-width: 600px; margin: 0 auto;">
                <h3 style="font-size: 1.75rem; color: white; margin: 0 0 0.5rem; font-weight: 700;">Subscribe to our Newsletter</h3>
                <p style="color: rgba(255,255,255,0.9); margin: 0 0 2rem;">Get the latest updates delivered to your inbox.</p>
                <form id="newsletterForm" style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center;">
                    <input type="email" name="email" placeholder="Enter your email" required style="flex: 1; min-width: 250px; padding: 1rem 1.25rem; border: 2px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white; border-radius: 50px; font-size: 1rem; backdrop-filter: blur(10px);" onfocus="this.style.borderColor='white'" onblur="this.style.borderColor='rgba(255,255,255,0.3)'">
                    <button type="submit" style="padding: 1rem 2.5rem; background: white; color: #667eea; border: none; border-radius: 50px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: transform 0.2s; white-space: nowrap;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Subscribe</button>
                </form>
                <div id="newsletter-message" style="margin-top: 1rem; color: white; font-weight: 500;"></div>
                <script>
                    document.getElementById('newsletterForm').addEventListener('submit', async function(e) {
                        e.preventDefault();
                        const email = this.querySelector('[name="email"]').value;
                        const messageDiv = document.getElementById('newsletter-message');
                        const button = this.querySelector('button');

                        button.disabled = true;
                        button.textContent = 'Subscribing...';

                        try {
                            const response = await fetch('https://app.loops.so/api/newsletter-form/YOUR_LOOPS_FORM_ID', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email })
                            });

                            if (response.ok) {
                                messageDiv.textContent = '✓ Thanks for subscribing!';
                                this.reset();
                            } else {
                                messageDiv.textContent = '✗ Something went wrong. Please try again.';
                            }
                        } catch (error) {
                            messageDiv.textContent = '✗ Something went wrong. Please try again.';
                        } finally {
                            button.disabled = false;
                            button.textContent = 'Subscribe';
                        }
                    });
                </script>
            </div>
        </section>
    `,
    'mailchimp-form': `
        <section style="padding: 3rem 2rem; background: linear-gradient(135deg, #FFE01B 0%, #F0C800 100%); text-align: center;">
            <div style="max-width: 600px; margin: 0 auto;">
                <h3 style="font-size: 1.75rem; color: #000; margin: 0 0 0.5rem; font-weight: 700;">Subscribe to our Newsletter</h3>
                <p style="color: rgba(0,0,0,0.7); margin: 0 0 2rem;">Get the latest updates delivered to your inbox.</p>
                <form action="https://YOUR_MAILCHIMP_URL" method="post" id="mailchimpForm" target="_blank" style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center;">
                    <input type="email" name="EMAIL" placeholder="Enter your email" required style="flex: 1; min-width: 250px; padding: 1rem 1.25rem; border: 2px solid rgba(0,0,0,0.2); background: white; color: #000; border-radius: 50px; font-size: 1rem;" onfocus="this.style.borderColor='#000'" onblur="this.style.borderColor='rgba(0,0,0,0.2)'">
                    <input type="hidden" name="u" value="YOUR_U_VALUE">
                    <input type="hidden" name="id" value="YOUR_AUDIENCE_ID">
                    <button type="submit" style="padding: 1rem 2.5rem; background: #000; color: #FFE01B; border: none; border-radius: 50px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: transform 0.2s; white-space: nowrap;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Subscribe</button>
                </form>
                <p style="margin-top: 1rem; color: rgba(0,0,0,0.5); font-size: 0.85rem;">Powered by Mailchimp</p>
            </div>
        </section>
    `,
    'convertkit-form': `
        <section style="padding: 3rem 2rem; background: linear-gradient(135deg, #FB6970 0%, #E85A61 100%); text-align: center;">
            <div style="max-width: 600px; margin: 0 auto;">
                <h3 style="font-size: 1.75rem; color: white; margin: 0 0 0.5rem; font-weight: 700;">Subscribe to our Newsletter</h3>
                <p style="color: rgba(255,255,255,0.9); margin: 0 0 2rem;">Get the latest updates delivered to your inbox.</p>
                <form id="convertkitForm" style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center;">
                    <input type="email" name="email" placeholder="Enter your email" required style="flex: 1; min-width: 250px; padding: 1rem 1.25rem; border: 2px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white; border-radius: 50px; font-size: 1rem; backdrop-filter: blur(10px);" onfocus="this.style.borderColor='white'" onblur="this.style.borderColor='rgba(255,255,255,0.3)'">
                    <button type="submit" style="padding: 1rem 2.5rem; background: white; color: #FB6970; border: none; border-radius: 50px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: transform 0.2s; white-space: nowrap;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Subscribe</button>
                </form>
                <div id="convertkit-message" style="margin-top: 1rem; color: white; font-weight: 500;"></div>
                <script>
                    document.getElementById('convertkitForm').addEventListener('submit', async function(e) {
                        e.preventDefault();
                        const email = this.querySelector('[name="email"]').value;
                        const messageDiv = document.getElementById('convertkit-message');
                        const button = this.querySelector('button');

                        button.disabled = true;
                        button.textContent = 'Subscribing...';

                        try {
                            const response = await fetch('https://api.convertkit.com/v3/forms/YOUR_FORM_ID/subscribe', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    api_key: 'YOUR_API_KEY',
                                    email: email
                                })
                            });

                            if (response.ok) {
                                messageDiv.textContent = '✓ Thanks for subscribing!';
                                this.reset();
                            } else {
                                messageDiv.textContent = '✗ Something went wrong. Please try again.';
                            }
                        } catch (error) {
                            messageDiv.textContent = '✗ Something went wrong. Please try again.';
                        } finally {
                            button.disabled = false;
                            button.textContent = 'Subscribe';
                        }
                    });
                </script>
            </div>
        </section>
    `,
    'navbar': `
        <nav style="display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 3rem; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 1000;">
            <div style="font-size: 1.5rem; font-weight: 700; color: #667eea;">YENZE</div>
            <ul style="display: flex; gap: 2rem; list-style: none; margin: 0; padding: 0; align-items: center;">
                <li><a href="#home" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='#667eea'" onmouseout="this.style.color='#374151'">Home</a></li>
                <li><a href="#about" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='#667eea'" onmouseout="this.style.color='#374151'">About</a></li>
                <li><a href="#services" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='#667eea'" onmouseout="this.style.color='#374151'">Services</a></li>
                <li><a href="#contact" style="padding: 0.625rem 1.5rem; background: #667eea; color: white; text-decoration: none; border-radius: 50px; font-weight: 500; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">Contact</a></li>
            </ul>
        </nav>
    `,
    'footer': `
        <footer style="background: #1a1a2e; color: white; padding: 4rem 3rem 2rem;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 3rem; margin-bottom: 3rem;">
                <div>
                    <h4 style="font-size: 1.25rem; margin: 0 0 1rem; font-weight: 700;">Company</h4>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 0.75rem;"><a href="#about" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">About Us</a></li>
                        <li style="margin-bottom: 0.75rem;"><a href="#careers" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">Careers</a></li>
                        <li style="margin-bottom: 0.75rem;"><a href="#blog" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">Blog</a></li>
                    </ul>
                </div>
                <div>
                    <h4 style="font-size: 1.25rem; margin: 0 0 1rem; font-weight: 700;">Support</h4>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 0.75rem;"><a href="#help" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">Help Center</a></li>
                        <li style="margin-bottom: 0.75rem;"><a href="#contact" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">Contact Us</a></li>
                        <li style="margin-bottom: 0.75rem;"><a href="#faq" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">FAQ</a></li>
                    </ul>
                </div>
                <div>
                    <h4 style="font-size: 1.25rem; margin: 0 0 1rem; font-weight: 700;">Legal</h4>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 0.75rem;"><a href="#privacy" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">Privacy Policy</a></li>
                        <li style="margin-bottom: 0.75rem;"><a href="#terms" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">Terms of Service</a></li>
                    </ul>
                </div>
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 2rem; text-align: center; color: rgba(255,255,255,0.6);">
                <p style="margin: 0;">&copy; 2024 YENZE. All rights reserved.</p>
            </div>
        </footer>
    `,
    'hero': `
        <section style="padding: 6rem 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center; color: white;">
            <div style="max-width: 800px; margin: 0 auto;">
                <h1 style="font-size: 3.5rem; margin: 0 0 1rem; font-weight: 800; line-height: 1.1;">Build Beautiful Websites in Minutes</h1>
                <p style="font-size: 1.25rem; margin: 0 0 2.5rem; opacity: 0.95;">Create stunning, responsive websites without writing code. Start building your dream site today.</p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <button style="padding: 1rem 2.5rem; background: white; color: #667eea; border: none; border-radius: 50px; font-size: 1.125rem; font-weight: 600; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">Get Started</button>
                    <button style="padding: 1rem 2.5rem; background: transparent; color: white; border: 2px solid white; border-radius: 50px; font-size: 1.125rem; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='white'; this.style.color='#667eea'" onmouseout="this.style.background='transparent'; this.style.color='white'">Learn More</button>
                </div>
            </div>
        </section>
    `,
    'card': `
        <section style="padding: 4rem 2rem; background: #f9fafb;">
            <div style="max-width: 1200px; margin: 0 auto;">
                <h2 style="font-size: 2.5rem; text-align: center; margin: 0 0 3rem; color: #1a1a2e; font-weight: 700;">Our Services</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                    <div style="background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-8px)'" onmouseout="this.style.transform='translateY(0)'">
                        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; font-size: 2rem;">🚀</div>
                        <h3 style="font-size: 1.5rem; margin: 0 0 0.75rem; color: #1a1a2e; font-weight: 600;">Fast Performance</h3>
                        <p style="color: #6b7280; line-height: 1.6; margin: 0;">Lightning-fast load times and optimized performance for the best user experience.</p>
                    </div>
                    <div style="background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-8px)'" onmouseout="this.style.transform='translateY(0)'">
                        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; font-size: 2rem;">📱</div>
                        <h3 style="font-size: 1.5rem; margin: 0 0 0.75rem; color: #1a1a2e; font-weight: 600;">Responsive Design</h3>
                        <p style="color: #6b7280; line-height: 1.6; margin: 0;">Beautiful layouts that look perfect on all devices, from mobile to desktop.</p>
                    </div>
                    <div style="background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-8px)'" onmouseout="this.style.transform='translateY(0)'">
                        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; font-size: 2rem;">🎨</div>
                        <h3 style="font-size: 1.5rem; margin: 0 0 0.75rem; color: #1a1a2e; font-weight: 600;">Beautiful UI</h3>
                        <p style="color: #6b7280; line-height: 1.6; margin: 0;">Modern, clean design with attention to detail and stunning visual appeal.</p>
                    </div>
                </div>
            </div>
        </section>
    `,
    'cta': `
        <section style="padding: 5rem 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center; color: white;">
            <div style="max-width: 700px; margin: 0 auto;">
                <h2 style="font-size: 2.75rem; margin: 0 0 1rem; font-weight: 700;">Ready to Get Started?</h2>
                <p style="font-size: 1.125rem; margin: 0 0 2.5rem; opacity: 0.95;">Join thousands of users who are already building amazing websites with YENZE.</p>
                <button style="padding: 1.25rem 3rem; background: white; color: #667eea; border: none; border-radius: 50px; font-size: 1.125rem; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 10px 30px rgba(0,0,0,0.2);" onmouseover="this.style.transform='translateY(-3px) scale(1.05)'; this.style.boxShadow='0 15px 40px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 10px 30px rgba(0,0,0,0.2)'">Start Building Now</button>
            </div>
        </section>
    `,
    'two-columns': `
        <section style="padding: 4rem 2rem;">
            <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center;">
                <div>
                    <h2 style="font-size: 2.5rem; margin: 0 0 1rem; color: #1a1a2e; font-weight: 700;">Column One</h2>
                    <p style="color: #6b7280; line-height: 1.8; margin: 0;">This is the first column. Add your content here. You can include text, images, or any other elements.</p>
                </div>
                <div>
                    <h2 style="font-size: 2.5rem; margin: 0 0 1rem; color: #1a1a2e; font-weight: 700;">Column Two</h2>
                    <p style="color: #6b7280; line-height: 1.8; margin: 0;">This is the second column. Add your content here. Perfect for side-by-side layouts and comparisons.</p>
                </div>
            </div>
        </section>
    `,
    'three-columns': `
        <section style="padding: 4rem 2rem; background: #f9fafb;">
            <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5rem;">
                <div style="text-align: center;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 2.5rem;">1</div>
                    <h3 style="font-size: 1.25rem; margin: 0 0 0.75rem; color: #1a1a2e; font-weight: 600;">First Step</h3>
                    <p style="color: #6b7280; line-height: 1.6; margin: 0;">Description for the first step or feature goes here.</p>
                </div>
                <div style="text-align: center;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 2.5rem;">2</div>
                    <h3 style="font-size: 1.25rem; margin: 0 0 0.75rem; color: #1a1a2e; font-weight: 600;">Second Step</h3>
                    <p style="color: #6b7280; line-height: 1.6; margin: 0;">Description for the second step or feature goes here.</p>
                </div>
                <div style="text-align: center;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 2.5rem;">3</div>
                    <h3 style="font-size: 1.25rem; margin: 0 0 0.75rem; color: #1a1a2e; font-weight: 600;">Third Step</h3>
                    <p style="color: #6b7280; line-height: 1.6; margin: 0;">Description for the third step or feature goes here.</p>
                </div>
            </div>
        </section>
    `
};

class YenzeBuilder {
    constructor() {
        this.currentHTML = '';
        this.selectedElement = null;
        this.currentDevice = 'desktop';
        this.deviceWidths = {
            desktop: 1440,
            tablet: 768,
            mobile: 375
        };
        this.currentScale = 1;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.draggedElement = null;
        this.draggedLayerElement = null;
        this.dropIndicator = null;
        this.pendingPublish = false; // Flag to track if user was trying to publish

        // History system for undo/redo
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;

        this.projectData = {
            name: 'My Website',
            html: '',
            assets: [],
            publishedUrl: null
        };

        // Popular Google Fonts
        this.googleFonts = [
            'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
            'Raleway', 'Nunito', 'Playfair Display', 'Merriweather',
            'PT Sans', 'Ubuntu', 'Oswald', 'Work Sans', 'Bebas Neue',
            'Crimson Text', 'Space Grotesk', 'DM Sans', 'Outfit', 'Manrope',
            'Plus Jakarta Sans', 'Sora', 'Lexend', 'Mulish', 'Quicksand'
        ];

        // Note: init() is called from builder.html after DOM is ready
    }

    async init() {
        this.loadSavedBreakpoints();
        this.setupEventListeners();
        await this.loadProject();

        // Auto-scale on init and window resize
        setTimeout(() => this.autoScaleCanvas(), 300);
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => this.autoScaleCanvas(), 150);
        });
    }

    loadSavedBreakpoints() {
        const saved = localStorage.getItem('customBreakpoints');
        if (saved) {
            try {
                const breakpoints = JSON.parse(saved);
                this.deviceWidths = breakpoints;

                // Update breakpoint inputs
                const desktopInput = document.getElementById('desktopBreakpoint');
                const tabletInput = document.getElementById('tabletBreakpoint');
                const mobileInput = document.getElementById('mobileBreakpoint');

                if (desktopInput) desktopInput.value = breakpoints.desktop;
                if (tabletInput) tabletInput.value = breakpoints.tablet;
                if (mobileInput) mobileInput.value = breakpoints.mobile;

                // Update canvas width input
                const canvasInput = document.getElementById('canvasWidthInput');
                if (canvasInput) canvasInput.value = breakpoints.desktop;
            } catch (e) {
                console.error('Error loading saved breakpoints:', e);
            }
        }
    }

    setupEventListeners() {
        // Left Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const leftSidebar = document.getElementById('leftSidebar');
        if (sidebarToggle && leftSidebar) {
            sidebarToggle.addEventListener('click', () => {
                leftSidebar.classList.toggle('collapsed');
                sidebarToggle.classList.toggle('collapsed');
                // Recalculate canvas scale after transition
                setTimeout(() => this.autoScaleCanvas(), 350);
            });
        }

        // Left Sidebar tabs
        document.querySelectorAll('.left-sidebar .sidebar-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab, 'left'));
        });

        // Right Sidebar tabs
        document.querySelectorAll('.right-sidebar .sidebar-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab, 'right'));
        });

        // Device toggle
        document.querySelectorAll('.device-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchDevice(e.currentTarget.dataset.device));
        });

        // Device width input
        document.getElementById('canvasWidthInput')?.addEventListener('change', (e) => {
            this.updateCanvasWidth(e.target.value);
        });

        document.getElementById('canvasWidthInput')?.addEventListener('input', (e) => {
            this.updateCanvasWidth(e.target.value);
        });

        // Breakpoints panel toggle
        const breakpointsToggle = document.getElementById('breakpointsToggle');
        const breakpointsContent = document.getElementById('breakpointsContent');
        const breakpointsChevron = document.getElementById('breakpointsChevron');

        if (breakpointsToggle && breakpointsContent) {
            breakpointsToggle.addEventListener('click', () => {
                const isOpen = breakpointsContent.style.display !== 'none';
                breakpointsContent.style.display = isOpen ? 'none' : 'block';
                if (breakpointsChevron) {
                    breakpointsChevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
                }
            });
        }

        // Apply breakpoints button
        const applyBreakpointsBtn = document.getElementById('applyBreakpoints');
        if (applyBreakpointsBtn) {
            applyBreakpointsBtn.addEventListener('click', () => this.applyCustomBreakpoints());
        }

        // Import area
        const importArea = document.getElementById('importArea');
        const fileInput = document.getElementById('fileInput');

        importArea.addEventListener('click', () => fileInput.click());

        importArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            importArea.classList.add('dragover');
        });

        importArea.addEventListener('dragleave', () => {
            importArea.classList.remove('dragover');
        });

        importArea.addEventListener('drop', (e) => {
            e.preventDefault();
            importArea.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'text/html') {
                this.loadHTMLFile(file);
            }
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadHTMLFile(file);
            }
        });

        // Load HTML from paste
        document.getElementById('loadHtmlBtn').addEventListener('click', () => {
            const html = document.getElementById('htmlPaste').value;
            if (html) {
                this.loadHTML(html);
            }
        });

        // Code view
        document.getElementById('codeViewBtn').addEventListener('click', () => {
            this.toggleCodeEditor();
        });

        document.getElementById('closeCodeBtn').addEventListener('click', () => {
            this.toggleCodeEditor();
        });

        document.getElementById('applyCodeBtn').addEventListener('click', () => {
            const code = document.getElementById('codeContent').value;
            this.loadHTML(code);
            this.toggleCodeEditor();
        });

        // Undo/Redo
        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undo();
        });

        document.getElementById('redoBtn').addEventListener('click', () => {
            this.redo();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            }
            // Redo
            else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                this.redo();
            }
            // Delete selected element with Backspace or Delete key
            else if ((e.key === 'Backspace' || e.key === 'Delete') && this.selectedElement) {
                console.log('🗑️ Delete key pressed. Selected element:', this.selectedElement);

                // Don't delete if user is typing in an input/textarea
                const activeElement = document.activeElement;
                const isTyping = activeElement && (
                    activeElement.tagName === 'INPUT' ||
                    activeElement.tagName === 'TEXTAREA' ||
                    activeElement.isContentEditable
                );

                console.log('Active element:', activeElement, 'Is typing:', isTyping);

                if (!isTyping) {
                    e.preventDefault();
                    this.deleteSelectedElement();
                }
            }
        });

        // Preview
        document.getElementById('previewBtn').addEventListener('click', () => {
            this.preview();
        });

        // Publish
        document.getElementById('publishBtn').addEventListener('click', () => {
            this.publish();
        });

        // Project name
        document.getElementById('projectName').addEventListener('blur', (e) => {
            this.projectData.name = e.target.value;
            this.saveProject();
        });

        // Asset upload (kept for backwards compatibility, but now hidden)
        document.getElementById('assetUpload')?.addEventListener('change', (e) => {
            this.handleAssetUpload(e.target.files);
        });

        // Element cards drag-and-drop - use event delegation since cards may not exist yet
        document.addEventListener('dragstart', (e) => {
            const card = e.target.closest('.element-card');
            if (card) {
                const elementType = card.dataset.element;
                console.log('🎯 Drag started:', elementType);
                e.dataTransfer.setData('text/plain', elementType); // Use text/plain for better compatibility
                e.dataTransfer.effectAllowed = 'copy';
                card.style.opacity = '0.5';
                card.classList.add('dragging');
            }
        });

        document.addEventListener('dragend', (e) => {
            const card = e.target.closest('.element-card');
            if (card) {
                card.style.opacity = '1';
                card.classList.remove('dragging');
            }
        });

        // Click to insert elements (but not if we're dragging)
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.element-card');
            if (card && !card.classList.contains('dragging')) {
                const elementType = card.dataset.element;

                // Special handling for contact-form: show template selector modal
                if (elementType === 'contact-form') {
                    this.showWeb3FormsModal();
                } else {
                    this.insertElementTemplate(elementType);
                }
            }
        });

        // Canvas drop zone for elements - on the whole canvas area
        const canvasArea = document.querySelector('.canvas-area');

        if (!canvasArea) {
            console.error('❌ Canvas area not found!');
            return;
        }

        console.log('✅ Canvas area found, adding drag-drop listeners');

        canvasArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            canvasArea.style.background = 'rgba(102, 126, 234, 0.05)';
            console.log('🎯 Dragging over canvas area');
        });

        canvasArea.addEventListener('dragleave', (e) => {
            if (e.target === canvasArea) {
                canvasArea.style.background = '';
            }
        });

        canvasArea.addEventListener('drop', (e) => {
            e.preventDefault();
            canvasArea.style.background = '';
            const elementType = e.dataTransfer.getData('text/plain');
            console.log('🎯 Drop received:', elementType);
            if (elementType && ELEMENT_TEMPLATES[elementType]) {
                this.insertElementTemplate(elementType);
            }
        });

        // Element search
        document.getElementById('elementSearch')?.addEventListener('input', (e) => {
            this.filterElements(e.target.value);
        });

        // Layers action buttons - Always available
        document.getElementById('addSectionBtn')?.addEventListener('click', () => this.addElement('section'));
        document.getElementById('addDivBtn')?.addEventListener('click', () => this.addElement('div'));
        document.getElementById('addColumnsBtn')?.addEventListener('click', () => this.addColumns());
    }

    switchTab(tabName, sidebar = 'left') {
        const sidebarClass = sidebar === 'left' ? '.left-sidebar' : '.right-sidebar';

        // Update active tab in the specific sidebar
        document.querySelectorAll(`${sidebarClass} .sidebar-tab`).forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`${sidebarClass} [data-tab="${tabName}"]`).classList.add('active');

        // Update active panel in the specific sidebar
        document.querySelectorAll(`${sidebarClass} .tab-panel`).forEach(panel => {
            panel.classList.remove('active');
        });
        document.querySelector(`${sidebarClass} #${tabName}Panel`).classList.add('active');
    }

    switchDevice(device) {
        this.currentDevice = device;

        // Update active button
        document.querySelectorAll('.device-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-device="${device}"]`).classList.add('active');

        // Reset scaler transform immediately
        const canvasScaler = document.getElementById('canvasScaler');
        if (canvasScaler) {
            canvasScaler.style.transition = 'none';
            canvasScaler.style.transform = 'scale(1)';
        }

        // Update canvas wrapper class and reset inline styles
        const wrapper = document.getElementById('canvasWrapper');
        wrapper.style.transition = 'none';
        wrapper.className = `canvas-wrapper ${device}`;
        wrapper.style.width = ''; // Clear inline width to use CSS class width

        // Update width from stored value
        const width = this.deviceWidths[device];

        // Update input value
        const input = document.getElementById('canvasWidthInput');
        if (input) {
            input.value = width;
        }

        // Reload HTML content to trigger responsive recalculation at new width
        if (this.currentHTML) {
            this.loadHTML(this.currentHTML, false, false); // false = don't add to history, false = don't show toast
        }

        // Force reflow then recalculate scale
        wrapper.offsetHeight;

        // Re-enable transitions and auto-scale
        requestAnimationFrame(() => {
            if (canvasScaler) canvasScaler.style.transition = '';
            wrapper.style.transition = '';
            this.autoScaleCanvas();
        });
    }

    autoScaleCanvas() {
        const canvasArea = document.getElementById('canvasArea');
        const canvasScaler = document.getElementById('canvasScaler');
        const wrapper = document.getElementById('canvasWrapper');
        const zoomIndicator = document.getElementById('zoomIndicator');

        if (!canvasArea || !canvasScaler || !wrapper) return;

        // Get available space (with comfortable margin)
        const margin = 16;
        const availableWidth = canvasArea.clientWidth - margin;
        const availableHeight = canvasArea.clientHeight - margin;

        // Device dimensions
        const deviceDimensions = {
            desktop: { width: 1440, height: 900 },
            tablet: { width: 768, height: 600 },
            mobile: { width: 375, height: 667 }
        };

        const dims = deviceDimensions[this.currentDevice] || deviceDimensions.desktop;
        const wrapperWidth = dims.width;
        const wrapperHeight = dims.height;

        // Calculate scale to fit canvas in available space
        const scaleX = availableWidth / wrapperWidth;
        const scaleY = availableHeight / wrapperHeight;

        // Use the smaller scale to fit both dimensions
        let scale = Math.min(scaleX, scaleY);

        // Cap at 1 (don't upscale beyond 100% - the canvas should never be bigger than its natural size)
        scale = Math.min(scale, 1);

        // Minimum scale for usability
        scale = Math.max(scale, 0.2);

        this.currentScale = scale;
        canvasScaler.style.transform = `scale(${scale})`;

        // Show zoom indicator briefly
        if (zoomIndicator) {
            zoomIndicator.textContent = `${Math.round(scale * 100)}%`;
            zoomIndicator.style.display = 'block';
            clearTimeout(this.zoomIndicatorTimeout);
            this.zoomIndicatorTimeout = setTimeout(() => {
                zoomIndicator.style.display = 'none';
            }, 1500);
        }
    }

    updateCanvasWidth(width) {
        const wrapper = document.getElementById('canvasWrapper');
        if (wrapper) {
            const canvasWidth = parseInt(width);
            wrapper.style.width = canvasWidth + 'px';

            // Update stored width for current device
            this.deviceWidths[this.currentDevice] = canvasWidth;

            // Update iframe viewport width override
            const canvas = document.getElementById('canvas');
            if (canvas) {
                // Keep iframe at 100% width to fill wrapper
                canvas.style.width = '100%';

                if (canvas.contentDocument) {
                    const iframeDoc = canvas.contentDocument;
                    let styleElement = iframeDoc.getElementById('yenze-viewport-override');

                    if (styleElement) {
                        styleElement.textContent = `
                            html, body {
                                width: 100% !important;
                                min-width: 100% !important;
                                max-width: 100% !important;
                                overflow-x: hidden !important;
                                overflow-y: auto !important;
                                margin: 0 !important;
                                padding: 0 !important;
                                box-sizing: border-box !important;
                            }
                            * {
                                box-sizing: border-box !important;
                            }
                            img, video, svg {
                                max-width: 100% !important;
                                height: auto !important;
                            }
                        `;
                    }

                    // Recalculate height after transition/reflow
                    setTimeout(() => {
                        this.adjustIframeHeight(canvas, iframeDoc);
                    }, 50);
                }
            }

            // Auto-scale after width change
            setTimeout(() => this.autoScaleCanvas(), 100);
        }
    }

    applyCustomBreakpoints() {
        const desktop = parseInt(document.getElementById('desktopBreakpoint')?.value || 1680);
        const tablet = parseInt(document.getElementById('tabletBreakpoint')?.value || 768);
        const mobile = parseInt(document.getElementById('mobileBreakpoint')?.value || 375);

        // Validate breakpoints
        if (desktop < 1024 || desktop > 3840) {
            alert('Desktop breakpoint must be between 1024px and 3840px');
            return;
        }
        if (tablet < 480 || tablet > 1024) {
            alert('Tablet breakpoint must be between 480px and 1024px');
            return;
        }
        if (mobile < 320 || mobile > 480) {
            alert('Mobile breakpoint must be between 320px and 480px');
            return;
        }

        // Update device widths
        this.deviceWidths.desktop = desktop;
        this.deviceWidths.tablet = tablet;
        this.deviceWidths.mobile = mobile;

        // Update current canvas width if viewing current device
        this.updateCanvasWidth(this.deviceWidths[this.currentDevice]);

        // Update width input
        const input = document.getElementById('canvasWidthInput');
        if (input) {
            input.value = this.deviceWidths[this.currentDevice];
        }

        // Save to localStorage
        localStorage.setItem('customBreakpoints', JSON.stringify(this.deviceWidths));

        // Show success toast
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            right: 24px;
            background: white;
            color: var(--text);
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10001;
            font-size: 13px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: slideIn 0.3s ease;
        `;
        toast.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Breakpoints updated!</span>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 2000);
    }

    loadHTMLFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const html = e.target.result;
            this.loadHTML(html);
        };
        reader.readAsText(file);
    }

    loadHTML(html, addToHistory = true, showToast = true) {
        this.currentHTML = html;
        this.projectData.html = html;

        // Reset state
        this.selectedElement = null;
        if (this.updateLayerTree) this.updateLayerTree(); // Clear layers if possible immediately

        // Add to history only if requested
        if (addToHistory) {
            this.addToHistory(html, 'Import HTML');
        }

        // Hide empty state
        document.getElementById('emptyState').style.display = 'none';

        // FORCE RESET IFRAME: Clone and replace to clear all internal state/listeners
        const oldCanvas = document.getElementById('canvas');
        const newCanvas = oldCanvas.cloneNode(false);
        newCanvas.style.display = 'block';

        // Replace in DOM
        oldCanvas.parentNode.replaceChild(newCanvas, oldCanvas);

        // Get fresh reference
        const canvas = newCanvas;

        // Set iframe to fill wrapper
        canvas.style.width = '100%';

        // Modify HTML for responsive simulation
        let modifiedHTML = html;

        // Only apply viewport modification for MOBILE to trigger responsive CSS
        // Desktop and Tablet should show the desktop layout (no viewport modification)
        if (this.currentDevice === 'mobile') {
            const deviceWidth = this.deviceWidths[this.currentDevice]; // 375px
            const viewportMeta = `<meta name="viewport" content="width=${deviceWidth}, initial-scale=1.0">`;
            if (modifiedHTML.includes('<meta') && modifiedHTML.includes('viewport')) {
                modifiedHTML = modifiedHTML.replace(/<meta[^>]*viewport[^>]*>/gi, viewportMeta);
            } else if (modifiedHTML.includes('<head>')) {
                modifiedHTML = modifiedHTML.replace('<head>', `<head>\n${viewportMeta}`);
            }
        }
        // For desktop and tablet, keep original viewport (or use desktop width) so responsive CSS doesn't trigger

        // Write HTML to iframe
        const iframeDoc = canvas.contentDocument || canvas.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(modifiedHTML);
        iframeDoc.close();

        // Force iframe content to render properly within the canvas
        const styleElement = iframeDoc.createElement('style');
        styleElement.id = 'yenze-viewport-override';
        styleElement.textContent = `
            html, body {
                width: 100% !important;
                min-width: 100% !important;
                max-width: 100% !important;
                overflow-x: hidden !important;
                overflow-y: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box !important;
            }
            * {
                box-sizing: border-box !important;
            }
            img, video, svg {
                max-width: 100% !important;
                height: auto !important;
            }
        `;

        // Wait for head to be available
        const insertStyle = () => {
            if (iframeDoc.head) {
                iframeDoc.head.insertBefore(styleElement, iframeDoc.head.firstChild);
            } else {
                setTimeout(insertStyle, 10);
            }
        };
        insertStyle();

        // Wait for iframe to be fully loaded before making elements editable
        // Use longer timeout for complex HTML and wait for readyState
        const initializeEditor = () => {
            if (iframeDoc.readyState === 'complete') {
                this.makeEditable(iframeDoc);
                this.buildLayersTree(iframeDoc);
                this.setupIframeKeyboardShortcuts(iframeDoc);
                this.adjustIframeHeight(canvas, iframeDoc);
                if (showToast) {
                    this.showToast('✅ HTML loaded successfully!', 'success');
                }

                // Add resize observer to body to auto-adjust height
                if (iframeDoc.body) {
                    const resizeObserver = new ResizeObserver(() => {
                        this.adjustIframeHeight(canvas, iframeDoc);
                    });
                    resizeObserver.observe(iframeDoc.body);

                    // Add MutationObserver to handle dynamic content changes (e.g. multipage navigation)
                    const mutationObserver = new MutationObserver((mutations) => {
                        let shouldRebuildLayers = false;
                        mutations.forEach((mutation) => {
                            if (mutation.type === 'childList') {
                                mutation.addedNodes.forEach((node) => {
                                    if (node.nodeType === 1) { // Element node
                                        this.makeElementEditable(node, iframeDoc);
                                        // Also make children editable
                                        node.querySelectorAll('*').forEach(child => {
                                            this.makeElementEditable(child, iframeDoc);
                                        });
                                        shouldRebuildLayers = true;
                                    }
                                });
                                if (mutation.removedNodes.length > 0) {
                                    shouldRebuildLayers = true;
                                }
                            }
                        });

                        if (shouldRebuildLayers) {
                            this.buildLayersTree(iframeDoc);
                        }
                    });
                    mutationObserver.observe(iframeDoc.body, { childList: true, subtree: true });
                }
            } else {
                // If not ready yet, wait a bit more
                setTimeout(initializeEditor, 200);
            }
        };

        // Start checking after a brief delay to allow initial parsing
        setTimeout(initializeEditor, 300);

        this.saveProject();
    }

    // Adjust iframe height to fit content (especially for mobile)
    // Adjust iframe height to fit content (especially for mobile)
    adjustIframeHeight(canvas, iframeDoc) {
        // Disabled to allow proper 100vh rendering and internal scrolling
        /*
        try {
            const body = iframeDoc.body;
            const html = iframeDoc.documentElement;

            if (body && html) {
                // Reset height first to allow shrinking
                canvas.style.height = 'auto';

                // Get the full content height
                const contentHeight = Math.max(
                    body.scrollHeight,
                    body.offsetHeight,
                    html.clientHeight,
                    html.scrollHeight,
                    html.offsetHeight
                );

                // Set iframe height to content height (with a minimum)
                const minHeight = window.innerWidth <= 768 ? 500 : 600;
                canvas.style.height = Math.max(contentHeight + 50, minHeight) + 'px';

                console.log('[Canvas] Adjusted iframe height to:', canvas.style.height);
            }
        } catch (e) {
            console.log('[Canvas] Could not adjust iframe height:', e);
        }
        */
        // Ensure height is 100% to fill the wrapper
        canvas.style.height = '100%';
    }

    setupIframeKeyboardShortcuts(doc) {
        // Add keyboard shortcuts to iframe document
        doc.addEventListener('keydown', (e) => {
            console.log('🎹 Key pressed in iframe:', e.key);

            // Delete selected element with Backspace or Delete key
            if ((e.key === 'Backspace' || e.key === 'Delete') && this.selectedElement) {
                console.log('🗑️ Delete key in iframe. Selected element:', this.selectedElement);

                // Don't delete if user is typing in an input/textarea within the iframe
                const activeElement = doc.activeElement;
                const isTyping = activeElement && (
                    activeElement.tagName === 'INPUT' ||
                    activeElement.tagName === 'TEXTAREA' ||
                    activeElement.isContentEditable
                );

                if (!isTyping) {
                    e.preventDefault();
                    this.deleteSelectedElement();
                }
            }
        });

        // Add drag-and-drop listeners to iframe document
        console.log('🎯 Setting up drag-and-drop in iframe');

        let dropIndicator = null;
        let dropTarget = null;
        let dropPosition = null;

        // Create drop indicator element
        const createDropIndicator = () => {
            if (!dropIndicator) {
                dropIndicator = doc.createElement('div');
                dropIndicator.style.position = 'absolute';
                dropIndicator.style.height = '3px';
                dropIndicator.style.background = '#667eea';
                dropIndicator.style.pointerEvents = 'none';
                dropIndicator.style.zIndex = '99999';
                dropIndicator.style.boxShadow = '0 0 8px rgba(102, 126, 234, 0.6)';
                dropIndicator.style.borderRadius = '2px';
            }
            return dropIndicator;
        };

        const removeDropIndicator = () => {
            if (dropIndicator && dropIndicator.parentNode) {
                dropIndicator.parentNode.removeChild(dropIndicator);
            }
            // Don't reset dropTarget and dropPosition here - we need them for the drop event!
        };

        doc.body.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';

            // Get the element being dragged over
            let target = e.target;

            // Skip if target is the drop indicator itself
            if (target === dropIndicator) return;

            // Skip script and style tags
            if (target.tagName === 'SCRIPT' || target.tagName === 'STYLE') {
                target = target.parentElement;
            }

            // Find the closest element that's not body
            while (target && target !== doc.body && target.tagName === 'HTML') {
                target = target.parentElement;
            }

            if (!target || target === doc.body) {
                target = doc.body;
            }

            // Calculate if we should insert before or after
            const rect = target.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            const position = e.clientY < midpoint ? 'before' : 'after';

            // Store drop target and position
            dropTarget = target;
            dropPosition = position;

            console.log('📍 Drag position:', position, 'over:', target.tagName);

            // Show drop indicator
            const indicator = createDropIndicator();

            if (target === doc.body) {
                // Insert at the end of body
                indicator.style.left = '20px';
                indicator.style.right = '20px';
                indicator.style.width = 'calc(100% - 40px)';
                indicator.style.top = (doc.body.scrollHeight - 3) + 'px';
            } else {
                indicator.style.left = rect.left + 'px';
                indicator.style.width = rect.width + 'px';

                if (position === 'before') {
                    indicator.style.top = (rect.top - 2) + 'px';
                } else {
                    indicator.style.top = (rect.bottom - 2) + 'px';
                }
            }

            if (!indicator.parentNode) {
                doc.body.appendChild(indicator);
            }
        });

        doc.body.addEventListener('dragleave', (e) => {
            // Only remove if we're leaving the body completely
            if (e.target === doc.body && !doc.body.contains(e.relatedTarget)) {
                removeDropIndicator();
            }
        });

        doc.body.addEventListener('drop', (e) => {
            e.preventDefault();

            const elementType = e.dataTransfer.getData('text/plain');

            // Save the drop target and position before removing indicator
            const savedTarget = dropTarget;
            const savedPosition = dropPosition;

            console.log('🎯 Drop received:', {
                elementType,
                position: savedPosition,
                targetTag: savedTarget?.tagName,
                targetText: savedTarget?.textContent?.substring(0, 30)
            });

            removeDropIndicator();

            if (elementType && ELEMENT_TEMPLATES[elementType]) {
                this.insertElementTemplateAtPosition(elementType, savedTarget, savedPosition);
            }

            // Reset after insertion
            dropTarget = null;
            dropPosition = null;
        });
    }

    makeEditable(doc) {
        // Add click handlers to all elements
        const allElements = doc.querySelectorAll('body *');

        allElements.forEach(el => {
            this.makeElementEditable(el, doc);
        });
    }

    makeElementEditable(el, doc) {
        // Skip script and style tags
        if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;

        el.style.cursor = 'grab';
        el.style.transition = 'outline 0.15s, box-shadow 0.15s';

        // Hover effect
        el.addEventListener('mouseenter', (e) => {
            e.stopPropagation();
            if (el !== this.selectedElement && !this.isDragging) {
                e.target.style.outline = '1px solid #0066FF';
                e.target.style.outlineOffset = '2px';
            }
        });

        el.addEventListener('mouseleave', (e) => {
            if (el !== this.selectedElement) {
                e.target.style.outline = 'none';
            }
        });

        // Single click to select
        el.addEventListener('click', (e) => {
            // Prevent default for all elements in edit mode
            e.preventDefault();
            e.stopPropagation();
            if (!this.isDragging) {
                this.selectElement(e.target);
            }
        });

        // Double click to edit
        el.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Enable inline editing for text elements (includes buttons, links, headings)
            if (this.isTextElement(e.target)) {
                this.enableInlineTextEdit(e.target);
                return;
            }

            // Enable image replacement for images
            if (e.target.tagName === 'IMG') {
                this.enableImageEdit(e.target);
                return;
            }

            // Check if it's an icon
            const isIcon = (e.target.tagName === 'I' || e.target.tagName === 'SPAN') &&
                Array.from(e.target.classList).some(c => c.startsWith('fa-') || c.startsWith('bi-') || c.includes('icon'));

            if (isIcon) {
                this.showToast('Edit icon classes in the properties panel', 'info');
                return;
            }

            // If not editable, show message
            this.showToast('This element is not editable inline. Use the properties panel.', 'warning');
        });

        // Drag and drop to reorder elements (Framer-style)
        el.setAttribute('draggable', 'true');

        el.addEventListener('dragstart', (e) => {
            // Don't drag if in edit mode
            if (e.target.contentEditable === 'true') {
                e.preventDefault();
                return;
            }

            this.draggedElement = e.target;
            e.target.style.opacity = '0.5';
            e.target.style.cursor = 'grabbing';
            e.dataTransfer.effectAllowed = 'move';

            // Create drop indicator if needed
            if (!this.dropIndicator) {
                this.dropIndicator = doc.createElement('div');
                this.dropIndicator.style.cssText = `
                        position: absolute;
                        height: 3px;
                        background: #0066FF;
                        border-radius: 2px;
                        pointer-events: none;
                        z-index: 10000;
                        box-shadow: 0 0 8px rgba(0, 102, 255, 0.5);
                        display: none;
                    `;
                doc.body.appendChild(this.dropIndicator);
            }
        });

        el.addEventListener('dragend', (e) => {
            e.target.style.opacity = '';
            e.target.style.cursor = 'grab';
            if (this.dropIndicator) {
                this.dropIndicator.style.display = 'none';
            }
            this.draggedElement = null;
            this.currentDropTarget = null;
            this.currentDropPosition = null;
        });

        el.addEventListener('dragover', (e) => {
            if (!this.draggedElement || this.draggedElement === e.target) return;
            if (this.draggedElement.contains(e.target)) return;

            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            const parent = e.target.parentNode;

            if (this.isContainer(e.target) || this.isContainer(parent)) {
                e.stopPropagation();

                const rect = e.target.getBoundingClientRect();
                const scrollTop = doc.documentElement.scrollTop || doc.body.scrollTop;
                const scrollLeft = doc.documentElement.scrollLeft || doc.body.scrollLeft;

                this.dropIndicator.style.display = 'block';
                this.dropIndicator.style.width = `${rect.width}px`;
                this.dropIndicator.style.left = `${rect.left + scrollLeft}px`;

                const midpoint = rect.top + rect.height / 2;

                // Determine position
                if (this.isContainer(e.target)) {
                    // Check if we are at the edges to drop before/after the container
                    const edgeThreshold = 10;
                    if (e.clientY < rect.top + edgeThreshold && parent) {
                        this.dropIndicator.style.top = `${rect.top + scrollTop}px`;
                        this.currentDropTarget = e.target;
                        this.currentDropPosition = 'before';
                    } else if (e.clientY > rect.bottom - edgeThreshold && parent) {
                        this.dropIndicator.style.top = `${rect.bottom + scrollTop}px`;
                        this.currentDropTarget = e.target;
                        this.currentDropPosition = 'after';
                    } else {
                        // Inside
                        // For inside, we might want to highlight the container border instead of a line?
                        // For now, let's put the line at the bottom (append) or top (prepend)
                        // Default to append
                        this.dropIndicator.style.top = `${rect.bottom + scrollTop - 2}px`; // Inside bottom
                        this.dropIndicator.style.width = `${rect.width - 4}px`; // Slightly smaller
                        this.dropIndicator.style.left = `${rect.left + scrollLeft + 2}px`;

                        this.currentDropTarget = e.target;
                        this.currentDropPosition = 'inside';
                    }
                } else if (e.clientY < midpoint) {
                    // Before
                    this.dropIndicator.style.top = `${rect.top + scrollTop}px`;
                    this.currentDropTarget = e.target;
                    this.currentDropPosition = 'before';
                } else {
                    // After
                    this.dropIndicator.style.top = `${rect.bottom + scrollTop}px`;
                    this.currentDropTarget = e.target;
                    this.currentDropPosition = 'after';
                }
            }
        });

        el.addEventListener('dragleave', (e) => {
            if (this.dropIndicator && this.dropIndicator.parentNode && !el.contains(e.relatedTarget) && e.relatedTarget !== this.dropIndicator) {
                // We are leaving the element and not going into a child or the indicator
                // But removing it here causes flickering if we are just moving slightly.
                // Let's rely on dragover to move it.
                // However, if we leave the iframe, we should remove it.
                // This is hard to detect perfectly from here.
            }
        });

        el.addEventListener('drop', (e) => {
            if (!this.draggedElement || !this.currentDropTarget) return;

            e.preventDefault();
            e.stopPropagation();

            const target = this.currentDropTarget;
            const position = this.currentDropPosition;

            if (target === this.draggedElement) return;

            let parent = target.parentNode;

            if (position === 'inside') {
                target.appendChild(this.draggedElement);
            } else if (position === 'before') {
                parent.insertBefore(this.draggedElement, target);
            } else if (position === 'after') {
                parent.insertBefore(this.draggedElement, target.nextSibling);
            }

            // Cleanup
            if (this.dropIndicator) {
                this.dropIndicator.style.display = 'none';
            }

            this.updateHTML('Reorder element');
            this.buildLayersTree(doc);
            this.selectElement(this.draggedElement);
            this.showToast('✅ Element repositioned', 'success');

            this.draggedElement = null;
            this.currentDropTarget = null;
            this.currentDropPosition = null;
        });
    }

    isContainer(element) {
        // Container elements that can receive other elements
        const containerTags = ['DIV', 'SECTION', 'ARTICLE', 'ASIDE', 'NAV', 'HEADER', 'FOOTER', 'MAIN', 'UL', 'OL', 'FORM'];
        return containerTags.includes(element.tagName);
    }

    isTextElement(element) {
        // Headings are always editable
        const headingTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
        if (headingTags.includes(element.tagName)) return true;

        const textTags = ['P', 'SPAN', 'A', 'BUTTON', 'LI', 'TD', 'TH', 'LABEL', 'DIV'];

        // Allow elements with no children OR only inline children (span, strong, em, etc)
        if (!textTags.includes(element.tagName)) return false;

        // If no children, it's editable
        if (element.children.length === 0) return true;

        // If has children, check if they're all inline elements
        // If has children, check if they're all inline elements or text-like block elements
        const inlineTags = ['SPAN', 'STRONG', 'EM', 'B', 'I', 'U', 'A', 'CODE', 'MARK', 'SMALL', 'BR', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'DIV', 'LI', 'LABEL'];
        const allInline = Array.from(element.children).every(child =>
            inlineTags.includes(child.tagName)
        );

        return allInline;
    }

    enableInlineTextEdit(element) {
        // Visual feedback - editing mode (green outline)
        element.style.outline = '2px solid #10B981';
        element.style.outlineOffset = '2px';
        element.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15)';

        // Make element editable
        element.contentEditable = 'true';
        element.style.cursor = 'text';

        // Notify user
        this.showToast('Editing mode - Press Enter or click outside to save', 'success');

        // Focus and select text
        setTimeout(() => {
            element.focus();

            // Select all text content
            try {
                const range = element.ownerDocument.createRange();
                range.selectNodeContents(element);
                const selection = element.ownerDocument.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            } catch (err) {
                // Fallback: just focus
            }
        }, 50);

        // Save handler
        const saveChanges = () => {
            element.contentEditable = 'false';
            element.style.cursor = 'pointer';

            // Restore blue selection style
            element.style.outline = '2px solid #0066FF';
            element.style.boxShadow = '0 0 0 4px rgba(0, 102, 255, 0.1)';

            // Update properties panel with new text content
            const propTextInput = document.getElementById('propText');
            if (propTextInput) {
                propTextInput.value = element.textContent;
            }

            this.updateHTML('Edit text');
            this.showToast('✅ Text updated successfully', 'success');
        };

        // Update properties panel in real-time as user types
        const updatePropertiesPanel = () => {
            const propTextInput = document.getElementById('propText');
            if (propTextInput) {
                propTextInput.value = element.textContent;
            }
        };
        element.addEventListener('input', updatePropertiesPanel);

        // Save on blur (click outside)
        element.addEventListener('blur', () => {
            element.removeEventListener('input', updatePropertiesPanel);
            saveChanges();
        }, { once: true });

        // Save on Enter/Escape
        const keyHandler = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                element.blur();
            } else if (e.key === 'Escape') {
                element.blur();
            }
        };

        element.addEventListener('keydown', keyHandler, { once: true });
    }

    enableImageEdit(imgElement) {
        // Create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    imgElement.src = event.target.result;

                    // Update the propImgSrc field if it exists (prevents disappearing when changing other properties)
                    const propImgSrc = document.getElementById('propImgSrc');
                    if (propImgSrc) {
                        propImgSrc.value = event.target.result;
                    }

                    this.updateHTML('Change image');
                    this.showToast('✅ Image updated', 'success');
                };
                reader.readAsDataURL(file);
            }
        });

        // Trigger file selection
        input.click();
    }

    enableVideoEdit(videoElement) {
        // Create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.style.display = 'none';

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    // Check if video has a source element or direct src
                    const sourceElement = videoElement.querySelector('source');
                    if (sourceElement) {
                        sourceElement.src = event.target.result;
                    } else {
                        videoElement.src = event.target.result;
                    }

                    // Reload the video
                    videoElement.load();

                    // Update the propVideoSrc field if it exists
                    const propVideoSrc = document.getElementById('propVideoSrc');
                    if (propVideoSrc) {
                        propVideoSrc.value = event.target.result;
                    }

                    this.updateHTML('Change video');
                    this.showToast('✅ Video updated', 'success');
                };
                reader.readAsDataURL(file);
            }
        });

        // Trigger file selection
        input.click();
    }

    updateHTML(action = 'Change') {
        const canvas = document.getElementById('canvas');
        const iframeDoc = canvas.contentDocument || canvas.contentWindow.document;
        const newHTML = iframeDoc.documentElement.outerHTML;

        // Only add to history if HTML actually changed
        if (newHTML !== this.currentHTML) {
            this.addToHistory(newHTML, action);
            this.currentHTML = newHTML;
            this.projectData.html = this.currentHTML;
            this.saveProject();
        }
    }

    addToHistory(html, action) {
        // Remove any future history if we're not at the end
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        // Add new state
        this.history.push({
            html: html,
            action: action,
            timestamp: new Date().toLocaleTimeString()
        });

        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }

        this.updateHistoryUI();
        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreFromHistory();
            this.showToast('↶ Undone', 'success');
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreFromHistory();
            this.showToast('↷ Redone', 'success');
        }
    }

    restoreFromHistory() {
        const state = this.history[this.historyIndex];
        if (state) {
            this.currentHTML = state.html;
            this.projectData.html = state.html;
            this.loadHTML(state.html, false); // false = don't add to history
            this.updateHistoryUI();
            this.updateUndoRedoButtons();
        }
    }



    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');

        undoBtn.disabled = this.historyIndex <= 0;
        redoBtn.disabled = this.historyIndex >= this.history.length - 1;
    }

    updateHistoryUI() {
        const historyList = document.getElementById('historyList');
        if (this.history.length === 0) {
            historyList.innerHTML = '<div style="color: var(--text-secondary); padding: 1rem; text-align: center;">No changes yet</div>';
            return;
        }

        historyList.innerHTML = this.history.map((item, index) => {
            const isCurrent = index === this.historyIndex;
            return `
                <div style="padding: 0.75rem; margin-bottom: 0.25rem; background: ${isCurrent ? 'var(--accent)' : 'var(--bg)'};
                     color: ${isCurrent ? 'white' : 'var(--text)'}; border-radius: 6px; cursor: pointer;
                     border: 1px solid ${isCurrent ? 'var(--accent)' : 'var(--border)'}; transition: all 0.15s;"
                     onmouseover="if(!${isCurrent}) this.style.background='var(--bg-secondary)'"
                     onmouseout="if(!${isCurrent}) this.style.background='var(--bg)'"
                     onclick="app.jumpToHistory(${index})">
                    <div style="font-weight: 500; margin-bottom: 0.25rem;">${item.action}</div>
                    <div style="font-size: 0.75rem; opacity: ${isCurrent ? '0.9' : '0.6'};">${item.timestamp}</div>
                </div>
            `;
        }).reverse().join('');
    }

    jumpToHistory(index) {
        if (index >= 0 && index < this.history.length) {
            this.historyIndex = index;
            this.restoreFromHistory();
        }
    }

    selectElement(element) {
        // Remove previous selection

        if (this.selectedElement) {
            this.selectedElement.style.removeProperty('outline');
            this.selectedElement.style.removeProperty('outline-offset');
            this.selectedElement.style.removeProperty('box-shadow');
            // Clean up empty style attribute
            if (this.selectedElement.getAttribute('style') === '') {
                this.selectedElement.removeAttribute('style');
            }
        }

        // If deselecting, stop here
        if (!element) {
            // Clear previous element's selection styles
            if (this.selectedElement) {
                this.selectedElement.style.outline = '';
                this.selectedElement.style.outlineOffset = '';
                this.selectedElement.style.boxShadow = '';
            }
            this.selectedElement = null;
            // Clear properties panel
            this.showProperties(null);
            return;
        }

        // 1. Ensure the element ITSELF is visible
        this.ensureElementPageVisible(element);

        // 2. If element is a navigation link, show its TARGET
        if (element.tagName === 'A') {
            const href = element.getAttribute('href');
            if (href && href.startsWith('#') && href.length > 1) {
                const targetId = href.substring(1);
                const iframeDoc = element.ownerDocument;
                const targetEl = iframeDoc.getElementById(targetId);

                if (targetEl) {
                    // Show the target page/section
                    this.ensureElementPageVisible(targetEl);

                    // Scroll target into view after a short delay to allow partial visibility updates
                    setTimeout(() => {
                        targetEl.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                            inline: 'center'
                        });
                    }, 100);
                }
            }
        }

        // Clear previous element's selection styles
        if (this.selectedElement && this.selectedElement !== element) {
            this.selectedElement.style.outline = '';
            this.selectedElement.style.outlineOffset = '';
            this.selectedElement.style.boxShadow = '';
        }

        // Highlight selected element with Framer-style selection
        this.selectedElement = element;

        if (!this.isPreviewMode) {
            element.style.outline = '2px solid #0066FF';
            element.style.outlineOffset = '2px';
            element.style.boxShadow = '0 0 0 4px rgba(0, 102, 255, 0.1)';
        }

        // Scroll element into view in the canvas (unless we just scrolled to its target!)
        // We prioritize showing the element we selected, unless it's a nav link where we probably want to see the result.
        // But if we scroll the target into view, the nav link might go out of view (if sticky, it stays).
        // Let's scroll the element into view ONLY if it's NOT a nav link that successfully found a target
        const isNavLink = element.tagName === 'A' && element.getAttribute('href')?.startsWith('#');
        if (!isNavLink) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            });
        }

        // Highlight in layers panel
        this.highlightInLayers(element);

        // Show properties
        this.showProperties(element);

        // Switch to layers tab in left sidebar to show selected element
        this.switchTab('layers', 'left');

        // Switch to properties tab in right sidebar
        this.switchTab('properties', 'right');
    }

    ensureElementPageVisible(element) {
        // Check if element is inside a hidden page/section
        let parent = element;
        let hiddenPage = null;
        const iframeWindow = element.ownerDocument.defaultView;

        while (parent && parent !== element.ownerDocument.body) {
            // Check if this parent is hidden
            const computedStyle = iframeWindow.getComputedStyle(parent);

            if (computedStyle.display === 'none' || computedStyle.opacity === '0' || computedStyle.visibility === 'hidden') {
                // It's hidden. Is it a page or section?
                // We check for 'page' class OR 'section' tag OR just generic 'page-view' class (used in the user's example)
                if (parent.classList.contains('page') || parent.classList.contains('page-view') || parent.tagName === 'SECTION' || parent.id) {
                    hiddenPage = parent;
                    break;
                }
            }

            parent = parent.parentElement;
        }

        // If we found a hidden page, try to activate it
        if (hiddenPage && hiddenPage.id) {

            // 1. Try iframe's switchPage function (Explicit Builder Helper)
            if (typeof iframeWindow.switchPage === 'function') {
                iframeWindow.switchPage(hiddenPage.id);
            }
            // 2. Try changing hash (Standard SPA Router) - This triggers the site's own routing logic
            else if (element.ownerDocument.getElementById(hiddenPage.id)) {
                // Only change if different to avoid reloading/jumping if already there but visually hidden for some other reason
                if (iframeWindow.location.hash !== '#' + hiddenPage.id) {
                    iframeWindow.location.hash = '#' + hiddenPage.id;

                    // Small delay to allow router to react, then force fallback if still hidden
                    setTimeout(() => {
                        const style = iframeWindow.getComputedStyle(hiddenPage);
                        if (style.display === 'none' || style.opacity === '0') {
                            this.forceShowElement(hiddenPage, element.ownerDocument);
                        }
                    }, 50);
                    return;
                } else {
                    // Hash matches but it's hidden? Force show.
                    this.forceShowElement(hiddenPage, element.ownerDocument);
                }
            }
            // 3. Fallback: Manually show it
            else {
                this.forceShowElement(hiddenPage, element.ownerDocument);
            }
        }
    }

    forceShowElement(element, doc) {
        // 1. Reset display
        element.style.display = 'block';
        element.style.visibility = 'visible';

        // 2. Add 'active' class (Common convention)
        element.classList.add('active');

        // 3. Force opacity if it was 0
        element.style.opacity = '1';

        // 4. Hide siblings if they look like pages (Exclusive visibility)
        if (element.classList.contains('page') || element.classList.contains('page-view')) {
            const className = element.classList.contains('page') ? '.page' : '.page-view';
            doc.querySelectorAll(className).forEach(p => {
                if (p !== element) {
                    p.style.display = 'none';
                    p.classList.remove('active');
                }
            });
        }
    }

    highlightInLayers(element) {
        const elementId = this.generateElementId(element);

        // Auto-expand all parent elements
        this.expandParentLayers(element);

        // Remove previous layer selection
        document.querySelectorAll('.layer-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Find and highlight the corresponding layer item
        const layerItem = document.querySelector(`[data-element-id="${elementId}"]`);
        if (layerItem) {
            layerItem.classList.add('selected');

            // Scroll into view centered so user can see layers above and below
            layerItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    expandParentLayers(element) {
        let parent = element.parentElement;
        while (parent && parent.tagName !== 'BODY') {
            const parentId = this.generateElementId(parent);
            if (!this.collapsedLayers) this.collapsedLayers = new Set();
            this.collapsedLayers.delete(parentId);

            // Update toggle icon with rotation
            const toggle = document.querySelector(`.layer-toggle[data-element-id="${parentId}"]`);
            if (toggle) {
                toggle.style.transform = 'rotate(90deg)';
            }

            // Show children
            this.updateLayerChildrenVisibility(parent);

            parent = parent.parentElement;
        }
    }

    toggleLayerCollapse(element) {
        const elementId = this.generateElementId(element);

        if (!this.collapsedLayers) {
            this.collapsedLayers = new Set();
        }

        const isCollapsed = this.collapsedLayers.has(elementId);

        if (isCollapsed) {
            this.collapsedLayers.delete(elementId);
        } else {
            this.collapsedLayers.add(elementId);
        }

        // Update toggle icon with rotation
        const toggle = document.querySelector(`.layer-toggle[data-element-id="${elementId}"]`);
        if (toggle) {
            toggle.style.transform = isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)';
        }

        // Update children visibility
        this.updateLayerChildrenVisibility(element);
    }

    updateLayerChildrenVisibility(element) {
        const elementId = this.generateElementId(element);
        const isCollapsed = this.collapsedLayers && this.collapsedLayers.has(elementId);

        // Find all child layer items
        const layerItems = document.querySelectorAll('.layer-item');
        const parentItem = document.querySelector(`[data-element-id="${elementId}"]`);

        if (!parentItem) return;

        // Get all descendants
        Array.from(element.querySelectorAll('*')).forEach(child => {
            if (child.tagName.toLowerCase() === 'script' || child.tagName.toLowerCase() === 'style') return;

            const childId = this.generateElementId(child);
            const childItem = document.querySelector(`[data-element-id="${childId}"]`);

            if (childItem) {
                childItem.style.display = isCollapsed ? 'none' : 'flex';
            }
        });
    }

    showProperties(element) {
        const panel = document.getElementById('propertiesPanel');
        if (!element) {
            panel.innerHTML = '<div class="prop-empty">Select an element to edit its properties</div>';
            return;
        }

        const tagName = element.tagName.toLowerCase();
        const iframeWindow = element.ownerDocument.defaultView;
        const styles = iframeWindow.getComputedStyle(element);

        // Helper to get style value
        const getStyle = (prop) => styles[prop];
        const getStyleInt = (prop) => parseInt(styles[prop]) || 0;

        // Colors
        let bgColor = this.rgbToHex(getStyle('backgroundColor'));
        if (getStyle('backgroundColor') === 'rgba(0, 0, 0, 0)' || getStyle('backgroundColor') === 'transparent') {
            bgColor = '#ffffff'; // Default for picker if transparent
        }
        const textColor = this.rgbToHex(getStyle('color'));

        // Spacing
        const spacing = {
            mt: getStyleInt('marginTop'),
            mr: getStyleInt('marginRight'),
            mb: getStyleInt('marginBottom'),
            ml: getStyleInt('marginLeft'),
            pt: getStyleInt('paddingTop'),
            pr: getStyleInt('paddingRight'),
            pb: getStyleInt('paddingBottom'),
            pl: getStyleInt('paddingLeft')
        };

        // Typography
        const typography = {
            size: getStyleInt('fontSize'),
            weight: getStyle('fontWeight'),
            align: getStyle('textAlign'),
            style: getStyle('fontStyle'),
            family: getStyle('fontFamily').split(',')[0].replace(/['"]/g, '')
        };

        const isText = this.isTextElement(element);
        const isImage = tagName === 'img';

        let html = '';

        // 1. Text Content (if applicable)
        if (isText) {
            html += `
                <div class="prop-section">
                    <div class="prop-header">Text</div>
                    <div class="prop-col">
                        <label class="prop-label">Content</label>
                        <textarea id="propTextContent" class="prop-textarea">${element.textContent.trim()}</textarea>
                    </div>
                </div>
            `;
        }

        // 1.5 Link (if applicable)
        const linkElement = element.tagName.toLowerCase() === 'a' ? element : element.closest('a');

        if (linkElement) {
            html += `
                <div class="prop-section">
                    <div class="prop-header">Link</div>
                    <div class="prop-col">
                        <label class="prop-label">URL (href)</label>
                        <input type="text" id="propLinkHref" class="prop-input" value="${linkElement.getAttribute('href') || '#'}" placeholder="https://example.com">
                    </div>
                    <div class="prop-col" style="margin-top: 8px;">
                        <label class="prop-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" id="propLinkTarget" ${linkElement.getAttribute('target') === '_blank' ? 'checked' : ''}>
                            Open in new tab
                        </label>
                    </div>
                </div>
            `;
        }

        // 1.6 Icon (if applicable)
        const isIcon = (tagName === 'i' || tagName === 'span') &&
            Array.from(element.classList).some(c => c.startsWith('fa-') || c.startsWith('bi-') || c.includes('icon'));

        if (isIcon) {
            html += `
                <div class="prop-section">
                    <div class="prop-header">Icon</div>
                    <div class="prop-col">
                        <label class="prop-label">Icon Class</label>
                        <input type="text" id="propIconClass" class="prop-input" value="${element.className}" placeholder="fas fa-home">
                        <div style="font-size: 10px; color: #666; margin-top: 4px;">
                            Use FontAwesome classes (e.g. 'fa-brands fa-instagram')
                        </div>
                    </div>
                </div>
            `;
        }

        // 2. Colors
        html += `
            <div class="prop-section">
                <div class="prop-header">Colors</div>
                <div class="prop-row">
                    <div class="prop-col">
                        <label class="prop-label">Text Color</label>
                        <div class="prop-color-wrapper">
                            <div class="prop-color-preview" style="background-color: ${textColor}">
                                <input type="color" id="propTextColor" class="prop-color-input" value="${textColor}">
                            </div>
                            <input type="text" class="prop-color-hex" value="${textColor}" onchange="document.getElementById('propTextColor').value = this.value; document.getElementById('propTextColor').dispatchEvent(new Event('input'));">
                        </div>
                    </div>
                    <div class="prop-col">
                        <label class="prop-label">Background</label>
                        <div class="prop-color-wrapper">
                            <div class="prop-color-preview" style="background-color: ${bgColor}">
                                <input type="color" id="propBgColor" class="prop-color-input" value="${bgColor}">
                            </div>
                            <input type="text" class="prop-color-hex" value="${bgColor}" onchange="document.getElementById('propBgColor').value = this.value; document.getElementById('propBgColor').dispatchEvent(new Event('input'));">
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 3. Spacing
        html += `
            <div class="prop-section">
                <div class="prop-header">Spacing</div>
                
                <div style="margin-bottom: 8px;">
                    <label class="prop-label" style="margin-bottom: 4px; display: block;">Margin</label>
                    <div class="prop-spacing-grid">
                        <div class="prop-spacing-item">
                            <span class="prop-spacing-icon"><i class="fa-solid fa-arrow-up"></i></span>
                            <input type="number" id="propMarginTop" class="prop-spacing-input" value="${spacing.mt}" placeholder="0">
                        </div>
                        <div class="prop-spacing-item">
                            <span class="prop-spacing-icon"><i class="fa-solid fa-arrow-right"></i></span>
                            <input type="number" id="propMarginRight" class="prop-spacing-input" value="${spacing.mr}" placeholder="0">
                        </div>
                        <div class="prop-spacing-item">
                            <span class="prop-spacing-icon"><i class="fa-solid fa-arrow-down"></i></span>
                            <input type="number" id="propMarginBottom" class="prop-spacing-input" value="${spacing.mb}" placeholder="0">
                        </div>
                        <div class="prop-spacing-item">
                            <span class="prop-spacing-icon"><i class="fa-solid fa-arrow-left"></i></span>
                            <input type="number" id="propMarginLeft" class="prop-spacing-input" value="${spacing.ml}" placeholder="0">
                        </div>
                    </div>
                </div>

                <div>
                    <label class="prop-label" style="margin-bottom: 4px; display: block;">Padding</label>
                    <div class="prop-spacing-grid">
                        <div class="prop-spacing-item">
                            <span class="prop-spacing-icon" title="Padding Top"><i class="fa-solid fa-arrow-up" style="font-size: 10px; opacity: 0.7;"></i></span>
                            <input type="number" id="propPaddingTop" class="prop-spacing-input" value="${spacing.pt}" placeholder="0">
                        </div>
                        <div class="prop-spacing-item">
                            <span class="prop-spacing-icon" title="Padding Right"><i class="fa-solid fa-arrow-right" style="font-size: 10px; opacity: 0.7;"></i></span>
                            <input type="number" id="propPaddingRight" class="prop-spacing-input" value="${spacing.pr}" placeholder="0">
                        </div>
                        <div class="prop-spacing-item">
                            <span class="prop-spacing-icon" title="Padding Bottom"><i class="fa-solid fa-arrow-down" style="font-size: 10px; opacity: 0.7;"></i></span>
                            <input type="number" id="propPaddingBottom" class="prop-spacing-input" value="${spacing.pb}" placeholder="0">
                        </div>
                        <div class="prop-spacing-item">
                            <span class="prop-spacing-icon" title="Padding Left"><i class="fa-solid fa-arrow-left" style="font-size: 10px; opacity: 0.7;"></i></span>
                            <input type="number" id="propPaddingLeft" class="prop-spacing-input" value="${spacing.pl}" placeholder="0">
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 4. Typography
        html += `
            <div class="prop-section">
                <div class="prop-header">Typography</div>
                <div class="prop-row">
                    <div class="prop-col">
                        <label class="prop-label">Font Family</label>
                        <select id="propFontFamily" class="prop-select">
                            <optgroup label="System">
                                <option value="Arial" ${typography.family === 'Arial' ? 'selected' : ''}>Arial</option>
                                <option value="Helvetica" ${typography.family === 'Helvetica' ? 'selected' : ''}>Helvetica</option>
                                <option value="Times New Roman" ${typography.family === 'Times New Roman' ? 'selected' : ''}>Times New Roman</option>
                                <option value="Courier New" ${typography.family === 'Courier New' ? 'selected' : ''}>Courier New</option>
                            </optgroup>
                            <optgroup label="Sans Serif">
                                <option value="Inter" ${typography.family === 'Inter' ? 'selected' : ''}>Inter</option>
                                <option value="Roboto" ${typography.family === 'Roboto' ? 'selected' : ''}>Roboto</option>
                                <option value="Open Sans" ${typography.family === 'Open Sans' ? 'selected' : ''}>Open Sans</option>
                                <option value="Lato" ${typography.family === 'Lato' ? 'selected' : ''}>Lato</option>
                                <option value="Montserrat" ${typography.family === 'Montserrat' ? 'selected' : ''}>Montserrat</option>
                                <option value="Poppins" ${typography.family === 'Poppins' ? 'selected' : ''}>Poppins</option>
                                <option value="Raleway" ${typography.family === 'Raleway' ? 'selected' : ''}>Raleway</option>
                                <option value="Oswald" ${typography.family === 'Oswald' ? 'selected' : ''}>Oswald</option>
                                <option value="Ubuntu" ${typography.family === 'Ubuntu' ? 'selected' : ''}>Ubuntu</option>
                                <option value="Nunito" ${typography.family === 'Nunito' ? 'selected' : ''}>Nunito</option>
                                <option value="Rubik" ${typography.family === 'Rubik' ? 'selected' : ''}>Rubik</option>
                                <option value="Work Sans" ${typography.family === 'Work Sans' ? 'selected' : ''}>Work Sans</option>
                                <option value="Quicksand" ${typography.family === 'Quicksand' ? 'selected' : ''}>Quicksand</option>
                                <option value="DM Sans" ${typography.family === 'DM Sans' ? 'selected' : ''}>DM Sans</option>
                            </optgroup>
                            <optgroup label="Serif">
                                <option value="Playfair Display" ${typography.family === 'Playfair Display' ? 'selected' : ''}>Playfair Display</option>
                                <option value="Merriweather" ${typography.family === 'Merriweather' ? 'selected' : ''}>Merriweather</option>
                                <option value="Lora" ${typography.family === 'Lora' ? 'selected' : ''}>Lora</option>
                                <option value="PT Serif" ${typography.family === 'PT Serif' ? 'selected' : ''}>PT Serif</option>
                                <option value="Crimson Text" ${typography.family === 'Crimson Text' ? 'selected' : ''}>Crimson Text</option>
                                <option value="Libre Baskerville" ${typography.family === 'Libre Baskerville' ? 'selected' : ''}>Libre Baskerville</option>
                                <option value="Cormorant Garamond" ${typography.family === 'Cormorant Garamond' ? 'selected' : ''}>Cormorant Garamond</option>
                            </optgroup>
                            <optgroup label="Display & Handwriting">
                                <option value="Bebas Neue" ${typography.family === 'Bebas Neue' ? 'selected' : ''}>Bebas Neue</option>
                                <option value="Abril Fatface" ${typography.family === 'Abril Fatface' ? 'selected' : ''}>Abril Fatface</option>
                                <option value="Pacifico" ${typography.family === 'Pacifico' ? 'selected' : ''}>Pacifico</option>
                                <option value="Dancing Script" ${typography.family === 'Dancing Script' ? 'selected' : ''}>Dancing Script</option>
                                <option value="Lobster" ${typography.family === 'Lobster' ? 'selected' : ''}>Lobster</option>
                            </optgroup>
                            <optgroup label="Monospace">
                                <option value="Roboto Mono" ${typography.family === 'Roboto Mono' ? 'selected' : ''}>Roboto Mono</option>
                                <option value="Fira Code" ${typography.family === 'Fira Code' ? 'selected' : ''}>Fira Code</option>
                                <option value="Source Code Pro" ${typography.family === 'Source Code Pro' ? 'selected' : ''}>Source Code Pro</option>
                            </optgroup>
                            <option value="${typography.family}" ${!['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway', 'Oswald', 'Ubuntu', 'Nunito', 'Rubik', 'Work Sans', 'Quicksand', 'DM Sans', 'Playfair Display', 'Merriweather', 'Lora', 'PT Serif', 'Crimson Text', 'Libre Baskerville', 'Cormorant Garamond', 'Bebas Neue', 'Abril Fatface', 'Pacifico', 'Dancing Script', 'Lobster', 'Roboto Mono', 'Fira Code', 'Source Code Pro', 'Arial', 'Helvetica', 'Times New Roman', 'Courier New'].includes(typography.family) ? 'selected' : ''} style="display: ${!['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway', 'Oswald', 'Ubuntu', 'Nunito', 'Rubik', 'Work Sans', 'Quicksand', 'DM Sans', 'Playfair Display', 'Merriweather', 'Lora', 'PT Serif', 'Crimson Text', 'Libre Baskerville', 'Cormorant Garamond', 'Bebas Neue', 'Abril Fatface', 'Pacifico', 'Dancing Script', 'Lobster', 'Roboto Mono', 'Fira Code', 'Source Code Pro', 'Arial', 'Helvetica', 'Times New Roman', 'Courier New'].includes(typography.family) ? 'block' : 'none'}">Current (${typography.family})</option>
                        </select>
                    </div>
                </div>

                <div class="prop-row">
                    <div class="prop-col">
                        <label class="prop-label">Font Size (px)</label>
                        <input type="number" id="propFontSize" class="prop-input" value="${typography.size}" placeholder="16">
                    </div>
                    <div class="prop-col">
                        <label class="prop-label">Weight</label>
                        <select id="propFontWeight" class="prop-select">
                            <option value="300" ${typography.weight == 300 ? 'selected' : ''}>Light</option>
                            <option value="400" ${typography.weight == 400 ? 'selected' : ''}>Regular</option>
                            <option value="500" ${typography.weight == 500 ? 'selected' : ''}>Medium</option>
                            <option value="600" ${typography.weight == 600 ? 'selected' : ''}>Semi Bold</option>
                            <option value="700" ${typography.weight == 700 ? 'selected' : ''}>Bold</option>
                            <option value="800" ${typography.weight == 800 ? 'selected' : ''}>Extra Bold</option>
                        </select>
                    </div>
                </div>
                
                <div class="prop-col">
                    <label class="prop-label">Alignment</label>
                    <div class="prop-btn-group">
                        <button class="prop-btn ${typography.align === 'left' ? 'active' : ''}" onclick="app.applyStyle('textAlign', 'left')"><i class="fa-solid fa-align-left"></i></button>
                        <button class="prop-btn ${typography.align === 'center' ? 'active' : ''}" onclick="app.applyStyle('textAlign', 'center')"><i class="fa-solid fa-align-center"></i></button>
                        <button class="prop-btn ${typography.align === 'right' ? 'active' : ''}" onclick="app.applyStyle('textAlign', 'right')"><i class="fa-solid fa-align-right"></i></button>
                        <button class="prop-btn ${typography.align === 'justify' ? 'active' : ''}" onclick="app.applyStyle('textAlign', 'justify')"><i class="fa-solid fa-align-justify"></i></button>
                    </div>
                </div>
            </div>
        `;

        // 5. Image (Specific)
        if (isImage) {
            const objectFit = getStyle('objectFit') || 'fill';
            const objectPosition = getStyle('objectPosition') || '50% 50%';
            const borderRadius = getStyleInt('borderRadius');

            html += `
                <div class="prop-section">
                    <div class="prop-header">Image</div>
                    <div class="prop-col">
                        <label class="prop-label">Source URL</label>
                        <input type="text" id="propImgSrc" class="prop-input" value="${element.getAttribute('src') || ''}">
                    </div>
                    <div class="prop-col" style="margin-top: 8px;">
                        <button class="btn btn-secondary" onclick="app.enableImageEdit(app.selectedElement)" style="width: 100%; font-size: 12px;">Upload Image</button>
                    </div>

                    <div class="prop-row" style="margin-top: 12px;">
                        <div class="prop-col">
                            <label class="prop-label">Fit</label>
                            <select id="propObjectFit" class="prop-select">
                                <option value="fill" ${objectFit === 'fill' ? 'selected' : ''}>Fill</option>
                                <option value="contain" ${objectFit === 'contain' ? 'selected' : ''}>Fit</option>
                                <option value="cover" ${objectFit === 'cover' ? 'selected' : ''}>Cover</option>
                                <option value="none" ${objectFit === 'none' ? 'selected' : ''}>None</option>
                                <option value="scale-down" ${objectFit === 'scale-down' ? 'selected' : ''}>Scale Down</option>
                            </select>
                        </div>
                        <div class="prop-col">
                            <label class="prop-label">Radius</label>
                            <input type="number" id="propImgRadius" class="prop-input" value="${borderRadius}" placeholder="0">
                        </div>
                    </div>

                    <div class="prop-col" style="margin-top: 12px;">
                        <label class="prop-label">Position</label>
                        <div class="prop-position-grid" id="propPositionGrid">
                            <!-- Grid items will be generated by JS or static HTML -->
                            <div class="pos-item ${objectPosition === '0% 0%' ? 'active' : ''}" data-pos="0% 0%"></div>
                            <div class="pos-item ${objectPosition === '50% 0%' ? 'active' : ''}" data-pos="50% 0%"></div>
                            <div class="pos-item ${objectPosition === '100% 0%' ? 'active' : ''}" data-pos="100% 0%"></div>
                            <div class="pos-item ${objectPosition === '0% 50%' ? 'active' : ''}" data-pos="0% 50%"></div>
                            <div class="pos-item ${objectPosition === '50% 50%' || objectPosition === 'center' ? 'active' : ''}" data-pos="50% 50%"></div>
                            <div class="pos-item ${objectPosition === '100% 50%' ? 'active' : ''}" data-pos="100% 50%"></div>
                            <div class="pos-item ${objectPosition === '0% 100%' ? 'active' : ''}" data-pos="0% 100%"></div>
                            <div class="pos-item ${objectPosition === '50% 100%' ? 'active' : ''}" data-pos="50% 100%"></div>
                            <div class="pos-item ${objectPosition === '100% 100%' ? 'active' : ''}" data-pos="100% 100%"></div>
                        </div>
                    </div>

                    <div class="prop-col" style="margin-top: 12px;">
                        <label class="prop-label">Alt Text</label>
                        <input type="text" id="propImgAlt" class="prop-input" value="${element.getAttribute('alt') || ''}" placeholder="Describe image...">
                    </div>
                </div>
            `;
        }

        // 6. Advanced (Classes)
        html += `
            <div class="prop-section">
                <div class="prop-header">Advanced</div>
                <div class="prop-col">
                    <label class="prop-label">CSS Classes</label>
                    <textarea id="propClasses" class="prop-code-block" placeholder="e.g. btn btn-primary mt-4">${element.className}</textarea>
                </div>
                <div class="prop-col" style="margin-top: 8px;">
                     <label class="prop-label">ID</label>
                    <input type="text" id="propId" class="prop-input" value="${element.id || ''}" placeholder="element-id">
                </div>
            </div>

            <div class="prop-section" style="border-bottom: none;">
                <button class="btn btn-danger" onclick="app.deleteSelectedElement()" style="width: 100%; background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; font-size: 12px; padding: 8px;">
                    <i class="fa-solid fa-trash" style="margin-right: 6px;"></i> Delete Element
                </button>
            </div>
        `;

        panel.innerHTML = html;

        // Attach Event Listeners
        this.attachPropertyListeners(element);
    }

    attachPropertyListeners(element) {
        // Text Content
        const textInput = document.getElementById('propTextContent');
        if (textInput) {
            textInput.addEventListener('input', (e) => {
                element.textContent = e.target.value;
                // Debounce history save? For now just update
            });
            textInput.addEventListener('change', () => this.updateHTML('Update text'));
        }

        // Link Properties
        const linkElement = element.tagName.toLowerCase() === 'a' ? element : element.closest('a');

        if (linkElement) {
            const linkHrefInput = document.getElementById('propLinkHref');
            if (linkHrefInput) {
                linkHrefInput.addEventListener('change', (e) => {
                    linkElement.setAttribute('href', e.target.value);
                    this.updateHTML('Update link URL');
                });
            }

            const linkTargetInput = document.getElementById('propLinkTarget');
            if (linkTargetInput) {
                linkTargetInput.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        linkElement.setAttribute('target', '_blank');
                    } else {
                        linkElement.removeAttribute('target');
                    }
                    this.updateHTML('Update link target');
                });
            }
        }

        // Icon Properties
        const iconClassInput = document.getElementById('propIconClass');
        if (iconClassInput) {
            iconClassInput.addEventListener('change', (e) => {
                element.className = e.target.value;
                this.updateHTML('Update icon class');
            });
        }

        // Colors
        const colorInputs = ['propTextColor', 'propBgColor'];
        colorInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', (e) => {
                    const prop = id === 'propTextColor' ? 'color' : 'backgroundColor';
                    element.style[prop] = e.target.value;
                    // Update preview hex
                    input.parentElement.nextElementSibling.value = e.target.value;
                    input.parentElement.style.backgroundColor = e.target.value;
                });
                input.addEventListener('change', () => this.updateHTML('Update color'));
            }
        });

        // Spacing
        const spacingInputs = [
            { id: 'propMarginTop', prop: 'marginTop' },
            { id: 'propMarginRight', prop: 'marginRight' },
            { id: 'propMarginBottom', prop: 'marginBottom' },
            { id: 'propMarginLeft', prop: 'marginLeft' },
            { id: 'propPaddingTop', prop: 'paddingTop' },
            { id: 'propPaddingRight', prop: 'paddingRight' },
            { id: 'propPaddingBottom', prop: 'paddingBottom' },
            { id: 'propPaddingLeft', prop: 'paddingLeft' }
        ];

        spacingInputs.forEach(item => {
            const input = document.getElementById(item.id);
            if (input) {
                input.addEventListener('input', (e) => {
                    element.style[item.prop] = e.target.value + 'px';
                });
                input.addEventListener('change', () => this.updateHTML('Update spacing'));
            }
        });

        // Typography
        const fontFamilyInput = document.getElementById('propFontFamily');
        if (fontFamilyInput) {
            fontFamilyInput.addEventListener('change', (e) => {
                const fontName = e.target.value;
                this.applyFontFamily(element, fontName);
                this.updateHTML('Update font family');
            });
        }

        const fontSizeInput = document.getElementById('propFontSize');
        if (fontSizeInput) {
            fontSizeInput.addEventListener('input', (e) => {
                element.style.fontSize = e.target.value + 'px';
            });
            fontSizeInput.addEventListener('change', (e) => {
                this.updateHTML('Update font size');
            });
        }

        const fontWeightInput = document.getElementById('propFontWeight');
        if (fontWeightInput) {
            fontWeightInput.addEventListener('change', (e) => {
                element.style.fontWeight = e.target.value;
                this.updateHTML('Update font weight');
            });
        }
        // Image
        const imgSrcInput = document.getElementById('propImgSrc');
        if (imgSrcInput) {
            imgSrcInput.addEventListener('change', (e) => {
                element.src = e.target.value;
                this.updateHTML('Update image src');
            });
        }

        const imgFitInput = document.getElementById('propObjectFit');
        if (imgFitInput) {
            imgFitInput.addEventListener('change', (e) => {
                element.style.objectFit = e.target.value;
                this.updateHTML('Update image fit');
            });
        }

        const imgRadiusInput = document.getElementById('propImgRadius');
        if (imgRadiusInput) {
            imgRadiusInput.addEventListener('input', (e) => {
                element.style.borderRadius = e.target.value + 'px';
            });
            imgRadiusInput.addEventListener('change', () => this.updateHTML('Update border radius'));
        }

        const imgAltInput = document.getElementById('propImgAlt');
        if (imgAltInput) {
            imgAltInput.addEventListener('change', (e) => {
                element.setAttribute('alt', e.target.value);
                this.updateHTML('Update image alt text');
            });
        }

        const positionGrid = document.getElementById('propPositionGrid');
        if (positionGrid) {
            positionGrid.querySelectorAll('.pos-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    // Remove active class from all
                    positionGrid.querySelectorAll('.pos-item').forEach(i => i.classList.remove('active'));
                    // Add to clicked
                    e.target.classList.add('active');

                    // Update style
                    element.style.objectPosition = e.target.dataset.pos;
                    this.updateHTML('Update image position');
                });
            });
        }

        // Advanced
        const classesInput = document.getElementById('propClasses');
        if (classesInput) {
            classesInput.addEventListener('change', (e) => {
                element.className = e.target.value;
                this.updateHTML('Update classes');
            });
        }

        const idInput = document.getElementById('propId');
        if (idInput) {
            idInput.addEventListener('change', (e) => {
                element.id = e.target.value;
                this.updateHTML('Update ID');
            });
        }
    }

    applyFontFamily(element, fontName) {
        // System fonts don't need loading
        const systemFonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'sans-serif', 'serif', 'monospace'];

        if (!systemFonts.includes(fontName)) {
            this.loadGoogleFont(fontName);
        }

        element.style.fontFamily = `"${fontName}", sans-serif`;
    }

    loadGoogleFont(fontName) {
        const iframe = document.getElementById('canvas');
        const doc = iframe.contentDocument || iframe.contentWindow.document;

        // Check if already loaded
        const id = `font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
        if (doc.getElementById(id)) return;

        const link = doc.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;

        doc.head.appendChild(link);
        console.log(`[Fonts] Loaded ${fontName}`);
    }



    applyStyle(prop, value) {
        if (this.selectedElement) {
            this.selectedElement.style[prop] = value;
            this.updateHTML(`Update ${prop}`);
            // Refresh panel to show active state
            this.showProperties(this.selectedElement);
        }
    }

    // Deprecated but kept for compatibility if called elsewhere, redirecting to new logic
    applyProperties(element, saveToHistory = true) {
        // This is now handled by individual event listeners in attachPropertyListeners
        // But if needed, we can trigger a refresh
        if (element) this.showProperties(element);
    }

    deleteElement(element) {
        // Don't allow deleting the body element
        if (element.tagName === 'BODY') {
            this.showToast('❌ Cannot delete body element', 'error');
            return;
        }

        const parent = element.parentNode;
        if (parent) {
            parent.removeChild(element);

            // Clear selection
            this.selectedElement = null;

            // Get iframe doc
            const canvas = document.getElementById('canvas');
            const iframeDoc = canvas.contentDocument || canvas.contentWindow.document;

            // Update HTML and layers
            this.updateHTML('Delete element');
            this.buildLayersTree(iframeDoc);

            // Clear properties panel
            const panel = document.getElementById('propertiesPanel');
            panel.innerHTML = `
                <p style="color: var(--text-secondary); font-size: 0.875rem; text-align: center; padding: 2rem 1rem;">
                    Select an element to edit
                </p>
            `;

            this.showToast('✅ Element deleted', 'success');
        }
    }

    deleteSelectedElement() {
        if (!this.selectedElement) {
            return;
        }

        // Don't allow deleting the body element
        if (this.selectedElement.tagName === 'BODY') {
            this.showToast('❌ Cannot delete body element', 'error');
            return;
        }

        // Store element info for the toast message
        const elementName = this.selectedElement.tagName.toLowerCase();

        // Delete the element
        this.deleteElement(this.selectedElement);

        console.log('🗑️ Deleted element:', elementName);
    }

    // Helper to get an icon for the element type
    _getIconForTagName(tagName) {
        switch (tagName) {
            case 'img': return '🖼️';
            case 'a': return '🔗';
            case 'button': return '🔘';
            case 'input': return '⌨️';
            case 'form': return '📝';
            case 'ul':
            case 'ol': return '📋';
            case 'li': return '•';
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6': return 'T';
            case 'p': return '¶';
            case 'span': return 'Aa';
            case 'div': return '▭';
            case 'section': return 'S';
            case 'header': return 'H';
            case 'footer': return 'F';
            case 'nav': return 'N';
            case 'body': return '📄';
            default: return '◻️';
        }
    }

    buildLayersTree(doc) {
        const tree = document.getElementById('layersTree');
        tree.innerHTML = '';

        const buildNode = (element, level = 0) => {
            const tagName = element.tagName.toLowerCase();

            // Skip script and style tags
            if (tagName === 'script' || tagName === 'style') return;

            const li = document.createElement('li');
            li.className = 'layer-item';
            li.style.paddingLeft = `${level * 0.875}rem`;
            li.draggable = true;
            li.dataset.elementId = this.generateElementId(element);

            const hasChildren = Array.from(element.children).some(child =>
                child.tagName && child.tagName.toLowerCase() !== 'script' && child.tagName.toLowerCase() !== 'style'
            );

            const icon = this.getElementIcon(tagName);

            // Add collapse/expand toggle if element has children
            const collapseToggle = hasChildren ?
                `<span class="layer-toggle" data-element-id="${this.generateElementId(element)}">▸</span>` :
                '<span class="layer-toggle-spacer"></span>';

            li.innerHTML = `
                ${collapseToggle}
                <span class="layer-icon">${icon}</span>
                <span class="layer-name">${tagName}</span>
            `;

            // Store element reference
            li._element = element;

            // Toggle collapse/expand
            const toggle = li.querySelector('.layer-toggle');
            if (toggle) {
                // Set initial rotation based on collapsed state
                const elementId = this.generateElementId(element);
                const isCollapsed = this.collapsedLayers && this.collapsedLayers.has(elementId);
                toggle.style.transform = isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)';

                toggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleLayerCollapse(element);
                });
            }

            // Click to select
            li.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectElement(element);

                // Highlight in tree
                document.querySelectorAll('.layer-item').forEach(item => {
                    item.classList.remove('selected');
                });
                li.classList.add('selected');
            });

            // Drag and drop in layers
            li.addEventListener('dragstart', (e) => {
                e.stopPropagation();
                this.draggedLayerElement = element;
                li.style.opacity = '0.5';
            });

            li.addEventListener('dragend', (e) => {
                li.style.opacity = '1';
                this.draggedLayerElement = null;

                // Clean up all drop indicators
                document.querySelectorAll('.layer-drop-indicator').forEach(indicator => indicator.remove());
                document.querySelectorAll('.layer-item').forEach(item => {
                    item.style.background = '';
                });
            });

            li.addEventListener('dragover', (e) => {
                if (!this.draggedLayerElement) return;
                e.preventDefault();
                e.stopPropagation();

                // Remove any existing drop indicators
                document.querySelectorAll('.layer-drop-indicator').forEach(indicator => indicator.remove());

                // Determine drop position based on mouse Y position
                const rect = li.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                const isContainer = this.isContainer(element);

                // Create drop indicator line
                const dropLine = document.createElement('div');
                dropLine.className = 'layer-drop-indicator';
                dropLine.style.cssText = `
                    height: 2px;
                    background: #0EA5E9;
                    position: absolute;
                    left: ${level * 1.5}rem;
                    right: 0;
                    pointer-events: none;
                    z-index: 1000;
                    box-shadow: 0 0 4px rgba(14, 165, 233, 0.5);
                `;

                if (isContainer && e.clientY > midpoint) {
                    // Drop inside container (indent the line more)
                    dropLine.style.left = `${(level + 1) * 1.5}rem`;
                    dropLine.style.top = `${rect.bottom - li.parentElement.getBoundingClientRect().top}px`;
                    this.dropPosition = 'inside';
                    li.style.background = 'rgba(14, 165, 233, 0.05)';
                } else if (e.clientY < midpoint) {
                    // Drop before element
                    dropLine.style.top = `${rect.top - li.parentElement.getBoundingClientRect().top}px`;
                    this.dropPosition = 'before';
                } else {
                    // Drop after element
                    dropLine.style.top = `${rect.bottom - li.parentElement.getBoundingClientRect().top}px`;
                    this.dropPosition = 'after';
                }

                li.parentElement.appendChild(dropLine);
            });

            li.addEventListener('dragleave', (e) => {
                // Only remove if actually leaving (not entering child)
                const relatedTarget = e.relatedTarget;
                if (!li.contains(relatedTarget)) {
                    li.style.background = '';
                }
            });

            li.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Clean up visual indicators
                li.style.background = '';
                document.querySelectorAll('.layer-drop-indicator').forEach(indicator => indicator.remove());

                if (this.draggedLayerElement && this.draggedLayerElement !== element) {
                    // Don't allow element to be dropped into itself or its children
                    let checkParent = element;
                    while (checkParent) {
                        if (checkParent === this.draggedLayerElement) {
                            this.showToast('❌ Cannot drop element into itself', 'error');
                            return;
                        }
                        checkParent = checkParent.parentNode;
                    }

                    const parent = element.parentNode;
                    if (!parent) return;

                    // Execute the drop based on the determined position
                    if (this.dropPosition === 'inside' && this.isContainer(element)) {
                        // Drop inside container as first child
                        element.insertBefore(this.draggedLayerElement, element.firstChild);
                    } else if (this.dropPosition === 'before') {
                        // Drop before element
                        parent.insertBefore(this.draggedLayerElement, element);
                    } else {
                        // Drop after element
                        parent.insertBefore(this.draggedLayerElement, element.nextSibling);
                    }

                    // Get the iframe doc for rebuilding layers
                    const canvas = document.getElementById('canvas');
                    const iframeDoc = canvas.contentDocument || canvas.contentWindow.document;

                    this.updateHTML('Reorder in layers');
                    this.buildLayersTree(iframeDoc); // Rebuild layers to show new order

                    // Re-highlight the moved element
                    if (this.selectedElement) {
                        this.highlightInLayers(this.selectedElement);
                    }

                    this.showToast('✅ Element reordered', 'success');
                }
            });

            tree.appendChild(li);

            // Add children
            Array.from(element.children).forEach(child => {
                buildNode(child, level + 1);
            });
        };

        if (doc.body) {
            buildNode(doc.body);
        }
    }

    generateElementId(element) {
        if (!element._yenzeId) {
            element._yenzeId = 'el_' + Math.random().toString(36).substr(2, 9);
        }
        return element._yenzeId;
    }

    addElement(type) {
        const canvas = document.getElementById('canvas');
        const iframeDoc = canvas.contentDocument || canvas.contentWindow.document;

        const newElement = iframeDoc.createElement(type);
        newElement.textContent = `New ${type}`;
        newElement.style.padding = '1rem';
        newElement.style.margin = '0.5rem 0';
        newElement.style.background = '#f0f0f0';
        newElement.style.borderRadius = '4px';
        newElement.style.minHeight = '50px'; // Ensure it's visible and can receive drops
        newElement.style.border = '1px dashed #ccc'; // Visual indicator that it's empty

        // Insert based on selected element
        if (this.selectedElement) {
            // If selected element is a container, add inside it
            if (this.isContainer(this.selectedElement)) {
                this.selectedElement.appendChild(newElement);
            } else {
                // Otherwise, add after the selected element (as sibling)
                const parent = this.selectedElement.parentNode;
                if (parent) {
                    parent.insertBefore(newElement, this.selectedElement.nextSibling);
                } else {
                    iframeDoc.body.appendChild(newElement);
                }
            }
        } else {
            // No selection, add to body
            iframeDoc.body.appendChild(newElement);
        }

        // Make the new element editable
        this.makeElementEditable(newElement, iframeDoc);

        this.updateHTML(`Add ${type}`);
        this.buildLayersTree(iframeDoc); // Rebuild layers to show new element

        // Select the new element
        this.selectElement(newElement);

        this.showToast(`✅ ${type} added`, 'success');
    }

    addColumns() {
        const canvas = document.getElementById('canvas');
        const iframeDoc = canvas.contentDocument || canvas.contentWindow.document;

        const row = iframeDoc.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '1rem';
        row.style.margin = '1rem 0';
        row.style.minHeight = '100px'; // Ensure visible

        const col1 = iframeDoc.createElement('div');
        col1.style.flex = '1';
        col1.style.padding = '1rem';
        col1.style.minHeight = '80px'; // Ensure can receive drops
        col1.style.border = '1px dashed #ccc';
        // No text content - empty column
        // No background - inherits from parent

        const col2 = iframeDoc.createElement('div');
        col2.style.flex = '1';
        col2.style.padding = '1rem';
        col2.style.minHeight = '80px'; // Ensure can receive drops
        col2.style.border = '1px dashed #ccc';
        // No text content - empty column
        // No background - inherits from parent

        row.appendChild(col1);
        row.appendChild(col2);

        // Insert based on selected element
        if (this.selectedElement) {
            // If selected element is a container, add inside it
            if (this.isContainer(this.selectedElement)) {
                this.selectedElement.appendChild(row);
            } else {
                // Otherwise, add after the selected element (as sibling)
                const parent = this.selectedElement.parentNode;
                if (parent) {
                    parent.insertBefore(row, this.selectedElement.nextSibling);
                } else {
                    iframeDoc.body.appendChild(row);
                }
            }
        } else {
            // No selection, add to body
            iframeDoc.body.appendChild(row);
        }

        // Make the new elements editable
        this.makeElementEditable(row, iframeDoc);
        this.makeElementEditable(col1, iframeDoc);
        this.makeElementEditable(col2, iframeDoc);

        this.updateHTML('Add columns');
        this.buildLayersTree(iframeDoc); // Rebuild layers to show new elements

        // Select the row
        this.selectElement(row);

        this.showToast('✅ 2 columns added', 'success');
    }

    insertElementTemplate(elementType) {
        const canvas = document.getElementById('canvas');
        const iframeDoc = canvas.contentDocument || canvas.contentWindow.document;

        if (!iframeDoc || !iframeDoc.body) {
            this.showToast('⚠️ Please import HTML first', 'error');
            return;
        }

        let template = ELEMENT_TEMPLATES[elementType];
        if (!template) {
            this.showToast('⚠️ Template not found', 'error');
            return;
        }

        // For form integrations, adapt to current page styles
        if (elementType === 'contact-form' || elementType === 'newsletter-form') {
            const pageStyles = this.extractPageStyles(iframeDoc);
            template = this.adaptFormTemplate(elementType, pageStyles);
        }

        // Create a temporary container to parse the HTML
        const tempDiv = iframeDoc.createElement('div');
        tempDiv.innerHTML = template.trim();
        const newElement = tempDiv.firstElementChild;

        // Insert based on selected element
        if (this.selectedElement) {
            // If selected element is a container, add inside it
            if (this.isContainer(this.selectedElement)) {
                this.selectedElement.appendChild(newElement);
            } else {
                // Otherwise, add after the selected element (as sibling)
                const parent = this.selectedElement.parentNode;
                if (parent) {
                    parent.insertBefore(newElement, this.selectedElement.nextSibling);
                } else {
                    iframeDoc.body.appendChild(newElement);
                }
            }
        } else {
            // No selection, add to body
            iframeDoc.body.appendChild(newElement);
        }

        // Make the new element and its children editable
        this.makeElementEditable(newElement, iframeDoc);

        // Make all descendant elements editable too
        newElement.querySelectorAll('*').forEach(child => {
            this.makeElementEditable(child, iframeDoc);
        });

        this.updateHTML(`Add ${elementType}`);
        this.buildLayersTree(iframeDoc);

        // Select the new element
        this.selectElement(newElement);

        // Switch to Layers tab to show the new element
        this.switchTab('layers', 'left');

        const elementNames = {
            'contact-form': 'Contact Form',
            'newsletter-form': 'Newsletter Form',
            'mailchimp-form': 'Mailchimp Newsletter',
            'convertkit-form': 'ConvertKit Newsletter',
            'navbar': 'Navigation Bar',
            'footer': 'Footer',
            'hero': 'Hero Section',
            'card': 'Card Grid',
            'cta': 'Call to Action',
            'two-columns': '2 Columns',
            'three-columns': '3 Columns'
        };

        this.showToast(`✅ ${elementNames[elementType] || elementType} added`, 'success');
    }

    insertElementTemplateAtPosition(elementType, targetElement, position) {
        const canvas = document.getElementById('canvas');
        const iframeDoc = canvas.contentDocument || canvas.contentWindow.document;

        if (!iframeDoc || !iframeDoc.body) {
            this.showToast('⚠️ Please import HTML first', 'error');
            return;
        }

        let template = ELEMENT_TEMPLATES[elementType];
        if (!template) {
            this.showToast('⚠️ Template not found', 'error');
            return;
        }

        // For form integrations, adapt to current page styles
        if (elementType === 'contact-form' || elementType === 'newsletter-form') {
            const pageStyles = this.extractPageStyles(iframeDoc);
            template = this.adaptFormTemplate(elementType, pageStyles);
        }

        // Create a temporary container to parse the HTML
        const tempDiv = iframeDoc.createElement('div');
        tempDiv.innerHTML = template.trim();
        const newElement = tempDiv.firstElementChild;

        // Insert at the specific position
        if (!targetElement || targetElement === iframeDoc.body) {
            // If no target or target is body, append to body
            iframeDoc.body.appendChild(newElement);
        } else {
            const parent = targetElement.parentNode;
            if (position === 'before') {
                parent.insertBefore(newElement, targetElement);
            } else {
                // Insert after
                parent.insertBefore(newElement, targetElement.nextSibling);
            }
        }

        // Make the new element and its children editable
        this.makeElementEditable(newElement, iframeDoc);

        // Make all descendant elements editable too
        newElement.querySelectorAll('*').forEach(child => {
            this.makeElementEditable(child, iframeDoc);
        });

        this.updateHTML(`Add ${elementType}`);
        this.buildLayersTree(iframeDoc);

        // Select the new element
        this.selectElement(newElement);

        // Switch to Layers tab to show the new element
        this.switchTab('layers', 'left');

        const elementNames = {
            'contact-form': 'Contact Form',
            'newsletter-form': 'Newsletter Form',
            'mailchimp-form': 'Mailchimp Newsletter',
            'convertkit-form': 'ConvertKit Newsletter',
            'navbar': 'Navigation Bar',
            'footer': 'Footer',
            'hero': 'Hero Section',
            'card': 'Card Grid',
            'cta': 'Call to Action',
            'two-columns': '2 Columns',
            'three-columns': '3 Columns'
        };

        this.showToast(`✅ ${elementNames[elementType] || elementType} added`, 'success');
    }

    extractPageStyles(iframeDoc) {
        const styles = {
            primaryColor: '#667eea',
            secondaryColor: '#764ba2',
            textColor: '#1a1a2e',
            labelColor: '#374151',
            backgroundColor: '#ffffff',
            sectionBgColor: '#f9fafb',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            borderRadius: '8px',
            inputBorderColor: '#d1d5db',
            inputPadding: '0.75rem',
            headingColor: '#1a1a2e',
            headingFontWeight: '700',
            buttonStyle: 'solid',
            isDarkMode: false
        };

        try {
            const body = iframeDoc.body;
            const computedBody = iframeDoc.defaultView.getComputedStyle(body);

            // Get font family
            styles.fontFamily = computedBody.fontFamily || styles.fontFamily;

            // Get background color and detect dark mode
            const bodyBg = computedBody.backgroundColor;
            if (bodyBg && bodyBg !== 'rgba(0, 0, 0, 0)' && bodyBg !== 'transparent') {
                styles.backgroundColor = bodyBg;
                // Detect dark mode by checking if background is dark
                const rgb = bodyBg.match(/\d+/g);
                if (rgb && rgb.length >= 3) {
                    const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
                    styles.isDarkMode = brightness < 128;
                }
            }

            // Find primary color from buttons, links, or accent elements
            const buttons = iframeDoc.querySelectorAll('button, .btn, [class*="button"], a[class*="btn"]');
            if (buttons.length > 0) {
                for (const btn of buttons) {
                    const btnStyle = iframeDoc.defaultView.getComputedStyle(btn);
                    const bgColor = btnStyle.backgroundColor;
                    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent' && bgColor !== 'rgb(255, 255, 255)') {
                        styles.primaryColor = bgColor;
                        styles.borderRadius = btnStyle.borderRadius || styles.borderRadius;
                        break;
                    }
                }
            }

            // Check links for accent color if no button found
            if (styles.primaryColor === '#667eea') {
                const links = iframeDoc.querySelectorAll('a');
                for (const link of links) {
                    const linkStyle = iframeDoc.defaultView.getComputedStyle(link);
                    const color = linkStyle.color;
                    if (color && color !== 'rgb(0, 0, 238)' && color !== 'rgb(0, 0, 0)') {
                        styles.primaryColor = color;
                        break;
                    }
                }
            }

            // Check for existing forms to match their style
            const existingInputs = iframeDoc.querySelectorAll('input[type="text"], input[type="email"], textarea');
            if (existingInputs.length > 0) {
                const inputStyle = iframeDoc.defaultView.getComputedStyle(existingInputs[0]);
                if (inputStyle.borderRadius && inputStyle.borderRadius !== '0px') {
                    styles.borderRadius = inputStyle.borderRadius;
                }
                if (inputStyle.borderColor) {
                    styles.inputBorderColor = inputStyle.borderColor;
                }
                if (inputStyle.padding) {
                    styles.inputPadding = inputStyle.padding;
                }
            }

            // Get text color from paragraphs or body
            const paragraphs = iframeDoc.querySelectorAll('p');
            if (paragraphs.length > 0) {
                const pStyle = iframeDoc.defaultView.getComputedStyle(paragraphs[0]);
                if (pStyle.color) {
                    styles.textColor = pStyle.color;
                }
            }

            // Get heading styles
            const headings = iframeDoc.querySelectorAll('h1, h2, h3');
            if (headings.length > 0) {
                const hStyle = iframeDoc.defaultView.getComputedStyle(headings[0]);
                if (hStyle.color) {
                    styles.headingColor = hStyle.color;
                }
                if (hStyle.fontWeight) {
                    styles.headingFontWeight = hStyle.fontWeight;
                }
            }

            // Get label styles
            const labels = iframeDoc.querySelectorAll('label');
            if (labels.length > 0) {
                const labelStyle = iframeDoc.defaultView.getComputedStyle(labels[0]);
                if (labelStyle.color) {
                    styles.labelColor = labelStyle.color;
                }
            }

            // Check sections for background
            const sections = iframeDoc.querySelectorAll('section, .section, [class*="section"]');
            if (sections.length > 0) {
                const secStyle = iframeDoc.defaultView.getComputedStyle(sections[0]);
                if (secStyle.backgroundColor && secStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                    styles.sectionBgColor = secStyle.backgroundColor;
                }
            }

            // Adjust colors for dark mode
            if (styles.isDarkMode) {
                styles.labelColor = styles.textColor;
                styles.inputBorderColor = 'rgba(255,255,255,0.2)';
            }

        } catch (error) {
            console.log('Could not extract all page styles, using defaults');
        }

        return styles;
    }

    getAdaptedWeb3FormTemplate(templateType, styles) {
        const {
            primaryColor,
            textColor,
            labelColor,
            fontFamily,
            borderRadius,
            inputBorderColor,
            isDarkMode
        } = styles;

        // Use transparent/inherit backgrounds to blend with the site's design
        const inputBg = isDarkMode ? 'rgba(255,255,255,0.1)' : 'white';

        // All templates now use minimal styling - just the form elements without decorative containers
        const templates = {
            basic: `
<form action="https://api.web3forms.com/submit" method="POST" style="max-width: 100%; font-family: inherit; padding-left: 1.5rem; padding-right: 1.5rem; box-sizing: border-box;">
    <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE">
    <input type="hidden" name="subject" value="New Contact Form Submission">
    <input type="hidden" name="redirect" value="https://web3forms.com/success">
    <input type="checkbox" name="botcheck" style="display: none;">

    <input type="text" name="name" placeholder="Your Name" required style="width: 100%; padding: 0.75rem 1rem; margin-bottom: 1rem; border: 1px solid ${inputBorderColor}; border-radius: ${borderRadius}; font-family: inherit; font-size: 1rem; background: ${inputBg}; color: inherit; box-sizing: border-box;">
    <input type="email" name="email" placeholder="Your Email" required style="width: 100%; padding: 0.75rem 1rem; margin-bottom: 1rem; border: 1px solid ${inputBorderColor}; border-radius: ${borderRadius}; font-family: inherit; font-size: 1rem; background: ${inputBg}; color: inherit; box-sizing: border-box;">
    <textarea name="message" placeholder="Your Message" required style="width: 100%; padding: 0.75rem 1rem; margin-bottom: 1rem; border: 1px solid ${inputBorderColor}; border-radius: ${borderRadius}; font-family: inherit; font-size: 1rem; min-height: 120px; background: ${inputBg}; color: inherit; box-sizing: border-box; resize: vertical;"></textarea>

    <button type="submit" style="width: 100%; padding: 0.85rem 1.5rem; background: ${primaryColor}; color: white; border: none; border-radius: ${borderRadius}; font-size: 1rem; font-weight: 600; font-family: inherit; cursor: pointer;">Send Message</button>
</form>`,

            tailwind: `
<form action="https://api.web3forms.com/submit" method="POST" style="max-width: 100%; font-family: inherit; padding-left: 1.5rem; padding-right: 1.5rem; box-sizing: border-box;">
    <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE">
    <input type="hidden" name="subject" value="New Contact Form Submission">
    <input type="checkbox" name="botcheck" style="display: none;">

    <div style="margin-bottom: 1.25rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: inherit;">Full Name</label>
        <input type="text" name="name" placeholder="John Doe" required style="width: 100%; padding: 0.75rem 1rem; border: 1px solid ${inputBorderColor}; border-radius: ${borderRadius}; font-family: inherit; font-size: 1rem; background: ${inputBg}; color: inherit; box-sizing: border-box;">
    </div>
    <div style="margin-bottom: 1.25rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: inherit;">Email Address</label>
        <input type="email" name="email" placeholder="you@example.com" required style="width: 100%; padding: 0.75rem 1rem; border: 1px solid ${inputBorderColor}; border-radius: ${borderRadius}; font-family: inherit; font-size: 1rem; background: ${inputBg}; color: inherit; box-sizing: border-box;">
    </div>
    <div style="margin-bottom: 1.25rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: inherit;">Phone Number</label>
        <input type="text" name="phone" placeholder="+1 (555) 123-4567" style="width: 100%; padding: 0.75rem 1rem; border: 1px solid ${inputBorderColor}; border-radius: ${borderRadius}; font-family: inherit; font-size: 1rem; background: ${inputBg}; color: inherit; box-sizing: border-box;">
    </div>
    <div style="margin-bottom: 1.5rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: inherit;">Your Message</label>
        <textarea name="message" rows="4" placeholder="Your message..." required style="width: 100%; padding: 0.75rem 1rem; border: 1px solid ${inputBorderColor}; border-radius: ${borderRadius}; font-family: inherit; font-size: 1rem; background: ${inputBg}; color: inherit; box-sizing: border-box; resize: vertical;"></textarea>
    </div>
    <button type="submit" style="width: 100%; padding: 0.85rem 1.5rem; background: ${primaryColor}; color: white; border: none; border-radius: ${borderRadius}; font-size: 1rem; font-weight: 600; font-family: inherit; cursor: pointer;">Send Message</button>
</form>`,

            ajax: `
<form action="https://api.web3forms.com/submit" method="POST" id="ajaxContactForm" style="max-width: 100%; font-family: inherit; padding-left: 1.5rem; padding-right: 1.5rem; box-sizing: border-box;">
    <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE">
    <input type="hidden" name="subject" value="New Contact Form Submission">
    <input type="checkbox" name="botcheck" style="display: none;">

    <div style="margin-bottom: 1.25rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: inherit;">Full Name</label>
        <input type="text" name="name" placeholder="John Doe" required style="width: 100%; padding: 0.75rem 1rem; border: 1px solid ${inputBorderColor}; border-radius: ${borderRadius}; font-family: inherit; font-size: 1rem; background: ${inputBg}; color: inherit; box-sizing: border-box;">
    </div>
    <div style="margin-bottom: 1.25rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: inherit;">Email Address</label>
        <input type="email" name="email" placeholder="you@example.com" required style="width: 100%; padding: 0.75rem 1rem; border: 1px solid ${inputBorderColor}; border-radius: ${borderRadius}; font-family: inherit; font-size: 1rem; background: ${inputBg}; color: inherit; box-sizing: border-box;">
    </div>
    <div style="margin-bottom: 1.25rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: inherit;">Phone Number</label>
        <input type="text" name="phone" placeholder="+1 (555) 123-4567" style="width: 100%; padding: 0.75rem 1rem; border: 1px solid ${inputBorderColor}; border-radius: ${borderRadius}; font-family: inherit; font-size: 1rem; background: ${inputBg}; color: inherit; box-sizing: border-box;">
    </div>
    <div style="margin-bottom: 1.5rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: inherit;">Your Message</label>
        <textarea name="message" rows="4" placeholder="Your message..." required style="width: 100%; padding: 0.75rem 1rem; border: 1px solid ${inputBorderColor}; border-radius: ${borderRadius}; font-family: inherit; font-size: 1rem; background: ${inputBg}; color: inherit; box-sizing: border-box; resize: vertical;"></textarea>
    </div>
    <button type="submit" style="width: 100%; padding: 0.85rem 1.5rem; background: ${primaryColor}; color: white; border: none; border-radius: ${borderRadius}; font-size: 1rem; font-weight: 600; font-family: inherit; cursor: pointer;">Send Message</button>
    <p style="font-size: 0.875rem; text-align: center; color: inherit; margin-top: 1rem;" id="ajaxResult"></p>
</form>
<script>
const ajaxForm = document.getElementById("ajaxContactForm");
const ajaxResult = document.getElementById("ajaxResult");
if (ajaxForm) {
    ajaxForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const formData = new FormData(ajaxForm);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);
        ajaxResult.innerHTML = "Please wait...";
        fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: json
        }).then(async (response) => {
            let json = await response.json();
            if (response.status == 200) {
                ajaxResult.innerHTML = json.message;
                ajaxResult.style.color = "#10B981";
            } else {
                ajaxResult.innerHTML = json.message;
                ajaxResult.style.color = "#EF4444";
            }
        }).catch((error) => {
            console.log(error);
            ajaxResult.innerHTML = "Something went wrong!";
        }).then(function() {
            ajaxForm.reset();
            setTimeout(() => { ajaxResult.style.display = "none"; }, 5000);
        });
    });
}
</script>`,

            multicolumn: `
<form action="https://api.web3forms.com/submit" method="POST" style="max-width: 100%; font-family: inherit; padding-left: 1.5rem; padding-right: 1.5rem; box-sizing: border-box;">
    <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE">
    <input type="hidden" name="subject" value="New Contact Form Submission">
    <input type="checkbox" name="botcheck" style="display: none;">

    <div style="display: flex; margin-bottom: 1.25rem; gap: 1rem; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
            <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: inherit;">First Name</label>
            <input type="text" name="first_name" placeholder="John" required style="width: 100%; padding: 0.75rem 1rem; border: 1px solid ${inputBorderColor}; border-radius: ${borderRadius}; font-family: inherit; font-size: 1rem; background: ${inputBg}; color: inherit; box-sizing: border-box;">
        </div>
        <div style="flex: 1; min-width: 200px;">
            <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: inherit;">Last Name</label>
            <input type="text" name="last_name" placeholder="Doe" required style="width: 100%; padding: 0.75rem 1rem; border: 1px solid ${inputBorderColor}; border-radius: ${borderRadius}; font-family: inherit; font-size: 1rem; background: ${inputBg}; color: inherit; box-sizing: border-box;">
        </div>
    </div>

    <div style="display: flex; margin-bottom: 1.25rem; gap: 1rem; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
            <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: inherit;">Email Address</label>
            <input type="email" name="email" placeholder="you@example.com" required style="width: 100%; padding: 0.75rem 1rem; border: 1px solid ${inputBorderColor}; border-radius: ${borderRadius}; font-family: inherit; font-size: 1rem; background: ${inputBg}; color: inherit; box-sizing: border-box;">
        </div>
        <div style="flex: 1; min-width: 200px;">
            <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: inherit;">Phone Number</label>
            <input type="text" name="phone" placeholder="+1 (555) 123-4567" style="width: 100%; padding: 0.75rem 1rem; border: 1px solid ${inputBorderColor}; border-radius: ${borderRadius}; font-family: inherit; font-size: 1rem; background: ${inputBg}; color: inherit; box-sizing: border-box;">
        </div>
    </div>

    <div style="margin-bottom: 1.5rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: inherit;">Your Message</label>
        <textarea name="message" rows="4" placeholder="Your message..." required style="width: 100%; padding: 0.75rem 1rem; border: 1px solid ${inputBorderColor}; border-radius: ${borderRadius}; font-family: inherit; font-size: 1rem; background: ${inputBg}; color: inherit; box-sizing: border-box; resize: vertical;"></textarea>
    </div>
    <button type="submit" style="width: 100%; padding: 0.85rem 1.5rem; background: ${primaryColor}; color: white; border: none; border-radius: ${borderRadius}; font-size: 1rem; font-weight: 600; font-family: inherit; cursor: pointer;">Send Message</button>
</form>`,

            validation: `
<form action="https://api.web3forms.com/submit" method="POST" id="validationForm" novalidate style="max-width: 100%; font-family: inherit; padding-left: 1.5rem; padding-right: 1.5rem; box-sizing: border-box;">
    <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE">
    <input type="hidden" name="subject" value="New Contact Form Submission">
    <input type="checkbox" name="botcheck" style="display: none;">

    <div style="display: flex; margin-bottom: 1.25rem; gap: 1rem; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
            <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: inherit;">First Name</label>
            <input type="text" name="first_name" placeholder="John" required style="width: 100%; padding: 0.75rem 1rem; border: 2px solid ${inputBorderColor}; border-radius: ${borderRadius}; font-family: inherit; font-size: 1rem; background: ${inputBg}; color: inherit; box-sizing: border-box;">
            <div class="invalid-feedback" style="color: #EF4444; font-size: 0.75rem; margin-top: 0.25rem; display: none;">Please provide your first name.</div>
        </div>
        <div style="flex: 1; min-width: 200px;">
            <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: inherit;">Last Name</label>
            <input type="text" name="last_name" placeholder="Doe" required style="width: 100%; padding: 0.75rem 1rem; border: 2px solid ${inputBorderColor}; border-radius: ${borderRadius}; font-family: inherit; font-size: 1rem; background: ${inputBg}; color: inherit; box-sizing: border-box;">
            <div class="invalid-feedback" style="color: #EF4444; font-size: 0.75rem; margin-top: 0.25rem; display: none;">Please provide your last name.</div>
        </div>
    </div>

    <div style="display: flex; margin-bottom: 1.25rem; gap: 1rem; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
            <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: inherit;">Email Address</label>
            <input type="email" name="email" placeholder="you@example.com" required style="width: 100%; padding: 0.75rem 1rem; border: 2px solid ${inputBorderColor}; border-radius: ${borderRadius}; font-family: inherit; font-size: 1rem; background: ${inputBg}; color: inherit; box-sizing: border-box;">
            <div class="invalid-feedback" style="color: #EF4444; font-size: 0.75rem; margin-top: 0.25rem; display: none;">Please provide a valid email.</div>
        </div>
        <div style="flex: 1; min-width: 200px;">
            <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: inherit;">Phone Number</label>
            <input type="text" name="phone" placeholder="+1 (555) 123-4567" style="width: 100%; padding: 0.75rem 1rem; border: 2px solid ${inputBorderColor}; border-radius: ${borderRadius}; font-family: inherit; font-size: 1rem; background: ${inputBg}; color: inherit; box-sizing: border-box;">
        </div>
    </div>

    <div style="margin-bottom: 1.5rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: inherit;">Your Message</label>
        <textarea name="message" rows="4" placeholder="Your message..." required style="width: 100%; padding: 0.75rem 1rem; border: 2px solid ${inputBorderColor}; border-radius: ${borderRadius}; font-family: inherit; font-size: 1rem; background: ${inputBg}; color: inherit; box-sizing: border-box; resize: vertical;"></textarea>
        <div class="invalid-feedback" style="color: #EF4444; font-size: 0.75rem; margin-top: 0.25rem; display: none;">Please enter your message.</div>
    </div>
    <button type="submit" style="width: 100%; padding: 0.85rem 1.5rem; background: ${primaryColor}; color: white; border: none; border-radius: ${borderRadius}; font-size: 1rem; font-weight: 600; font-family: inherit; cursor: pointer;">Send Message</button>
    <p style="font-size: 0.875rem; text-align: center; color: inherit; margin-top: 1rem;" id="validationResult"></p>
</form>
<script>
const validationForm = document.getElementById("validationForm");
const validationResult = document.getElementById("validationResult");
if (validationForm) {
    validationForm.addEventListener("submit", function(e) {
        e.preventDefault();
        let isValid = true;
        validationForm.querySelectorAll("[required]").forEach(input => {
            const feedback = input.nextElementSibling;
            if (!input.value.trim() || (input.type === "email" && !input.value.includes("@"))) {
                input.style.borderColor = "#EF4444";
                if (feedback && feedback.classList.contains("invalid-feedback")) {
                    feedback.style.display = "block";
                }
                isValid = false;
            } else {
                input.style.borderColor = "${inputBorderColor}";
                if (feedback && feedback.classList.contains("invalid-feedback")) {
                    feedback.style.display = "none";
                }
            }
        });
        if (!isValid) return;
        const formData = new FormData(validationForm);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);
        validationResult.innerHTML = "Please wait...";
        fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: json
        }).then(async (response) => {
            let json = await response.json();
            if (response.status == 200) {
                validationResult.innerHTML = json.message;
                validationResult.style.color = "#10B981";
                validationForm.reset();
            } else {
                validationResult.innerHTML = json.message;
                validationResult.style.color = "#EF4444";
            }
        }).catch((error) => {
            validationResult.innerHTML = "Something went wrong!";
            validationResult.style.color = "#EF4444";
        });
    });
}
</script>`,

            raw: `
<form action="https://api.web3forms.com/submit" method="POST" style="max-width: 100%; font-family: inherit; padding-left: 1.5rem; padding-right: 1.5rem; box-sizing: border-box;">
    <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE">
    <input type="hidden" name="subject" value="New Contact Form Submission">
    <input type="hidden" name="redirect" value="https://web3forms.com/success">
    <input type="checkbox" name="botcheck" style="display: none;">

    <div style="margin-bottom: 1rem;">
        <label style="display: block; margin-bottom: 0.5rem; color: inherit;">Name:</label>
        <input type="text" name="name" required style="width: 100%; padding: 0.5rem; border: 1px solid ${inputBorderColor}; border-radius: 4px; font-family: inherit; background: ${inputBg}; color: inherit; box-sizing: border-box;">
    </div>
    <div style="margin-bottom: 1rem;">
        <label style="display: block; margin-bottom: 0.5rem; color: inherit;">Email:</label>
        <input type="email" name="email" required style="width: 100%; padding: 0.5rem; border: 1px solid ${inputBorderColor}; border-radius: 4px; font-family: inherit; background: ${inputBg}; color: inherit; box-sizing: border-box;">
    </div>
    <div style="margin-bottom: 1rem;">
        <label style="display: block; margin-bottom: 0.5rem; color: inherit;">Message:</label>
        <textarea name="message" required style="width: 100%; padding: 0.5rem; border: 1px solid ${inputBorderColor}; border-radius: 4px; font-family: inherit; min-height: 100px; background: ${inputBg}; color: inherit; box-sizing: border-box; resize: vertical;"></textarea>
    </div>
    <button type="submit" style="padding: 0.75rem 1.5rem; background: ${primaryColor}; color: white; border: none; border-radius: 4px; font-family: inherit; cursor: pointer;">Submit Form</button>
</form>`
        };

        return templates[templateType] || null;
    }

    adaptFormTemplate(elementType, pageStyles) {
        const { primaryColor, textColor, backgroundColor, fontFamily, borderRadius } = pageStyles;

        if (elementType === 'contact-form') {
            return `
        <div class="yenze-form-wrapper" style="font-family: inherit;">
            <div class="yenze-form-container">
                <h2 class="yenze-form-heading">Get in Touch</h2>
                <p class="yenze-form-description">We'd love to hear from you. Send us a message!</p>
                <form action="https://api.web3forms.com/submit" method="POST" class="yenze-contact-form">
                    <input type="hidden" name="access_key" value="YOUR_WEB3FORMS_KEY">
                    <input type="hidden" name="subject" value="New Contact Form Submission">
                    <input type="hidden" name="redirect" value="https://web3forms.com/success">

                    <div class="yenze-form-field">
                        <label class="yenze-form-label">Name</label>
                        <input type="text" name="name" placeholder="Your name" required class="yenze-form-input" data-primary-color="${primaryColor}">
                    </div>
                    <div class="yenze-form-field">
                        <label class="yenze-form-label">Email</label>
                        <input type="email" name="email" placeholder="your@email.com" required class="yenze-form-input" data-primary-color="${primaryColor}">
                    </div>
                    <div class="yenze-form-field">
                        <label class="yenze-form-label">Message</label>
                        <textarea name="message" placeholder="Your message..." rows="4" required class="yenze-form-textarea" data-primary-color="${primaryColor}"></textarea>
                    </div>
                    <div class="h-captcha" data-captcha="true"></div>
                    <button type="submit" class="yenze-form-button" data-primary-color="${primaryColor}">Send Message</button>
                </form>
                <script src="https://web3forms.com/client/script.js" async defer></script>
            </div>
            <style>
                .yenze-form-wrapper { width: 100%; }
                .yenze-form-container { width: 100%; max-width: 100%; }
                .yenze-form-heading { font-size: inherit; margin: 0 0 0.5em; color: inherit; font-weight: inherit; }
                .yenze-form-description { color: inherit; opacity: 0.7; margin: 0 0 1.5em; font-size: 0.9em; }
                .yenze-form-field { margin-bottom: 1.25em; }
                .yenze-form-label { display: block; font-weight: 500; margin-bottom: 0.5em; color: inherit; font-size: 0.9em; }
                .yenze-form-input, .yenze-form-textarea {
                    width: 100%;
                    padding: 0.75em 1em;
                    border: 1px solid currentColor;
                    border-color: rgba(0,0,0,0.15);
                    border-radius: inherit;
                    font-size: inherit;
                    font-family: inherit;
                    background: inherit;
                    color: inherit;
                    transition: border-color 0.2s;
                    box-sizing: border-box;
                }
                .yenze-form-input:focus, .yenze-form-textarea:focus {
                    outline: none;
                    border-color: ${primaryColor};
                }
                .yenze-form-textarea { resize: vertical; min-height: 100px; }
                .yenze-form-button {
                    width: 100%;
                    padding: 0.85em 1.5em;
                    background: ${primaryColor};
                    color: white;
                    border: none;
                    border-radius: inherit;
                    font-size: inherit;
                    font-weight: 600;
                    font-family: inherit;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .yenze-form-button:hover { opacity: 0.9; transform: translateY(-1px); }
            </style>
        </div>
            `;
        } else if (elementType === 'newsletter-form') {
            return `
        <div class="yenze-newsletter-wrapper" style="font-family: inherit; text-align: inherit;">
            <div class="yenze-newsletter-container">
                <h3 class="yenze-newsletter-heading">Subscribe to our Newsletter</h3>
                <p class="yenze-newsletter-description">Get the latest updates delivered to your inbox.</p>
                <form id="newsletterForm" class="yenze-newsletter-form">
                    <input type="email" name="email" placeholder="Enter your email" required class="yenze-newsletter-input" data-primary-color="${primaryColor}">
                    <button type="submit" class="yenze-newsletter-button" data-primary-color="${primaryColor}">Subscribe</button>
                </form>
                <div id="newsletter-message" class="yenze-newsletter-message"></div>
                <script>
                    document.getElementById('newsletterForm').addEventListener('submit', async function(e) {
                        e.preventDefault();
                        const email = this.querySelector('[name="email"]').value;
                        const messageDiv = document.getElementById('newsletter-message');
                        const button = this.querySelector('button');

                        button.disabled = true;
                        button.textContent = 'Subscribing...';

                        try {
                            const response = await fetch('https://app.loops.so/api/newsletter-form/YOUR_LOOPS_FORM_ID', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email })
                            });

                            if (response.ok) {
                                messageDiv.textContent = '✓ Thanks for subscribing!';
                                this.reset();
                            } else {
                                messageDiv.textContent = '✗ Something went wrong. Please try again.';
                            }
                        } catch (error) {
                            messageDiv.textContent = '✗ Something went wrong. Please try again.';
                        } finally {
                            button.disabled = false;
                            button.textContent = 'Subscribe';
                        }
                    });
                </script>
            </div>
            <style>
                .yenze-newsletter-wrapper { width: 100%; }
                .yenze-newsletter-container { width: 100%; max-width: 100%; }
                .yenze-newsletter-heading { font-size: inherit; margin: 0 0 0.3em; color: inherit; font-weight: inherit; }
                .yenze-newsletter-description { color: inherit; opacity: 0.7; margin: 0 0 1.5em; font-size: 0.9em; }
                .yenze-newsletter-form {
                    display: flex;
                    gap: 0.75em;
                    flex-wrap: wrap;
                    align-items: stretch;
                }
                .yenze-newsletter-input {
                    flex: 1;
                    min-width: 200px;
                    padding: 0.85em 1.25em;
                    border: 1px solid currentColor;
                    border-color: rgba(0,0,0,0.15);
                    background: inherit;
                    color: inherit;
                    border-radius: inherit;
                    font-size: inherit;
                    font-family: inherit;
                    transition: border-color 0.2s;
                    box-sizing: border-box;
                }
                .yenze-newsletter-input:focus {
                    outline: none;
                    border-color: ${primaryColor};
                }
                .yenze-newsletter-button {
                    padding: 0.85em 2em;
                    background: ${primaryColor};
                    color: white;
                    border: none;
                    border-radius: inherit;
                    font-size: inherit;
                    font-weight: 600;
                    font-family: inherit;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .yenze-newsletter-button:hover { opacity: 0.9; transform: scale(1.02); }
                .yenze-newsletter-message { margin-top: 1em; color: inherit; font-weight: 500; }
            </style>
        </div>
            `;
        }

        return ELEMENT_TEMPLATES[elementType];
    }

    filterElements(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        const categories = document.querySelectorAll('.element-category');

        categories.forEach(category => {
            const cards = category.querySelectorAll('.element-card');
            let visibleCards = 0;

            cards.forEach(card => {
                const elementName = card.querySelector('.element-name').textContent.toLowerCase();
                const elementType = card.dataset.element.toLowerCase();

                if (elementName.includes(term) || elementType.includes(term)) {
                    card.style.display = 'flex';
                    visibleCards++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Hide category if no visible cards
            if (visibleCards === 0 && term !== '') {
                category.style.display = 'none';
            } else {
                category.style.display = 'flex';
            }
        });
    }

    getElementIcon(tagName) {
        const icons = {
            'body': '□',
            'html': '□',
            'head': '⊙',
            'header': '▭',
            'nav': '≡',
            'section': '▢',
            'article': '▢',
            'div': '▪',
            'span': '▸',
            'p': '¶',
            'h1': 'H1',
            'h2': 'H2',
            'h3': 'H3',
            'h4': 'H4',
            'h5': 'H5',
            'h6': 'H6',
            'button': '▭',
            'a': '⎋',
            'img': '▨',
            'svg': '◊',
            'footer': '▭',
            'ul': '≡',
            'ol': '≡',
            'li': '·',
            'form': '▢',
            'input': '▭',
            'textarea': '▭',
            'select': '▭',
            'table': '▦',
            'tr': '─',
            'td': '□',
            'th': '■',
        };
        return icons[tagName] || '○';
    }

    toggleCodeEditor() {
        const editor = document.getElementById('codeEditor');
        const isActive = editor.classList.contains('active');

        if (isActive) {
            editor.classList.remove('active');
        } else {
            document.getElementById('codeContent').value = this.currentHTML;
            editor.classList.add('active');
        }
    }

    preview() {
        // Clear selection to remove editor artifacts
        this.selectElement(null);

        // Get fresh HTML from iframe to ensure it's clean and up-to-date
        const canvas = document.getElementById('canvas');
        const iframeDoc = canvas.contentDocument || canvas.contentWindow.document;

        // Use outerHTML of documentElement to get the full HTML including <html> tag
        const cleanHTML = "<!DOCTYPE html>\n" + iframeDoc.documentElement.outerHTML;

        // Open in new window
        const previewWindow = window.open('', 'Preview', 'width=1200,height=800');
        previewWindow.document.write(cleanHTML);
        previewWindow.document.close();

        this.showToast('👁️ Preview opened in new window', 'success');
    }

    async publish() {
        if (!this.currentHTML) {
            this.showToast('⚠️ No content to publish', 'error');
            return;
        }

        try {
            // Ensure authUI is ready
            if (!window.authUI && typeof AuthUI !== 'undefined') {
                console.log('[Publish] Initializing AuthUI fallback');
                window.authUI = new AuthUI();
            }

            // Check if user is authenticated (with session refresh)
            const isAuth = await this.checkAuthentication();
            if (!isAuth) {
                console.log('[Publish] User not authenticated, showing auth modal');
                // Set flag so we know to show pricing modal after login
                this.pendingPublish = true;
                // Show auth modal first
                if (window.authUI) {
                    window.authUI.showAuthModal('login');
                } else {
                    console.error('AuthUI not found even after fallback check!');
                    alert('Authentication system not loaded. Please refresh the page.');
                }
                return;
            }

            // If project already has an ID, it's been published before - just update it
            if (this.projectData.id) {
                await this.updateExistingProject();
            } else {
                // New project - check user's plan and show appropriate modal
                const { data: subscription, error: subError } = await window.supabaseClient.client
                    .from('subscriptions')
                    .select('plan, status')
                    .eq('user_id', window.supabaseClient.currentUser.id)
                    .eq('status', 'active')
                    .maybeSingle();

                if (subError) {
                    console.error('Error checking subscription:', subError);
                    // Default to free plan behavior on error
                    this.showSlugModal();
                    return;
                }

                // Determine plan
                const currentPlan = subscription ? subscription.plan.toLowerCase() : 'free';
                console.log('[Publish] User plan:', currentPlan);

                if (currentPlan === 'free') {
                    // FREE: Show path-based slug modal
                    this.showSlugModal();
                } else if (currentPlan === 'starter' || currentPlan === 'pro' || currentPlan === 'business') {
                    // PAID: Show subdomain modal
                    this.showSubdomainModal();
                } else {
                    // Unknown plan or no subscription - show pricing options
                    console.warn('[Publish] Unknown plan, showing pricing options');
                    this.showPublishOptionsModal();
                }
            }
        } catch (err) {
            console.error('[Publish] Critical error:', err);
            alert('Publish failed: ' + err.message);
        }
    }

    async checkAuthentication() {
        try {
            // First, ensure Supabase is fully initialized
            await supabaseClient.init();

            // Check if we have a cached user
            if (supabaseClient.isAuthenticated()) {
                return true;
            }

            // If not, try to refresh the session
            const { data: { session } } = await supabaseClient.client.auth.getSession();
            if (session && session.user) {
                supabaseClient.currentUser = session.user;
                console.log('Session refreshed for user:', session.user.email);
                return true;
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
        }

        return false;
    }

    showPublishOptionsModal() {
        const modal = document.getElementById('publishOptionsModal');
        if (!modal) {
            console.error('Publish options modal not found');
            return;
        }

        // Generate subdomain preview
        const subdomainSlug = this.generateSubdomainSlug(this.projectData.name);
        const subdomainPreview = document.getElementById('subdomainPreview');
        if (subdomainPreview) {
            subdomainPreview.textContent = `${subdomainSlug}.yenze.io`;
        }

        modal.style.display = 'flex';
    }

    closePublishOptionsModal() {
        const modal = document.getElementById('publishOptionsModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Web3Forms Modal Functions
    showWeb3FormsModal() {
        const modal = document.getElementById('web3formsModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeWeb3FormsModal() {
        const modal = document.getElementById('web3formsModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    insertWeb3FormTemplate(templateType) {
        // Close the modal first
        this.closeWeb3FormsModal();

        // Insert the template into the canvas
        const canvas = document.getElementById('canvas');
        const iframeDoc = canvas.contentDocument || canvas.contentWindow.document;

        if (!iframeDoc || !iframeDoc.body) {
            this.showToast('⚠️ Please import HTML first', 'error');
            return;
        }

        // Extract current page styles to adapt the form
        const pageStyles = this.extractPageStyles(iframeDoc);

        // Get the appropriate template with adapted styles
        const template = this.getAdaptedWeb3FormTemplate(templateType, pageStyles);

        if (!template) {
            this.showToast('⚠️ Template not found', 'error');
            return;
        }

        // Create element from template
        const tempDiv = iframeDoc.createElement('div');
        tempDiv.innerHTML = template.trim();
        const newElement = tempDiv.firstElementChild;

        // Insert the element
        if (this.selectedElement && this.isContainer(this.selectedElement)) {
            this.selectedElement.appendChild(newElement);
        } else {
            iframeDoc.body.appendChild(newElement);
        }

        // Make editable
        this.makeElementEditable(newElement, iframeDoc);
        newElement.querySelectorAll('*').forEach(child => {
            this.makeElementEditable(child, iframeDoc);
        });

        this.updateHTML('Add Web3Forms Contact Form');
        this.buildLayersTree(iframeDoc);
        this.selectElement(newElement);
        this.switchTab('layers', 'left');

        this.showToast('✅ Web3Forms contact form added', 'success');
    }

    // Legacy function kept for backwards compatibility - now uses getAdaptedWeb3FormTemplate
    getWeb3FormsTemplates() {
        // Extract styles from current page if available
        const canvas = document.getElementById('canvas');
        if (canvas) {
            const iframeDoc = canvas.contentDocument || canvas.contentWindow?.document;
            if (iframeDoc && iframeDoc.body) {
                const styles = this.extractPageStyles(iframeDoc);
                return {
                    basic: this.getAdaptedWeb3FormTemplate('basic', styles),
                    tailwind: this.getAdaptedWeb3FormTemplate('tailwind', styles),
                    ajax: this.getAdaptedWeb3FormTemplate('ajax', styles),
                    multicolumn: this.getAdaptedWeb3FormTemplate('multicolumn', styles),
                    validation: this.getAdaptedWeb3FormTemplate('validation', styles),
                    raw: this.getAdaptedWeb3FormTemplate('raw', styles)
                };
            }
        }
        // Fallback to default styles
        const defaultStyles = this.extractPageStyles({ body: document.body, defaultView: window, querySelectorAll: () => [] });
        return {
            basic: this.getAdaptedWeb3FormTemplate('basic', defaultStyles),
            tailwind: this.getAdaptedWeb3FormTemplate('tailwind', defaultStyles),
            ajax: this.getAdaptedWeb3FormTemplate('ajax', defaultStyles),
            multicolumn: this.getAdaptedWeb3FormTemplate('multicolumn', defaultStyles),
            validation: this.getAdaptedWeb3FormTemplate('validation', defaultStyles),
            raw: this.getAdaptedWeb3FormTemplate('raw', defaultStyles)
        };
    }

    async selectPlanAndPublish(selectedPlan) {
        // Check if user is authenticated first
        if (!supabaseClient.isAuthenticated()) {
            this.closePublishOptionsModal();
            this.showAuthModal('login');
            return;
        }

        // Get user's current subscription
        const { data: subscription } = await supabaseClient.client
            .from('subscriptions')
            .select('plan')
            .eq('user_id', supabaseClient.currentUser.id)
            .eq('status', 'active')
            .single();

        const currentPlan = subscription?.plan || 'free';

        // Close pricing modal
        this.closePublishOptionsModal();

        // If selecting FREE or user already has the selected plan, handle appropriately
        if (selectedPlan === 'free' || selectedPlan === currentPlan) {
            // Set current plan for modal
            this.currentUserPlan = selectedPlan;

            // Show appropriate modal based on plan
            if (selectedPlan === 'free') {
                // FREE plan: Show path-based slug modal (yenze.io/s/slug)
                this.showSlugModal();
            } else if (selectedPlan === 'starter' || selectedPlan === 'pro' || selectedPlan === 'business') {
                // PAID plans: Show subdomain modal (slug.yenze.io)
                this.showSubdomainModal();
            }
        } else {
            // User wants to upgrade - redirect to Stripe
            await this.initializeStripeAndCheckout(selectedPlan);
        }
    }

    async initializeStripeAndCheckout(plan) {
        console.log('[initializeStripeAndCheckout] Called with plan:', plan);
        console.log('[initializeStripeAndCheckout] All payment links:', STRIPE_CONFIG.paymentLinks);

        // Show loading message
        this.showToast(`Redirecting to checkout for ${plan.toUpperCase()} plan...`, 'info');

        try {
            // Get the payment link from config
            const planKey = plan.toLowerCase();
            console.log('[initializeStripeAndCheckout] Looking for plan key:', planKey);

            const paymentLink = STRIPE_CONFIG.paymentLinks[planKey];
            console.log('[initializeStripeAndCheckout] Payment link found:', paymentLink);

            if (!paymentLink) {
                console.error('[App] No payment link found for plan:', plan);
                this.showToast('❌ Payment link not configured for this plan.', 'error');
                return;
            }

            // Add customer email as prefill if user is authenticated
            if (supabaseClient.isAuthenticated()) {
                const userEmail = supabaseClient.currentUser.email;
                const userId = supabaseClient.currentUser.id;
                const urlWithEmail = `${paymentLink}?prefilled_email=${encodeURIComponent(userEmail)}&client_reference_id=${userId}`;

                console.log('[initializeStripeAndCheckout] Final redirect URL:', urlWithEmail);
                window.location.href = urlWithEmail;
            } else {
                console.log('[initializeStripeAndCheckout] User not authenticated, redirecting to:', paymentLink);
                window.location.href = paymentLink;
            }
        } catch (error) {
            console.error('Failed to start checkout:', error);
            this.showToast('❌ Failed to start checkout. Please try again.', 'error');
        }
    }

    async publishFree() {
        this.closePublishOptionsModal();
        // Show subdomain selection modal for free plan
        this.showSubdomainModal('free');
    }

    async selectPaidPlan(plan) {
        this.closePublishOptionsModal();
        await this.initializeStripeAndCheckout(plan);
    }

    async upgradeFromModal(plan) {
        this.closeSubdomainModal();

        console.log('[upgradeFromModal] Called with plan:', plan);
        console.log('[upgradeFromModal] All payment links:', STRIPE_CONFIG.paymentLinks);

        // Show loading message
        this.showToast(`Redirecting to checkout for ${plan.toUpperCase()} plan...`, 'info');

        try {
            // Get the payment link from config
            const planKey = plan.toLowerCase();
            console.log('[upgradeFromModal] Looking for plan key:', planKey);

            const paymentLink = STRIPE_CONFIG.paymentLinks[planKey];
            console.log('[upgradeFromModal] Payment link found:', paymentLink);

            if (!paymentLink) {
                console.error('[App] No payment link found for plan:', plan);
                this.showToast('❌ Payment link not configured for this plan.', 'error');
                return;
            }

            // Add customer email as prefill if user is authenticated
            if (supabaseClient.isAuthenticated()) {
                const userEmail = supabaseClient.currentUser.email;
                const userId = supabaseClient.currentUser.id;
                const urlWithEmail = `${paymentLink}?prefilled_email=${encodeURIComponent(userEmail)}&client_reference_id=${userId}`;

                console.log('[upgradeFromModal] Final redirect URL:', urlWithEmail);
                window.location.href = urlWithEmail;
            } else {
                console.log('[upgradeFromModal] User not authenticated, redirecting to:', paymentLink);
                window.location.href = paymentLink;
            }
        } catch (error) {
            console.error('Failed to start checkout:', error);
            this.showToast('❌ Failed to start checkout. Please try again.', 'error');
        }
    }

    showPublishModal(userPlan) {
        // Store the user's plan
        this.currentUserPlan = userPlan;

        if (userPlan === 'free') {
            // FREE: Show slug modal for /s/slug format
            this.showSlugModal();
        } else if (userPlan === 'starter' || userPlan === 'pro' || userPlan === 'business') {
            // STARTER/PRO/BUSINESS: Show subdomain modal for slug.yenze.io
            this.showSubdomainModal();
        }
    }

    showSlugModal() {
        const modal = document.getElementById('subdomainModal');
        if (!modal) {
            console.error('Subdomain modal not found');
            return;
        }

        // Update modal UI for FREE plan (yenze.io/s/slug)
        const modalHeader = modal.querySelector('.subdomain-modal-header h2');
        const modalDesc = modal.querySelector('.subdomain-modal-header p');
        const suffix = modal.querySelector('.subdomain-suffix');
        const upgradeSection = modal.querySelector('.subdomain-upgrade-section');
        const inputLabel = modal.querySelector('.subdomain-input-group label');

        if (modalHeader) modalHeader.textContent = '🆓 Choose Your Site Name';
        if (modalDesc) modalDesc.textContent = 'Your site will be available at yenze.io/s/your-name';
        if (suffix) suffix.style.display = 'none'; // Hide suffix for FREE
        if (upgradeSection) upgradeSection.style.display = 'block'; // Show upgrade options
        if (inputLabel) inputLabel.textContent = 'Your Site Name';

        // Generate default slug from project name
        const defaultSlug = this.generateSubdomainSlug(this.projectData.name);
        const subdomainInput = document.getElementById('subdomainInput');
        if (subdomainInput) {
            subdomainInput.value = defaultSlug;
            // Update preview for FREE plan
            this.updateSlugPreview();
        }

        modal.style.display = 'flex';
        setTimeout(() => {
            subdomainInput?.focus();
            subdomainInput?.select();
        }, 100);
    }

    showSubdomainModal() {
        const modal = document.getElementById('subdomainModal');
        if (!modal) {
            console.error('Subdomain modal not found');
            return;
        }

        // Update modal UI for STARTER/PRO plan (slug.yenze.io)
        const modalHeader = modal.querySelector('.subdomain-modal-header h2');
        const modalDesc = modal.querySelector('.subdomain-modal-header p');
        const suffix = modal.querySelector('.subdomain-suffix');
        const upgradeSection = modal.querySelector('.subdomain-upgrade-section');
        const inputLabel = modal.querySelector('.subdomain-input-group label');

        if (modalHeader) modalHeader.textContent = '🌐 Choose Your Subdomain';
        if (modalDesc) modalDesc.textContent = 'Select a unique name for your website URL';
        if (suffix) {
            suffix.textContent = '.yenze.io';
            suffix.style.display = 'inline'; // Show suffix for STARTER/PRO
        }
        if (upgradeSection) upgradeSection.style.display = 'none'; // Hide upgrade for paid users
        if (inputLabel) inputLabel.textContent = 'Your Subdomain';

        // Generate default subdomain from project name
        const defaultSlug = this.generateSubdomainSlug(this.projectData.name);
        const subdomainInput = document.getElementById('subdomainInput');
        if (subdomainInput) {
            subdomainInput.value = defaultSlug;
            // Update preview
            this.updateSubdomainPreview();
        }

        modal.style.display = 'flex';
        setTimeout(() => {
            subdomainInput?.focus();
            subdomainInput?.select();
        }, 100);
    }

    closeSubdomainModal() {
        const modal = document.getElementById('subdomainModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    updateSubdomainPreview() {
        const input = document.getElementById('subdomainInput');
        const preview = document.getElementById('subdomainLivePreview');
        if (input && preview) {
            const slug = input.value || 'your-project';
            preview.textContent = `${slug}.yenze.io`;
        }
    }

    updateSlugPreview() {
        const input = document.getElementById('subdomainInput');
        const preview = document.getElementById('subdomainLivePreview');
        if (input && preview) {
            const slug = input.value || 'your-site';
            preview.textContent = `yenze.io/s/${slug}`;
        }
    }

    async checkSubdomainAvailability() {
        const input = document.getElementById('subdomainInput');
        const availabilityMessage = document.getElementById('availabilityMessage');
        const publishButton = document.getElementById('confirmPublishBtn');

        if (!input || !availabilityMessage || !publishButton) return;

        const slug = input.value.trim();

        // Validate slug format
        if (!slug) {
            availabilityMessage.textContent = '⚠️ Please enter a name';
            availabilityMessage.className = 'availability-message warning';
            publishButton.disabled = true;
            return;
        }

        // For paid plans, use subdomain-utils validation
        if (this.currentUserPlan !== 'free' && window.subdomainUtils) {
            const validation = window.subdomainUtils.validate(slug);
            if (!validation.valid) {
                availabilityMessage.textContent = '❌ ' + validation.error;
                availabilityMessage.className = 'availability-message error';
                publishButton.disabled = true;
                return;
            }
        } else {
            // Basic validation for free plan
            if (!/^[a-z0-9-]+$/.test(slug)) {
                availabilityMessage.textContent = '⚠️ Only lowercase letters, numbers, and hyphens allowed';
                availabilityMessage.className = 'availability-message warning';
                publishButton.disabled = true;
                return;
            }

            if (slug.length < 3) {
                availabilityMessage.textContent = '⚠️ Name must be at least 3 characters';
                availabilityMessage.className = 'availability-message warning';
                publishButton.disabled = true;
                return;
            }
        }

        // Check availability in database
        availabilityMessage.textContent = '🔍 Checking availability...';
        availabilityMessage.className = 'availability-message checking';

        try {
            // Check based on user plan
            const fieldToCheck = this.currentUserPlan === 'free' ? 'public_slug' : 'subdomain_slug';

            const { data: existing } = await supabaseClient.client
                .from('projects')
                .select('id')
                .eq(fieldToCheck, slug)
                .neq('id', this.projectData.id || 'none')
                .single();

            if (existing) {
                availabilityMessage.textContent = '❌ This name is already taken. Try another one.';
                availabilityMessage.className = 'availability-message error';
                publishButton.disabled = true;
            } else {
                availabilityMessage.textContent = '✅ Available! Ready to publish.';
                availabilityMessage.className = 'availability-message success';
                publishButton.disabled = false;
            }
        } catch (error) {
            // If no existing found, it's available
            availabilityMessage.textContent = '✅ Available! Ready to publish.';
            availabilityMessage.className = 'availability-message success';
            publishButton.disabled = false;
        }
    }

    async confirmPublish() {
        const input = document.getElementById('subdomainInput');
        const slug = input?.value.trim();

        if (!slug) {
            this.showToast('Please enter a name', 'error');
            return;
        }

        // Close modal and publish with the chosen slug
        this.closeSubdomainModal();
        await this.publishWithSlug(slug);
    }

    async publishWithSlug(slug) {
        try {
            this.showToast('Publishing your website...', 'info');

            const plan = this.currentUserPlan || 'free';

            // Validate subdomain for paid plans
            if (plan !== 'free' && window.subdomainUtils) {
                const validation = window.subdomainUtils.validate(slug);
                if (!validation.valid) {
                    this.showToast('❌ ' + validation.error, 'error');
                    return;
                }

                // Check availability
                const available = await window.subdomainUtils.checkAvailability(slug, supabaseClient);
                if (!available) {
                    this.showToast('❌ This subdomain is already taken', 'error');
                    return;
                }
            }

            // Prepare project data based on plan
            const projectData = {
                name: this.projectData.name,
                html: this.currentHTML,
                published: true
            };

            // Generate deployment URL based on plan
            let publishedUrl;

            if (plan === 'free') {
                // FREE: Use /s/slug format
                projectData.public_slug = slug;
                publishedUrl = `https://yenze.io/s/${slug}`;
            } else if (plan === 'starter' || plan === 'pro' || plan === 'business') {
                // STARTER/PRO/BUSINESS: Use subdomain format
                projectData.subdomain_slug = slug;
                publishedUrl = `https://${slug}.yenze.io`;
            }

            // Save project to database
            const { data: project, error: saveError } = await supabaseClient.saveProject(projectData);

            if (saveError) {
                throw new Error('Failed to save project: ' + saveError.message);
            }

            // Update project with published URL
            const { error: updateError } = await supabaseClient.updateProjectUrl(
                project.id,
                publishedUrl
            );

            if (updateError) {
                throw new Error('Failed to update project URL: ' + updateError.message);
            }

            this.projectData.publishedUrl = publishedUrl;
            if (plan === 'free') {
                this.projectData.publicSlug = slug;
            } else {
                this.projectData.subdomainSlug = slug;
            }
            this.saveProject(); // Save to localStorage as well

            // Create deployment record
            await supabaseClient.client
                .from('deployments')
                .insert({
                    project_id: project.id,
                    user_id: supabaseClient.currentUser.id,
                    deployment_url: publishedUrl,
                    status: 'ready'
                });

            // Show professional popup with the URL
            showPublishPopup(publishedUrl, plan);
            this.showToast('🚀 Website published!', 'success');

        } catch (error) {
            console.error('Publish error:', error);
            this.showToast('❌ Failed to publish: ' + error.message, 'error');
        }
    }

    async updateExistingProject() {
        try {
            this.showToast('Updating your website...', 'info');

            // Update the existing project in the database
            const { error: updateError } = await supabaseClient.client
                .from('projects')
                .update({
                    html: this.currentHTML,
                    name: this.projectData.name,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.projectData.id)
                .eq('user_id', supabaseClient.currentUser.id);

            if (updateError) {
                throw new Error('Failed to update project: ' + updateError.message);
            }

            // Save to localStorage
            this.saveProject();

            // Create a new deployment record
            const { data: project } = await supabaseClient.client
                .from('projects')
                .select('published_url, plan, subdomain_slug')
                .eq('id', this.projectData.id)
                .single();

            if (project) {
                await supabaseClient.client
                    .from('deployments')
                    .insert({
                        project_id: this.projectData.id,
                        user_id: supabaseClient.currentUser.id,
                        deployment_url: project.published_url,
                        status: 'ready'
                    });

                // Show success popup with the URL
                showPublishPopup(project.published_url, project.plan || 'free');
                this.showToast('✅ Website updated successfully!', 'success');
            }

        } catch (error) {
            console.error('Update error:', error);
            this.showToast('❌ Failed to update: ' + error.message, 'error');
        }
    }

    async publishWithPlan(plan) {
        try {
            this.showToast('Publishing your website...', 'info');

            // Generate subdomain slug from project name
            // Generate unique subdomain slug
            const subdomainSlug = await this.generateUniqueSubdomainSlug(this.projectData.name);

            // Save project to database with subdomain_slug
            const { data: project, error: saveError } = await supabaseClient.saveProject({
                name: this.projectData.name,
                html: this.currentHTML,
                plan: plan,
                subdomain_slug: subdomainSlug
            });

            if (saveError) {
                throw new Error('Failed to save project: ' + saveError.message);
            }

            // Generate deployment URL based on plan
            let publishedUrl;

            if (plan === 'free' || plan === 'starter') {
                // FREE & STARTER: Use subdomain
                publishedUrl = `https://${subdomainSlug}.yenze.io`;
            } else if (plan === 'pro') {
                // PRO: Can use custom domain (to be implemented) or subdomain for now
                publishedUrl = `https://${subdomainSlug}.yenze.io`;
            }

            // Update project with published URL
            const { error: updateError } = await supabaseClient.updateProjectUrl(
                project.id,
                publishedUrl
            );

            if (updateError) {
                throw new Error('Failed to update project URL: ' + updateError.message);
            }

            this.projectData.publishedUrl = publishedUrl;
            this.projectData.subdomainSlug = subdomainSlug;
            this.saveProject(); // Save to localStorage as well

            // Create deployment record
            await supabaseClient.client
                .from('deployments')
                .insert({
                    project_id: project.id,
                    user_id: supabaseClient.currentUser.id,
                    deployment_url: publishedUrl,
                    status: 'ready'
                });

            // Show professional popup with the URL
            showPublishPopup(publishedUrl, plan);
            this.showToast('🚀 Website published!', 'success');

        } catch (error) {
            console.error('Publish error:', error);
            this.showToast('❌ Failed to publish: ' + error.message, 'error');
        }
    }

    generateSubdomainSlug(projectName) {
        // Convert project name to valid subdomain slug
        // Examples:
        // "My Portfolio" → "my-portfolio"
        // "Empresa XYZ!" → "empresa-xyz"
        // "José's Site" → "joses-site"

        return projectName
            .toLowerCase()
            .normalize('NFD') // Normalize accents
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
            .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
            .substring(0, 63); // Max length for subdomain
    }

    async generateUniqueSubdomainSlug(projectName) {
        // Generate base slug from project name
        let baseSlug = this.generateSubdomainSlug(projectName);

        // If slug is empty (project name had no valid chars), use default
        if (!baseSlug) {
            baseSlug = 'project';
        }

        let uniqueSlug = baseSlug;
        let attempt = 1;
        const maxAttempts = 100;

        // Keep trying until we find a unique slug
        while (attempt < maxAttempts) {
            // Check if this slug is available
            const { data: existing } = await supabaseClient.client
                .from('projects')
                .select('id')
                .eq('subdomain_slug', uniqueSlug)
                .neq('id', this.projectData.id || 'none')
                .single();

            if (!existing) {
                // Slug is available!
                if (attempt > 1) {
                    // Show message that we auto-generated a unique slug
                    this.showToast(`Project name was modified to "${uniqueSlug}" to ensure uniqueness`, 'info');
                }
                return uniqueSlug;
            }

            // Slug is taken, try adding a number
            attempt++;
            uniqueSlug = `${baseSlug}-${attempt}`;
        }

        // If we couldn't find a unique slug after 100 attempts, use timestamp
        const timestamp = Date.now().toString().slice(-6);
        uniqueSlug = `${baseSlug}-${timestamp}`;
        this.showToast(`Project name was modified to "${uniqueSlug}" to ensure uniqueness`, 'info');

        return uniqueSlug;
    }

    handleAssetUpload(files) {
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const asset = {
                    name: file.name,
                    url: e.target.result,
                    type: file.type
                };
                this.projectData.assets.push(asset);
                this.renderAssets();
                this.saveProject();
            };
            reader.readAsDataURL(file);
        });
    }

    renderAssets() {
        const assetsList = document.getElementById('assetsList');
        assetsList.innerHTML = '';

        this.projectData.assets.forEach((asset, index) => {
            const assetEl = document.createElement('div');
            assetEl.style.cssText = `
                background: var(--bg);
                border: 1px solid var(--border);
                border-radius: 6px;
                padding: 0.5rem;
                margin-bottom: 0.5rem;
                cursor: pointer;
                transition: all 0.15s;
            `;
            assetEl.innerHTML = `
                <img src="${asset.url}" style="width: 100%; border-radius: 4px; margin-bottom: 0.5rem;">
                <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${asset.name}</div>
            `;

            assetEl.addEventListener('mouseenter', () => {
                assetEl.style.background = 'var(--bg-secondary)';
                assetEl.style.borderColor = 'var(--accent)';
            });

            assetEl.addEventListener('mouseleave', () => {
                assetEl.style.background = 'var(--bg)';
                assetEl.style.borderColor = 'var(--border)';
            });

            assetEl.addEventListener('click', () => {
                navigator.clipboard.writeText(asset.url);
                this.showToast('📋 Asset URL copied!', 'success');
            });

            assetsList.appendChild(assetEl);
        });
    }

    saveProject() {
        localStorage.setItem('yenzeProject', JSON.stringify(this.projectData));
    }

    async loadProject() {
        // Check if there's a project ID in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('project');
        const isNewProject = urlParams.get('new') === 'true';
        const isPasteMode = urlParams.get('paste') === 'true';
        const templateId = urlParams.get('template');
        const templateName = urlParams.get('templateName');
        const isImportMode = urlParams.get('import') === 'true';

        console.log('[LoadProject] Project ID from URL:', projectId);
        console.log('[LoadProject] New project flag:', isNewProject);
        console.log('[LoadProject] Paste mode:', isPasteMode);
        console.log('[LoadProject] Template ID from URL:', templateId);
        console.log('[LoadProject] Template Name from URL:', templateName);

        // Check for template ID from URL (new cross-domain approach)
        if (templateId && templateId !== 'true') {
            console.log('[LoadProject] Loading template from URL:', templateId);

            try {
                // Fetch the template HTML from the templates folder
                const response = await fetch(`https://yenze.io/templates/${templateId}.html?v=20241219-4`);

                if (!response.ok) {
                    throw new Error(`Failed to load template: ${response.status}`);
                }

                const templateHTML = await response.text();
                console.log('[LoadProject] Template loaded, size:', templateHTML.length, 'bytes');

                // Clear existing project to start fresh
                localStorage.removeItem('yenzeProject');

                // Load the template HTML
                this.projectData = {
                    name: decodeURIComponent(templateName || 'Template Website'),
                    html: templateHTML,
                    assets: [],
                    publishedUrl: null
                };

                document.getElementById('projectName').value = this.projectData.name;
                this.loadHTML(templateHTML);
                this.showToast('🎨 Template loaded! Customize it to your needs.', 'success');

                // Remove the template parameter from URL
                window.history.replaceState({}, '', window.location.pathname);
                return;
            } catch (error) {
                console.error('[LoadProject] Failed to load template:', error);
                this.showToast('❌ Failed to load template. Please try again.', 'error');
            }
        }

        // Check for imported HTML from prompt generator
        if (isImportMode && localStorage.getItem('yenze_imported_code')) {
            const importedHTML = localStorage.getItem('yenze_imported_code');
            console.log('[LoadProject] Loading imported HTML from prompt generator');

            // Clear the imported HTML from localStorage
            localStorage.removeItem('yenze_imported_code');
            localStorage.removeItem('yenze_load_import');

            // Clear existing project to start fresh
            localStorage.removeItem('yenzeProject');

            // Load the imported HTML
            this.projectData = {
                name: 'Imported Website',
                html: importedHTML,
                assets: [],
                publishedUrl: null
            };

            document.getElementById('projectName').value = this.projectData.name;
            this.loadHTML(importedHTML);
            this.showToast('✨ Code imported successfully!', 'success');

            // Remove the import parameter from URL
            window.history.replaceState({}, '', window.location.pathname);
            return;
        }

        // Check for pasted HTML from landing page
        if (isPasteMode && localStorage.getItem('pastedHTML')) {
            const pastedHTML = localStorage.getItem('pastedHTML');
            const timestamp = localStorage.getItem('pastedHTML_timestamp');
            console.log('[LoadProject] Loading pasted HTML from landing page');

            // Clear the pasted HTML from localStorage
            localStorage.removeItem('pastedHTML');
            localStorage.removeItem('pastedHTML_timestamp');

            // Clear existing project to start fresh
            localStorage.removeItem('yenzeProject');

            // Load the pasted HTML
            this.projectData = {
                name: 'Pasted Website',
                html: pastedHTML,
                assets: [],
                publishedUrl: null
            };

            document.getElementById('projectName').value = this.projectData.name;
            this.loadHTML(pastedHTML);
            this.showToast('✨ HTML loaded! Ready to customize.', 'success');

            // Remove the paste parameter from URL
            window.history.replaceState({}, '', window.location.pathname);
            return;
        }

        // If new project flag is set, clear everything and start fresh
        if (isNewProject) {
            console.log('[LoadProject] Creating new project from scratch');
            console.log('[LoadProject] Current user:', supabaseClient.currentUser?.email || 'Not logged in');
            localStorage.removeItem('yenzeProject');
            this.currentHTML = '';
            this.projectData = {
                name: 'My Website',
                html: '',
                assets: [],
                publishedUrl: null
            };
            document.getElementById('projectName').value = this.projectData.name;
            this.renderPreview();
            return;
        }

        if (projectId) {
            // Load project from public API (no authentication required)
            try {
                console.log('[LoadProject] Fetching project from API...');

                const response = await fetch(`/api/get-project?id=${encodeURIComponent(projectId)}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('[LoadProject] API error:', errorData);
                    throw new Error(errorData.error || 'Failed to load project');
                }

                const result = await response.json();
                console.log('[LoadProject] API response:', result);

                if (!result.success || !result.project) {
                    throw new Error('Invalid API response');
                }

                const project = result.project;

                if (project) {
                    console.log('[LoadProject] Project loaded successfully:', project.name);

                    this.projectData = {
                        id: project.id,
                        name: project.name || 'Untitled Project',
                        html: project.html || '',
                        assets: project.assets || []
                    };

                    document.getElementById('projectName').value = this.projectData.name;

                    if (this.projectData.html) {
                        console.log('[LoadProject] Loading HTML into canvas...');
                        this.loadHTML(this.projectData.html);
                    } else {
                        console.warn('[LoadProject] Project has no HTML content');
                    }

                    if (this.projectData.assets.length > 0) {
                        this.renderAssets();
                    }

                    // Save to localStorage for future edits
                    localStorage.setItem('yenzeProject', JSON.stringify(this.projectData));

                    this.showToast('Project loaded successfully', 'success');
                    return;
                }
            } catch (error) {
                console.error('Error loading project from database:', error);
                this.showToast('Failed to load project', 'error');
            }
        }

        // Fall back to loading from localStorage
        const saved = localStorage.getItem('yenzeProject');
        if (saved) {
            this.projectData = JSON.parse(saved);
            document.getElementById('projectName').value = this.projectData.name;

            if (this.projectData.html) {
                this.loadHTML(this.projectData.html);
            }

            if (this.projectData.assets.length > 0) {
                this.renderAssets();
            }
        }
    }

    // Utility functions
    rgbToHex(rgb) {
        if (rgb.startsWith('#')) return rgb;

        // Check for transparent
        if (rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') {
            return '#ffffff';  // Default to white for transparent
        }

        const values = rgb.match(/[\d.]+/g);
        if (!values) return '#ffffff';

        // Check if alpha channel is 0 (transparent)
        if (values.length === 4 && parseFloat(values[3]) === 0) {
            return '#ffffff';  // Transparent, return white
        }

        return '#' + values.slice(0, 3).map(x => {
            const hex = parseInt(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    showToast(message, type = 'success') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 4000);
    }

}

// Initialize app
// Make app globally accessible for auth-ui integration
// Note: init() will be called from builder.html after DOM is ready
const app = new YenzeBuilder();
window.app = app;

// Listen for authentication events
window.addEventListener('auth-change', (e) => {
    const { event } = e.detail;

    console.log('[Auth Event]', event, 'pendingPublish:', app.pendingPublish);

    // If user just signed in and was trying to publish, show pricing modal
    if (event === 'SIGNED_IN' && app.pendingPublish) {
        console.log('[Auth Event] Showing pricing modal after login');
        app.pendingPublish = false; // Reset flag
        // Small delay to let auth modal close
        setTimeout(() => {
            app.showPublishOptionsModal();
        }, 300);
    }
});
