import React from "react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
    label: string;
    path: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
    return (
        <nav className="text-sm mb-4 flex items-center space-x-2">
            {items.map((item, index) => (
                <span key={index} className="flex items-center">
                    {index < items.length - 1 ? (
                        <Link
                            to={item.path}
                            className="text-[#FFD110] hover:underline font-medium"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-white font-semibold">{item.label}</span>
                    )}
                    {index < items.length - 1 && (
                        <span className="mx-2 text-gray-500">/</span>
                    )}
                </span>
            ))}
        </nav>
    );
};

export default Breadcrumb;