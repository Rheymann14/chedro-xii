import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type ComboboxOption = {
    value: string;
    label: string;
};

/**
 * Searchable dropdown. Works controlled (`value` + `onValueChange`) or
 * uncontrolled (`defaultValue`), and submits through a hidden input when
 * `name` is given so it drops into plain forms.
 */
export function Combobox({
    options,
    value,
    defaultValue,
    onValueChange,
    name,
    id,
    placeholder = 'Select…',
    searchPlaceholder = 'Search…',
    emptyText = 'No results found.',
    disabled = false,
    className,
    'aria-label': ariaLabel,
}: {
    options: ComboboxOption[];
    value?: string;
    defaultValue?: string | number | null;
    onValueChange?: (value: string) => void;
    name?: string;
    id?: string;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    disabled?: boolean;
    className?: string;
    'aria-label'?: string;
}) {
    const [open, setOpen] = useState(false);
    const [uncontrolledValue, setUncontrolledValue] = useState(
        defaultValue === null || defaultValue === undefined
            ? ''
            : String(defaultValue),
    );
    const selectedValue = value ?? uncontrolledValue;
    const selected = options.find((option) => option.value === selectedValue);

    const choose = (option: ComboboxOption) => {
        setUncontrolledValue(option.value);
        setOpen(false);
        onValueChange?.(option.value);
    };

    return (
        <Popover open={open} onOpenChange={setOpen} modal>
            {name !== undefined && (
                <input type="hidden" name={name} value={selectedValue} />
            )}
            <PopoverTrigger asChild>
                <button
                    type="button"
                    id={id}
                    role="combobox"
                    aria-expanded={open}
                    aria-label={ariaLabel}
                    disabled={disabled}
                    className={cn(
                        'flex min-h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-1.5 text-left text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 dark:hover:bg-input/50',
                        className,
                    )}
                >
                    <span
                        className={cn(
                            'min-w-0 break-words',
                            !selected && 'text-muted-foreground',
                        )}
                    >
                        {selected?.label ?? placeholder}
                    </span>
                    <ChevronsUpDown
                        className="size-4 shrink-0 opacity-50"
                        aria-hidden
                    />
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-(--radix-popover-trigger-width) min-w-48 p-0"
            >
                <Command
                    defaultValue={`option:${selectedValue}`}
                    filter={(_, search, keywords) =>
                        (keywords ?? [])
                            .join(' ')
                            .toLowerCase()
                            .includes(search.trim().toLowerCase())
                            ? 1
                            : 0
                    }
                >
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={`option:${option.value}`}
                                    keywords={[option.label]}
                                    onSelect={() => choose(option)}
                                >
                                    <Check
                                        className={cn(
                                            'mt-0.5 size-4 self-start',
                                            option.value === selectedValue
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                        )}
                                        aria-hidden
                                    />
                                    <span className="min-w-0 break-words">
                                        {option.label}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
