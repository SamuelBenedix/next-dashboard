// components/search-input.tsx

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

type SearchInputProps = {
  placeholder?: string;
  onSearch: (query: string) => void;
  delay?: number; // optional debounce delay
};

export function SearchInput({
  placeholder = 'Search...',
  onSearch,
  delay = 300,
}: SearchInputProps) {
  const [input, setInput] = useState('');
  const debouncedInput = useDebounce(input, delay);

  useEffect(() => {
    onSearch(debouncedInput);
  }, [debouncedInput, onSearch]);

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}

// Hook for debouncing input
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}
