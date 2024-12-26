'use client';

export default function NavBar() {
  return (
    <nav className="border-b dark:border-gray-800 bg-white dark:bg-gray-900">
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
              Phylax Systems
            </a>
          </div>

          {/* Right side - External links */}
          <div className="flex items-center space-x-6">
            <a
              href="https://github.com/phylax-systems"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              GitHub
            </a>
            <a
              href="https://twitter.com/phylax_systems"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Twitter
            </a>
            <a
              href="https://docs.phylax.systems"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Docs
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}