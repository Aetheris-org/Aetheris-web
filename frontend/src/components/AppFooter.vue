<template>
    <div class="footer-wrapper">
        <!-- Main footer content -->
        <div class="footer-main">
            <div class="footer-container">
                <!-- Left section: Brand and Social -->
                <div class="footer-left">
                    <div class="brand-section">
                        <div class="logo-container">
                            <img src="/logo.svg" alt="Logo" class="ae-logo-footer">
                        </div>
                        <div class="brand-text">
                            <h2 class="site-title">Aetheris Community</h2>
                            <p class="tagline">Eternity in our hands</p>
                        </div>
                    </div>
                    
                    <div class="social-section">
                        <a href="https://github.com/Aetheris-Community" class="social-icon-link" target="_blank" rel="noopener noreferrer" title="GitHub" aria-label="GitHub">
                            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" fill="currentColor"/>
                            </svg>
                        </a>
                        <a href="https://discord.gg/XUFmR4bDMw" class="social-icon-link" target="_blank" rel="noopener noreferrer" title="Discord" aria-label="Discord">
                            <img class="social-icon discord-icon" :src="discordIcon" alt="Discord">
                        </a>
                        <a href="https://t.me/AetherisNews" class="social-icon-link" target="_blank" rel="noopener noreferrer" title="Telegram" aria-label="Telegram">
                            <img class="social-icon telegram-icon" :src="telegramIcon" alt="Telegram">
                        </a>
                        <a href="https://boosty.to/aetheris" class="social-icon-link" target="_blank" rel="noopener noreferrer" title="Boosty" aria-label="Boosty">
                            <img class="social-icon boosty-icon" :src="boostyIcon" alt="Boosty">
                        </a>
                    </div>
                    
                    <div class="copyright-section">
                        <span class="copyright-text">© 2025 Aetheris Community</span>
                    </div>
                </div>

                <!-- Right section: Navigation columns -->
                <div class="footer-right">
                    <!-- Platform column -->
                    <div class="footer-column">
                        <h4 class="column-title">Platform</h4>
                        <ul class="column-links">
                            <li><router-link to="/" class="column-link">Articles</router-link></li>
                            <li><router-link to="/create-article" class="column-link">Create Article</router-link></li>
                            <li><router-link to="/profile" class="column-link">Profile</router-link></li>
                            <li><router-link to="/settings/profile" class="column-link">Settings</router-link></li>
                        </ul>
                    </div>

                    <!-- Developers column -->
                    <div class="footer-column">
                        <h4 class="column-title">Developers</h4>
                        <ul class="column-links">
                            <li><a href="https://github.com/Aetheris-Community" class="column-link external-link" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                            <li><router-link to="/faq/help" class="column-link">Documentation</router-link></li>
                            <li><router-link to="/faq" class="column-link">FAQ</router-link></li>
                            <li><router-link to="/news" class="column-link">News</router-link></li>
                        </ul>
                    </div>

                    <!-- Community column -->
                    <div class="footer-column">
                        <h4 class="column-title">Community</h4>
                        <ul class="column-links">
                            <li><a href="https://discord.gg/XUFmR4bDMw" class="column-link external-link" target="_blank" rel="noopener noreferrer">Discord</a></li>
                            <li><a href="https://t.me/AetherisNews" class="column-link external-link" target="_blank" rel="noopener noreferrer">Telegram</a></li>
                            <li><a href="https://boosty.to/aetheris" class="column-link external-link" target="_blank" rel="noopener noreferrer">Boosty</a></li>
                            <li><router-link to="/faq/help" class="column-link">Help Center</router-link></li>
                        </ul>
                    </div>

                    <!-- Company column -->
                    <div class="footer-column">
                        <h4 class="column-title">Company</h4>
                        <ul class="column-links">
                            <li><router-link to="/legal/terms-of-use" class="column-link">Terms</router-link></li>
                            <li><router-link to="/legal/privacy-policy" class="column-link">Privacy</router-link></li>
                            <li><router-link to="/legal/content-rules" class="column-link">Content Rules</router-link></li>
                            <li><router-link to="/legal/copyright-policy" class="column-link">Copyright</router-link></li>
                            <li><router-link to="/legal/community-rules" class="column-link">Community Rules</router-link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import discordIcon from '../assets/imgs/discord_ico.png';
import telegramIcon from '../assets/imgs/telegram_ico.png';
import boostyIcon from '../assets/imgs/boosty_ico.png';
</script>

<style lang="scss">
.footer-wrapper {
    width: 100%;
    max-width: 100%;
    position: relative;
    background: var(--bg-primary);
    overflow: visible;
    z-index: 1;
    margin-top: 0;
    display: block;
    margin-left: auto;
    margin-right: auto;
}

/* Main footer section */
.footer-main {
    background: var(--bg-primary);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    padding: 96px 0 32px;
    position: relative;
    z-index: 3;
}

.footer-container {
    max-width: 100%;
    margin: 0 auto;
    /* Match app-wrapper/header horizontal paddings */
    padding: 0 20px;
    display: flex;
    gap: 80px;
    align-items: flex-start;
    justify-content: flex-start;
    min-height: 400px;
    
    @media (max-width: 1024px) {
        flex-direction: column;
        gap: 48px;
        padding: 0 20px;
        min-height: auto;
        align-items: flex-start;
    }
    
    @media (max-width: 768px) {
        gap: 40px;
        padding: 0 16px;
        min-height: auto;
        align-items: flex-start;
    }

    /* Desktop small: 1025-1440px */
    @media (min-width: 1025px) and (max-width: 1440px) {
        padding: 0 24px;
    }

    /* Desktop medium: 1441-1920px */
    @media (min-width: 1441px) and (max-width: 1920px) {
        padding: 0 28px;
    }

    /* Large screens: 1921px+ */
    @media (min-width: 1921px) {
        padding: 0 32px;
    }
}

/* Left section: Brand and Social */
.footer-left {
    flex: 0 0 auto;
    min-width: 280px;
    max-width: 320px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    
    @media (max-width: 1024px) {
        min-width: auto;
        max-width: none;
        width: 100%;
    }
}

.brand-section {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 32px;
    min-height: 80px;
    
    @media (max-width: 768px) {
        min-height: 70px;
    }
}

.brand-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-left: 92px;
    
    @media (max-width: 768px) {
        margin-left: 72px;
    }
}

.logo-container {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
}

.ae-logo-footer {
    width: 70px;
    height: 70px;
    position: relative;
    z-index: 2;
    /* Let themes control logo via asset itself; avoid forced invert */
    filter: var(--footer-logo-filter, none);
    
    @media (max-width: 768px) {
        width: 60px;
        height: 60px;
    }
}

.site-title {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    font-size: 24px;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
    line-height: 1.2;
    text-align: left;
}

.tagline {
    font-family: var(--font-primary, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: 18px;
    font-weight: 400;
    color: var(--text-secondary);
    margin: 0;
    opacity: 0.95;
    line-height: 1.4;
    text-align: left;
}

/* Social section */
.social-section {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 20px;
    margin-bottom: 32px;
    
    @media (max-width: 768px) {
        gap: 24px;
    }
}

.social-icon-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    color: var(--text-primary);
    position: relative;
    border-radius: 50%;
    border: 3px solid transparent;
    transition: opacity 0.2s ease, background-color 0.2s ease;
    overflow: visible;
    
    &::after {
        content: '';
        position: absolute;
        top: -3px;
        left: -3px;
        width: calc(100% + 6px);
        height: calc(100% + 6px);
        border-radius: 50%;
        border: 3px solid rgba(255, 255, 255, 0.18);
        clip-path: inset(100% 0 0 0);
        transition: clip-path 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 0;
        pointer-events: none;
    }
    
    svg,
    .social-icon {
        position: relative;
        z-index: 1;
        transition: opacity 0.2s ease, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    svg {
        width: 34px;
        height: 34px;
        color: var(--text-primary);
    }
    
    &:hover {
        opacity: 1;
        
        &::after {
            clip-path: inset(0 0 0 0);
        }
        
        svg,
        .social-icon {
            opacity: 1;
            transform: scale(0.85);
        }
    }
}

.social-icon {
    width: 34px;
    height: 34px;
    transition: opacity 0.2s ease;
    /* Adapt bitmap icons to theme using CSS filters */
    filter: var(--footer-social-filter, none);
    position: relative;
    z-index: 1;
}



/* Copyright section */
.copyright-section {
    margin-top: auto;
}

.copyright-text {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    font-size: 18px;
    color: var(--text-secondary);
    opacity: 0.9;
    margin: 0;
    text-align: left;
}

/* Right section: Navigation columns */
.footer-right {
    display: flex;
    gap: 96px;
    flex: 1;
    width: 100%;
    justify-content: flex-start;
    align-items: flex-start;
    
    @media (max-width: 1024px) {
        width: 100%;
        justify-content: flex-start;
        gap: 64px;
    }
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 28px;
        align-items: flex-start;
    }
}

.footer-column {
    flex: 0 0 auto;
    min-width: 140px;
    text-align: left;
    
    @media (max-width: 768px) {
        width: 100%;
    }
}

.column-title {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 22px 0;
    line-height: 1.4;
    letter-spacing: 0.01em;
    text-align: left;
}

.column-links {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
}

.column-link {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    font-size: 18px;
    font-weight: 500;
    color: var(--text-secondary);
    text-decoration: none;
    transition: opacity 0.2s ease;
    line-height: 1.5;
    display: inline-block;
    opacity: 1;
    text-align: left;
    position: relative;
    
    &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 0;
        height: 1px;
        background-color: var(--text-secondary) !important;
        transition: width 0.3s ease;
    }
    
    &:hover {
        opacity: 1;
        color: var(--text-primary) !important;
        
        &::after {
            width: 100%;
            background-color: rgba(255, 255, 255, 0.9) !important;
            transition: width 0.3s ease;
        }
    }
    
    &.external-link {
        position: relative;
    }
}

/* Force white underline for all dark themes - override any router-link styles */
:root[data-theme='oled'] .footer-wrapper .column-link:hover::after,
:root[data-theme='oled'] .footer-wrapper a.column-link:hover::after,
:root[data-theme='oled'] .footer-wrapper router-link.column-link:hover::after,
:root[data-theme='oled'] .footer-wrapper .column-link.router-link-active:hover::after,
:root[data-theme='oled'] .footer-wrapper .column-link.router-link-exact-active:hover::after,
:root[data-theme='night-dark'] .footer-wrapper .column-link:hover::after,
:root[data-theme='night-dark'] .footer-wrapper a.column-link:hover::after,
:root[data-theme='night-dark'] .footer-wrapper router-link.column-link:hover::after,
:root[data-theme='night-dark'] .footer-wrapper .column-link.router-link-active:hover::after,
:root[data-theme='night-dark'] .footer-wrapper .column-link.router-link-exact-active:hover::after,
:root[data-theme='system'] .footer-wrapper .column-link:hover::after,
:root[data-theme='system'] .footer-wrapper a.column-link:hover::after,
:root[data-theme='system'] .footer-wrapper router-link.column-link:hover::after,
:root[data-theme='system'] .footer-wrapper .column-link.router-link-active:hover::after,
:root[data-theme='system'] .footer-wrapper .column-link.router-link-exact-active:hover::after,
.footer-wrapper .column-link:hover::after,
.footer-wrapper a.column-link:hover::after,
.footer-wrapper router-link.column-link:hover::after,
.footer-wrapper .column-link.router-link-active:hover::after,
.footer-wrapper .column-link.router-link-exact-active:hover::after,
.footer-wrapper a.column-link.router-link-active:hover::after,
.footer-wrapper a.column-link.router-link-exact-active:hover::after {
    background-color: rgba(255, 255, 255, 0.9) !important;
}

/* Improve link hover contrast specifically for white theme */
:root[data-theme='white'] .footer-wrapper .column-link:hover,
:root[data-theme='white'] .footer-wrapper a.column-link:hover,
:root[data-theme='white'] .footer-wrapper router-link.column-link:hover,
:root[data-theme='white'] .footer-wrapper .column-link.router-link-active:hover,
:root[data-theme='white'] .footer-wrapper .column-link.router-link-exact-active:hover { 
    color: rgba(17, 24, 39, 0.95) !important; 
}
:root[data-theme='white'] .footer-wrapper .column-link:hover::after,
:root[data-theme='white'] .footer-wrapper a.column-link:hover::after,
:root[data-theme='white'] .footer-wrapper router-link.column-link:hover::after,
:root[data-theme='white'] .footer-wrapper .column-link.router-link-active:hover::after,
:root[data-theme='white'] .footer-wrapper .column-link.router-link-exact-active:hover::after,
:root[data-theme='white'] .footer-wrapper a.column-link.router-link-active:hover::after,
:root[data-theme='white'] .footer-wrapper a.column-link.router-link-exact-active:hover::after { 
    background-color: rgba(17, 24, 39, 0.95) !important; 
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
    .social-icon-link:hover,
    .column-link:hover {
        transition: none;
    }
}

/* Theme adaptations for icon bitmaps and borders */
/* Respect app theme attribute rather than OS preference */
:root[data-theme='white'] .footer-wrapper {
    --footer-social-filter: brightness(0) saturate(100%);
    --footer-logo-filter: none;
}

:root[data-theme='white'] .footer-main {
    background: var(--bg-primary);
}

:root[data-theme='oled'] .footer-wrapper,
:root[data-theme='night-dark'] .footer-wrapper,
:root[data-theme='system'] .footer-wrapper {
    --footer-social-filter: brightness(0) invert(1);
    --footer-logo-filter: none;
}

:root[data-theme='white'] .social-icon-link::after { border-color: rgba(0, 0, 0, 0.8); }
:root[data-theme='oled'] .social-icon-link::after,
:root[data-theme='night-dark'] .social-icon-link::after,
:root[data-theme='system'] .social-icon-link::after { border-color: rgba(255, 255, 255, 0.8); }

/* Stronger hover states for white theme (buttons visible) */
:root[data-theme='white'] .footer-wrapper .social-icon-link:hover {
    background-color: rgba(0, 0, 0, 0.06);
}

:root[data-theme='white'] .footer-wrapper .social-icon-link:hover::after {
    border-color: rgba(0, 0, 0, 0.95);
}

/* Hover background for dark themes */
:root[data-theme='oled'] .footer-wrapper .social-icon-link:hover,
:root[data-theme='night-dark'] .footer-wrapper .social-icon-link:hover,
:root[data-theme='system'] .footer-wrapper .social-icon-link:hover {
    background-color: rgba(255, 255, 255, 0.08);
}
</style>