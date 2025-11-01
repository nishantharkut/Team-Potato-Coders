import { cn } from "@/lib/utils";

import { features } from '@/data/features'

export function FeaturesSectionDemo() {
  return (
    (<div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>)
  );
}

const Feature = ({
  title,
  description,
  icon,
  index
}) => {
  const bgColors = ['bg-tanjiro-green', 'bg-demon-red', 'bg-earthy-orange', 'bg-tanjiro-green'];
  
  return (
    (<div
      className={cn(
        "flex flex-col p-8 relative group/feature bg-white hover:bg-cream transition-all duration-300 border-4 border-black rounded-xl shadow-neu hover:shadow-neu-hover hover:translate-x-[4px] hover:translate-y-[4px]",
        "min-h-[300px]"
      )}>
      
      {/* Icon with background */}
      <div className={cn(
        "mb-6 relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center border-4 border-black shadow-neu-sm group-hover/feature:scale-110 transition-transform text-white",
        bgColors[index % 4]
      )}>
        <div className="text-4xl">
          {icon}
        </div>
      </div>
      
      {/* Title */}
      <h3 className="text-xl font-black mb-4 relative z-10 text-charcoal group-hover/feature:text-tanjiro-green transition-colors">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-sm md:text-base text-charcoal font-medium relative z-10 leading-relaxed">
        {description}
      </p>
      
      {/* Decorative corner */}
      <div className="absolute top-3 right-3 w-10 h-10 border-t-4 border-r-4 border-black opacity-10"></div>
    </div>)
  );
};
