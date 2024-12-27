'use client';

import ConnectButton from './ConnectButton';

export default function NavBar() {
  return (
    <nav className="border-b border-solid border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left side - Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a 
              href="https://phylax.systems" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Phylax Systems Inc.
            </a>
          </div>

          {/* Right side - External links and Connect button */}
          <div className="flex items-center space-x-6">
            <a
              href="https://github.com/kamwithak/phylax-tx-decoder"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              GitHub
            </a>
            <a
              href="https://x.com/phylaxsystems"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Twitter
            </a>
            <a
              href="https://phylax.systems/blog/phylax-systems-raises-a-4-5mm-pre-seed-to-back-credible-security"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Blog
            </a>
            
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}