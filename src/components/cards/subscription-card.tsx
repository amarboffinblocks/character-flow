import { Check } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export interface SubscriptionCardProps {
    title: string;
    price: string;
    description: string;
    features: string[];
    buttonLabel: string;
    cadence?: string;
    highlighted?: boolean;
    badge?: string;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
    title,
    price,
    description,
    features,
    buttonLabel,
    cadence = "/month",
    highlighted = false,
    badge,
}) => {
    return (
        <div
            className={cn(
                "rounded-4xl bg-primary/20 backdrop-blur-xl border border-white/10 overflow-hidden transition-all duration-300",
                "hover:-translate-y-1 hover:border-primary/50 hover:bg-primary/30 hover:shadow-xl hover:shadow-primary/10",
                highlighted && "border-indigo-400/50 shadow-lg shadow-indigo-500/10 bg-primary/30"
            )}
        >
            <div className="px-5 pt-6 flex items-center justify-between gap-2">
                <h3
                    className={cn(
                        "text-xs font-semibold text-white px-3 py-1 rounded-full border w-fit uppercase tracking-wider",
                        highlighted ? "bg-indigo-500/20 border-indigo-300/40" : "bg-primary/40 border-white/10"
                    )}
                >
                    {title}
                </h3>
                {badge ? (
                    <span className="text-[11px] font-medium rounded-full border border-emerald-300/30 bg-emerald-500/15 px-2.5 py-1 text-emerald-300">
                        {badge}
                    </span>
                ) : null}
            </div>
            <div className="px-5 py-6 space-y-5">
                <p className="flex items-baseline gap-x-2">
                    <span className="text-5xl font-semibold tracking-tight text-white">{price}</span>
                    <span className="text-sm text-muted-foreground">{cadence}</span>
                </p>

                <p className="text-muted-foreground">{description}</p>

                <ul role="list" className="space-y-3 text-sm text-white/85">
                    {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-x-3">
                            <Check className="size-4 mt-0.5 text-emerald-400" />
                            {feature}
                        </li>
                    ))}
                </ul>

                <Button
                    className={cn(
                        "w-full rounded-xl",
                        highlighted
                            ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                            : "bg-surface-selected hover:bg-surface-hover border border-border text-foreground"
                    )}
                >
                    {buttonLabel}
                </Button>
            </div>
        </div>
    );
};

export default SubscriptionCard;