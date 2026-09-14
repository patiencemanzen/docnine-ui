import { Github, MessageSquare, Twitter } from "@/components/icons"
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'
import { ApplicationLogo } from './application-logo';

export function Footer() {
    return (
        <footer className="relative z-10 border-t border-border bg-background py-16 px-4">
            <div className="container mx-auto max-w-6xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-12 mb-16">
                    <div className="sm:col-span-2 md:col-span-2">
                        <div className="flex items-center mb-6">
                            <ApplicationLogo className='!h-9' />
                        </div>
                        <p className="text-muted-foreground leading-relaxed max-w-sm mb-6">
                            Clear, up-to-date documentation for teams who ship fast.
                        </p>

                        {/* Email Subscribe */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-sm">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 h-10 px-4 rounded-full border border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-10 px-5 text-sm font-semibold shrink-0">
                                Subscribe
                            </Button>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm text-foreground mb-6">Navigation</h4>
                        <ul className="space-y-3 text-muted-foreground text-sm">
                            <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
                            <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                            <li><Link to="/docs" className="hover:text-foreground transition-colors">Documentation</Link></li>
                            <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm text-foreground mb-6">Features</h4>
                        <ul className="space-y-3 text-muted-foreground text-sm">
                            <li><a href="/#features" className="hover:text-foreground transition-colors">AI doc generation</a></li>
                            <li><a href="/#features" className="hover:text-foreground transition-colors">Chat with your codebase</a></li>
                            <li><a href="/#features" className="hover:text-foreground transition-colors">Integrations</a></li>
                            <li><a href="/#features" className="hover:text-foreground transition-colors">Exports</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm text-foreground mb-6">Support</h4>
                        <ul className="space-y-3 text-muted-foreground text-sm">
                            <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
                            <li><a href="https://github.com/docnineai" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">GitHub</a></li>
                            <li><a href="https://discord.gg/docnineai" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">Community</a></li>
                            <li><Link to="/contact" className="hover:text-foreground transition-colors">Help Center</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} Docnine, Seablings Technology. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Use</Link>
                        <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
