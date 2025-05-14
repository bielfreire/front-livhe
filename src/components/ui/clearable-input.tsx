import React from 'react';
import { Input } from './input';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClearableInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onClear: () => void;
    value: string | number;
    className?: string;
}

const ClearableInput = React.forwardRef<HTMLInputElement, ClearableInputProps>(
    ({ className, onClear, value, ...props }, ref) => {
        return (
            <div className="relative">
                <Input
                    ref={ref}
                    value={value}
                    className={cn("pr-8", className)}
                    {...props}
                />
                {value && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        );
    }
);

ClearableInput.displayName = 'ClearableInput';

export { ClearableInput }; 