import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Logo } from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <Logo size="md" variant="white" />
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Connecting you with trusted local service providers. Quality
              services at your doorstep.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="hover:text-blue-400 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="hover:text-blue-400 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="hover:text-blue-400 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="hover:text-blue-400 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services" className="hover:text-blue-400 transition-colors text-sm">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link href="/providers" className="hover:text-blue-400 transition-colors text-sm">
                  Find Providers
                </Link>
              </li>
              <li>
                <Link href="/auth/signup?role=provider" className="hover:text-blue-400 transition-colors text-sm">
                  Become a Provider
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-400 transition-colors text-sm">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services?category=PLUMBER" className="hover:text-blue-400 transition-colors">
                  Plumbing
                </Link>
              </li>
              <li>
                <Link href="/services?category=ELECTRICIAN" className="hover:text-blue-400 transition-colors">
                  Electrical
                </Link>
              </li>
              <li>
                <Link href="/services?category=CLEANER" className="hover:text-blue-400 transition-colors">
                  Cleaning
                </Link>
              </li>
              <li>
                <Link href="/services?category=TECHNICIAN" className="hover:text-blue-400 transition-colors">
                  Tech Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <a href="mailto:support@karigar.com" className="hover:text-blue-400 transition-colors">
                  support@karigar.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <a href="tel:+1234567890" className="hover:text-blue-400 transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5" />
                <span>123 Service Street, City, Country</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Karigar. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-blue-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
