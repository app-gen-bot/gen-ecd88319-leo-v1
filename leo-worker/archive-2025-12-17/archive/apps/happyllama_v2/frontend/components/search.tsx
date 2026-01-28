'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'Page' | 'Resource' | 'FAQ' | 'Documentation' | 'Video' | 'Template';
  icon?: string;
}

// Mock search data - in real app this would come from a search API
const searchData: SearchResult[] = [
  // Pages
  { id: '1', title: 'How It Works', description: 'Learn about our 4-stage AI development process', url: '/how-it-works', category: 'Page', icon: '🔧' },
  { id: '2', title: "Why It's Different", description: 'See what makes Happy Llama unique', url: '/why-different', category: 'Page', icon: '✨' },
  { id: '3', title: 'For Builders', description: 'Resources and tools for developers', url: '/for-builders', category: 'Page', icon: '👨‍💻' },
  { id: '4', title: 'For Enterprises', description: 'Enterprise solutions and security', url: '/for-enterprises', category: 'Page', icon: '🏢' },
  { id: '5', title: 'Investors', description: 'Investment information and metrics', url: '/investors', category: 'Page', icon: '📈' },
  { id: '6', title: 'Beta Signup', description: 'Join our beta program', url: '/beta-signup', category: 'Page', icon: '🚀' },
  
  // Resources
  { id: '7', title: 'AI Development Whitepaper', description: 'The Future of AI-Powered Development', url: '/download/ai-development-whitepaper', category: 'Resource', icon: '📄' },
  { id: '8', title: 'Enterprise Security Guide', description: 'Security implementation guide', url: '/download/enterprise-security-guide', category: 'Resource', icon: '🔒' },
  { id: '9', title: 'ROI Calculator', description: 'Calculate your development ROI', url: '/download/roi-calculator-template', category: 'Resource', icon: '🧮' },
  { id: '10', title: 'Architecture Patterns', description: 'Multi-agent systems research', url: '/download/architecture-patterns-paper', category: 'Resource', icon: '🏗️' },
  
  // Templates
  { id: '11', title: 'SaaS Dashboard Template', description: 'Complete dashboard with analytics', url: '/templates', category: 'Template', icon: '📊' },
  { id: '12', title: 'E-commerce Store Template', description: 'Full online store functionality', url: '/templates', category: 'Template', icon: '🛒' },
  { id: '13', title: 'Blog Platform Template', description: 'Modern blog with CMS features', url: '/templates', category: 'Template', icon: '📝' },
  
  // Videos
  { id: '14', title: 'Getting Started Tutorial', description: 'Learn the basics in 10 minutes', url: '/resources/videos', category: 'Video', icon: '🎥' },
  { id: '15', title: 'AI Agents Explained', description: 'Understanding our architecture', url: '/resources/videos', category: 'Video', icon: '🤖' },
  { id: '16', title: 'SaaS Case Study', description: 'Building a SaaS app walkthrough', url: '/resources/videos', category: 'Video', icon: '📹' },
  
  // FAQ/Documentation
  { id: '17', title: 'What is Happy Llama?', description: 'Basic introduction to our platform', url: '/how-it-works#faq', category: 'FAQ', icon: '❓' },
  { id: '18', title: 'Security & Compliance', description: 'How we keep your data safe', url: '/for-enterprises#security', category: 'FAQ', icon: '🛡️' },
  { id: '19', title: 'Pricing Information', description: 'Cost calculator and pricing tiers', url: '/for-builders#calculator', category: 'FAQ', icon: '💰' },
  { id: '20', title: 'API Documentation', description: 'Technical API reference', url: '/resources/api-reference', category: 'Documentation', icon: '📚' },
];

const categoryColors = {
  'Page': 'bg-blue-100 text-blue-800',
  'Resource': 'bg-green-100 text-green-800',
  'FAQ': 'bg-purple-100 text-purple-800',
  'Documentation': 'bg-orange-100 text-orange-800',
  'Video': 'bg-red-100 text-red-800',
  'Template': 'bg-yellow-100 text-yellow-800'
};

interface SearchProps {
  className?: string;
  placeholder?: string;
  showModal?: boolean;
  onClose?: () => void;
}

export default function Search({ className = '', placeholder = 'Search...', showModal = false, onClose }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(showModal);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Search function
  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const filteredResults = searchData.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8); // Limit to 8 results

    setResults(filteredResults);
    setSelectedIndex(0);
  };

  // Handle input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 150); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % results.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, results, selectedIndex]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
    onClose?.();
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (showModal || isOpen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
        <div ref={modalRef} className="w-full max-w-2xl mx-4">
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center px-4 py-3 border-b">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-3" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages, resources, videos, and more..."
                className="border-none outline-none ring-0 focus-visible:ring-0 text-lg"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="ml-2"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Results */}
            {results.length > 0 && (
              <div className="max-h-80 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    className={`px-4 py-3 cursor-pointer border-b last:border-b-0 ${
                      index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{result.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {result.title}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryColors[result.category]}`}>
                            {result.category}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {result.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {query && results.length === 0 && (
              <div className="px-4 py-8 text-center">
                <div className="text-gray-400 mb-2">
                  <MagnifyingGlassIcon className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No results found
                </h3>
                <p className="text-gray-600">
                  Try searching with different keywords or check the spelling.
                </p>
              </div>
            )}

            {/* Empty State */}
            {!query && (
              <div className="px-4 py-8 text-center">
                <div className="text-gray-400 mb-4">
                  <MagnifyingGlassIcon className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Search Happy Llama
                </h3>
                <p className="text-gray-600 mb-4">
                  Find pages, resources, documentation, videos, and templates.
                </p>
                <div className="text-sm text-gray-500">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">↑</kbd>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs ml-1">↓</kbd>
                  <span className="ml-2">to navigate</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs ml-4">Enter</kbd>
                  <span className="ml-2">to select</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs ml-4">Esc</kbd>
                  <span className="ml-2">to close</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Regular search input (for inline use)
  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleOpen}
          placeholder={placeholder}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
          <kbd className="px-1 py-0.5 bg-gray-100 rounded">⌘K</kbd>
        </div>
      </div>
    </div>
  );
}