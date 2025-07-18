import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InputDropdownProps<T> {
  data: T[];
  labelKey: keyof T;
  valueKey: keyof T;
  placeholder?: string;
  onChange?: (value: string) => void;
  filterKey?: keyof T;
  filterExclude?: string;
}

export default function InputDropdown<T extends Record<string, unknown>>({
  data,
  labelKey,
  valueKey,
  placeholder = 'Pilih opsi',
  onChange,
  filterKey,
  filterExclude,
}: InputDropdownProps<T>) {
  const filteredData =
    filterKey && filterExclude
      ? data.filter((item) => item[filterKey] !== filterExclude)
      : data;

  return (
    <Select onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {filteredData.map((item) => (
          <SelectItem
            key={String(item[valueKey])}
            value={String(item[valueKey])}
          >
            {String(item[labelKey])}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
