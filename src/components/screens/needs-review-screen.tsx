"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { GlassSurface } from "@/components/ui/glass-surface";
import { ChevronLeft, Check, HelpCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ReviewItem {
  id: string;
  merchant: string;
  amount: number;
  question: string;
  options: string[];
}

export function NeedsReviewScreen({ onBack, onResolved }: { onBack: () => void, onResolved: () => void }) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUncategorized = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("category_name", "Uncategorized")
        .limit(10);

      if (data && !error) {
        const formattedReviews: ReviewItem[] = data.map(tx => ({
          id: tx.id,
          merchant: tx.description_clean || tx.description_raw,
          amount: tx.amount_minor / 100,
          question: `What category should this transaction belong to?`,
          options: ["Groceries", "Transport", "Subscriptions", "Personal", "Income"]
        }));
        setReviews(formattedReviews);
      }
      setIsLoading(false);
    };
    fetchUncategorized();
  }, [supabase]);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-250, -150, 0, 150, 250], [0, 1, 1, 1, 0]);

  const currentReview = reviews[currentIndex];

  const handleResolve = async (answer: string) => {
    if (!currentReview) return;

    await supabase
      .from("transactions")
      .update({ category_name: answer })
      .eq("id", currentReview.id);

    setCurrentIndex((prev) => prev + 1);
    x.set(0);
    onResolved();
  };

  const handleDragEnd = (event: any, info: { offset: { x: number } }) => {
    if (Math.abs(info.offset.x) > 100) {
      setCurrentIndex((prev) => prev + 1);
      x.set(0);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  if (reviews.length === 0 || currentIndex >= reviews.length) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 rounded-full bg-[var(--brand)]/20 flex items-center justify-center mb-6">
          <Check size={40} className="text-[var(--brand)]" />
        </div>
        <h2 className="text-[24px] font-bold text-white mb-2">All Caught Up!</h2>
        <p className="text-[15px] text-white/60 text-center mb-8">You've resolved all pending transactions.</p>
        <button onClick={onBack} className="px-6 py-3 bg-white/10 rounded-full text-white font-medium hover:bg-white/20 transition-colors">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-32 flex flex-col">
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} className="text-white" />
          </button>
          <h1 className="text-[17px] font-semibold text-white">Needs Review</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-white/60">Remaining</span>
          <span className="text-[13px] font-bold text-white bg-[var(--warn)]/20 px-2 py-0.5 rounded-md">
            {reviews.length - currentIndex}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
        <div className="relative w-full max-w-sm h-[420px] flex items-center justify-center">
          {reviews.slice(currentIndex, currentIndex + 2).reverse().map((review) => {
            const isTopCard = review.id === currentReview.id;
            return (
              <motion.div
                key={review.id}
                style={{
                  zIndex: isTopCard ? 10 : 1,
                  x: isTopCard ? x : 0,
                  rotate: isTopCard ? rotate : 0,
                  opacity: isTopCard ? opacity : 1,
                }}
                drag={isTopCard ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={isTopCard ? handleDragEnd : undefined}
                initial={false}
                animate={{ 
                  scale: isTopCard ? 1 : 0.95, 
                  opacity: isTopCard ? 1 : 0.6,
                  y: isTopCard ? 0 : 20,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
              >
                <GlassSurface tier="thick" radius={28} className="w-full h-full p-6 flex flex-col justify-between shadow-2xl">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[24px]">
                      💳
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] text-white/60 mb-1">Amount</p>
                      <p className="text-[20px] font-bold text-white tabular">₦{review.amount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="my-6">
                    <h3 className="text-[18px] font-medium text-white leading-snug mb-3">{review.merchant}</h3>
                    <div className="flex items-start gap-2 text-white/70">
                      <HelpCircle size={18} className="shrink-0 mt-0.5 text-[var(--warn)]" />
                      <p className="text-[14px] leading-relaxed">{review.question}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {review.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleResolve(option)}
                        className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[15px] font-medium text-white hover:bg-[var(--brand)] hover:text-black hover:border-transparent transition-all"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </GlassSurface>
              </motion.div>
            );
          })}
        </div>
        <p className="mt-8 text-[13px] text-white/30">Swipe to dismiss or tap an option to resolve</p>
      </div>
    </div>
  );
}