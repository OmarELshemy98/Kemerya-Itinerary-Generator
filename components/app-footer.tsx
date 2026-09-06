import React from 'react';
import Link from 'next/link';

export const AppFooter = () => {
  return (
    <footer className="bg-gray-100 py-6 px-4 mt-auto">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-700">Customer Support: <a href="tel:01275050450" className="text-blue-600 hover:underline">01275050450</a></p>
            <p className="text-gray-700">
              Developed by <Link href="https://omarelshemy.com" className="text-blue-600 hover:underline">Omar Elshemy</Link>
            </p>
          </div>
          <div className="flex space-x-4">
            <a href="https://facebook.com/kemerya" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-600">
              Facebook
            </a>
            <a href="https://instagram.com/kemerya" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-600">
              Instagram
            </a>
            <a href="https://youtube.com/kemerya" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-600">
              YouTube
            </a>
            <a href="https://twitter.com/kemerya" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-600">
              Twitter
            </a>
            <a href="https://g.page/kemerya" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-600">
              Google Business
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;