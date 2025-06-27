'use client';

import Link from 'next/link';
import { Github, Linkedin, Mail, Twitter, Code, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Navigation',
      links: [

      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'GitHub', href: 'https://github.com/Al-Edrisy/ai-recipe-recommender' },
        { label: 'LinkedIn', href: 'https://linkedin.com/in/salih-otman-a565a2242' }
      ],
    }
  ];

  return (
    <footer className="m-auto border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 py-12 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-primary">
              <Code className="h-5 w-5" />
              <Briefcase className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">AI Recipe Recommender</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discover personalized recipes powered by AI. Built for food lovers and developers.
            </p>

            {/* Social Links */}
            <div className="flex gap-2 mt-4">
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://github.com/Al-Edrisy"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="transition-colors hover:text-primary"
                >
                  <Github className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://linkedin.com/in/salih-otman-a565a2242"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="transition-colors hover:text-primary"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="mailto:hello@saliho.com"
                  aria-label="Email"
                  className="transition-colors hover:text-primary"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://twitter.com/saliho"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="transition-colors hover:text-primary"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="text-sm font-semibold tracking-wide text-foreground">{section.title}</h4>
              <div className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="border-t pt-6 text-center text-xs text-muted-foreground">
          <p>
            © {currentYear} Salih Otman. All rights reserved.
            <br />
            Built with Next.js, Tailwind CSS, and shadcn/ui.
          </p>
        </div>
      </div>
    </footer>
  );
}
