"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

export default function CustomerFooter() {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="bg-card border-t border-border py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-bold text-customer-primary mb-4">Eventify</h3>
            <p className="text-muted-foreground mb-4">
              Your premier platform for discovering and managing event tickets. 
              Join thousands of event enthusiasts and never miss out on amazing experiences.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com/eventify" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-customer-primary transition-colors"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a 
                href="https://twitter.com/eventify" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-customer-primary transition-colors"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a 
                href="https://instagram.com/eventify" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-customer-primary transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">QUICK LINKS</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/events" className="text-muted-foreground hover:text-customer-primary transition-colors">
                  Browse Events
                </Link>
              </li>
              {isAuthenticated ? (
                <li>
                  <Link href="/tickets" className="text-muted-foreground hover:text-customer-primary transition-colors">
                    My Tickets
                  </Link>
                </li>
              ) : (
                <li>
                  <Link href="/auth/signin" className="text-muted-foreground hover:text-customer-primary transition-colors">
                    Sign In
                  </Link>
                </li>
              )}
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-customer-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-muted-foreground hover:text-customer-primary transition-colors">
                  Support
                </Link>
              </li>
              {!isAuthenticated && (
                <li>
                  <Link href="/auth/signup" className="text-muted-foreground hover:text-customer-primary transition-colors">
                    Create Account
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">CONTACT US</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-customer-primary" />
                <a href="mailto:support@eventify.com" className="hover:text-customer-primary transition-colors">
                  support@eventify.com
                </a>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-customer-primary" />
                <a href="tel:+15551234567" className="hover:text-customer-primary transition-colors">
                  +1 (555) 123-4567
                </a>
              </li>
              <li className="flex items-start space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-customer-primary mt-0.5" />
                <span>123 Event Street<br />San Francisco, CA 94102</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Eventify. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center md:justify-end space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-muted-foreground hover:text-customer-primary text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-customer-primary text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-muted-foreground hover:text-customer-primary text-sm transition-colors">
              Cookie Policy
            </Link>
            <Link href="/accessibility" className="text-muted-foreground hover:text-customer-primary text-sm transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}