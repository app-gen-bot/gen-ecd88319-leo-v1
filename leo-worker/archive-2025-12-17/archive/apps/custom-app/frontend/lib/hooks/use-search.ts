import { useState, useCallback, useEffect } from 'react'
import { store } from '@/lib/store'

export interface SearchResult {
  type: 'task' | 'message' | 'person'
  item: any
}

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [filter, setFilter] = useState<'all' | 'tasks' | 'messages' | 'people'>('all')
  
  const debouncedQuery = useDebounce(query, 300)
  
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([])
      setIsSearching(false)
      return
    }
    
    setIsSearching(true)
    
    // Perform search
    const searchResults = store.search(
      debouncedQuery,
      filter === 'all' ? undefined : { type: filter as any }
    )
    
    setResults(searchResults)
    setIsSearching(false)
  }, [debouncedQuery, filter])
  
  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery)
  }, [])
  
  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
  }, [])
  
  return {
    query,
    results,
    isSearching,
    filter,
    setFilter,
    search,
    clearSearch
  }
}

// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}