"use client";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { value: "ALL", label: "All Services", icon: "🔍" },
  { value: "PLUMBER", label: "Plumber", icon: "🔧" },
  { value: "ELECTRICIAN", label: "Electrician", icon: "⚡" },
  { value: "CLEANER", label: "Cleaner", icon: "🧹" },
  { value: "TUTOR", label: "Tutor", icon: "📚" },
  { value: "TECHNICIAN", label: "Technician", icon: "💻" },
  { value: "CARPENTER", label: "Carpenter", icon: "🪚" },
  { value: "PAINTER", label: "Painter", icon: "🎨" },
  { value: "GARDENER", label: "Gardener", icon: "🌱" },
  { value: "MECHANIC", label: "Mechanic", icon: "🔩" },
  { value: "OTHER", label: "Other", icon: "📦" },
];

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onCategoryChange(category.value)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            selectedCategory === category.value
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
              : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700"
          }`}
        >
          <span>{category.icon}</span>
          {category.label}
        </button>
      ))}
    </div>
  );
}

export { categories };
