import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import footervid from "/assets/footervid.mp4";

const Footer = () => {
  return (
    <footer className="relative text-gray-300 pt-16 pb-8 overflow-hidden">

      <video
        className="absolute top-0 pb-17 left-0 w-full h-full object-fit opacity-40 z-0 hidden sm:block"
        src={footervid}
        autoPlay
        loop
        muted
        playsInline
      ></video>


      <div className="absolute inset-0 bg-black bg-opacity-60 -z-10"></div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 relative z-10">

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">FitN</h2>
          <p className="text-gray-300 mb-4">
            Empowering your fitness journey with premium products and trusted guidance.
          </p>
          <div className="flex space-x-4 mt-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition"><FaFacebookF /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition"><FaInstagram /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition"><FaTwitter /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition"><FaLinkedinIn /></a>
          </div>
        </div>


        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Product Categories</h3>
          <ul className="space-y-2">
            <li><Link to="/Categories" className="hover:text-green-400 transition">Supplements</Link></li>
            <li><Link to="/Categories" className="hover:text-green-400 transition">Protein Bars</Link></li>
            <li><Link to="/Categories" className="hover:text-green-400 transition">Energy Drinks</Link></li>
            <li><Link to="/Categories" className="hover:text-green-400 transition">Fitness Equipment</Link></li>
            <li><Link to="/Categories" className="hover:text-green-400 transition">Accessories</Link></li>
          </ul>
        </div>


        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link to="/About" className="hover:text-green-400 transition">About Us</Link></li>
            <li><Link to="/Contact" className="hover:text-green-400 transition">Contact</Link></li>
            <li><Link to="#" className="hover:text-green-400 transition">Privacy Policy</Link></li>
            <li><Link to="#" className="hover:text-green-400 transition">Terms of Service</Link></li>
            <li><Link to="#" className="hover:text-green-400 transition">FAQs</Link></li>
          </ul>
        </div>


        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
          <ul className="space-y-2 text-gray-300">
            <li>📍 673642, Malappuram, Kerala</li>
            <li>📞 +91 98765 43210</li>
            <li>✉️ support@fitn.com</li>
          </ul>
        </div>
      </div>


      <div className="border-t border-gray-700 mt-12 pt-6 text-center text-sm text-gray-400 relative z-10">
        <p>© 2025 FITiN. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;