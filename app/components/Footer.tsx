export default function Footer() {
  return (
    <footer className="sticky bottom-0 border-t border-solid border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
      <div className="mx-auto px-6 py-2 mb-[2px]">
        <div className="flex justify-end items-center">
          <div className="ml-auto">
            <span className="text-gray-600 dark:text-gray-400">
              Developed by{" "}
              <a
                href="https://github.com/kamwithak"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Kamran Choudhry
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
