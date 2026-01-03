import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "../../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";

type Props = {
    values: string[];
    onChange: (values: string[]) => void;
    options: readonly string[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    disabled?: boolean;
};

export default function CityMultiSelect({
    values,
    onChange,
    options,
    placeholder = "Selecione as cidades",
    searchPlaceholder = "Buscar cidade…",
    emptyText = "Nenhuma cidade encontrada.",
    disabled,
}: Props) {
    const [open, setOpen] = React.useState(false);

    const handleToggle = (city: string) => {
        if (values.includes(city)) {
            onChange(values.filter((v) => v !== city));
        } else {
            onChange([...values, city]);
        }
    };

    const handleRemove = (city: string) => {
        onChange(values.filter((v) => v !== city));
    };

    return (
        <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        disabled={disabled}
                        className="w-full justify-between h-11 rounded-xl"
                    >
                        <span className="truncate text-left">
                            {values.length > 0 ? `${values.length} cidade(s) selecionada(s)` : placeholder}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                        <CommandInput placeholder={searchPlaceholder} />
                        <CommandList className="max-h-60">
                            <CommandEmpty>{emptyText}</CommandEmpty>
                            <CommandGroup>
                                {options.map((opt) => {
                                    const isSelected = values.includes(opt);
                                    return (
                                        <CommandItem
                                            key={opt}
                                            value={opt}
                                            onSelect={() => handleToggle(opt)}
                                            className="cursor-pointer"
                                        >
                                            <div
                                                className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded border border-gray-300",
                                                    isSelected ? "bg-lime-500 border-lime-500 text-white" : "bg-white"
                                                )}
                                            >
                                                {isSelected && <Check className="h-3 w-3" />}
                                            </div>
                                            {opt}
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {values.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {values.map((city) => (
                        <span
                            key={city}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-lime-100 text-lime-800 text-xs font-medium"
                        >
                            {city}
                            <button
                                type="button"
                                onClick={() => handleRemove(city)}
                                className="hover:text-lime-900"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
