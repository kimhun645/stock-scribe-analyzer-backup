import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Filter, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'product' | 'category' | 'supplier' | 'movement' | 'budget';
  title: string;
  description: string;
  url: string;
  icon: string;
  relevance: number;
}

interface SearchHistory {
  id: string;
  query: string;
  timestamp: Date;
  resultCount: number;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: Record<string, any>;
  isDefault: boolean;
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    dateRange: 'all',
    status: 'all'
  });

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'product',
      title: 'iPhone 15 Pro Max',
      description: 'สมาร์ทโฟน Apple รุ่นล่าสุด',
      url: '/products/1',
      icon: '📱',
      relevance: 95
    },
    {
      id: '2',
      type: 'category',
      title: 'อิเล็กทรอนิกส์',
      description: 'หมวดหมู่สินค้าอิเล็กทรอนิกส์',
      url: '/categories/1',
      icon: '📱',
      relevance: 85
    },
    {
      id: '3',
      type: 'supplier',
      title: 'Apple Inc.',
      description: 'ผู้จำหน่ายสินค้า Apple',
      url: '/suppliers/1',
      icon: '🏢',
      relevance: 80
    },
    {
      id: '4',
      type: 'movement',
      title: 'การเคลื่อนไหวสต็อก',
      description: 'รายการเคลื่อนไหวสต็อกล่าสุด',
      url: '/movements',
      icon: '📈',
      relevance: 75
    }
  ];

  // Load search history and saved searches from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    const savedSearchesData = localStorage.getItem('savedSearches');
    
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    
    if (savedSearchesData) {
      setSavedSearches(JSON.parse(savedSearchesData));
    }
  }, []);

  // Handle search
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      const filteredResults = mockResults.filter(result =>
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Sort by relevance
      filteredResults.sort((a, b) => b.relevance - a.relevance);
      
      setResults(filteredResults);
      setIsSearching(false);

      // Save to history
      if (searchQuery.trim()) {
        const newHistoryItem: SearchHistory = {
          id: Date.now().toString(),
          query: searchQuery,
          timestamp: new Date(),
          resultCount: filteredResults.length
        };
        
        const updatedHistory = [newHistoryItem, ...history.slice(0, 9)];
        setHistory(updatedHistory);
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      }
    }, 300);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
      setResults([]);
    }
  };

  // Toggle search
  const toggleSearch = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  // Save current search
  const saveSearch = () => {
    if (!query.trim()) return;

    const newSavedSearch: SavedSearch = {
      id: Date.now().toString(),
      name: query,
      query: query,
      filters: filters,
      isDefault: false
    };

    const updatedSavedSearches = [...savedSearches, newSavedSearch];
    setSavedSearches(updatedSavedSearches);
    localStorage.setItem('savedSearches', JSON.stringify(updatedSavedSearches));
  };

  // Load saved search
  const loadSavedSearch = (savedSearch: SavedSearch) => {
    setQuery(savedSearch.query);
    setFilters(savedSearch.filters);
    handleSearch(savedSearch.query);
  };

  // Remove from history
  const removeFromHistory = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleSearch}
        className="relative hover:bg-gray-100"
      >
        <Search className="h-5 w-5 text-gray-700" />
      </Button>

      {/* Search Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsOpen(false)}>
          <div className="flex justify-center pt-20">
            <div className="w-full max-w-2xl mx-4">
              <div className="bg-white rounded-lg shadow-xl">
                {/* Search Input */}
                <div className="flex items-center p-4 border-b">
                  <Search className="h-5 w-5 text-gray-500 mr-3" />
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    placeholder="ค้นหาสินค้า, หมวดหมู่, ผู้จำหน่าย, หรืออื่นๆ..."
                    className="border-0 text-lg focus-visible:ring-0"
                    autoFocus
                  />
                  {query && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="ml-2"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>

                {/* Filters */}
                {showFilters && (
                  <div className="p-4 border-b bg-gray-50">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium">ประเภท</label>
                        <select
                          value={filters.type}
                          onChange={(e) => setFilters({...filters, type: e.target.value})}
                          className="w-full mt-1 p-2 border rounded"
                        >
                          <option value="all">ทั้งหมด</option>
                          <option value="product">สินค้า</option>
                          <option value="category">หมวดหมู่</option>
                          <option value="supplier">ผู้จำหน่าย</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">ช่วงเวลา</label>
                        <select
                          value={filters.dateRange}
                          onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                          className="w-full mt-1 p-2 border rounded"
                        >
                          <option value="all">ทั้งหมด</option>
                          <option value="today">วันนี้</option>
                          <option value="week">สัปดาห์นี้</option>
                          <option value="month">เดือนนี้</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">สถานะ</label>
                        <select
                          value={filters.status}
                          onChange={(e) => setFilters({...filters, status: e.target.value})}
                          className="w-full mt-1 p-2 border rounded"
                        >
                          <option value="all">ทั้งหมด</option>
                          <option value="active">ใช้งาน</option>
                          <option value="inactive">ไม่ใช้งาน</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Search Results */}
                <div className="max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-500">กำลังค้นหา...</p>
                    </div>
                  ) : results.length > 0 ? (
                    <div className="p-2">
                      {results.map((result) => (
                        <div
                          key={result.id}
                          className="flex items-center p-3 hover:bg-gray-50 rounded cursor-pointer"
                          onClick={() => {
                            window.location.href = result.url;
                            setIsOpen(false);
                          }}
                        >
                          <div className="text-2xl mr-3">{result.icon}</div>
                          <div className="flex-1">
                            <div className="font-medium">{result.title}</div>
                            <div className="text-sm text-gray-500">{result.description}</div>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {result.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : query ? (
                    <div className="p-8 text-center text-gray-500">
                      <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>ไม่พบผลลัพธ์สำหรับ "{query}"</p>
                    </div>
                  ) : (
                    <div className="p-4">
                      {/* Saved Searches */}
                      {savedSearches.length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">การค้นหาที่บันทึก</h3>
                          <div className="space-y-1">
                            {savedSearches.map((savedSearch) => (
                              <div
                                key={savedSearch.id}
                                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                                onClick={() => loadSavedSearch(savedSearch)}
                              >
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-500 mr-2" />
                                  <span className="text-sm">{savedSearch.name}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Remove saved search
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Search History */}
                      {history.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">ประวัติการค้นหา</h3>
                          <div className="space-y-1">
                            {history.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                                onClick={() => {
                                  setQuery(item.query);
                                  handleSearch(item.query);
                                }}
                              >
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm">{item.query}</span>
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {item.resultCount} ผลลัพธ์
                                  </Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFromHistory(item.id);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {query && (
                  <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      พบ {results.length} ผลลัพธ์
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={saveSearch}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      บันทึกการค้นหา
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

